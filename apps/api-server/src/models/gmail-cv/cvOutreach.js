const mongoose = require("mongoose");

/**
 * One document per CV/resume email sent from the owner's Gmail SENT folder.
 * Detected by attachment filename match — see cvOutreachSyncService.
 */
const attachmentSchema = new mongoose.Schema(
  {
    filename: { type: String, default: "" },
    mimeType: { type: String, default: "" },
    sizeBytes: { type: Number, default: 0 },
    attachmentId: { type: String, default: "" },
    isCv: { type: Boolean, default: false },
  },
  { _id: false }
);

const cvOutreachSchema = new mongoose.Schema(
  {
    // ── Gmail identity ───────────────────────────────────────────
    gmailMessageId: { type: String, required: true, unique: true, index: true },
    gmailThreadId: { type: String, required: true, index: true },
    historyId: { type: String, default: "" },
    labelIds: { type: [String], default: [] },

    // ── Message ──────────────────────────────────────────────────
    subject: { type: String, default: "(no subject)" },
    snippet: { type: String, default: "" },
    fromEmail: { type: String, default: "" },
    to: { type: [String], default: [] },
    cc: { type: [String], default: [] },
    bcc: { type: [String], default: [] },

    // ── Derived recipient info ───────────────────────────────────
    primaryRecipient: { type: String, default: "", index: true },
    primaryRecipientName: { type: String, default: "" },
    recipientDomain: { type: String, default: "", index: true },
    companyName: { type: String, default: "" },
    recipientCount: { type: Number, default: 0 },

    // ── Attachments ──────────────────────────────────────────────
    attachments: { type: [attachmentSchema], default: [] },
    cvFileName: { type: String, default: "" },
    attachmentCount: { type: Number, default: 0 },

    // ── Timing ───────────────────────────────────────────────────
    sentAt: { type: Date, required: true, index: true },

    // ── Manual flags ─────────────────────────────────────────────
    starred: { type: Boolean, default: false, index: true },

    // ── Reply tracking ───────────────────────────────────────────
    replied: { type: Boolean, default: false, index: true },
    replyCount: { type: Number, default: 0 },
    firstReplyAt: { type: Date },
    lastReplyAt: { type: Date },
    lastReplyFrom: { type: String, default: "" },
    firstReplySnippet: { type: String, default: "" },
    hoursToReply: { type: Number },
    daysToReply: { type: Number },
    threadMessageCount: { type: Number, default: 1 },
    bounced: { type: Boolean, default: false, index: true },
    replyCheckedAt: { type: Date },
    replyChecks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Analytics indexes
cvOutreachSchema.index({ sentAt: -1 });
cvOutreachSchema.index({ recipientDomain: 1, sentAt: -1 });
cvOutreachSchema.index({ replied: 1, sentAt: -1 });

module.exports = mongoose.model("CvOutreach", cvOutreachSchema);
