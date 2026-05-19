const nodemailer = require("nodemailer");

const sendContactEmail = async (options) => {
  try {
    // Create transporter with contact-specific email configuration
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
          console.log("Contact email server verification failed:", error);
          reject(error);
        } else {
          console.log("Contact email server is ready to send messages");
          resolve(success);
        }
      });
    });

    // Handle recipient email
    const recipientEmail = options.to || options.email;

    if (!recipientEmail) {
      throw new Error("Recipient email address is required");
    }

    // Configure mail options with contact-specific headers
    const mailOptions = {
      from:
        options.from || `Ministry of Agriculture <${process.env.ZOHO_NODEMAILER_EMAIL_HELLO}>`,
      to: recipientEmail,
      subject: options.subject,
      html: options.html,
      encoding: "8bit",
      textEncoding: "base64",
      headers: {
        "Reply-To": "info@shivrajsinghchouhan.co.in",
        "X-Auto-Response-Suppress": "OOF, AutoReply",
        "X-Report-Abuse":
          "Please report abuse to abuse@shivrajsinghchouhan.co.in",
        Date: new Date().toUTCString(),
        "MIME-Version": "1.0",
        "X-Priority": options.priority || "3", // Normal priority by default
        "X-Mailer": "Ministry Contact System",
        "Return-Path": `<info@shivrajsinghchouhan.co.in>`,
        "List-Unsubscribe": "<mailto:unsubscribe@shivrajsinghchouhan.co.in>",
        "X-Contact-Type": options.contactType || "General",
        "X-Contact-ID": options.contactId || "N/A",
        ...(options.headers || {}),
      },
    };

    // Add CC for admin notifications if specified
    if (options.cc) {
      mailOptions.cc = options.cc;
    }

    // Send the email
    const result = await transporter.sendMail(mailOptions);
    console.log("Contact email sent successfully to:", recipientEmail);

    // Log contact email details
    const logDetails = {
      contactId: options.contactId,
      recipientEmail,
      emailSubject: options.subject,
      emailType: options.emailType || "Contact",
      contactType: options.contactType || "General",
      timestamp: new Date().toISOString(),
      messageId: result.messageId,
    };

    if (options.contactData) {
      logDetails.contactName = options.contactData.name;
      logDetails.contactCategory = options.contactData.category?.id;
    }

    console.log("Contact Email Details:", logDetails);

    return {
      success: true,
      messageId: result.messageId,
      response: result.response,
      details: logDetails,
    };
  } catch (error) {
    console.error("Error sending contact email:", error);
    
    // Log error details
    console.error("Contact Email Error Details:", {
      recipientEmail: options.to || options.email,
      subject: options.subject,
      contactId: options.contactId,
      errorMessage: error.message,
      errorCode: error.code,
      timestamp: new Date().toISOString(),
    });

    return {
      success: false,
      error: error.message || "Failed to send contact email",
      errorCode: error.code,
    };
  }
};

/**
 * Send contact confirmation email to user
 * @param {Object} contactData - The contact form data
 * @param {string} template - The HTML email template
 * @returns {Promise<Object>} Email send result
 */
const sendContactConfirmation = async (contactData, template) => {
  return await sendContactEmail({
    to: contactData.email,
    subject: "Thank you for contacting Ministry of Agriculture & Farmers Welfare",
    html: template,
    emailType: "ContactConfirmation",
    contactType: contactData.category?.id || "General",
    contactId: contactData._id,
    contactData: contactData,
    priority: "3", // Normal priority
  });
};

/**
 * Send new contact notification to admins
 * @param {Object} contactData - The contact form data
 * @param {string} template - The HTML email template
 * @param {Array<string>} adminEmails - List of admin emails
 * @returns {Promise<Object>} Email send result
 */
const sendContactAdminNotification = async (contactData, template, adminEmails) => {
  const primaryAdmin = adminEmails[0];
  const ccAdmins = adminEmails.slice(1).join(", ");

  return await sendContactEmail({
    to: primaryAdmin,
    cc: ccAdmins || undefined,
    subject: `New Contact Form: ${contactData.category?.name || "General Inquiry"} - ${contactData.name}`,
    html: template,
    emailType: "AdminNotification",
    contactType: contactData.category?.id || "General",
    contactId: contactData._id,
    contactData: contactData,
    priority: contactData.category?.id === "services" ? "1" : "3", // High priority for services
  });
};

module.exports = {
  sendContactEmail,
  sendContactConfirmation,
  sendContactAdminNotification,
};