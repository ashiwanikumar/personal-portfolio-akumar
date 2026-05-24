const nodemailer = require("nodemailer");
const { generateBackupCodesEmailTemplate } = require("@mails/mfa/backupCodesEmailTemplate");
const { generateMFASetupNotificationTemplate } = require("@mails/mfa/mfaEnabledEmailTemplate");
const { generateMFADisabledNotificationTemplate } = require("@mails/mfa/mfaDisabledEmailTemplate");
const { generateBackupCodesRegeneratedEmailTemplate } = require("@mails/mfa/backupCodesRegeneratedEmailTemplate");

/**
 * Send MFA-related emails using the same SMTP configuration
 * as the Ask Sschouhan email service
 */
const sendMFAEmail = async (options) => {
  try {
    // Create transporter with the same SMTP configuration
    const transporter = nodemailer.createTransport({
      port: 587,
      host: "smtp.zoho.com",
      tls: {
        ciphers: "SSLv3",
        rejectUnauthorized: false,
      },
      auth: {
        user: process.env.ZOHO_NODEMAILER_EMAIL_HELLO,
        pass: process.env.ZOHO_NODEMAILER_PASSWORD_HELLO,
      },
      secure: false,
      encryption: "STARTTLS",
    });

    // Verify connection configuration
    await new Promise((resolve, reject) => {
      transporter.verify(function (error, success) {
        if (error) {
          console.log("MFA email server verification failed:", error);
          reject(error);
        } else {
          console.log("MFA email server is ready to send messages");
          resolve(success);
        }
      });
    });

    // Handle recipient email
    const recipientEmail = options.to || options.email;

    if (!recipientEmail) {
      throw new Error("Recipient email address is required");
    }

    // Configure mail options with MFA-specific headers
    const mailOptions = {
      from:
        options.from ||
        `SSC Dashboard Security <${process.env.ZOHO_NODEMAILER_EMAIL_HELLO}>`,
      to: recipientEmail,
      subject: options.subject,
      html: options.html,
      encoding: "8bit",
      textEncoding: "base64",
      headers: {
        "Reply-To": "security@ashiwanikumar.in",
        "X-Auto-Response-Suppress": "OOF, AutoReply",
        "X-Report-Abuse":
          "Please report abuse to security@ashiwanikumar.in",
        Date: new Date().toUTCString(),
        "MIME-Version": "1.0",
        "X-Priority": options.priority || "2", // High priority for security emails
        "X-Mailer": "SSC Dashboard Security System",
        "Return-Path": `<security@ashiwanikumar.in>`,
        "List-Unsubscribe": "<mailto:unsubscribe@ashiwanikumar.in>",
        "X-MFA-Operation": options.mfaOperation || "General",
        "X-Security-Alert": "true",
        ...(options.headers || {}),
      },
    };

    // Add CC for admin notifications if specified
    if (options.cc) {
      mailOptions.cc = options.cc;
    }

    // Add BCC for internal tracking if specified
    if (options.bcc) {
      mailOptions.bcc = options.bcc;
    }

    // Send the email
    const result = await transporter.sendMail(mailOptions);
    console.log("MFA email sent successfully to:", recipientEmail);

    // Log MFA email details
    const logDetails = {
      recipientEmail,
      emailSubject: options.subject,
      emailType: options.emailType || "MFA",
      mfaOperation: options.mfaOperation || "General",
      userId: options.userId,
      adminId: options.adminId,
      timestamp: new Date().toISOString(),
      messageId: result.messageId,
    };

    console.log("MFA Email Details:", logDetails);

    return {
      success: true,
      messageId: result.messageId,
      response: result.response,
      details: logDetails,
    };
  } catch (error) {
    console.error("Error sending MFA email:", error);

    // Log error details
    console.error("MFA Email Error Details:", {
      recipientEmail: options.to || options.email,
      subject: options.subject,
      userId: options.userId,
      adminId: options.adminId,
      errorMessage: error.message,
      errorCode: error.code,
      timestamp: new Date().toISOString(),
    });

    return {
      success: false,
      error: error.message || "Failed to send MFA email",
      errorCode: error.code,
    };
  }
};

/**
 * Send MFA backup codes to team email
 * @param {Object} userData - User data
 * @param {Array<string>} backupCodes - Array of backup codes
 * @param {string} adminEmail - Admin's email address
 * @param {string} adminName - Admin's name
 * @param {string} adminId - Admin's user ID
 * @returns {Promise<Object>} Email send result
 */
