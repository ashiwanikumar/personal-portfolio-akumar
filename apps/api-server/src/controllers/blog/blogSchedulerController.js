const blogSchedulerService = require("../../services/blog/blogSchedulerService");
const blogCronJobs = require("../../services/blog/blogCronJobs");
const { validationResult } = require("express-validator");
const logger = require("../../utils/logger");
const { BlogService } = require("../../services/blog/blogService");
const blogNotificationService = require("../../services/blog/blogNotificationService");
const { sendBlogApprovalEmail } = require("../../utils/blog/sendBlogApprovalEmail");
const { blogScheduleNotificationEmailTemplate } = require("../../mails/blog/blogScheduleEmailTemplate");

/**
 * Schedule a blog post
 */
const scheduleBlogPost = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { id: blogId } = req.params;
    const userId = req.user.id;
    const scheduleData = {
      ...req.body,
      userId,
    };

    const result = await blogSchedulerService.scheduleBlogPost(blogId, scheduleData);

    // Send email notifications for scheduled blog
    if (result.success) {
      setImmediate(async () => {
        try {
          // Get the blog details
          const blog = await BlogService.findBlogById(blogId);
          
          if (blog) {
            // Get author email
            const authorEmail = blog.author?.email || 
              (blog.author?._id ? await BlogService.getBlogAuthorEmail(blog.author._id) : null);

            // Send notification to author
            if (authorEmail) {
              const emailTemplate = blogScheduleNotificationEmailTemplate(blog, scheduleData);
              
              await sendBlogApprovalEmail({
                to: authorEmail,
                subject: emailTemplate.subject,
                html: emailTemplate.body,
                emailType: 'BlogSchedule',
                notificationType: 'blog_schedule',
                blogId: blog._id,
                blogTitle: blog.title,
                blogAuthor: blog.author?.name || 'Author',
                blogSlug: blog.slug,
                scheduledPublishAt: scheduleData.publishAt,
                isScheduled: true,
                scheduleType: scheduleData.scheduleType,
                triggeredBy: req.user._id,
                userAgent: req.get('User-Agent'),
                ipAddress: req.ip || req.connection.remoteAddress,
              });
              
              logger.info(`Blog schedule notification sent to author: ${authorEmail}`);
            }

            // Get super admin emails for notification
            const allSuperAdminEmails = await blogNotificationService.getSuperAdminUsers({
              emailsOnly: true,
              includeDisabled: false,
              includeInactive: true,
            });

            // Filter out null/undefined emails and remove author email if they're also a super admin
            const validSuperAdminEmails = allSuperAdminEmails.filter(email => 
              email && typeof email === 'string' && email.includes('@')
            );
            
            const filteredSuperAdminEmails = authorEmail
              ? validSuperAdminEmails.filter(email => email.toLowerCase() !== authorEmail.toLowerCase())
              : validSuperAdminEmails;

            // Send to super admins
            if (filteredSuperAdminEmails.length > 0) {
              const emailTemplate = blogScheduleNotificationEmailTemplate(blog, scheduleData);
              
              for (const adminEmail of filteredSuperAdminEmails) {
                // Validate email before sending
                if (adminEmail && typeof adminEmail === 'string' && adminEmail.includes('@')) {
                  await sendBlogApprovalEmail({
                    to: adminEmail,
                    subject: emailTemplate.subject,
                    html: emailTemplate.body,
                    emailType: 'BlogSchedule',
                    notificationType: 'blog_schedule_admin',
                    blogId: blog._id,
                    blogTitle: blog.title,
                    blogAuthor: blog.author?.name || 'Author',
                    blogSlug: blog.slug,
                    scheduledPublishAt: scheduleData.publishAt,
                    isScheduled: true,
                    scheduleType: scheduleData.scheduleType,
                    triggeredBy: req.user._id,
                    userAgent: req.get('User-Agent'),
                    ipAddress: req.ip || req.connection.remoteAddress,
                  });
                } else {
                  logger.warn(`Invalid admin email for blog schedule notification: ${adminEmail}`);
                }
              }
              
              logger.info(`Blog schedule notification sent to ${filteredSuperAdminEmails.length} super admins`);
            }
          }
        } catch (emailError) {
          logger.error("Error sending blog schedule notification emails:", emailError);
        }
      });
    }

    res.status(200).json(result);
  } catch (error) {
    logger.error("Error in scheduleBlogPost controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to schedule blog post",
    });
  }
};

/**
 * Unschedule a blog post
 */
const unscheduleBlogPost = async (req, res) => {
  try {
    const { id: blogId } = req.params;
    const userId = req.user.id;

    const result = await blogSchedulerService.unscheduleBlogPost(blogId, userId);

    res.status(200).json(result);
  } catch (error) {
    logger.error("Error in unscheduleBlogPost controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to unschedule blog post",
    });
  }
};

/**
 * Update blog schedule
 */
