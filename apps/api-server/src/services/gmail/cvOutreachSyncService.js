const CvOutreach = require("@models/gmail-cv/cvOutreach");
const GmailSyncState = require("@models/gmail-cv/gmailSyncState");
const { getGmailClient, getProfile, isConfigured } = require("./gmailClient");
const logger = require("@utils/logger");

const STATE_KEY = "cv_outreach";

// Mail providers that are a person, not a company
const PERSONAL_DOMAINS = new Set([
  "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.in", "ymail.com",
  "outlook.com", "hotmail.com", "live.com", "msn.com", "icloud.com", "me.com",
  "protonmail.com", "proton.me", "aol.com", "zoho.com", "zohomail.com",
  "rediffmail.com", "mail.com", "gmx.com", "yandex.com",
]);

const BOUNCE_SENDERS = /(mailer-daemon|postmaster|no-?reply@.*(google|mail))/i;
const BOUNCE_SUBJECTS = /(delivery status notification|undelivered mail returned|address not found|delivery incomplete)/i;

// ─── Config ────────────────────────────────────────────────────────────────
function config() {
  return {
    cvNameRegex: new RegExp(
      process.env.GMAIL_CV_FILENAME_REGEX || "cv|resume|curriculum[ _-]?vitae|profile",
      "i"
    ),
    // A name-based cvNameRegex also catches salary certificates, contracts and
    // the like, so paperwork that is clearly not a CV is subtracted here.
    cvExcludeRegex: new RegExp(
      process.env.GMAIL_CV_FILENAME_EXCLUDE_REGEX ||
        "salary|certificate|payslip|invoice|contract|offer[ _-]?letter|relieving|experience[ _-]?letter",
      "i"
    ),
    fileTypes: (process.env.GMAIL_CV_ATTACHMENT_TYPES || "pdf,doc,docx")
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean),
    lookbackDays: parseInt(process.env.GMAIL_SYNC_LOOKBACK_DAYS || "365", 10),
    maxMessages: parseInt(process.env.GMAIL_SYNC_MAX_MESSAGES || "500", 10),
    replyWindowDays: parseInt(process.env.GMAIL_REPLY_WINDOW_DAYS || "60", 10),
    replyCheckLimit: parseInt(process.env.GMAIL_REPLY_CHECK_LIMIT || "80", 10),
    extraQuery: process.env.GMAIL_CV_EXTRA_QUERY || "",
    lockStaleMinutes: parseInt(process.env.GMAIL_SYNC_LOCK_STALE_MINUTES || "15", 10),
  };
}

/**
 * Gmail returns snippets HTML-escaped ("I&#39;m"). Decode them so the text reads
 * correctly and so substring search matches what a person would type.
 */
const NAMED_ENTITIES = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  rsquo: "\u2019", lsquo: "\u2018", ldquo: "\u201c", rdquo: "\u201d",
  mdash: "\u2014", ndash: "\u2013", hellip: "\u2026",
};

function decodeEntities(text) {
  if (!text) return "";

  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&([a-z]+);/gi, (match, name) => NAMED_ENTITIES[name.toLowerCase()] ?? match);
}

// ─── Header / address helpers ──────────────────────────────────────────────
function headerValue(headers, name) {
  const found = (headers || []).find((h) => h.name.toLowerCase() === name.toLowerCase());
  return found ? found.value : "";
}

/**
 * Split an address list on commas that are not inside quotes or angle brackets —
 * recruiter mail routinely uses `"Doe, Jane" <jane@acme.com>`.
 */
