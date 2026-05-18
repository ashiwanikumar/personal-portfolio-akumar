const Blog = require("../../models/blog/blog");
const moment = require("moment");
const logger = require("../../utils/logger");

class BlogSchedulerService {
  constructor() {
    this.logger = logger;
  }

  /**
   * Schedule a blog post for publication
   * @param {string} blogId - The blog ID
   * @param {Object} scheduleData - Scheduling configuration
   * @returns {Promise<Object>} - Updated blog with schedule
   */
  async scheduleBlogPost(blogId, scheduleData) {
    try {
      const { publishAt, unpublishAt, scheduleType, recurringPattern, conditionalRules, userId } = scheduleData;

      // Validate publish date is in the future
      if (publishAt && moment(publishAt).isBefore(moment())) {
        throw new Error("Publish date must be in the future");
      }

      // Validate unpublish date is after publish date
      if (unpublishAt && publishAt && moment(unpublishAt).isBefore(moment(publishAt))) {
        throw new Error("Unpublish date must be after publish date");
      }

      const updateData = {
        status: "scheduled",
        isScheduled: true,
        scheduledAt: new Date(),
        publishAt: publishAt ? new Date(publishAt) : null,
        unpublishAt: unpublishAt ? new Date(unpublishAt) : null,
        scheduleType: scheduleType || "once",
        schedulerMetadata: {
          createdBy: userId,
          nextExecutionAt: publishAt ? new Date(publishAt) : null,
          executionCount: 0,
          executionHistory: [],
        },
      };

      // Add recurring pattern if specified
      if (scheduleType === "recurring" && recurringPattern) {
        updateData.recurringPattern = recurringPattern;
        // Calculate next execution for recurring posts
        updateData.schedulerMetadata.nextExecutionAt = this.calculateNextExecution(
          publishAt,
          recurringPattern
        );
      }

      // Add conditional rules if specified
      if (scheduleType === "conditional" && conditionalRules) {
        updateData.conditionalRules = conditionalRules;
      }

      const updatedBlog = await Blog.findByIdAndUpdate(blogId, updateData, {
        new: true,
        runValidators: true,
      }).populate("author", "name email");

      if (!updatedBlog) {
        throw new Error("Blog not found");
      }

      this.logger.info(`Blog scheduled successfully: ${blogId}`, {
        blogId,
        publishAt,
        scheduleType,
        userId,
      });

      return {
        success: true,
        data: updatedBlog,
        message: "Blog scheduled successfully",
      };
    } catch (error) {
      this.logger.error("Error scheduling blog post:", error);
      throw error;
    }
  }

  /**
   * Unschedule a blog post
   * @param {string} blogId - The blog ID
   * @param {string} userId - User performing the action
   * @returns {Promise<Object>} - Updated blog
   */
  async unscheduleBlogPost(blogId, userId) {
    try {
      const updateData = {
        status: "draft",
        isScheduled: false,
        scheduledAt: null,
        publishAt: null,
        unpublishAt: null,
        scheduleType: "once",
        recurringPattern: {},
        conditionalRules: {},
        "schedulerMetadata.nextExecutionAt": null,
      };

      const updatedBlog = await Blog.findByIdAndUpdate(blogId, updateData, {
        new: true,
        runValidators: true,
      }).populate("author", "name email");

      if (!updatedBlog) {
        throw new Error("Blog not found");
      }

      this.logger.info(`Blog unscheduled successfully: ${blogId}`, {
        blogId,
        userId,
      });

      return {
        success: true,
        data: updatedBlog,
        message: "Blog unscheduled successfully",
      };
    } catch (error) {
      this.logger.error("Error unscheduling blog post:", error);
      throw error;
    }
  }

  /**
   * Update existing schedule
   * @param {string} blogId - The blog ID
   * @param {Object} scheduleData - New scheduling configuration
   * @returns {Promise<Object>} - Updated blog
   */
  async updateSchedule(blogId, scheduleData) {
    try {
      // Unschedule first, then reschedule with new data
      await this.unscheduleBlogPost(blogId, scheduleData.userId);
      return await this.scheduleBlogPost(blogId, scheduleData);
    } catch (error) {
      this.logger.error("Error updating blog schedule:", error);
      throw error;
    }
  }

