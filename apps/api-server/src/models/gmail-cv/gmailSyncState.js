const mongoose = require("mongoose");

/**
 * Singleton state document for the Gmail CV outreach sync.
 * key = "cv_outreach"
 */
const gmailSyncStateSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "cv_outreach" },

    // Lock — prevents overlapping cron/manual runs
    running: { type: Boolean, default: false },
    runningSince: { type: Date },
    lockOwner: { type: String, default: "" },

    // Last run
    lastSyncAt: { type: Date },
    lastSyncStatus: {
      type: String,
      enum: ["never", "success", "partial", "error"],
      default: "never",
    },
    lastError: { type: String, default: "" },
    lastTrigger: { type: String, enum: ["cron", "manual", "startup"], default: "cron" },
    lastDurationMs: { type: Number, default: 0 },

    // Watermark — newest sentAt already imported
    lastMessageDate: { type: Date },

    // Counters from the last run
    lastRun: {
      scanned: { type: Number, default: 0 },
      matched: { type: Number, default: 0 },
      inserted: { type: Number, default: 0 },
      updated: { type: Number, default: 0 },
      threadsChecked: { type: Number, default: 0 },
      repliesFound: { type: Number, default: 0 },
    },

    // Lifetime counters
    totalSyncs: { type: Number, default: 0 },
    totalInserted: { type: Number, default: 0 },

    // Mailbox identity from the last successful auth
    mailboxEmail: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GmailSyncState", gmailSyncStateSchema);
