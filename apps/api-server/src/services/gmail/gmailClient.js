const { google } = require("googleapis");
const logger = require("@utils/logger");

/**
 * Gmail API client for the owner's personal mailbox.
 *
 * Auth model: a Desktop ("installed") OAuth client + a long-lived refresh token
 * obtained once via `node scripts/gmail-authorize.js`. No web callback needed —
 * this reads exactly one mailbox (the site owner's), never a visitor's.
 *
 * Required env:
 *   GMAIL_CLIENT_ID
 *   GMAIL_CLIENT_SECRET
 *   GMAIL_REFRESH_TOKEN
 * Optional:
 *   GMAIL_REDIRECT_URI   (default http://localhost)
 */

// Read-only is all this feature ever needs.
const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

function getMissingEnv() {
  return ["GMAIL_CLIENT_ID", "GMAIL_CLIENT_SECRET", "GMAIL_REFRESH_TOKEN"].filter(
    (key) => !process.env[key]
  );
}

function isConfigured() {
  return getMissingEnv().length === 0;
}

/**
 * Build an OAuth2 client. Used both by the server (with a refresh token) and by
 * the one-time authorize script (without one).
 */
function buildOAuthClient() {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const redirectUri = process.env.GMAIL_REDIRECT_URI || "http://localhost";

  if (!clientId || !clientSecret) {
    throw new Error("GMAIL_CLIENT_ID / GMAIL_CLIENT_SECRET are not set");
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

let cachedClient = null;

/**
 * Authenticated Gmail API client, memoised. googleapis refreshes the access
 * token on its own from the refresh token, so this is safe to hold onto.
 */
function getGmailClient() {
  if (cachedClient) return cachedClient;

  const missing = getMissingEnv();
  if (missing.length) {
    throw new Error(`Gmail is not configured — missing env: ${missing.join(", ")}`);
  }

  const auth = buildOAuthClient();
  auth.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });

  auth.on("tokens", (tokens) => {
    if (tokens.refresh_token) {
      logger.warn("[Gmail] Google issued a new refresh token — update GMAIL_REFRESH_TOKEN in .env");
    }
  });

  cachedClient = google.gmail({ version: "v1", auth });
  return cachedClient;
}

/**
 * Verify credentials and return the mailbox profile.
 * Throws a readable error rather than the raw Google payload.
 */
async function getProfile() {
  try {
    const gmail = getGmailClient();
    const { data } = await gmail.users.getProfile({ userId: "me" });
    return {
      emailAddress: data.emailAddress,
      messagesTotal: data.messagesTotal,
      threadsTotal: data.threadsTotal,
      historyId: data.historyId,
    };
  } catch (error) {
    const reason = error?.response?.data?.error_description || error?.message || "unknown error";
    throw new Error(`Gmail auth failed: ${reason}`);
  }
}

module.exports = {
  SCOPES,
  isConfigured,
  getMissingEnv,
  buildOAuthClient,
  getGmailClient,
  getProfile,
};
