const nodemailer = require("nodemailer");
const logger = require("../logger");
const EmailActivityService = require("../../services/blog/emailActivityService");

const sendBlogApprovalEmail = async (options) => {
  try {
    // Validate input options
    if (!options || typeof options !== 'object') {
      throw new Error("Email options object is required");
    }

    if (!options.to) {
      throw new Error("Recipient email address (options.to) is required");
    }

    if (!options.subject) {
      throw new Error("Email subject (options.subject) is required");
    }

    if (!options.html) {
      throw new Error("Email HTML content (options.html) is required");
    }

    // Create transporter with blog-specific email configuration
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
          logger.error("Blog approval email server verification failed:", error);
          reject(error);
        } else {
          logger.info("Blog approval email server is ready to send messages");
          resolve(success);
        }
      });
    });

    // Handle recipient emails (can be array or single email)
    const recipientEmails = Array.isArray(options.to) ? options.to : [options.to];
    
    // More robust email validation
    const validEmails = recipientEmails.filter(email => {
      if (!email || typeof email !== 'string') {
        logger.warn(`Invalid email type: ${typeof email}, value: ${email}`);
        return false;
      }
      const trimmedEmail = email.trim();
      if (!trimmedEmail || !trimmedEmail.includes('@') || trimmedEmail.length < 5) {
        logger.warn(`Invalid email format: ${email}`);
        return false;
      }
      return true;
    }).map(email => email.trim());

    if (validEmails.length === 0) {
      const errorDetails = {
        originalRecipients: recipientEmails,
        recipientTypes: recipientEmails.map(r => typeof r),
        optionsTo: options.to,
        optionsToType: typeof options.to
      };
      logger.error("No valid email recipients found:", errorDetails);
      throw new Error("At least one valid recipient email address is required");
    }

    // Configure mail options with blog-specific headers
    const mailOptions = {
      from:
        options.from ||
        `Ashiwani Kumar - Blog System <${process.env.ZOHO_NODEMAILER_EMAIL_HELLO}>`,
      to: validEmails[0], // Primary recipient
      cc: validEmails.length > 1 ? validEmails.slice(1).join(", ") : undefined,
      subject: options.subject,
      html: options.html,
      encoding: "8bit",
      textEncoding: "base64",
      headers: {
        "Reply-To": "hello@ashiwanikumar.in",
        "X-Auto-Response-Suppress": "OOF, AutoReply",
        "X-Report-Abuse":
          "Please report abuse to hello@ashiwanikumar.in",
        Date: new Date().toUTCString(),
        "MIME-Version": "1.0",
        "X-Priority": options.priority || "2", // High priority for approvals
        "X-Mailer": "Blog Approval System",
        "Return-Path": `<hello@ashiwanikumar.in>`,
        "List-Unsubscribe": "<mailto:hello@ashiwanikumar.in>",
        "X-Blog-ID": options.blogId || "N/A",
        "X-Blog-Title": options.blogTitle || "N/A",
        "X-Blog-Author": options.blogAuthor || "N/A",
        "X-Approval-Status": options.approvalStatus || "N/A",
        "X-Notification-Type": options.notificationType || "blog_approval",
        "X-Scheduled-Publish": options.scheduledPublishAt || "N/A",
        "X-Is-Scheduled": options.isScheduled || "false",
        ...(options.headers || {}),
      },
    };

    // Add BCC for internal tracking if specified
    if (options.bcc) {
      mailOptions.bcc = Array.isArray(options.bcc) ? options.bcc.join(", ") : options.bcc;
    }

    // Send the email
    const result = await transporter.sendMail(mailOptions);
    logger.info(`Blog approval email sent successfully to: ${validEmails.join(", ")}`);

    // Log email details
    const logDetails = {
      blogId: options.blogId,
      recipients: validEmails,
      emailSubject: options.subject,
      emailType: options.emailType || "BlogApproval",
      notificationType: options.notificationType || "blog_approval",
      approvalStatus: options.approvalStatus,
      blogTitle: options.blogTitle,
      blogAuthor: options.blogAuthor,
      scheduledPublishAt: options.scheduledPublishAt,
      isScheduled: options.isScheduled,
      timestamp: new Date().toISOString(),
      messageId: result.messageId,
    };

    logger.info("Blog Approval Email Details:", logDetails);

    // Log email activity to database if sufficient data is provided
    if (options.blogId && options.triggeredBy) {
      try {
        // Determine activity type from approval status or notification type
        let activityType = "approval";
        if (options.approvalStatus === "rejected" || options.notificationType?.includes("reject")) {
          activityType = "unapproval";
        } else if (options.approvalStatus === "approved") {
          activityType = "approval";
        } else if (options.notificationType?.includes("created")) {
          activityType = "blog_created";
        } else if (options.notificationType?.includes("update") || options.notificationType?.includes("status")) {
          // Only use blog_updated for non-approval status updates
          if (options.approvalStatus !== "approved" && options.approvalStatus !== "rejected") {
            activityType = "blog_updated";
          }
        }

        // Prepare recipients data for logging
        const recipientsData = validEmails.map(email => ({
          email: email,
          name: options.recipientNames?.[email] || email.split('@')[0], // Use provided name or extract from email
          role: options.recipientRoles?.[email] || "user",
          deliveryStatus: "sent",
          deliveredAt: new Date(),
        }));

        // Log the email activity
        await EmailActivityService.logEmailActivity({
          blog: options.blogId,
          triggeredBy: options.triggeredBy,
          recipients: recipientsData,
          activityType: activityType,
          subject: options.subject,
          template: options.emailType || "default",
          content: options.html,
          blogSnapshot: {
            title: options.blogTitle || "",
            author: options.blogAuthorId || null,
            status: options.blogStatus || "draft",
            approved: options.approvalStatus === "approved" || options.approvalStatus === "published",
          },
          metadata: {
            comments: options.comments || "",
            previousStatus: options.previousStatus || "",
            previousApproval: options.previousApproval || false,
            userAgent: options.userAgent || "",
            ipAddress: options.ipAddress || "",
            scheduledPublishAt: options.scheduledPublishAt || null,
            isScheduled: options.isScheduled || false,
            scheduleType: options.scheduleType || null,
          },
        });

        logger.info("Email activity logged successfully", {
          blogId: options.blogId,
          activityType,
          recipientCount: validEmails.length,
        });
      } catch (activityLogError) {
        // Don't fail the email sending if activity logging fails
        logger.error("Failed to log email activity:", activityLogError);
      }
    }

    return {
      success: true,
      messageId: result.messageId,
      response: result.response,
      details: logDetails,
      recipients: validEmails,
    };
  } catch (error) {
    logger.error("Error sending blog approval email:", error);

    // Log error details
    logger.error("Blog Approval Email Error Details:", {
      recipients: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      blogId: options.blogId,
      errorMessage: error.message,
      errorCode: error.code,
      timestamp: new Date().toISOString(),
    });

    return {
      success: false,
      error: error.message || "Failed to send blog approval email",
      errorCode: error.code,
    };
  }
};

