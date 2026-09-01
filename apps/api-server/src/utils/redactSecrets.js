/**
 * Strips credentials out of text before it reaches a log.
 *
 * Node prints some warnings itself — DEP0170 echoes the whole Mongo URI, password
 * included — so masking at the log call site is not enough; see installLogRedaction.
 */

// user:password@host  in any URI scheme (mongodb, mongodb+srv, amqp, redis, https…)
const URI_CREDENTIALS = /(\b[a-z][a-z0-9+.-]*:\/\/)([^/\s:@]+):([^@\s/]+)@/gi;

// key=value and "key": "value" for names that are secret by definition. The
// leading class matters: GMAIL_CLIENT_SECRET has no word boundary before
// "SECRET", so \b would miss every prefixed variable.
const SECRET_ASSIGNMENT =
  /([A-Za-z0-9_.-]*(?:password|passwd|pwd|secret|token|api[_-]?key|credential)s?)("?\s*[:=]\s*)("?)([^\s,;"'&}]+)\3/gi;

function redactSecrets(value) {
  if (value === null || value === undefined) return value;

  const text = typeof value === "string" ? value : String(value);

  return text
    .replace(URI_CREDENTIALS, (_, scheme, user) => `${scheme}${user}:****@`)
    .replace(SECRET_ASSIGNMENT, (match, key, sep, quote) => `${key}${sep}${quote}****${quote}`);
}

/**
 * Node prints process warnings through its own internal 'warning' listener, so a
 * warning containing a connection string bypasses the logger entirely. Removing
 * that listener and printing a redacted version keeps the warning visible
 * without the credentials.
 */
function installLogRedaction(logger) {
  process.removeAllListeners("warning");

  process.on("warning", (warning) => {
    const name = warning.name || "Warning";
    const message = redactSecrets(warning.message || "");
    const line = `[${name}] ${message}`;

    if (logger && typeof logger.warn === "function") logger.warn(line);
    else console.warn(line);
  });
}

module.exports = { redactSecrets, installLogRedaction };
