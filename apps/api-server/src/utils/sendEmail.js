const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  try {
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

    await new Promise((resolve, reject) => {
      // verify connection configuration
      transporter.verify(function (error, success) {
        if (error) {
          console.log("Email server verification failed:", error);
          reject(error);
        } else {
          console.log("Email server is ready to take our messages");
          resolve(success);
        }
      });
    });

    // Handle both old format (options.email) and new format (options.to)
    const recipientEmail = options.to || options.email;

    if (!recipientEmail) {
      throw new Error("Recipient email address is required");
    }

    const mailOptions = {
      from:
        options.from || `Netraga <${process.env.ZOHO_NODEMAILER_EMAIL_HELLO}>`,
      to: recipientEmail,
      subject: options.subject,
      html: options.html,
      encoding: "8bit",
      textEncoding: "base64",
      headers: {
        "Reply-To": "info@shivrajsinghchouhan.co.in",
        "X-Auto-Response-Suppress": "OOF, AutoReply",
        "X-Report-Abuse":
          "Please report abuse to info@shivrajsinghchouhan.co.in",
        Date: new Date().toUTCString(),
        "MIME-Version": "1.0",
        "X-Priority": "1",
        "X-Mailer": "Nodemailer",
        "Return-Path": `<info@shivrajsinghchouhan.co.in>`,
        ...(options.headers || {}),
      },
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to:", recipientEmail);

    // Log user information if available
    if (options.user) {
      console.log("Email Details:", {
        userID: options.user._id || options.user.id,
        userName: options.user.name || options.user.firstName || "N/A",
        userEmail: options.user.email,
        emailSubject: options.subject,
        emailType: options.emailType || "General",
        timestamp: new Date().toISOString(),
      });
    } else {
      console.log("Email Details:", {
        recipientEmail,
        emailSubject: options.subject,
        emailType: options.emailType || "General",
        timestamp: new Date().toISOString(),
      });
    }

    return {
      success: true,
      messageId: result.messageId,
      response: result.response,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error.message || "Failed to send email",
    };
  }
};

module.exports = sendEmail;