/**
 * Send blog approval notification to super admins
 * @param {Object} blogData - The blog data
 * @param {string} template - The HTML email template
 * @param {Array<string>} superAdminEmails - List of super admin emails
 * @param {Object} approvalData - Approval metadata
 * @returns {Promise<Object>} Email send result
 */
const sendBlogApprovalNotification = async (
  blogData,
  template,
  superAdminEmails,
  approvalData = {}
) => {
  // Enhanced email validation
  const validEmails = superAdminEmails.filter(email => {
    if (!email || typeof email !== 'string') {
      logger.warn(`Invalid super admin email type: ${typeof email}, value: ${email}`);
      return false;
    }
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@') || trimmedEmail.length < 5) {
      logger.warn(`Invalid super admin email format: ${email}`);
      return false;
    }
    return true;
  }).map(email => email.trim());
  
  if (validEmails.length === 0) {
    const errorDetails = {
      originalEmails: superAdminEmails,
      emailTypes: superAdminEmails.map(e => typeof e),
      blogId: blogData._id,
      blogTitle: blogData.title
    };
    logger.error("No valid super admin emails provided:", errorDetails);
    throw new Error("No valid super admin emails provided");
  }

  const approvalStatus = approvalData.status || "pending";
  const approverName = approvalData.approverName || "System";

  const statusMessages = {
    pending: "PENDING APPROVAL",
    approved: "APPROVED",
    rejected: "REJECTED",
    published: "PUBLISHED",
  };

  const statusText = statusMessages[approvalStatus] || approvalStatus.toUpperCase();
  
  // Format current date and time
  const now = new Date();
  const dateTime = now.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  return await sendBlogApprovalEmail({
    to: validEmails,
    subject: `[${statusText}] Blog: "${blogData.title}" - ${dateTime}`,
    html: template,
    emailType: "BlogApprovalNotification",
    notificationType: "blog_approval_notification",
    approvalStatus: approvalStatus,
    blogId: blogData._id,
    blogTitle: blogData.title,
    blogAuthor: blogData.author?.name || blogData.author?.email || "Unknown",
    priority: approvalStatus === "pending" ? "1" : "2", // Urgent for pending, high for others
    headers: {
      "X-Approval-Action": approvalData.action || "notification",
      "X-Approver": approverName,
      "X-Blog-Category": blogData.category || "N/A",
      "X-Blog-Status": blogData.status || "draft",
    },
    // Email activity logging data
    triggeredBy: approvalData.triggeredBy,
    blogAuthorId: approvalData.blogAuthorId,
    blogStatus: approvalData.blogStatus,
    previousStatus: approvalData.previousStatus,
    previousApproval: approvalData.previousApproval,
    recipientNames: approvalData.recipientNames,
    recipientRoles: approvalData.recipientRoles,
    comments: approvalData.comments,
    userAgent: approvalData.userAgent,
    ipAddress: approvalData.ipAddress,
  });
};

