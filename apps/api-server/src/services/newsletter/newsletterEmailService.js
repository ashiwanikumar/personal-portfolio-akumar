// ** LIBS ** //
const sendEmail = require("@utils/sendEmail");
const {
  newsletterConfirmationEmailTemplate,
  newsletterWelcomeSeriesEmailTemplate,
  newsletterUnsubscribeEmailTemplate,
} = require("@mails/newsletterEmailTemplate");

/**********************************
  Newsletter Email Service
  Handles all newsletter-related email sending
***********************************/

class NewsletterEmailService {
  /**
   * Send newsletter confirmation email to new subscriber
   * @param {Object} subscriberData - Subscriber information
   * @returns {Promise<Boolean>} Success status
   */
  static async sendConfirmationEmail(subscriberData) {
    try {
      // Validate subscriber data
      if (!subscriberData || !subscriberData.email) {
        throw new Error("Subscriber email is required");
      }

      // Generate email template
      const emailTemplate = newsletterConfirmationEmailTemplate(subscriberData);

      // Extract subscriber name for subject line
      const firstName =
        subscriberData?.name?.firstName || subscriberData?.name || "Subscriber";

      // Email configuration
      const emailConfig = {
        from: `Ashiwani Kumar <${process.env.ZOHO_NODEMAILER_EMAIL_HELLO || "hello@ashiwanikumar.in"}>`,
        to: subscriberData.email,
        subject: `Welcome ${firstName}! Newsletter Subscription Confirmed - Ashiwani Kumar`,
        html: emailTemplate,
        encoding: "8bit",
        textEncoding: "base64",
        headers: {
          "Reply-To": "hello@ashiwanikumar.in",
          "X-Auto-Response-Suppress": "OOF, AutoReply",
          "X-Report-Abuse":
            "Please report abuse to hello@ashiwanikumar.in",
          Date: new Date().toUTCString(),
          "MIME-Version": "1.0",
          "X-Priority": "1",
          "X-Mailer": "Nodemailer",
          "X-Newsletter-Type": "confirmation",
          "X-Subscriber-ID": subscriberData._id?.toString() || "unknown",
          "X-Campaign-Type": "welcome",
          "Return-Path": `<hello@ashiwanikumar.in>`,
        },
      };

      // Send email
      const emailResult = await sendEmail(emailConfig);

      if (emailResult.success) {
        console.log(
          `Newsletter confirmation email sent successfully to: ${subscriberData.email}`
        );
        return true;
      } else {
        console.error(
          `Failed to send newsletter confirmation email to: ${subscriberData.email}`,
          emailResult.error
        );
        return false;
      }
    } catch (error) {
      console.error("Error in sendConfirmationEmail:", error);
      return false;
    }
  }

  /**
   * Send welcome series emails (multiple emails over time)
   * @param {Object} subscriberData - Subscriber information
   * @param {Number} emailNumber - Which email in the series (1, 2, 3...)
   * @returns {Promise<Boolean>} Success status
   */
  static async sendWelcomeSeriesEmail(subscriberData, emailNumber = 1) {
    try {
      if (!subscriberData || !subscriberData.email) {
        throw new Error("Subscriber email is required");
      }

      const emailTemplate = newsletterWelcomeSeriesEmailTemplate(
        subscriberData,
        emailNumber
      );
      const firstName =
        subscriberData?.name?.firstName || subscriberData?.name || "Subscriber";

      const welcomeSubjects = {
        1: `Welcome to our Newsletter, ${firstName}!`,
        2: `Latest Updates for ${firstName}`,
        3: `Resources and Information for ${firstName}`,
      };

      const emailConfig = {
        from: `Ashiwani Kumar <${process.env.ZOHO_NODEMAILER_EMAIL_HELLO || "hello@ashiwanikumar.in"}>`,
        to: subscriberData.email,
        subject: welcomeSubjects[emailNumber] || `Updates for ${firstName}`,
        html: emailTemplate,
        encoding: "8bit",
        textEncoding: "base64",
        headers: {
          "Reply-To": "hello@ashiwanikumar.in",
          "X-Auto-Response-Suppress": "OOF, AutoReply",
          "X-Report-Abuse":
            "Please report abuse to hello@ashiwanikumar.in",
          Date: new Date().toUTCString(),
          "MIME-Version": "1.0",
          "X-Priority": "1",
          "X-Mailer": "Nodemailer",
          "X-Newsletter-Type": "welcome-series",
          "X-Series-Number": emailNumber.toString(),
          "X-Subscriber-ID": subscriberData._id?.toString() || "unknown",
          "Return-Path": `<hello@ashiwanikumar.in>`,
        },
      };

      const emailResult = await sendEmail(emailConfig);

      if (emailResult.success) {
        console.log(
          `Welcome series email ${emailNumber} sent successfully to: ${subscriberData.email}`
        );
        return true;
      } else {
        console.error(
          `Failed to send welcome series email ${emailNumber} to: ${subscriberData.email}`,
          emailResult.error
        );
        return false;
      }
    } catch (error) {
      console.error("Error in sendWelcomeSeriesEmail:", error);
      return false;
    }
  }

