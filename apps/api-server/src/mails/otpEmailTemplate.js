/**
 * OTP Email Template — dark-themed, responsive HTML email
 * @param {string} otp - 6-digit OTP code
 * @param {string} name - Recipient name
 * @returns {string} HTML email body
 */
const otpEmailTemplate = (otp, name) => {
  const digits = otp.split("");
  const digitCells = digits
    .map(
      (d) =>
        `<td style="width:44px;height:52px;text-align:center;font-size:28px;font-weight:700;font-family:'Courier New',monospace;color:#ffffff;background:#1e293b;border:2px solid #3b82f6;border-radius:8px;letter-spacing:2px;">${d}</td>`
    )
    .join('<td style="width:8px;"></td>');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 0;">
  <tr><td align="center">
    <table width="480" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.4);">
      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:32px 40px;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:22px;font-weight:600;">Login Verification</h1>
        <p style="margin:8px 0 0;color:#93c5fd;font-size:14px;">Your one-time passcode</p>
      </td></tr>
      <!-- Body -->
      <tr><td style="padding:36px 40px;">
        <p style="color:#e2e8f0;font-size:15px;line-height:1.6;margin:0 0 24px;">
          Hi <strong>${name || "there"}</strong>,<br/>Use the code below to sign in to the dashboard.
        </p>
        <!-- OTP Code -->
        <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
          <tr>${digitCells}</tr>
        </table>
        <p style="text-align:center;color:#94a3b8;font-size:13px;margin:0 0 28px;">
          This code expires in <strong style="color:#f59e0b;">5 minutes</strong>.
        </p>
        <hr style="border:none;border-top:1px solid #334155;margin:0 0 20px;">
        <p style="color:#64748b;font-size:12px;line-height:1.5;margin:0;">
          If you did not request this code, someone may be trying to access your account. You can safely ignore this email.
        </p>
      </td></tr>
      <!-- Footer -->
      <tr><td style="background:#0f172a;padding:20px 40px;text-align:center;">
        <p style="color:#475569;font-size:11px;margin:0;">&copy; ${new Date().getFullYear()} Ashiwani Kumar &middot; Secure Login</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
};

module.exports = { otpEmailTemplate };
