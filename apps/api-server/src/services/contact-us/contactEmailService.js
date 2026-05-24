/**
 * @fileoverview Contact Email Service
 * Service layer for handling all contact email related operations
 *
 * @module ContactEmailService
 * @requires @utils/sendContactEmail
 * @requires @mails/contactEmailTemplate
 * @requires @utils/logger
 */

const {
  sendContactConfirmation,
  sendContactAdminNotification,
} = require("@utils/sendContactEmail");
const {
  contactConfirmationEmailTemplate,
  contactAdminNotificationTemplate,
} = require("@mails/contactEmailTemplate");
const logger = require("@utils/logger");

class ContactEmailService {
  /**
   * Send confirmation email to user who submitted contact form
   * @param {Object} contactData - The saved contact document
   * @returns {Promise<Object>} Email send result
   */
  static async sendUserConfirmation(contactData) {
    try {
      // Generate email template
      const emailTemplate = contactConfirmationEmailTemplate(contactData);

      // Send email
      const result = await sendContactConfirmation(contactData, emailTemplate);

      if (result.success) {
        logger.info("Contact confirmation email sent", {
          contactId: contactData._id,
          email: contactData.email,
          messageId: result.messageId,
        });
      } else {
        logger.error("Failed to send contact confirmation email", {
          contactId: contactData._id,
          email: contactData.email,
          error: result.error,
        });
      }

      return result;
    } catch (error) {
      logger.error("Error in sendUserConfirmation", {
        error: error.message,
        contactId: contactData._id,
        email: contactData.email,
      });
      throw error;
    }
  }

  /**
   * Send notification email to admins about new contact
   * @param {Object} contactData - The saved contact document
   * @returns {Promise<Object>} Email send result
   */
  static async sendAdminNotification(contactData) {
    try {
      // Get admin emails from environment or use defaults
      const adminEmails = process.env.CONTACT_ADMIN_EMAILS 
        ? process.env.CONTACT_ADMIN_EMAILS.split(',').map(email => email.trim())
        : ['admin@ashiwanikumar.in', 'info@ashiwanikumar.in'];

      // Generate email template
      const emailTemplate = contactAdminNotificationTemplate(contactData);

      // Send email
      const result = await sendContactAdminNotification(
        contactData,
        emailTemplate,
        adminEmails
      );

      if (result.success) {
        logger.info("Admin notification email sent", {
          contactId: contactData._id,
          adminEmails: adminEmails.join(', '),
          messageId: result.messageId,
        });
      } else {
        logger.error("Failed to send admin notification email", {
          contactId: contactData._id,
          adminEmails: adminEmails.join(', '),
          error: result.error,
        });
      }

      return result;
    } catch (error) {
      logger.error("Error in sendAdminNotification", {
        error: error.message,
        contactId: contactData._id,
      });
      throw error;
    }
  }

  /**
   * Send all contact-related emails
   * @param {Object} contactData - The saved contact document
   * @returns {Promise<Object>} Combined results
   */
  static async sendContactEmails(contactData) {
    const results = {
      userConfirmation: null,
      adminNotification: null,
    };

    try {
      // Send emails in parallel for better performance
      const [userResult, adminResult] = await Promise.allSettled([
        this.sendUserConfirmation(contactData),
        this.sendAdminNotification(contactData),
      ]);

      // Process user confirmation result
      if (userResult.status === 'fulfilled') {
        results.userConfirmation = userResult.value;
      } else {
        logger.error("User confirmation email failed", {
          error: userResult.reason,
          contactId: contactData._id,
        });
        results.userConfirmation = { 
          success: false, 
          error: userResult.reason?.message || 'Unknown error' 
        };
      }

      // Process admin notification result
      if (adminResult.status === 'fulfilled') {
        results.adminNotification = adminResult.value;
      } else {
        logger.error("Admin notification email failed", {
          error: adminResult.reason,
          contactId: contactData._id,
        });
        results.adminNotification = { 
          success: false, 
          error: adminResult.reason?.message || 'Unknown error' 
        };
      }

      return results;
    } catch (error) {
      logger.error("Error in sendContactEmails", {
        error: error.message,
        contactId: contactData._id,
      });
      throw error;
    }
  }

  /**
   * Resend confirmation email to user
   * @param {string} contactId - The contact document ID
   * @returns {Promise<Object>} Email send result
   */
  static async resendConfirmation(contactId) {
    try {
      // Get contact from database
      const Contact = require("@models/contact-us/contact");
      const contact = await Contact.findById(contactId);

      if (!contact) {
        throw new Error("Contact not found");
      }

      // Send confirmation email
      const result = await this.sendUserConfirmation(contact);

      return result;
    } catch (error) {
      logger.error("Error in resendConfirmation", {
        error: error.message,
        contactId,
      });
      throw error;
    }
  }
}

module.exports = ContactEmailService;