const CvOutreach = require("@models/gmail-cv/cvOutreach");
const GmailSyncState = require("@models/gmail-cv/gmailSyncState");
const { syncCvOutreach, STATE_KEY } = require("@services/gmail/cvOutreachSyncService");
const { isConfigured, getMissingEnv, getProfile, getGmailClient } = require("@services/gmail/gmailClient");
const { extractBody } = require("@services/gmail/messageBody");
const logger = require("@utils/logger");

const LIST_FIELDS =
  "gmailMessageId gmailThreadId subject snippet fromEmail primaryRecipient primaryRecipientName " +
  "recipientDomain companyName to cc recipientCount cvFileName attachments attachmentCount starred " +
  "sentAt replied replyCount firstReplyAt lastReplyAt lastReplyFrom firstReplySnippet " +
  "hoursToReply daysToReply threadMessageCount bounced";

/**
 * Translate a Gmail-style folder into a Mongo filter.
 */
function folderFilter(folder) {
  switch (folder) {
    case "replied":
      return { replied: true };
    case "awaiting":
      return { replied: false, bounced: false };
    case "bounced":
      return { bounced: true };
    case "starred":
      return { starred: true };
    default:
      return {};
  }
}

function buildListFilter(query) {
  const filter = { ...folderFilter(query.folder) };

  if (query.domain) filter.recipientDomain = query.domain;

  if (query.days && query.days !== "all") {
    const since = new Date();
    since.setDate(since.getDate() - parseInt(query.days, 10));
    filter.sentAt = { $gte: since };
  }

  if (query.q) {
    const rx = new RegExp(String(query.q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [
      { subject: rx },
      { snippet: rx },
      { primaryRecipient: rx },
      { primaryRecipientName: rx },
      { companyName: rx },
      { cvFileName: rx },
      { to: rx },
    ];
  }

  return filter;
}

/**
 * Days are bucketed in the owner's timezone, not UTC — a CV sent at 1am IST
 * belongs to that day on the dashboard, not to the one before.
 */
function analyticsTimezone() {
  const zone = process.env.ANALYTICS_TIMEZONE || "Asia/Kolkata";

  try {
    new Intl.DateTimeFormat("en-CA", { timeZone: zone });
    return zone;
  } catch (error) {
    logger.warn(`[GmailCV] Invalid ANALYTICS_TIMEZONE "${zone}" — falling back to UTC`);
    return "UTC";
  }
}

function dayKey(date, timezone) {
  // en-CA formats as YYYY-MM-DD, matching Mongo's $dateToString output.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * Mongo only returns days that have data. A bar chart needs the empty days too,
 * otherwise a two-week gap renders as if it were a single day. The series always
 * runs through today.
 */
function fillDailyGaps(dailyStats, since, days, timezone) {
  const bucket = new Map(dailyStats.map((d) => [d._id, { sent: d.sent, replied: d.replied }]));
  const todayKey = dayKey(new Date(), timezone);

  const filled = [];
  const seen = new Set();
  let cursor = new Date(since);

  // days + 2 caps the walk; the loop normally exits on today's key.
  for (let i = 0; i <= days + 2; i += 1) {
    const key = dayKey(cursor, timezone);

    if (!seen.has(key)) {
      seen.add(key);
      const found = bucket.get(key);
      filled.push({ date: key, sent: found?.sent || 0, replied: found?.replied || 0 });
    }

    if (key === todayKey) break;
    cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
  }

  return filled;
}

/**
 * @route   GET /api/v1/gmail-cv/messages
 * @desc    Paginated CV email list for the Gmail-style inbox
 * @access  Protected (Super Admin)
 */
exports.getCvOutreachMessages = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const perPage = Math.min(parseInt(req.query.perPage, 10) || 25, 100);
    const filter = buildListFilter(req.query);

    const [messages, total, folderCounts] = await Promise.all([
      CvOutreach.find(filter)
        .sort({ sentAt: -1 })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .select(LIST_FIELDS)
        .lean(),
      CvOutreach.countDocuments(filter),
      CvOutreach.aggregate([
        {
          $group: {
            _id: null,
            all: { $sum: 1 },
            replied: { $sum: { $cond: ["$replied", 1, 0] } },
            bounced: { $sum: { $cond: ["$bounced", 1, 0] } },
            starred: { $sum: { $cond: ["$starred", 1, 0] } },
            awaiting: {
              $sum: { $cond: [{ $and: [{ $eq: ["$replied", false] }, { $eq: ["$bounced", false] }] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    res.status(200).json({
      success: true,
      messages,
      folderCounts: folderCounts[0]
        ? {
            all: folderCounts[0].all,
            replied: folderCounts[0].replied,
            awaiting: folderCounts[0].awaiting,
            bounced: folderCounts[0].bounced,
            starred: folderCounts[0].starred,
          }
        : { all: 0, replied: 0, awaiting: 0, bounced: 0, starred: 0 },
      paginationData: {
        currentPage: page,
        perPage,
        totalMessages: total,
        totalPages: Math.max(Math.ceil(total / perPage), 1),
      },
    });
  } catch (error) {
    logger.error(`GMAIL_CV_MESSAGES_ERROR: ${error.message}`);
    res.status(500).json({ success: false, message: "Failed to fetch CV emails" });
  }
};

/**
 * @route   GET /api/v1/gmail-cv/messages/:id
 * @desc    Single CV email (reading pane)
 * @access  Protected (Super Admin)
 */
exports.getCvOutreachMessage = async (req, res) => {
  try {
    const message = await CvOutreach.findOne({ gmailMessageId: req.params.id })
      .select(LIST_FIELDS + " bcc labelIds")
      .lean();

    if (!message) {
      return res.status(404).json({ success: false, message: "Email not found" });
    }

    // Everything else sent to the same company, for context in the reading pane
    const related = message.recipientDomain
      ? await CvOutreach.find({
          recipientDomain: message.recipientDomain,
          gmailMessageId: { $ne: message.gmailMessageId },
        })
          .sort({ sentAt: -1 })
          .limit(5)
          .select("gmailMessageId subject sentAt replied")
          .lean()
      : [];

    res.status(200).json({ success: true, message, related });
  } catch (error) {
    logger.error(`GMAIL_CV_MESSAGE_ERROR: ${error.message}`);
    res.status(500).json({ success: false, message: "Failed to fetch email" });
  }
};

/**
 * @route   GET /api/v1/gmail-cv/analytics
 * @desc    Outreach analytics — volume, reply rate, top companies
 * @access  Protected (Super Admin)
 */
exports.getCvOutreachAnalytics = async (req, res) => {
  try {
    const days = parseInt(req.query.days, 10) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const periodMatch = { sentAt: { $gte: since } };
    const timezone = analyticsTimezone();

    const [
      totalSent,
      repliedCount,
      bouncedCount,
      uniqueCompanies,
      dailyStats,
      byCompany,
      byCvFile,
      replyTimes,
      byWeekday,
      allTimeTotal,
      allTimeReplied,
    ] = await Promise.all([
      CvOutreach.countDocuments(periodMatch),
      CvOutreach.countDocuments({ ...periodMatch, replied: true }),
      CvOutreach.countDocuments({ ...periodMatch, bounced: true }),
      CvOutreach.distinct("recipientDomain", periodMatch),
      CvOutreach.aggregate([
        { $match: periodMatch },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$sentAt", timezone } },
            sent: { $sum: 1 },
            replied: { $sum: { $cond: ["$replied", 1, 0] } },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 366 },
      ]),
      CvOutreach.aggregate([
        { $match: periodMatch },
        {
          $group: {
            _id: { domain: "$recipientDomain", company: "$companyName" },
            sent: { $sum: 1 },
            replied: { $sum: { $cond: ["$replied", 1, 0] } },
            lastSentAt: { $max: "$sentAt" },
          },
        },
        { $sort: { sent: -1, lastSentAt: -1 } },
        { $limit: 15 },
      ]),
      CvOutreach.aggregate([
        { $match: periodMatch },
        { $group: { _id: "$cvFileName", sent: { $sum: 1 }, replied: { $sum: { $cond: ["$replied", 1, 0] } } } },
        { $sort: { sent: -1 } },
        { $limit: 10 },
      ]),
      CvOutreach.aggregate([
        { $match: { ...periodMatch, replied: true, hoursToReply: { $gt: 0 } } },
        {
          $group: {
            _id: null,
            avgHours: { $avg: "$hoursToReply" },
            fastestHours: { $min: "$hoursToReply" },
            slowestHours: { $max: "$hoursToReply" },
          },
        },
      ]),
      CvOutreach.aggregate([
        { $match: periodMatch },
        {
          $group: {
            _id: { $dayOfWeek: { date: "$sentAt", timezone } },
            sent: { $sum: 1 },
            replied: { $sum: { $cond: ["$replied", 1, 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      CvOutreach.countDocuments(),
      CvOutreach.countDocuments({ replied: true }),
    ]);

    const replyTime = replyTimes[0] || {};
    const rate = (part, whole) => (whole ? Math.round((part / whole) * 1000) / 10 : 0);

    res.status(200).json({
      success: true,
      period: `${days} days`,
      summary: {
        sent: totalSent,
        replied: repliedCount,
        awaiting: Math.max(totalSent - repliedCount - bouncedCount, 0),
        bounced: bouncedCount,
        replyRate: rate(repliedCount, totalSent),
        companies: uniqueCompanies.filter(Boolean).length,
        perDay: days ? Math.round((totalSent / days) * 10) / 10 : 0,
      },
      allTime: {
        sent: allTimeTotal,
        replied: allTimeReplied,
        replyRate: rate(allTimeReplied, allTimeTotal),
      },
      replyTime: {
        avgHours: replyTime.avgHours ? Math.round(replyTime.avgHours * 10) / 10 : null,
        fastestHours: replyTime.fastestHours ?? null,
        slowestHours: replyTime.slowestHours ?? null,
      },
      timezone,
      dailyStats: fillDailyGaps(dailyStats, since, days, timezone),
      byCompany: byCompany.map((c) => ({
        domain: c._id.domain,
        company: c._id.company || c._id.domain,
        sent: c.sent,
        replied: c.replied,
        replyRate: rate(c.replied, c.sent),
        lastSentAt: c.lastSentAt,
      })),
      byCvFile: byCvFile.map((f) => ({
        fileName: f._id,
        sent: f.sent,
        replied: f.replied,
        replyRate: rate(f.replied, f.sent),
      })),
      byWeekday: byWeekday.map((w) => ({ weekday: w._id, sent: w.sent, replied: w.replied })),
    });
  } catch (error) {
    logger.error(`GMAIL_CV_ANALYTICS_ERROR: ${error.message}`);
    res.status(500).json({ success: false, message: "Failed to fetch outreach analytics" });
  }
};

/**
 * @route   GET /api/v1/gmail-cv/status
 * @desc    Gmail connection + sync state
 * @access  Protected (Super Admin)
 */
exports.getGmailStatus = async (req, res) => {
  try {
    const configured = isConfigured();
    const state = await GmailSyncState.findOne({ key: STATE_KEY }).lean();
    const stored = await CvOutreach.countDocuments();

    let mailbox = state?.mailboxEmail || "";
    let connected = false;
    let connectionError = "";

    if (configured) {
      try {
        const profile = await getProfile();
        mailbox = profile.emailAddress;
        connected = true;
      } catch (error) {
        connectionError = error.message;
      }
    }

    res.status(200).json({
      success: true,
      configured,
      connected,
      connectionError,
      missingEnv: configured ? [] : getMissingEnv(),
      mailbox,
      storedMessages: stored,
      sync: state
        ? {
            running: state.running,
            lastSyncAt: state.lastSyncAt,
            lastSyncStatus: state.lastSyncStatus,
            lastError: state.lastError,
            lastTrigger: state.lastTrigger,
            lastDurationMs: state.lastDurationMs,
            lastRun: state.lastRun,
            totalSyncs: state.totalSyncs,
          }
        : null,
    });
  } catch (error) {
    logger.error(`GMAIL_CV_STATUS_ERROR: ${error.message}`);
    res.status(500).json({ success: false, message: "Failed to fetch Gmail status" });
  }
};

/**
 * @route   POST /api/v1/gmail-cv/sync
 * @desc    Trigger a sync now (body: { full: true } for a full re-scan)
 * @access  Protected (Super Admin)
 */
exports.triggerSync = async (req, res) => {
  try {
    const result = await syncCvOutreach({
      trigger: "manual",
      fullResync: req.body?.full === true,
    });

    if (!result.ok) {
      const code = result.skipped ? (result.message === "Gmail is not configured" ? 412 : 409) : 502;

      return res.status(code).json({
        success: false,
        message: result.message || "Sync failed",
        stats: result.stats,
      });
    }

    res.status(200).json({
      success: true,
      message: "Sync complete",
      status: result.status,
      durationMs: result.durationMs,
      mailbox: result.mailbox,
      stats: result.stats,
    });
  } catch (error) {
    logger.error(`GMAIL_CV_SYNC_ERROR: ${error.message}`);
    res.status(500).json({ success: false, message: "Failed to run sync" });
  }
};

/**
 * @route   GET /api/v1/gmail-cv/messages/:id/body
 * @desc    Live-fetch the full message body from Gmail for the reading pane
 * @access  Protected (Super Admin)
 */
exports.getCvOutreachBody = async (req, res) => {
  try {
    const stored = await CvOutreach.findOne({ gmailMessageId: req.params.id })
      .select("gmailMessageId")
      .lean();

    // Only ever fetch messages this feature already indexed.
    if (!stored) {
      return res.status(404).json({ success: false, message: "Email not found" });
    }

    const gmail = getGmailClient();
    const { data } = await gmail.users.messages.get({
      userId: "me",
      id: req.params.id,
      format: "full",
    });

    const body = extractBody(data.payload);

    res.status(200).json({ success: true, body });
  } catch (error) {
    logger.error(`GMAIL_CV_BODY_ERROR: ${error.message}`);
    res.status(502).json({ success: false, message: "Failed to load email body from Gmail" });
  }
};

/**
 * @route   GET /api/v1/gmail-cv/messages/:id/attachments/:attachmentId
 * @desc    Stream an attachment (the CV as actually sent) back to the dashboard
 * @access  Protected (Super Admin)
 */
exports.downloadCvAttachment = async (req, res) => {
  try {
    const { id, attachmentId } = req.params;

    const stored = await CvOutreach.findOne({ gmailMessageId: id })
      .select("attachments")
      .lean();

    if (!stored) {
      return res.status(404).json({ success: false, message: "Email not found" });
    }

    const attachment = (stored.attachments || []).find((a) => a.attachmentId === attachmentId);
    if (!attachment) {
      return res.status(404).json({ success: false, message: "Attachment not found" });
    }

    const gmail = getGmailClient();
    const { data } = await gmail.users.messages.attachments.get({
      userId: "me",
      messageId: id,
      id: attachmentId,
    });

    const buffer = Buffer.from(String(data.data).replace(/-/g, "+").replace(/_/g, "/"), "base64");
    const safeName = (attachment.filename || "attachment").replace(/[^\w.\- ]+/g, "_");

    res.setHeader("Content-Type", attachment.mimeType || "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${safeName}"`);
    res.setHeader("Content-Length", buffer.length);
    res.status(200).send(buffer);
  } catch (error) {
    logger.error(`GMAIL_CV_ATTACHMENT_ERROR: ${error.message}`);
    res.status(502).json({ success: false, message: "Failed to download attachment from Gmail" });
  }
};

/**
 * @route   PATCH /api/v1/gmail-cv/messages/:id
 * @desc    Toggle manual flags on an indexed email (currently: starred)
 * @access  Protected (Super Admin)
 */
exports.updateCvOutreachFlags = async (req, res) => {
  try {
    const update = {};
    if (typeof req.body?.starred === "boolean") update.starred = req.body.starred;

    if (!Object.keys(update).length) {
      return res.status(400).json({ success: false, message: "Nothing to update" });
    }

    const message = await CvOutreach.findOneAndUpdate(
      { gmailMessageId: req.params.id },
      { $set: update },
      { new: true }
    )
      .select("gmailMessageId starred")
      .lean();

    if (!message) {
      return res.status(404).json({ success: false, message: "Email not found" });
    }

    res.status(200).json({ success: true, message });
  } catch (error) {
    logger.error(`GMAIL_CV_FLAGS_ERROR: ${error.message}`);
    res.status(500).json({ success: false, message: "Failed to update email" });
  }
};