const sendBackupCodesToEmail = async (userData, backupCodes, adminEmail, adminName, adminId) => {
  const template = generateBackupCodesEmailTemplate(userData, backupCodes, adminName);
  
  return await sendMFAEmail({
    to: adminEmail,
    subject: `🔐 MFA Backup Codes for ${userData.name} (${userData.email})`,
    html: template,
    emailType: "BackupCodes",
    mfaOperation: "BackupCodesEmail",
    userId: userData._id,
    adminId: adminId,
    priority: "2", // High priority for security
    headers: {
      "X-User-Email": userData.email,
      "X-User-Name": userData.name,
      "X-Admin-Request": "true",
      "X-Backup-Codes-Count": backupCodes.length.toString(),
    },
  });
};


/**
 * Send MFA setup notification to admin
 * @param {Object} userData - User data
 * @param {string} adminEmail - Admin's email address
 * @param {string} adminName - Admin's name
 * @param {string} adminId - Admin's user ID
 * @returns {Promise<Object>} Email send result
 */
const sendMFASetupNotification = async (userData, adminEmail, adminName, adminId) => {
  const template = generateMFASetupNotificationTemplate(userData, adminName);
  
  return await sendMFAEmail({
    to: adminEmail,
    subject: `🔐 MFA Enabled for ${userData.name} (${userData.email})`,
    html: template,
    emailType: "MFASetupNotification",
    mfaOperation: "SetupNotification",
    userId: userData._id,
    adminId: adminId,
    priority: "3", // Normal priority for notifications
    headers: {
      "X-User-Email": userData.email,
      "X-User-Name": userData.name,
      "X-MFA-Event": "Setup",
    },
  });
};

/**
 * Send MFA disabled notification to user
 * @param {Object} userData - User data
 * @param {string} disabledBy - Who disabled MFA ('user' or 'admin')
 * @param {Object} adminData - Admin data if disabled by admin
 * @returns {Promise<Object>} Email send result
 */
const sendMFADisabledNotification = async (userData, disabledBy = 'user', adminData = null) => {
  const template = generateMFADisabledNotificationTemplate(userData, disabledBy, adminData);
  
  return await sendMFAEmail({
    to: userData.email,
    subject: `⚠️ Two-Factor Authentication Disabled - ${userData.name}`,
    html: template,
    emailType: "MFADisabledNotification",
    mfaOperation: "DisabledNotification",
    userId: userData._id,
    adminId: adminData?._id,
    priority: "1", // High priority for security notifications
    headers: {
      "X-User-Email": userData.email,
      "X-User-Name": userData.name,
      "X-MFA-Event": "Disabled",
      "X-Disabled-By": disabledBy,
    },
  });
};

/**
 * Send backup codes regeneration notification to user
 * @param {Object} userData - User data
 * @param {Array<string>} backupCodes - Array of new backup codes (optional)
 * @param {boolean} includeCodes - Whether to include codes in email (default: false for security)
 * @param {string} adminId - Admin/User ID who initiated the action (optional)
 * @returns {Promise<Object>} Email send result
 */
const sendBackupCodesRegeneratedNotification = async (userData, backupCodes = [], includeCodes = false, adminId = null) => {
  const template = generateBackupCodesRegeneratedEmailTemplate(userData, backupCodes, includeCodes);
  
  return await sendMFAEmail({
    to: userData.email,
    subject: `🔄 MFA Backup Codes Regenerated - ${userData.name}`,
    html: template,
    emailType: "BackupCodesRegeneratedNotification",
    mfaOperation: "BackupCodesRegenerated",
    userId: userData._id,
    adminId: adminId || userData._id, // Use the adminId or default to userId for self-initiated actions
    priority: "2", // High priority for security notifications
    headers: {
      "X-User-Email": userData.email,
      "X-User-Name": userData.name,
      "X-MFA-Event": "BackupCodesRegenerated",
      "X-Codes-Count": backupCodes.length.toString(),
      "X-Codes-Included": includeCodes.toString(),
    },
  });
};

module.exports = {
  sendMFAEmail,
  sendBackupCodesToEmail,
  sendMFASetupNotification,
  sendMFADisabledNotification,
  sendBackupCodesRegeneratedNotification,
};