  /**
   * Process scheduled blogs ready for publication
   * @returns {Promise<Array>} - Array of processing results
   */
  async processScheduledBlogs() {
    try {
      const now = new Date();
      
      // Find blogs scheduled for publication with atomic query to prevent race conditions
      const blogsToPublish = await Blog.find({
        status: "scheduled", // Must be in scheduled status
        isScheduled: true,
        publishAt: { $lte: now },
        $or: [
          { "schedulerMetadata.nextExecutionAt": { $lte: now } },
          { "schedulerMetadata.nextExecutionAt": null },
        ],
        // Additional safety check to prevent already processing blogs
        "schedulerMetadata.isProcessing": { $ne: true }
      }).populate("author", "name email");

      if (blogsToPublish.length === 0) {
        return [];
      }

      this.logger.info(`Found ${blogsToPublish.length} blogs ready for publication`);
      
      const results = [];

      for (const blog of blogsToPublish) {
        try {
          // Mark blog as processing to prevent duplicate processing
          const updateResult = await Blog.findOneAndUpdate(
            { 
              _id: blog._id,
              status: "scheduled", // Double-check status hasn't changed
              "schedulerMetadata.isProcessing": { $ne: true } // Ensure not already processing
            },
            { 
              "schedulerMetadata.isProcessing": true,
              "schedulerMetadata.processingStartedAt": new Date()
            },
            { new: true }
          );

          if (!updateResult) {
            this.logger.warn(`Blog ${blog._id} already being processed or status changed, skipping`);
            continue;
          }

          const result = await this.publishScheduledBlog(updateResult);
          results.push(result);
        } catch (error) {
          // Clear processing flag on error
          await Blog.findByIdAndUpdate(blog._id, {
            "schedulerMetadata.isProcessing": false,
            "schedulerMetadata.processingStartedAt": null
          });
          
          this.logger.error(`Failed to publish scheduled blog ${blog._id}:`, error);
          results.push({
            blogId: blog._id,
            success: false,
            error: error.message,
          });
        }
      }

      this.logger.info(`Processed ${results.length} scheduled blogs`);
      return results;
    } catch (error) {
      this.logger.error("Error processing scheduled blogs:", error);
      throw error;
    }
  }

  /**
   * Publish a scheduled blog
   * @param {Object} blog - Blog document
   * @returns {Promise<Object>} - Publication result
   */
  async publishScheduledBlog(blog) {
    try {
      // Check conditional rules if applicable
      if (blog.scheduleType === "conditional" && blog.conditionalRules) {
        const conditionsMet = await this.checkConditionalRules(blog);
        if (!conditionsMet) {
          return await this.skipBlogPublication(blog, "Conditional rules not met");
        }
      }

      const updateData = {
        status: "published",
        publishedDate: new Date(),
        "schedulerMetadata.lastExecutedAt": new Date(),
        "schedulerMetadata.isProcessing": false, // Clear processing flag
        "schedulerMetadata.processingStartedAt": null,
        $inc: { "schedulerMetadata.executionCount": 1 },
        $push: {
          "schedulerMetadata.executionHistory": {
            executedAt: new Date(),
            status: "success",
            result: { action: "published" },
          },
        },
      };

      // Handle recurring blogs
      if (blog.scheduleType === "recurring") {
        const nextExecution = this.calculateNextExecution(
          blog.publishAt,
          blog.recurringPattern
        );
        
        if (nextExecution && (!blog.recurringPattern.endDate || moment(nextExecution).isBefore(blog.recurringPattern.endDate))) {
          updateData["schedulerMetadata.nextExecutionAt"] = nextExecution;
          updateData.publishAt = nextExecution;
          updateData.status = "scheduled"; // Keep as scheduled for next run
          updateData.isScheduled = true;
        } else {
          // End of recurring schedule
          updateData.isScheduled = false;
          updateData["schedulerMetadata.nextExecutionAt"] = null;
        }
      } else {
        // One-time schedule completed - mark as published and not scheduled
        updateData.isScheduled = false;
        updateData["schedulerMetadata.nextExecutionAt"] = null;
      }

      // Atomic update with condition to prevent race conditions
      const updatedBlog = await Blog.findOneAndUpdate(
        { 
          _id: blog._id,
          "schedulerMetadata.isProcessing": true // Only update if still processing
        }, 
        updateData, 
        {
          new: true,
        }
      ).populate('author');

      if (!updatedBlog) {
        throw new Error(`Blog ${blog._id} was already processed by another instance`);
      }

      this.logger.info(`Blog published successfully: ${blog._id}`, {
        blogId: blog._id,
        title: blog.title,
        scheduleType: blog.scheduleType,
      });

      // Send publication confirmation email only once
      if (!blog.scheduleType || blog.scheduleType === "once") {
        // Only send emails for one-time publications to avoid spam
        setImmediate(async () => {
          try {
            await this.sendPublicationEmails(updatedBlog, true);
          } catch (emailError) {
            this.logger.error("Error sending blog publication confirmation emails:", emailError);
          }
        });
      }

      return {
        blogId: blog._id,
        success: true,
        action: "published",
        publishedAt: new Date(),
      };
    } catch (error) {
      // Record failure in execution history
      await Blog.findByIdAndUpdate(blog._id, {
        $push: {
          "schedulerMetadata.executionHistory": {
            executedAt: new Date(),
            status: "failed",
            error: error.message,
          },
        },
      });

      this.logger.error(`Failed to publish blog ${blog._id}:`, error);
      throw error;
    }
  }

