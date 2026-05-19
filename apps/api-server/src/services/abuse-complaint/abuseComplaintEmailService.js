const sendEmail = require("@utils/sendEmail");
const logger = require("@utils/logger");
const {
  abuseComplaintConfirmationEmailTemplate,
  abuseComplaintStatusUpdateEmailTemplate,
} = require("@mails/abuseComplaintEmailTemplate");

class AbuseComplaintEmailService {
  /**
   * Send confirmation email to the reporter after complaint submission
   * @param {Object} complaintData - The abuse complaint data
   * @returns {Object} - Success/failure status
   */
  static sendComplaintConfirmationEmail = async (complaintData) => {
    try {
      // Validate required data
      if (
        !complaintData ||
        !complaintData.reporter ||
        !complaintData.reporter.email
      ) {
        logger.error("Missing required complaint data for email confirmation", {
          complaintId: complaintData?._id,
          hasReporter: !!complaintData?.reporter,
          hasEmail: !!complaintData?.reporter?.email,
        });
        return {
          success: false,
          error: "Missing required complaint data for email confirmation",
        };
      }

      const reporterEmail = complaintData.reporter.email;
      const reporterName = complaintData.reporter.firstName
        ? `${complaintData.reporter.firstName} ${
            complaintData.reporter.lastName || ""
          }`.trim()
        : "User";

      // Generate email content
      const emailTemplate =
        abuseComplaintConfirmationEmailTemplate(complaintData);

      // Email configuration
      const emailConfig = {
        to: reporterEmail,
        subject: `Abuse Complaint Confirmation - Reference #${complaintData.referenceNumber}`,
        html: emailTemplate,
        headers: {
          "X-Entity-Ref-ID": complaintData._id?.toString() || "unknown",
          "X-Complaint-Reference": complaintData.referenceNumber || "unknown",
          "X-Ministry": "Agriculture-Farmers-Welfare",
          "X-Email-Type": "abuse-complaint-confirmation",
          "X-Priority": "high",
          "Reply-To": "security@shivrajsinghchouhan.co.in",
          "List-Unsubscribe":
            "<mailto:abuse@shivrajsinghchouhan.co.in?subject=Unsubscribe>",
          "List-Id":
            "Ministry Agriculture Security Notifications <security.shivrajsinghchouhan.co.in>",
          "X-Auto-Response-Suppress": "OOF, AutoReply",
          Precedence: "bulk",
          "X-Mailer": "Ministry-Agriculture-Email-Service-v1.0",
        },
      };

      // Send email
      const emailResult = await sendEmail(emailConfig);

      if (emailResult.success) {
        logger.info("Abuse complaint confirmation email sent successfully", {
          complaintId: complaintData._id,
          referenceNumber: complaintData.referenceNumber,
          recipientEmail: reporterEmail,
          recipientName: reporterName,
          emailType: "confirmation",
        });

        return {
          success: true,
          message: "Confirmation email sent successfully",
          data: {
            messageId: emailResult.messageId,
            recipientEmail: reporterEmail,
            sentAt: new Date().toISOString(),
          },
        };
      } else {
        logger.error("Failed to send abuse complaint confirmation email", {
          complaintId: complaintData._id,
          referenceNumber: complaintData.referenceNumber,
          recipientEmail: reporterEmail,
          error: emailResult.error,
          emailType: "confirmation",
        });

        return {
          success: false,
          error: emailResult.error || "Failed to send confirmation email",
        };
      }
    } catch (error) {
      logger.error("Error in sendComplaintConfirmationEmail", {
        complaintId: complaintData?._id,
        error: error.message,
        stack: error.stack,
      });

      return {
        success: false,
        error: "Internal error while sending confirmation email",
      };
    }
  };

