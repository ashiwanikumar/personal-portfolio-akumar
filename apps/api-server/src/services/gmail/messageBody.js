/**
 * Decode and sanitize a Gmail message body for the dashboard reading pane.
 * These are the owner's own sent messages, but the HTML still gets stripped of
 * anything active before it reaches the browser.
 */

function collectParts(part, acc = []) {
  if (!part) return acc;
  acc.push(part);
  (part.parts || []).forEach((child) => collectParts(child, acc));
  return acc;
}

function decodeBase64Url(data) {
  if (!data) return "";
  return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
}

/**
 * Remove scripts, styles, embedded frames, event handlers and javascript: URLs.
 */
function sanitizeHtml(html) {
  if (!html) return "";

  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|base|form)[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|base|form)\b[^>]*\/?>/gi, "")
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, "")
    .replace(/(href|src|action)\s*=\s*("|')\s*javascript:[^"']*\2/gi, '$1="#"')
    .replace(/<a\b/gi, '<a target="_blank" rel="noopener noreferrer nofollow"');
}

/**
 * @param {object} payload Gmail message payload
 * @returns {{ html: string, text: string, format: "html"|"text"|"none" }}
 */
function extractBody(payload) {
  const parts = collectParts(payload);

  const htmlPart = parts.find((p) => p.mimeType === "text/html" && p.body?.data);
  if (htmlPart) {
    return { html: sanitizeHtml(decodeBase64Url(htmlPart.body.data)), text: "", format: "html" };
  }

  const textPart = parts.find((p) => p.mimeType === "text/plain" && p.body?.data);
  if (textPart) {
    return { html: "", text: decodeBase64Url(textPart.body.data), format: "text" };
  }

  if (payload?.body?.data) {
    return { html: "", text: decodeBase64Url(payload.body.data), format: "text" };
  }

  return { html: "", text: "", format: "none" };
}

module.exports = { extractBody, sanitizeHtml, decodeBase64Url };