  /**
   * Process blogs scheduled for unpublishing
   * @returns {Promise<Array>} - Array of processing results
   */
  async processScheduledUnpublications() {
    try {
      const now = new Date();
      
      const blogsToUnpublish = await Blog.find({
        status: "published",
        unpublishAt: { $lte: now },
      });

      const results = [];

      for (const blog of blogsToUnpublish) {
        try {
          const result = await this.unpublishExpiredBlog(blog);
          results.push(result);
        } catch (error) {
          this.logger.error(`Failed to unpublish blog ${blog._id}:`, error);
          results.push({
            blogId: blog._id,
            success: false,
            error: error.message,
          });
        }
      }

      if (results.length > 0) {
        this.logger.info(`Processed ${results.length} blogs for unpublishing`);
      }
      
      return results;
    } catch (error) {
      this.logger.error("Error processing scheduled unpublications:", error);
      throw error;
    }
  }

  /**
   * Unpublish an expired blog
   * @param {Object} blog - Blog document
   * @returns {Promise<Object>} - Unpublication result
   */
  async unpublishExpiredBlog(blog) {
    try {
      const updatedBlog = await Blog.findByIdAndUpdate(
        blog._id,
        {
          status: "archived",
          $push: {
            "schedulerMetadata.executionHistory": {
              executedAt: new Date(),
              status: "success",
              result: { action: "unpublished" },
            },
          },
        },
        { new: true }
      );

      this.logger.info(`Blog unpublished successfully: ${blog._id}`, {
        blogId: blog._id,
        title: blog.title,
      });

      return {
        blogId: blog._id,
        success: true,
        action: "unpublished",
        unpublishedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to unpublish blog ${blog._id}:`, error);
      throw error;
    }
  }

  /**
   * Skip blog publication with reason
   * @param {Object} blog - Blog document
   * @param {string} reason - Skip reason
   * @returns {Promise<Object>} - Skip result
   */
  async skipBlogPublication(blog, reason) {
    await Blog.findByIdAndUpdate(blog._id, {
      $push: {
        "schedulerMetadata.executionHistory": {
          executedAt: new Date(),
          status: "skipped",
          error: reason,
        },
      },
    });

    this.logger.info(`Blog publication skipped: ${blog._id}`, {
      blogId: blog._id,
      reason,
    });

    return {
      blogId: blog._id,
      success: true,
      action: "skipped",
      reason,
    };
  }

  /**
   * Check if conditional rules are met
   * @param {Object} blog - Blog document
   * @returns {Promise<boolean>} - Whether conditions are met
   */
  async checkConditionalRules(blog) {
    // Placeholder for conditional rules checking
    // This can be extended to check various conditions like:
    // - Minimum views/engagement
    // - Required approvals
    // - Content validation scores
    // - SEO scores
    return true;
  }

  /**
   * Calculate next execution time for recurring blogs
   * @param {Date} baseDate - Base date for calculation
   * @param {Object} pattern - Recurring pattern
   * @returns {Date|null} - Next execution date
   */
  calculateNextExecution(baseDate, pattern) {
    if (!pattern || !pattern.frequency) return null;

    const base = moment(baseDate);
    const { frequency, interval = 1, daysOfWeek, dayOfMonth } = pattern;

    switch (frequency) {
      case "daily":
        return base.add(interval, "days").toDate();
      
      case "weekly":
        if (daysOfWeek && daysOfWeek.length > 0) {
          // Find next occurrence of specified day(s) of week
          const nextDay = base.clone();
          let found = false;
          
          for (let i = 1; i <= 7 * interval; i++) {
            nextDay.add(1, "day");
            if (daysOfWeek.includes(nextDay.day())) {
              found = true;
              break;
            }
          }
          
          return found ? nextDay.toDate() : null;
        }
        return base.add(interval * 7, "days").toDate();
      
      case "monthly":
        if (dayOfMonth) {
          const nextMonth = base.clone().add(interval, "months");
          nextMonth.date(Math.min(dayOfMonth, nextMonth.daysInMonth()));
          return nextMonth.toDate();
        }
        return base.add(interval, "months").toDate();
      
      case "yearly":
        return base.add(interval, "years").toDate();
      
      default:
        return null;
    }
  }

  /**
   * Get scheduled blogs dashboard data
   * @returns {Promise<Object>} - Dashboard data
   */
  async getScheduledBlogsStatus() {
    try {
      const [
        totalScheduled,
        scheduledForToday,
        recentlyPublished,
        failedSchedules,
        upcomingThisWeek,
      ] = await Promise.all([
        Blog.countDocuments({ isScheduled: true }),
        Blog.countDocuments({
          isScheduled: true,
          publishAt: {
            $gte: moment().startOf("day").toDate(),
            $lte: moment().endOf("day").toDate(),
          },
        }),
        Blog.countDocuments({
          status: "published",
          publishedDate: {
            $gte: moment().subtract(7, "days").toDate(),
          },
        }),
        Blog.countDocuments({
          "schedulerMetadata.executionHistory.status": "failed",
          "schedulerMetadata.executionHistory.executedAt": {
            $gte: moment().subtract(1, "day").toDate(),
          },
        }),
        Blog.find({
          isScheduled: true,
          publishAt: {
            $gte: new Date(),
            $lte: moment().add(7, "days").toDate(),
          },
        })
          .select("title publishAt scheduleType")
          .populate("author", "name")
          .sort({ publishAt: 1 })
          .limit(10),
      ]);

      return {
        success: true,
        data: {
          totalScheduled,
          scheduledForToday,
          recentlyPublished,
          failedSchedules,
          upcomingThisWeek,
        },
      };
    } catch (error) {
      this.logger.error("Error getting scheduled blogs status:", error);
      throw error;
    }
  }

  /**
   * Clean up expired schedules and old execution history
   * @returns {Promise<Object>} - Cleanup result
   */
  async cleanupExpiredSchedules() {
    try {
      const thirtyDaysAgo = moment().subtract(30, "days").toDate();

      // Clean up old execution history
      const historyCleanup = await Blog.updateMany(
        {},
        {
          $pull: {
            "schedulerMetadata.executionHistory": {
              executedAt: { $lt: thirtyDaysAgo },
            },
          },
        }
      );

      // Clean up expired one-time schedules that failed
      const expiredCleanup = await Blog.updateMany(
        {
          isScheduled: true,
          scheduleType: "once",
          publishAt: { $lt: thirtyDaysAgo },
          status: "scheduled",
        },
        {
          $set: {
            status: "draft",
            isScheduled: false,
            scheduledAt: null,
            publishAt: null,
          },
        }
      );

      this.logger.info("Scheduler cleanup completed", {
        historyCleanup: historyCleanup.modifiedCount,
        expiredCleanup: expiredCleanup.modifiedCount,
      });

      return {
        success: true,
        historyItemsRemoved: historyCleanup.modifiedCount,
        expiredSchedulesCleared: expiredCleanup.modifiedCount,
      };
    } catch (error) {
      this.logger.error("Error during scheduler cleanup:", error);
      throw error;
    }
  }

  /**
   * Send publication emails to author and admins
   * @param {Object} blog - Published blog
   * @param {boolean} wasScheduled - Whether this was a scheduled publication
   */
  async sendPublicationEmails(blog, wasScheduled = false) {
    try {
      const { sendBlogApprovalEmail } = require("../../utils/blog/sendBlogApprovalEmail");
      const { blogPublicationConfirmationEmailTemplate } = require("../../mails/blog/blogScheduleEmailTemplate");
      const blogNotificationService = require("./blogNotificationService");
      
      // Get author email
      const authorEmail = blog.author?.email;

      // Send notification to author only
      if (authorEmail) {
        const emailTemplate = blogPublicationConfirmationEmailTemplate(blog, {
          wasScheduled,
          scheduleType: blog.scheduleType
        });
        
        await sendBlogApprovalEmail({
          to: authorEmail,
          subject: emailTemplate.subject,
          html: emailTemplate.body,
          emailType: 'BlogPublication',
          notificationType: 'blog_published',
          blogId: blog._id,
          blogTitle: blog.title,
          blogAuthor: blog.author?.name || 'Author',
          blogSlug: blog.slug,
          publishedAt: new Date(),
          wasScheduled,
          scheduleType: blog.scheduleType,
        });
        
        this.logger.info(`Blog publication confirmation sent to author: ${authorEmail}`);
      }

      // Skip admin emails for scheduled publications to reduce email volume
      // Admins already get notifications when blog is scheduled
      
    } catch (error) {
      this.logger.error("Error sending publication emails:", error);
      throw error;
    }
  }
}

module.exports = new BlogSchedulerService();