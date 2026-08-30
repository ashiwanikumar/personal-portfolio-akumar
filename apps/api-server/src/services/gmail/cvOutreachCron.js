const cron = require("node-cron");
const { syncCvOutreach } = require("./cvOutreachSyncService");
const { isConfigured } = require("./gmailClient");
const logger = require("@utils/logger");

/**
 * Periodic Gmail → MongoDB sync for CV outreach.
 * Schedule via GMAIL_SYNC_CRON (default: every 30 minutes).
 */
function initializeCvOutreachCron() {
  if (!isConfigured()) {
    logger.warn("[GmailCron] Gmail not configured — CV outreach sync disabled");
    return null;
  }

  const schedule = process.env.GMAIL_SYNC_CRON || "*/30 * * * *";

  if (!cron.validate(schedule)) {
    logger.error(`[GmailCron] Invalid GMAIL_SYNC_CRON "${schedule}" — sync not scheduled`);
    return null;
  }

  const task = cron.schedule(schedule, async () => {
    try {
      const result = await syncCvOutreach({ trigger: "cron" });
      if (!result.ok && !result.skipped) {
        logger.error(`[GmailCron] Sync failed: ${result.message}`);
      }
    } catch (error) {
      logger.error(`[GmailCron] Unhandled sync error: ${error.message}`);
    }
  });

  logger.info(`[GmailCron] CV outreach sync scheduled (${schedule})`);
  return task;
}

module.exports = { initializeCvOutreachCron };
