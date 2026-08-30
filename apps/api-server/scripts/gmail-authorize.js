#!/usr/bin/env node
/**
 * One-time Gmail authorization.
 *
 *   node scripts/gmail-authorize.js
 *
 * Opens a consent URL for the owner's Google account, captures the code on a
 * local loopback listener, and prints a refresh token to paste into .env as
 * GMAIL_REFRESH_TOKEN. Run once per mailbox — the token does not expire unless
 * you revoke it or change your password.
 *
 * Works with a Desktop ("installed") OAuth client: Google accepts any loopback
 * port for those, so no extra redirect URI needs registering.
 */

require("module-alias/register");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", "..", "..", ".env") });
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

const http = require("http");
const readline = require("readline");
const { google } = require("googleapis");

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];
const PORT = parseInt(process.env.GMAIL_AUTH_PORT || "5599", 10);
const REDIRECT_URI = `http://localhost:${PORT}`;

const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("\n  ✗ GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET must be set in .env first.\n");
  process.exit(1);
}

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent", // force a refresh token even on re-authorization
  scope: SCOPES,
});

console.log("\n────────────────────────────────────────────────────────────");
console.log("  Gmail authorization — CV outreach dashboard");
console.log("────────────────────────────────────────────────────────────\n");
console.log("  1. Open this URL in a browser signed in as the mailbox owner:\n");
console.log(`  ${authUrl}\n`);
console.log(`  2. Approve read-only Gmail access. You will land on ${REDIRECT_URI}.`);
console.log("     If the browser is on another machine, copy the ?code=... value");
console.log("     from the address bar and paste it below.\n");

let settled = false;

async function exchange(code, server) {
  if (settled) return;
  settled = true;

  try {
    const { tokens } = await oAuth2Client.getToken(code);

    if (!tokens.refresh_token) {
      console.error(
        "\n  ✗ No refresh token returned. Revoke this app at " +
          "https://myaccount.google.com/permissions and run the script again.\n"
      );
      process.exit(1);
    }

    oAuth2Client.setCredentials(tokens);
    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
    const { data: profile } = await gmail.users.getProfile({ userId: "me" });

    console.log("\n────────────────────────────────────────────────────────────");
    console.log(`  ✓ Authorized: ${profile.emailAddress}`);
    console.log(`    ${profile.messagesTotal} messages, ${profile.threadsTotal} threads`);
    console.log("────────────────────────────────────────────────────────────\n");
    console.log("  Add this to your .env (never commit it):\n");
    console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}\n`);
  } catch (error) {
    console.error(`\n  ✗ Token exchange failed: ${error?.response?.data?.error_description || error.message}\n`);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    process.exit(process.exitCode || 0);
  }
}

// Loopback listener — catches the redirect automatically.
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT_URI);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end(`Authorization denied: ${error}`);
    return;
  }

  if (!code) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Waiting for the Google redirect...");
    return;
  }

  res.writeHead(200, { "Content-Type": "text/html" });
  res.end("<h2>Authorized.</h2><p>You can close this tab and return to the terminal.</p>");

  await exchange(code, server);
});

server.on("error", (err) => {
  console.warn(`  ! Could not listen on ${REDIRECT_URI} (${err.message}) — paste the code manually.\n`);
});

server.listen(PORT, () => {
  console.log(`  Listening on ${REDIRECT_URI} for the redirect...\n`);
});

// Manual fallback — accepts a bare code or the whole redirect URL.
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question("  Paste code (or full redirect URL), or just wait: ", async (answer) => {
  const trimmed = (answer || "").trim();
  if (!trimmed) return;

  let code = trimmed;
  if (trimmed.startsWith("http")) {
    try {
      code = new URL(trimmed).searchParams.get("code") || trimmed;
    } catch {
      /* fall through with the raw value */
    }
  }

  rl.close();
  await exchange(code, server);
});