/**
 * Send blog status update notification to author
 * @param {Object} blogData - The blog data
 * @param {string} template - The HTML email template
 * @param {string} authorEmail - Author's email
 * @param {Object} statusData - Status update metadata
 * @returns {Promise<Object>} Email send result
 */
const sendBlogStatusUpdateNotification = async (
  blogData,
  template,
  authorEmail,
  statusData = {}
) => {
  // Enhanced author email validation
  if (!authorEmail || typeof authorEmail !== 'string') {
    const errorDetails = {
      authorEmail,
      authorEmailType: typeof authorEmail,
      blogId: blogData._id,
      blogTitle: blogData.title
    };
    logger.error("Invalid author email:", errorDetails);
    throw new Error("Valid author email is required");
  }

  const trimmedEmail = authorEmail.trim();
  if (!trimmedEmail || !trimmedEmail.includes('@') || trimmedEmail.length < 5) {
    const errorDetails = {
      authorEmail,
      trimmedEmail,
      blogId: blogData._id,
      blogTitle: blogData.title
    };
    logger.error("Invalid author email format:", errorDetails);
    throw new Error("Valid author email is required");
  }

  const status = statusData.status || blogData.status || "draft";
  const approverName = statusData.approverName || "Admin";
  const comments = statusData.comments || "";

  const statusMessages = {
    approved: "APPROVED",
    rejected: "REJECTED",
    published: "PUBLISHED",
    draft: "SAVED AS DRAFT",
    "under-review": "UNDER REVIEW",
  };

  const statusText = statusMessages[status] || status.toUpperCase();
  
  // Format current date and time
  const now = new Date();
  const dateTime = now.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  return await sendBlogApprovalEmail({
    to: trimmedEmail,
    subject: `[${statusText}] Your Blog: "${blogData.title}" - ${dateTime}`,
    html: template,
    emailType: "BlogStatusUpdate",
    notificationType: "blog_status_update",
    approvalStatus: status,
    blogId: blogData._id,
    blogTitle: blogData.title,
    blogAuthor: blogData.author?.name || blogData.author?.email || "Author",
    priority: status === "rejected" ? "1" : "2", // Urgent for rejections
    headers: {
      "X-Status-Update": status,
      "X-Approver": approverName,
      "X-Comments": comments || "N/A",
      "X-Blog-Category": blogData.category || "N/A",
    },
    // Email activity logging data
    triggeredBy: statusData.triggeredBy,
    blogAuthorId: statusData.blogAuthorId,
    blogStatus: statusData.blogStatus,
    previousStatus: statusData.previousStatus,
    previousApproval: statusData.previousApproval,
    recipientNames: statusData.recipientNames,
    recipientRoles: statusData.recipientRoles,
    comments: comments,
    userAgent: statusData.userAgent,
    ipAddress: statusData.ipAddress,
  });
};

/**
 * Send bulk blog approval notifications
 * @param {Array<Object>} blogList - Array of blog data objects
 * @param {Function} templateGenerator - Function to generate email template
 * @param {Array<string>} superAdminEmails - List of super admin emails
 * @param {Object} approvalData - Approval metadata
 * @returns {Promise<Array<Object>>} Array of email send results
 */
const sendBulkBlogApprovalNotifications = async (
  blogList,
  templateGenerator,
  superAdminEmails,
  approvalData = {}
) => {
  const results = [];

  for (const blogData of blogList) {
    try {
      const template = templateGenerator(blogData, approvalData);
      const result = await sendBlogApprovalNotification(
        blogData,
        template,
        superAdminEmails,
        approvalData
      );
      results.push({
        blogId: blogData._id,
        blogTitle: blogData.title,
        success: result.success,
        messageId: result.messageId,
        recipients: result.recipients,
        error: result.error,
      });
    } catch (error) {
      results.push({
        blogId: blogData._id,
        blogTitle: blogData.title,
        success: false,
        error: error.message,
      });
    }
  }

  return results;
};

/**
 * Send test blog approval email for debugging
 * @param {string} toEmail - Recipient email
 * @param {string} template - The HTML email template
 * @returns {Promise<Object>} Email send result
 */
const sendTestBlogApprovalEmail = async (toEmail, template) => {
  return await sendBlogApprovalEmail({
    to: toEmail,
    subject: "Test Email - Blog Approval System",
    html: template,
    emailType: "TestBlogApprovalEmail",
    notificationType: "test_blog_approval",
    blogId: "TEST-" + Date.now(),
    blogTitle: "Test Blog Post",
    blogAuthor: "Test Author",
    priority: "3",
  });
};

module.exports = {
  sendBlogApprovalEmail,
  sendBlogApprovalNotification,
  sendBlogStatusUpdateNotification,
  sendBulkBlogApprovalNotifications,
  sendTestBlogApprovalEmail,
};