  /**
   * Send status update email to the reporter when complaint status changes
   * @param {Object} complaintData - The abuse complaint data
   * @param {Object} statusUpdate - The status update information
   * @returns {Object} - Success/failure status
   */
  static sendComplaintStatusUpdateEmail = async (
    complaintData,
    statusUpdate
  ) => {
    try {
      // Validate required data
      if (
        !complaintData ||
        !complaintData.reporter ||
        !complaintData.reporter.email
      ) {
        logger.error(
          "Missing required complaint data for status update email",
          {
            complaintId: complaintData?._id,
            hasReporter: !!complaintData?.reporter,
            hasEmail: !!complaintData?.reporter?.email,
          }
        );
        return {
          success: false,
          error: "Missing required complaint data for status update email",
        };
      }

      if (!statusUpdate || !statusUpdate.status) {
        logger.error("Missing status update information", {
          complaintId: complaintData._id,
          hasStatusUpdate: !!statusUpdate,
          hasStatus: !!statusUpdate?.status,
        });
        return {
          success: false,
          error: "Missing status update information",
        };
      }

      const reporterEmail = complaintData.reporter.email;
      const reporterName = complaintData.reporter.firstName
        ? `${complaintData.reporter.firstName} ${
            complaintData.reporter.lastName || ""
          }`.trim()
        : "User";

      // Generate email content
      const emailTemplate = abuseComplaintStatusUpdateEmailTemplate(
        complaintData,
        statusUpdate
      );

      // Email configuration
      const emailConfig = {
        to: reporterEmail,
        subject: `Complaint Status Update - Reference #${
          complaintData.referenceNumber
        } - ${statusUpdate.status.toUpperCase()}`,
        html: emailTemplate,
        headers: {
          "X-Entity-Ref-ID": complaintData._id?.toString() || "unknown",
          "X-Complaint-Reference": complaintData.referenceNumber || "unknown",
          "X-Status-Update": statusUpdate.status,
          "X-Ministry": "Agriculture-Farmers-Welfare",
          "X-Email-Type": "abuse-complaint-status-update",
          "X-Priority": "normal",
          "Reply-To": "security@shivrajsinghchouhan.co.in",
          "List-Unsubscribe":
            "<mailto:abuse@shivrajsinghchouhan.co.in?subject=Unsubscribe>",
          "List-Id":
            "Ministry Agriculture Security Notifications <security.shivrajsinghchouhan.co.in>",
          "X-Auto-Response-Suppress": "OOF, AutoReply",
          Precedence: "bulk",
          "X-Mailer": "Ministry-Agriculture-Email-Service-v1.0",
        },
      };

      // Send email
      const emailResult = await sendEmail(emailConfig);

      if (emailResult.success) {
        logger.info("Abuse complaint status update email sent successfully", {
          complaintId: complaintData._id,
          referenceNumber: complaintData.referenceNumber,
          recipientEmail: reporterEmail,
          recipientName: reporterName,
          newStatus: statusUpdate.status,
          emailType: "status-update",
        });

        return {
          success: true,
          message: "Status update email sent successfully",
          data: {
            messageId: emailResult.messageId,
            recipientEmail: reporterEmail,
            newStatus: statusUpdate.status,
            sentAt: new Date().toISOString(),
          },
        };
      } else {
        logger.error("Failed to send abuse complaint status update email", {
          complaintId: complaintData._id,
          referenceNumber: complaintData.referenceNumber,
          recipientEmail: reporterEmail,
          newStatus: statusUpdate.status,
          error: emailResult.error,
          emailType: "status-update",
        });

        return {
          success: false,
          error: emailResult.error || "Failed to send status update email",
        };
      }
    } catch (error) {
      logger.error("Error in sendComplaintStatusUpdateEmail", {
        complaintId: complaintData?._id,
        newStatus: statusUpdate?.status,
        error: error.message,
        stack: error.stack,
      });

      return {
        success: false,
        error: "Internal error while sending status update email",
      };
    }
  };