  /**
   * Send unsubscribe confirmation email
   * @param {Object} subscriberData - Subscriber information
   * @returns {Promise<Boolean>} Success status
   */
  static async sendUnsubscribeConfirmationEmail(subscriberData) {
    try {
      if (!subscriberData || !subscriberData.email) {
        throw new Error("Subscriber email is required");
      }

      const emailTemplate = newsletterUnsubscribeEmailTemplate(subscriberData);
      const firstName =
        subscriberData?.name?.firstName || subscriberData?.name || "Subscriber";

      const emailConfig = {
        from: `Ashiwani Kumar <${process.env.ZOHO_NODEMAILER_EMAIL_HELLO || "hello@ashiwanikumar.in"}>`,
        to: subscriberData.email,
        subject: `Newsletter Unsubscribed - ${firstName}`,
        html: emailTemplate,
        encoding: "8bit",
        textEncoding: "base64",
        headers: {
          "Reply-To": "hello@ashiwanikumar.in",
          "X-Auto-Response-Suppress": "OOF, AutoReply",
          "X-Report-Abuse":
            "Please report abuse to hello@ashiwanikumar.in",
          Date: new Date().toUTCString(),
          "MIME-Version": "1.0",
          "X-Priority": "1",
          "X-Mailer": "Nodemailer",
          "X-Newsletter-Type": "unsubscribe-confirmation",
          "X-Subscriber-ID": subscriberData._id?.toString() || "unknown",
          "Return-Path": `<hello@ashiwanikumar.in>`,
        },
      };

      const emailResult = await sendEmail(emailConfig);

      if (emailResult.success) {
        console.log(
          `Unsubscribe confirmation email sent successfully to: ${subscriberData.email}`
        );
        return true;
      } else {
        console.error(
          `Failed to send unsubscribe confirmation email to: ${subscriberData.email}`,
          emailResult.error
        );
        return false;
      }
    } catch (error) {
      console.error("Error in sendUnsubscribeConfirmationEmail:", error);
      return false;
    }
  }

