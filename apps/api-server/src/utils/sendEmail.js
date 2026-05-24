const nodemailer = require("nodemailer");
const logger = require("@utils/logger");

// ---------------------------------------------------------------------------
// Reusable transporter — created once, keeps SMTP connection alive via pooling
// ---------------------------------------------------------------------------
let _transporter = null;

function getTransporter() {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host: "smtp.zoho.com",
      port: 587,
      secure: false,
      pool: true, // reuse connections
      maxConnections: 3,
      auth: {
        user: process.env.ZOHO_NODEMAILER_EMAIL_HELLO,
        pass: process.env.ZOHO_NODEMAILER_PASSWORD_HELLO,
      },
      tls: {
        ciphers: "SSLv3",
        rejectUnauthorized: false,
      },
    });
    logger.info("[Email] SMTP transporter initialized (pooled)");
  }
  return _transporter;
}

const sendEmail = async (options) => {
  try {
    const transporter = getTransporter();
    const recipientEmail = options.to || options.email;

    if (!recipientEmail) {
      throw new Error("Recipient email address is required");
    }

    const senderEmail = process.env.ZOHO_NODEMAILER_EMAIL_HELLO;
    const mailOptions = {
      from: options.from || `Ashiwani Kumar <${senderEmail}>`,
      to: recipientEmail,
      subject: options.subject,
      html: options.html,
      encoding: "8bit",
      textEncoding: "base64",
      headers: {
        "Reply-To": senderEmail,
        "X-Auto-Response-Suppress": "OOF, AutoReply",
        "X-Report-Abuse": `Please report abuse to ${senderEmail}`,
        Date: new Date().toUTCString(),
        "MIME-Version": "1.0",
        "X-Priority": "1",
        "X-Mailer": "Nodemailer",
        "Return-Path": `<${senderEmail}>`,
        ...(options.headers || {}),
      },
    };

    const result = await transporter.sendMail(mailOptions);

    logger.info(`[Email] Sent to: ${recipientEmail}`, {
      subject: options.subject,
      emailType: options.emailType || "General",
      messageId: result.messageId,
    });

    return {
      success: true,
      messageId: result.messageId,
      response: result.response,
    };
  } catch (error) {
    logger.error(`[Email] Failed to send to: ${options.to || options.email}`, {
      error: error.message,
    });
    return {
      success: false,
      error: error.message || "Failed to send email",
    };
  }
};

module.exports = sendEmail;