  /**
   * Send email notification to admin team about new complaint
   * @param {Object} complaintData - The abuse complaint data
   * @returns {Object} - Success/failure status
   */
  static sendComplaintAdminNotificationEmail = async (complaintData) => {
    try {
      // Validate required data
      if (!complaintData || !complaintData._id) {
        logger.error("Missing required complaint data for admin notification", {
          hasComplaintData: !!complaintData,
          hasId: !!complaintData?._id,
        });
        return {
          success: false,
          error: "Missing required complaint data for admin notification",
        };
      }

      const adminEmails = [
        "security@shivrajsinghchouhan.co.in",
        "info@shivrajsinghchouhan.co.in",
      ];

      const reporterName = complaintData.reporter?.firstName
        ? `${complaintData.reporter.firstName} ${
            complaintData.reporter.lastName || ""
          }`.trim()
        : "Anonymous User";

      // Simple admin notification template
      const adminEmailTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>New Abuse Complaint - ${complaintData.referenceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ea580c; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .detail { margin: 10px 0; padding: 10px; background: white; border-left: 4px solid #ea580c; }
            .urgent { color: #dc2626; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Abuse Complaint Received</h1>
              <p>Reference: ${complaintData.referenceNumber}</p>
            </div>
            <div class="content">
              <div class="detail">
                <strong>Reporter:</strong> ${reporterName}<br>
                <strong>Email:</strong> ${
                  complaintData.reporter?.email || "Not provided"
                }<br>
                <strong>Abuse Type:</strong> ${complaintData.abuseType}<br>
                <strong>Medium:</strong> ${complaintData.abuseMedium}<br>
                <strong>Submitted:</strong> ${new Date(
                  complaintData.submittedAt
                ).toLocaleString()}
              </div>
              <div class="detail">
                <strong>Location & Device Information:</strong><br>
                <strong>IP Address:</strong> ${
                  complaintData.technicalInfo?.network?.ip?.ipv4 ||
                  complaintData.metadata?.ipAddress ||
                  "Unknown"
                }<br>
                <strong>Location:</strong> ${
                  complaintData.technicalInfo?.network?.location?.city ||
                  "Unknown"
                }, ${
        complaintData.technicalInfo?.network?.location?.country || "Unknown"
      }<br>
                <strong>ISP:</strong> ${
                  complaintData.technicalInfo?.network?.isp?.name || "Unknown"
                }<br>
                <strong>Organization:</strong> ${
                  complaintData.technicalInfo?.network?.isp?.organization ||
                  "Unknown"
                }<br>
                <strong>ASN:</strong> ${
                  complaintData.technicalInfo?.network?.isp?.asn || "Unknown"
                }<br>
                <strong>Device:</strong> ${
                  complaintData.technicalInfo?.device?.deviceType || "Unknown"
                } - ${
        complaintData.technicalInfo?.device?.os?.name || "Unknown"
      }<br>
                <strong>Browser:</strong> ${
                  complaintData.technicalInfo?.browser?.name || "Unknown"
                } ${complaintData.technicalInfo?.browser?.version || ""}<br>
                <strong>Screen:</strong> ${
                  complaintData.technicalInfo?.device?.screen?.width || "?"
                }x${
        complaintData.technicalInfo?.device?.screen?.height || "?"
      }<br>
                <strong>Timezone:</strong> ${
                  complaintData.technicalInfo?.network?.location?.timezone ||
                  "Unknown"
                }<br>
                <strong>Risk Score:</strong> ${
                  complaintData.technicalInfo?.security?.riskScore || 0
                }/100
              </div>
              ${
                complaintData.comments
                  ? `
              <div class="detail">
                <strong>Comments:</strong><br>
                ${complaintData.comments}
              </div>
              `
                  : ""
              }
              ${
                complaintData.evidenceUrls &&
                complaintData.evidenceUrls.length > 0
                  ? `
              <div class="detail">
                <strong>Evidence URLs:</strong><br>
                ${complaintData.evidenceUrls
                  .map((url) => `• ${url}`)
                  .join("<br>")}
              </div>
              `
                  : ""
              }
              <p class="urgent">Please review and take appropriate action within 24 hours.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Send to all admin emails
      const emailPromises = adminEmails.map((adminEmail) => {
        const emailConfig = {
          to: adminEmail,
          subject: `New Abuse Complaint - ${complaintData.referenceNumber} - ${complaintData.abuseType}`,
          html: adminEmailTemplate,
          headers: {
            "X-Entity-Ref-ID": complaintData._id.toString(),
            "X-Complaint-Reference": complaintData.referenceNumber,
            "X-Ministry": "Agriculture-Farmers-Welfare",
            "X-Email-Type": "abuse-complaint-admin-notification",
            "X-Priority": "high",
            "X-Auto-Response-Suppress": "OOF, AutoReply",
            Precedence: "urgent",
          },
        };
        return sendEmail(emailConfig);
      });

      const emailResults = await Promise.allSettled(emailPromises);
      const successCount = emailResults.filter(
        (result) => result.status === "fulfilled" && result.value.success
      ).length;
      const failedCount = emailResults.length - successCount;

      if (successCount > 0) {
        logger.info("Admin notification emails sent for new abuse complaint", {
          complaintId: complaintData._id,
          referenceNumber: complaintData.referenceNumber,
          successCount,
          failedCount,
          totalAdmins: adminEmails.length,
        });

        return {
          success: true,
          message: `Admin notification emails sent (${successCount}/${adminEmails.length} successful)`,
          data: {
            successCount,
            failedCount,
            totalSent: adminEmails.length,
            sentAt: new Date().toISOString(),
          },
        };
      } else {
        logger.error(
          "Failed to send admin notification emails for abuse complaint",
          {
            complaintId: complaintData._id,
            referenceNumber: complaintData.referenceNumber,
            failedCount,
            totalAdmins: adminEmails.length,
          }
        );

        return {
          success: false,
          error: "Failed to send admin notification emails",
        };
      }
    } catch (error) {
      logger.error("Error in sendComplaintAdminNotificationEmail", {
        complaintId: complaintData?._id,
        error: error.message,
        stack: error.stack,
      });

      return {
        success: false,
        error: "Internal error while sending admin notification emails",
      };
    }
  };

  /**
   * Helper method to validate email address format
   * @param {string} email - Email address to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  static isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Helper method to sanitize email content
   * @param {string} content - Content to sanitize
   * @returns {string} - Sanitized content
   */
  static sanitizeEmailContent = (content) => {
    if (!content || typeof content !== "string") return "";

    // Basic HTML escaping to prevent email injection
    return content
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
  };
}

module.exports = AbuseComplaintEmailService;