  /**
   * Send bulk newsletter campaign to subscribers
   * @param {Array} subscribers - Array of subscriber objects
   * @param {Object} campaignData - Campaign content and metadata
   * @returns {Promise<Object>} Results summary
   */
  static async sendBulkNewsletter(subscribers, campaignData) {
    try {
      const results = {
        total: subscribers.length,
        sent: 0,
        failed: 0,
        errors: [],
      };

      console.log(
        `Starting bulk newsletter send to ${subscribers.length} subscribers`
      );

      // Process subscribers in batches to avoid overwhelming the email service
      const batchSize = 50;
      const batches = [];

      for (let i = 0; i < subscribers.length; i += batchSize) {
        batches.push(subscribers.slice(i, i + batchSize));
      }

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        console.log(
          `Processing batch ${batchIndex + 1} of ${batches.length} (${
            batch.length
          } subscribers)`
        );

        const batchPromises = batch.map(async (subscriber) => {
          try {
            // Personalize email content for each subscriber
            const personalizedContent = this.personalizeNewsletterContent(
              campaignData.content,
              subscriber
            );

            const emailConfig = {
              from: `Ashiwani Kumar <${process.env.ZOHO_NODEMAILER_EMAIL_HELLO || "hello@ashiwanikumar.in"}>`,
              to: subscriber.email,
              subject: campaignData.subject,
              html: personalizedContent,
              encoding: "8bit",
              textEncoding: "base64",
              headers: {
                "Reply-To": "hello@ashiwanikumar.in",
                "X-Auto-Response-Suppress": "OOF, AutoReply",
                "X-Report-Abuse":
                  "Please report abuse to hello@ashiwanikumar.in",
                Date: new Date().toUTCString(),
                "MIME-Version": "1.0",
                "X-Priority": "1",
                "X-Mailer": "Nodemailer",
                "X-Newsletter-Type": "campaign",
                "X-Campaign-ID": campaignData.campaignId || "unknown",
                "X-Subscriber-ID": subscriber._id?.toString() || "unknown",
                "Return-Path": `<hello@ashiwanikumar.in>`,
              },
            };

            const emailResult = await sendEmail(emailConfig);

            if (emailResult.success) {
              results.sent++;
              return { success: true, email: subscriber.email };
            } else {
              results.failed++;
              results.errors.push({
                email: subscriber.email,
                error: emailResult.error,
              });
              return {
                success: false,
                email: subscriber.email,
                error: emailResult.error,
              };
            }
          } catch (error) {
            results.failed++;
            results.errors.push({
              email: subscriber.email,
              error: error.message,
            });
            return {
              success: false,
              email: subscriber.email,
              error: error.message,
            };
          }
        });

        // Wait for batch to complete before processing next batch
        await Promise.all(batchPromises);

        // Add delay between batches to respect email service limits
        if (batchIndex < batches.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 second delay
        }
      }

      console.log(
        `Bulk newsletter send completed. Sent: ${results.sent}, Failed: ${results.failed}`
      );
      return results;
    } catch (error) {
      console.error("Error in sendBulkNewsletter:", error);
      return {
        total: subscribers.length,
        sent: 0,
        failed: subscribers.length,
        errors: [{ error: error.message }],
      };
    }
  }

  /**
   * Personalize newsletter content for individual subscriber
   * @param {String} content - Base email content
   * @param {Object} subscriber - Subscriber data
   * @returns {String} Personalized content
   */
  static personalizeNewsletterContent(content, subscriber) {
    try {
      let personalizedContent = content;

      // Replace common placeholders
      const firstName =
        subscriber?.name?.firstName || subscriber?.name || "Subscriber";
      const fullName = subscriber?.fullName || firstName;
      const location = subscriber?.location;
      const state = location?.state || "your region";
      const district = location?.district || "";

      personalizedContent = personalizedContent
        .replace(/{{firstName}}/g, firstName)
        .replace(/{{fullName}}/g, fullName)
        .replace(/{{state}}/g, state)
        .replace(/{{district}}/g, district)
        .replace(/{{email}}/g, subscriber.email);

      // Add location-specific content if available
      if (location && location.state !== "Unknown") {
        personalizedContent = personalizedContent.replace(
          "{{locationSpecific}}",
          `Special information for subscribers in ${state}${district ? ", " + district : ""}:`
        );
      } else {
        personalizedContent = personalizedContent.replace(
          "{{locationSpecific}}",
          ""
        );
      }

      return personalizedContent;
    } catch (error) {
      console.error("Error personalizing newsletter content:", error);
      return content; // Return original content if personalization fails
    }
  }

  /**
   * Send test email to verify email service configuration
   * @param {String} testEmail - Test email address
   * @returns {Promise<Boolean>} Success status
   */
  static async sendTestEmail(testEmail) {
    try {
      const testSubscriberData = {
        email: testEmail,
        name: { firstName: "Test" },
        interests: ["technology-innovation", "events-announcements"],
        location: { state: "Test State", district: "Test District" },
      };

      return await this.sendConfirmationEmail(testSubscriberData);
    } catch (error) {
      console.error("Error in sendTestEmail:", error);
      return false;
    }
  }
}

module.exports = NewsletterEmailService;