const updateBlogSchedule = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { id: blogId } = req.params;
    const userId = req.user.id;
    const scheduleData = {
      ...req.body,
      userId,
    };

    const result = await blogSchedulerService.updateSchedule(blogId, scheduleData);

    res.status(200).json(result);
  } catch (error) {
    logger.error("Error in updateBlogSchedule controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update blog schedule",
    });
  }
};

/**
 * Get scheduled blogs dashboard
 */
const getScheduledBlogsDashboard = async (req, res) => {
  try {
    const result = await blogSchedulerService.getScheduledBlogsStatus();

    res.status(200).json(result);
  } catch (error) {
    logger.error("Error in getScheduledBlogsDashboard controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get scheduled blogs dashboard",
    });
  }
};

/**
 * Get cron jobs status (Admin only)
 */
const getCronJobsStatus = async (req, res) => {
  try {
    const jobsStatus = blogCronJobs.getJobsStatus();
    const jobConfigurations = blogCronJobs.getJobConfigurations();

    res.status(200).json({
      success: true,
      data: {
        status: jobsStatus,
        configurations: jobConfigurations,
        initialized: blogCronJobs.isInitialized,
      },
    });
  } catch (error) {
    logger.error("Error in getCronJobsStatus controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get cron jobs status",
    });
  }
};

/**
 * Control cron jobs (Admin only)
 */
const controlCronJob = async (req, res) => {
  try {
    const { jobName } = req.params;
    const { action } = req.body;

    if (!["start", "stop", "restart", "trigger"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Allowed: start, stop, restart, trigger",
      });
    }

    let result;
    
    switch (action) {
      case "start":
        blogCronJobs.startJob(jobName);
        result = { message: `Job ${jobName} started` };
        break;
      case "stop":
        blogCronJobs.stopJob(jobName);
        result = { message: `Job ${jobName} stopped` };
        break;
      case "restart":
        blogCronJobs.restartJob(jobName);
        result = { message: `Job ${jobName} restarted` };
        break;
      case "trigger":
        result = await blogCronJobs.triggerJob(jobName);
        break;
    }

    res.status(200).json({
      success: true,
      data: result,
      message: `Job ${jobName} ${action} completed`,
    });
  } catch (error) {
    logger.error("Error in controlCronJob controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to control cron job",
    });
  }
};

/**
 * Manually process scheduled blogs (Admin only)
 */
const manualProcessScheduledBlogs = async (req, res) => {
  try {
    const results = await blogSchedulerService.processScheduledBlogs();

    res.status(200).json({
      success: true,
      data: results,
      message: `Processed ${results.length} scheduled blogs`,
    });
  } catch (error) {
    logger.error("Error in manualProcessScheduledBlogs controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to process scheduled blogs",
    });
  }
};

/**
 * Manually process scheduled unpublications (Admin only)
 */
const manualProcessUnpublications = async (req, res) => {
  try {
    const results = await blogSchedulerService.processScheduledUnpublications();

    res.status(200).json({
      success: true,
      data: results,
      message: `Processed ${results.length} scheduled unpublications`,
    });
  } catch (error) {
    logger.error("Error in manualProcessUnpublications controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to process scheduled unpublications",
    });
  }
};

/**
 * Cleanup expired schedules (Admin only)
 */
const cleanupExpiredSchedules = async (req, res) => {
  try {
    const result = await blogSchedulerService.cleanupExpiredSchedules();

    res.status(200).json({
      success: true,
      data: result,
      message: "Cleanup completed successfully",
    });
  } catch (error) {
    logger.error("Error in cleanupExpiredSchedules controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to cleanup expired schedules",
    });
  }
};

/**
 * Bulk schedule blogs (Admin only)
 */
const bulkScheduleBlogs = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { blogs } = req.body;
    const userId = req.user.id;
    const results = [];

    for (const blogSchedule of blogs) {
      try {
        const scheduleData = {
          ...blogSchedule,
          userId,
        };
        delete scheduleData.id; // Remove id from schedule data
        
        const result = await blogSchedulerService.scheduleBlogPost(
          blogSchedule.id,
          scheduleData
        );
        results.push({
          blogId: blogSchedule.id,
          success: true,
          data: result.data,
        });
      } catch (error) {
        results.push({
          blogId: blogSchedule.id,
          success: false,
          error: error.message,
        });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    res.status(200).json({
      success: true,
      data: results,
      message: `Bulk scheduling completed: ${successful} successful, ${failed} failed`,
    });
  } catch (error) {
    logger.error("Error in bulkScheduleBlogs controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to bulk schedule blogs",
    });
  }
};

module.exports = {
  scheduleBlogPost,
  unscheduleBlogPost,
  updateBlogSchedule,
  getScheduledBlogsDashboard,
  getCronJobsStatus,
  controlCronJob,
  manualProcessScheduledBlogs,
  manualProcessUnpublications,
  cleanupExpiredSchedules,
  bulkScheduleBlogs,
};