function splitAddresses(value) {
  const chunks = [];
  let current = "";
  let inQuotes = false;
  let inAngle = false;

  for (const char of value) {
    if (char === '"' && !inAngle) inQuotes = !inQuotes;
    else if (char === "<" && !inQuotes) inAngle = true;
    else if (char === ">" && !inQuotes) inAngle = false;

    if (char === "," && !inQuotes && !inAngle) {
      chunks.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  chunks.push(current);
  return chunks;
}

/**
 * Parse an RFC-5322 address list: `Jane Doe <jane@acme.com>, bob@acme.com`
 */
function parseAddressList(value) {
  if (!value) return [];

  return splitAddresses(value)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const angle = chunk.match(/^(.*?)<([^>]+)>$/);
      if (angle) {
        return {
          name: angle[1].trim().replace(/^["']|["']$/g, ""),
          email: angle[2].trim().toLowerCase(),
        };
      }
      return { name: "", email: chunk.trim().toLowerCase() };
    })
    .filter((a) => a.email.includes("@"));
}

function domainFromEmail(email) {
  const at = (email || "").lastIndexOf("@");
  return at === -1 ? "" : email.slice(at + 1).toLowerCase();
}

/**
 * "careers.acme-corp.co.uk" → "Acme Corp". Personal mail domains stay blank so
 * the UI can fall back to the person's name.
 */
function companyNameFromDomain(domain) {
  if (!domain || PERSONAL_DOMAINS.has(domain)) return "";

  const parts = domain.split(".").filter((p) => !["www", "mail", "careers", "jobs", "hr", "recruiting"].includes(p));
  const generic = new Set(["com", "net", "org", "io", "co", "in", "uk", "us", "ai", "dev", "app", "tech"]);
  const core = parts.find((p) => !generic.has(p)) || parts[0] || domain;

  return core
    .split(/[-_]/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ")
    .trim();
}

// ─── Attachment extraction ─────────────────────────────────────────────────
function collectParts(part, acc = []) {
  if (!part) return acc;
  acc.push(part);
  (part.parts || []).forEach((child) => collectParts(child, acc));
  return acc;
}

function extractAttachments(payload, cfg) {
  return collectParts(payload)
    .filter((p) => p.filename && p.filename.trim())
    .map((p) => {
      const filename = p.filename.trim();
      const ext = filename.includes(".") ? filename.split(".").pop().toLowerCase() : "";
      const typeOk = cfg.fileTypes.length === 0 || cfg.fileTypes.includes(ext);

      return {
        filename,
        mimeType: p.mimeType || "",
        sizeBytes: p.body?.size || 0,
        attachmentId: p.body?.attachmentId || "",
        isCv: typeOk && cfg.cvNameRegex.test(filename) && !cfg.cvExcludeRegex.test(filename),
      };
    });
}

// ─── Message → document ────────────────────────────────────────────────────
function buildOutreachDoc(message, cfg) {
  const headers = message.payload?.headers || [];
  const attachments = extractAttachments(message.payload, cfg);
  const cvAttachment = attachments.find((a) => a.isCv);

  if (!cvAttachment) return null;

  const to = parseAddressList(headerValue(headers, "To"));
  const cc = parseAddressList(headerValue(headers, "Cc"));
  const bcc = parseAddressList(headerValue(headers, "Bcc"));
  const from = parseAddressList(headerValue(headers, "From"))[0] || { email: "", name: "" };

  const primary = to[0] || cc[0] || bcc[0] || { email: "", name: "" };
  const domain = domainFromEmail(primary.email);

  const sentAt = message.internalDate
    ? new Date(Number(message.internalDate))
    : new Date(headerValue(headers, "Date") || Date.now());

  return {
    gmailMessageId: message.id,
    gmailThreadId: message.threadId,
    historyId: message.historyId || "",
    labelIds: message.labelIds || [],

    subject: headerValue(headers, "Subject") || "(no subject)",
    snippet: decodeEntities(message.snippet),
    fromEmail: from.email,
    to: to.map((a) => a.email),
    cc: cc.map((a) => a.email),
    bcc: bcc.map((a) => a.email),

    primaryRecipient: primary.email,
    primaryRecipientName: primary.name,
    recipientDomain: domain,
    companyName: companyNameFromDomain(domain),
    recipientCount: to.length + cc.length + bcc.length,

    attachments,
    cvFileName: cvAttachment.filename,
    attachmentCount: attachments.length,

    sentAt,
  };
}

// ─── Gmail query ───────────────────────────────────────────────────────────
function buildQuery(since, cfg) {
  const parts = ["in:sent", "has:attachment"];

  if (cfg.fileTypes.length) {
    parts.push(`filename:(${cfg.fileTypes.join(" OR ")})`);
  }

  if (since) {
    // Gmail `after:` is date-granular — step back a day so nothing is skipped.
    const safe = new Date(since.getTime() - 24 * 60 * 60 * 1000);
    const y = safe.getFullYear();
    const m = String(safe.getMonth() + 1).padStart(2, "0");
    const d = String(safe.getDate()).padStart(2, "0");
    parts.push(`after:${y}/${m}/${d}`);
  }

  if (cfg.extraQuery) parts.push(cfg.extraQuery);

  return parts.join(" ");
}

// ─── Lock ──────────────────────────────────────────────────────────────────
async function acquireLock(trigger, cfg) {
  const staleBefore = new Date(Date.now() - cfg.lockStaleMinutes * 60 * 1000);

  try {
    return await GmailSyncState.findOneAndUpdate(
      {
        key: STATE_KEY,
        $or: [{ running: false }, { running: { $exists: false } }, { runningSince: { $lt: staleBefore } }],
      },
      {
        $set: {
          key: STATE_KEY,
          running: true,
          runningSince: new Date(),
          lockOwner: `${process.pid}`,
          lastTrigger: trigger,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
  } catch (error) {
    // Duplicate key = the state doc exists but is locked by a live run.
    if (error.code === 11000) return null;
    throw error;
  }
}

async function releaseLock(update) {
  await GmailSyncState.updateOne(
    { key: STATE_KEY },
    { $set: { running: false, runningSince: null, lockOwner: "", ...update } }
  );
}

// ─── Import pass ───────────────────────────────────────────────────────────
async function importSentMessages(gmail, since, cfg, stats) {
  let pageToken;
  const query = buildQuery(since, cfg);

  logger.info(`[GmailSync] Query: ${query}`);

  do {
    const { data } = await gmail.users.messages.list({
      userId: "me",
      q: query,
      maxResults: 100,
      pageToken,
    });

    const messages = data.messages || [];
    if (!messages.length) break;

    // Only fetch what we do not already have — messages.get is the expensive call.
    const ids = messages.map((m) => m.id);
    const known = await CvOutreach.find({ gmailMessageId: { $in: ids } })
      .select("gmailMessageId")
      .lean();
    const knownIds = new Set(known.map((k) => k.gmailMessageId));
    const newIds = ids.filter((id) => !knownIds.has(id));

    for (const id of newIds) {
      if (stats.scanned >= cfg.maxMessages) return;
      stats.scanned += 1;

      try {
        const { data: message } = await gmail.users.messages.get({
          userId: "me",
          id,
          format: "full",
        });

        const doc = buildOutreachDoc(message, cfg);
        if (!doc) continue;

        stats.matched += 1;

        const result = await CvOutreach.updateOne(
          { gmailMessageId: doc.gmailMessageId },
          { $set: doc },
          // Without setDefaultsOnInsert the reply fields are absent, not false,
          // and the reply pass below would never match the document.
          { upsert: true, setDefaultsOnInsert: true }
        );

        if (result.upsertedCount || result.upserted) stats.inserted += 1;
        else stats.updated += 1;

        if (!stats.newestSentAt || doc.sentAt > stats.newestSentAt) {
          stats.newestSentAt = doc.sentAt;
        }
      } catch (error) {
        stats.errors.push(`message ${id}: ${error.message}`);
        logger.warn(`[GmailSync] Failed message ${id}: ${error.message}`);
      }
    }

    pageToken = data.nextPageToken;
  } while (pageToken && stats.scanned < cfg.maxMessages);
}

// ─── Reply pass ────────────────────────────────────────────────────────────
async function checkReplies(gmail, mailboxEmail, cfg, stats) {
  const windowStart = new Date(Date.now() - cfg.replyWindowDays * 24 * 60 * 60 * 1000);

  const pending = await CvOutreach.find({
    sentAt: { $gte: windowStart },
    replied: { $ne: true },
    bounced: { $ne: true },
  })
    .sort({ replyCheckedAt: 1, sentAt: -1 })
    .limit(cfg.replyCheckLimit)
    .select("gmailThreadId gmailMessageId sentAt")
    .lean();

  for (const doc of pending) {
    try {
      const { data: thread } = await gmail.users.threads.get({
        userId: "me",
        id: doc.gmailThreadId,
        format: "metadata",
        metadataHeaders: ["From", "Subject", "Date"],
      });

      stats.threadsChecked += 1;

      const sentMs = new Date(doc.sentAt).getTime();
      const replies = (thread.messages || [])
        .map((m) => {
          const headers = m.payload?.headers || [];
          const from = parseAddressList(headerValue(headers, "From"))[0] || { email: "" };
          return {
            email: from.email,
            subject: headerValue(headers, "Subject"),
            snippet: decodeEntities(m.snippet),
            at: Number(m.internalDate || 0),
          };
        })
        .filter((m) => m.at > sentMs && m.email && m.email !== mailboxEmail.toLowerCase())
        .sort((a, b) => a.at - b.at);

      const update = {
        replyCheckedAt: new Date(),
        threadMessageCount: (thread.messages || []).length,
      };

      if (replies.length) {
        const first = replies[0];
        const last = replies[replies.length - 1];
        const isBounce = BOUNCE_SENDERS.test(first.email) || BOUNCE_SUBJECTS.test(first.subject || "");
        const ms = first.at - sentMs;

        Object.assign(update, {
          replied: !isBounce,
          bounced: isBounce,
          replyCount: replies.length,
          firstReplyAt: new Date(first.at),
          lastReplyAt: new Date(last.at),
          lastReplyFrom: last.email,
          firstReplySnippet: first.snippet.slice(0, 300),
          hoursToReply: Math.round((ms / (1000 * 60 * 60)) * 10) / 10,
          daysToReply: Math.round((ms / (1000 * 60 * 60 * 24)) * 10) / 10,
        });

        stats.repliesFound += 1;
      }

      await CvOutreach.updateOne(
        { gmailMessageId: doc.gmailMessageId },
        { $set: update, $inc: { replyChecks: 1 } }
      );
    } catch (error) {
      stats.errors.push(`thread ${doc.gmailThreadId}: ${error.message}`);
      logger.warn(`[GmailSync] Failed thread ${doc.gmailThreadId}: ${error.message}`);
    }
  }
}

// ─── Entry point ───────────────────────────────────────────────────────────
/**
 * Sync CV emails from Gmail SENT into MongoDB, then refresh reply status.
 * @param {{ trigger?: "cron"|"manual"|"startup", fullResync?: boolean }} options
 */
async function syncCvOutreach({ trigger = "cron", fullResync = false } = {}) {
  if (!isConfigured()) {
    return { ok: false, skipped: true, message: "Gmail is not configured" };
  }

  const cfg = config();
  const startedAt = Date.now();

  const state = await acquireLock(trigger, cfg);
  if (!state || (state.lockOwner && state.lockOwner !== `${process.pid}`)) {
    return { ok: false, skipped: true, message: "A sync is already running" };
  }

  const stats = {
    scanned: 0,
    matched: 0,
    inserted: 0,
    updated: 0,
    threadsChecked: 0,
    repliesFound: 0,
    newestSentAt: null,
    errors: [],
  };

  try {
    const gmail = getGmailClient();
    const profile = await getProfile();

    let since = null;
    if (!fullResync) {
      const previous = await GmailSyncState.findOne({ key: STATE_KEY }).select("lastMessageDate").lean();
      since = previous?.lastMessageDate || null;
    }
    if (!since) {
      since = new Date(Date.now() - cfg.lookbackDays * 24 * 60 * 60 * 1000);
    }

    await importSentMessages(gmail, since, cfg, stats);
    await checkReplies(gmail, profile.emailAddress, cfg, stats);

    const durationMs = Date.now() - startedAt;
    const status = stats.errors.length ? "partial" : "success";

    await releaseLock({
      lastSyncAt: new Date(),
      lastSyncStatus: status,
      lastError: stats.errors.slice(0, 3).join(" | "),
      lastDurationMs: durationMs,
      mailboxEmail: profile.emailAddress,
      ...(stats.newestSentAt ? { lastMessageDate: stats.newestSentAt } : {}),
      lastRun: {
        scanned: stats.scanned,
        matched: stats.matched,
        inserted: stats.inserted,
        updated: stats.updated,
        threadsChecked: stats.threadsChecked,
        repliesFound: stats.repliesFound,
      },
    });

    await GmailSyncState.updateOne(
      { key: STATE_KEY },
      { $inc: { totalSyncs: 1, totalInserted: stats.inserted } }
    );

    logger.info(
      `[GmailSync] ${status} in ${durationMs}ms — scanned ${stats.scanned}, matched ${stats.matched}, ` +
        `new ${stats.inserted}, threads ${stats.threadsChecked}, replies ${stats.repliesFound}`
    );

    return { ok: true, status, durationMs, mailbox: profile.emailAddress, stats };
  } catch (error) {
    await releaseLock({
      lastSyncAt: new Date(),
      lastSyncStatus: "error",
      lastError: error.message,
      lastDurationMs: Date.now() - startedAt,
    });

    logger.error(`[GmailSync] Failed: ${error.message}`);
    return { ok: false, status: "error", message: error.message, stats };
  }
}

module.exports = {
  STATE_KEY,
  syncCvOutreach,
  // exported for tests
  parseAddressList,
  decodeEntities,
  domainFromEmail,
  companyNameFromDomain,
  buildQuery,
  buildOutreachDoc,
  config,
};
