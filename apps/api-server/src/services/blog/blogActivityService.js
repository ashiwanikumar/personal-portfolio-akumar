const BlogActivity = require("@models/blog/blogActivity");
const logger = require("@utils/logger");

class BlogActivityService {
  /**
   * Log a blog activity
   * @param {Object} activityData - Activity data to log
   * @returns {Promise<Object>} Created activity
   */
  static async logActivity(activityData) {
    try {
      // Validate required fields
      if (!activityData.user) {
        throw new Error("User is required for activity logging");
      }
      
      if (!activityData.activityType) {
        throw new Error("Activity type is required for activity logging");
      }
      
      if (!activityData.action) {
        throw new Error("Action description is required for activity logging");
      }

      // Set default values
      const activity = {
        ...activityData,
        status: activityData.status || "success",
        priority: activityData.priority || "normal",
        visibility: activityData.visibility || "internal",
        metadata: {
          ...activityData.metadata,
          timestamp: new Date(),
        },
      };

      // Add automatic tags based on activity type
      if (!activity.tags) {
        activity.tags = this.generateTags(activity.activityType, activity);
      }

      const createdActivity = await BlogActivity.logActivity(activity);
      
      logger.info("Blog activity logged:", {
        activityId: createdActivity._id,
        activityType: createdActivity.activityType,
        user: createdActivity.user,
        blog: createdActivity.blog,
      });

      return createdActivity;
    } catch (error) {
      logger.error("Error logging blog activity:", error);
      // Don't throw error to prevent breaking main functionality
      return null;
    }
  }

  /**
   * Log blog creation activity
   * @param {Object} blog - Blog object
   * @param {Object} user - User who created the blog
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Created activity
   */
  static async logBlogCreated(blog, user, metadata = {}) {
    return await this.logActivity({
      blog: blog._id,
      user: user._id,
      activityType: "blog_created",
      action: `Created blog "${blog.title}"`,
      description: `New blog post "${blog.title}" was created`,
      afterData: {
        title: blog.title,
        status: blog.status,
        approved: blog.approved,
        category: blog.category,
        tags: blog.tags,
      },
      metadata: {
        ...metadata,
        source: metadata.source || "web",
      },
      priority: "normal",
      visibility: "internal",
    });
  }

  /**
   * Log blog update activity
   * @param {Object} blog - Updated blog object
   * @param {Object} originalBlog - Original blog object before update
   * @param {Object} user - User who updated the blog
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Created activity
   */
  static async logBlogUpdated(blog, originalBlog, user, metadata = {}) {
    const changes = this.detectChanges(originalBlog, blog);
    
    return await this.logActivity({
      blog: blog._id,
      user: user._id,
      activityType: "blog_updated",
      action: `Updated blog "${blog.title}"`,
      description: `Blog post "${blog.title}" was updated`,
      beforeData: this.extractBlogData(originalBlog),
      afterData: this.extractBlogData(blog),
      changes,
      metadata: {
        ...metadata,
        changedFields: Object.keys(changes),
        source: metadata.source || "web",
      },
      priority: "normal",
      visibility: "internal",
    });
  }

  /**
   * Log blog approval activity
   * @param {Object} blog - Blog object
   * @param {Object} user - User who approved/rejected the blog
   * @param {boolean} approved - Whether blog was approved or rejected
   * @param {string} comments - Approval/rejection comments
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Created activity
   */
  static async logBlogApproval(blog, user, approved, comments = "", metadata = {}) {
    const activityType = approved ? "blog_approved" : "blog_rejected";
    const action = approved ? `Approved blog "${blog.title}"` : `Rejected blog "${blog.title}"`;
    
    return await this.logActivity({
      blog: blog._id,
      user: user._id,
      targetUser: blog.author,
      activityType,
      action,
      description: `Blog post "${blog.title}" was ${approved ? "approved" : "rejected"}${comments ? `: ${comments}` : ""}`,
      beforeData: { approved: !approved },
      afterData: { approved },
      metadata: {
        ...metadata,
        comments,
        approvalComments: comments,
        source: metadata.source || "web",
      },
      priority: "high",
      visibility: "internal",
    });
  }

  /**
   * Log blog publication activity
   * @param {Object} blog - Blog object
   * @param {Object} user - User who published the blog
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Created activity
   */
  static async logBlogPublished(blog, user, metadata = {}) {
    return await this.logActivity({
      blog: blog._id,
      user: user._id,
      activityType: "blog_published",
      action: `Published blog "${blog.title}"`,
      description: `Blog post "${blog.title}" is now live and public`,
      afterData: {
        status: "published",
        publishedAt: new Date(),
      },
      metadata: {
        ...metadata,
        publishUrl: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/blogs/${blog.slug}`,
        source: metadata.source || "web",
      },
      priority: "high",
      visibility: "public",
    });
  }

  /**
   * Log blog scheduling activity
   * @param {Object} blog - Blog object
   * @param {Object} user - User who scheduled the blog
   * @param {Date} publishAt - Scheduled publish date
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Created activity
   */
  static async logBlogScheduled(blog, user, publishAt, metadata = {}) {
    return await this.logActivity({
      blog: blog._id,
      user: user._id,
      activityType: "blog_scheduled",
      action: `Scheduled blog "${blog.title}" for publication`,
      description: `Blog post "${blog.title}" scheduled to be published on ${publishAt.toLocaleString()}`,
      afterData: {
        isScheduled: true,
        publishAt,
      },
      metadata: {
        ...metadata,
        schedulingInfo: {
          publishAt,
          scheduleType: metadata.scheduleType || "once",
        },
        source: metadata.source || "web",
      },
      priority: "normal",
      visibility: "internal",
    });
  }

  /**
   * Log category creation activity
   * @param {Object} category - Category object
   * @param {Object} user - User who created the category
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Created activity
   */
  static async logCategoryCreated(category, user, metadata = {}) {
    return await this.logActivity({
      blogCategory: category._id,
      user: user._id,
      activityType: "category_created",
      action: `Created category "${category.name}"`,
      description: `New blog category "${category.name}" was created`,
      afterData: {
        name: category.name,
        description: category.description,
        slug: category.slug,
      },
      metadata: {
        ...metadata,
        source: metadata.source || "web",
      },
      priority: "normal",
      visibility: "internal",
    });
  }

  /**
   * Log category update activity
   * @param {Object} category - Updated category object
   * @param {Object} originalCategory - Original category before update
   * @param {Object} user - User who updated the category
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Created activity
   */
  static async logCategoryUpdated(category, originalCategory, user, metadata = {}) {
    const changes = this.detectChanges(originalCategory, category);
    
    return await this.logActivity({
      blogCategory: category._id,
      user: user._id,
      activityType: "category_updated",
      action: `Updated category "${category.name}"`,
      description: `Blog category "${category.name}" was updated`,
      beforeData: this.extractCategoryData(originalCategory),
      afterData: this.extractCategoryData(category),
      changes,
      metadata: {
        ...metadata,
        changedFields: Object.keys(changes),
        source: metadata.source || "web",
      },
      priority: "normal",
      visibility: "internal",
    });
  }

  /**
   * Log category deletion activity
   * @param {Object} category - Deleted category object
   * @param {Object} user - User who deleted the category
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Created activity
   */
  static async logCategoryDeleted(category, user, metadata = {}) {
    return await this.logActivity({
      blogCategory: category._id,
      user: user._id,
      activityType: "category_deleted",
      action: `Deleted category "${category.name}"`,
      description: `Blog category "${category.name}" was permanently deleted`,
      beforeData: this.extractCategoryData(category),
      metadata: {
        ...metadata,
        deletedCategoryName: category.name,
        deletedCategoryId: category._id.toString(),
        source: metadata.source || "web",
      },
      priority: "high", // Deletion is high priority
      visibility: "internal",
    });
  }

  /**
   * Log tag creation activity
   * @param {Object} tag - Tag object
   * @param {Object} user - User who created the tag
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Created activity
   */
  static async logTagCreated(tag, user, metadata = {}) {
    return await this.logActivity({
      blogTag: tag._id,
      user: user._id,
      activityType: "tag_created",
      action: `Created tag "${tag.name}"`,
      description: `New blog tag "${tag.name}" was created`,
      afterData: {
        name: tag.name,
        description: tag.description,
        slug: tag.slug,
      },
      metadata: {
        ...metadata,
        source: metadata.source || "web",
      },
      priority: "normal",
      visibility: "internal",
    });
  }

  /**
   * Log tag update activity
   * @param {Object} tag - Updated tag object
   * @param {Object} originalTag - Original tag before update
   * @param {Object} user - User who updated the tag
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Created activity
   */
  static async logTagUpdated(tag, originalTag, user, metadata = {}) {
    const changes = this.detectChanges(originalTag, tag);
    
    return await this.logActivity({
      blogTag: tag._id,
      user: user._id,
      activityType: "tag_updated",
      action: `Updated tag "${tag.name}"`,
      description: `Blog tag "${tag.name}" was updated`,
      beforeData: this.extractTagData(originalTag),
      afterData: this.extractTagData(tag),
      changes,
      metadata: {
        ...metadata,
        changedFields: Object.keys(changes),
        source: metadata.source || "web",
      },
      priority: "normal",
      visibility: "internal",
    });
  }

  /**
   * Log tag deletion activity
   * @param {Object} tag - Deleted tag object
   * @param {Object} user - User who deleted the tag
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Created activity
   */
  static async logTagDeleted(tag, user, metadata = {}) {
    return await this.logActivity({
      blogTag: tag._id,
      user: user._id,
      activityType: "tag_deleted",
      action: `Deleted tag "${tag.name}"`,
      description: `Blog tag "${tag.name}" was permanently deleted`,
      beforeData: this.extractTagData(tag),
      metadata: {
        ...metadata,
        deletedTagName: tag.name,
        deletedTagId: tag._id.toString(),
        source: metadata.source || "web",
      },
      priority: "high", // Deletion is high priority
      visibility: "internal",
    });
  }

  /**
   * Log image upload activity
   * @param {Object} blog - Blog object
   * @param {Object} user - User who uploaded the image
   * @param {string} imageType - Type of image (cover, content)
   * @param {Object} fileInfo - File information
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Created activity
   */
  static async logImageUploaded(blog, user, imageType, fileInfo, metadata = {}) {
    const activityType = imageType === "cover" ? "blog_cover_image_uploaded" : "blog_content_image_uploaded";
    
    return await this.logActivity({
      blog: blog._id,
      user: user._id,
      activityType,
      action: `Uploaded ${imageType} image for blog "${blog.title}"`,
      description: `${imageType === "cover" ? "Cover" : "Content"} image uploaded for blog "${blog.title}"`,
      metadata: {
        ...metadata,
        fileInfo: {
          originalName: fileInfo.originalName,
          size: fileInfo.size,
          mimeType: fileInfo.mimeType,
          s3Key: fileInfo.s3Key,
          cloudFrontUrl: fileInfo.cloudFrontUrl,
        },
        source: metadata.source || "web",
      },
      priority: "normal",
      visibility: "internal",
    });
  }

  /**
   * Log email activity
   * @param {Object} blog - Blog object
   * @param {Object} user - User who triggered the email
   * @param {string} emailType - Type of email sent
   * @param {Array} recipients - Email recipients
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Created activity
   */
  static async logEmailActivity(blog, user, emailType, recipients, metadata = {}) {
    const emailTypeMap = {
      approval: "email_approval_sent",
      rejection: "email_rejection_sent",
      publication: "email_publication_sent",
      schedule: "email_schedule_sent",
    };
    
    const activityType = emailTypeMap[emailType] || "email_approval_sent";
    
    return await this.logActivity({
      blog: blog._id,
      user: user._id,
      activityType,
      action: `Sent ${emailType} email for blog "${blog.title}"`,
      description: `${emailType.charAt(0).toUpperCase() + emailType.slice(1)} email sent to ${recipients.length} recipient(s)`,
      metadata: {
        ...metadata,
        emailInfo: {
          recipients: recipients.map(r => r.email || r),
          subject: metadata.subject,
          template: metadata.template,
          deliveryStatus: metadata.deliveryStatus || "sent",
          messageId: metadata.messageId,
        },
        source: metadata.source || "system",
      },
      priority: "normal",
      visibility: "internal",
    });
  }

  /**
   * Get activity timeline for a blog
   * @param {string} blogId - Blog ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Activity timeline
   */
  static async getBlogActivityTimeline(blogId, options = {}) {
    return await BlogActivity.getBlogActivityTimeline(blogId, options);
  }

  /**
   * Get user activity statistics
   * @param {string} userId - User ID
   * @param {Object} dateRange - Date range filter
   * @returns {Promise<Array>} User activity stats
   */
  static async getUserActivityStats(userId, dateRange = {}) {
    return await BlogActivity.getUserActivityStats(userId, dateRange);
  }

  /**
   * Get comprehensive activity analytics
   * @param {Object} filters - Filters to apply
   * @returns {Promise<Object>} Activity analytics
   */
  static async getActivityAnalytics(filters = {}) {
    return await BlogActivity.getActivityAnalytics(filters);
  }

  /**
   * Get recent activities
   * @param {Object} filters - Filters to apply
   * @param {number} limit - Number of activities to return
   * @returns {Promise<Array>} Recent activities
   */
  static async getRecentActivities(filters = {}, limit = 50) {
    const matchQuery = {};
    
    if (filters.users && filters.users.length > 0) {
      matchQuery.user = { $in: filters.users };
    }
    
    if (filters.activityTypes && filters.activityTypes.length > 0) {
      matchQuery.activityType = { $in: filters.activityTypes };
    }
    
    if (filters.dateRange) {
      matchQuery.createdAt = {};
      if (filters.dateRange.startDate) {
        matchQuery.createdAt.$gte = new Date(filters.dateRange.startDate);
      }
      if (filters.dateRange.endDate) {
        matchQuery.createdAt.$lte = new Date(filters.dateRange.endDate);
      }
    }
    
    if (filters.blogs && filters.blogs.length > 0) {
      matchQuery.blog = { $in: filters.blogs };
    }
    
    if (filters.status) {
      matchQuery.status = filters.status;
    }
    
    if (filters.priority) {
      matchQuery.priority = filters.priority;
    }
    
    return await BlogActivity.find(matchQuery)
      .populate("user", "name email firstName lastName")
      .populate("targetUser", "name email firstName lastName")
      .populate("blog", "title slug status approved")
      .populate("blogCategory", "name slug")
      .populate("blogTag", "name slug")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Get activities with pagination and advanced filtering
   * @param {Object} filters - Filters to apply
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Paginated activities with metadata
   */
  static async getActivitiesPaginated(filters = {}, pagination = {}) {
    const { page = 1, limit = 20, skip = 0 } = pagination;
    
    const matchQuery = {};
    
    // Apply filters
    if (filters.users && filters.users.length > 0) {
      matchQuery.user = { $in: filters.users };
    }
    
    if (filters.activityTypes && filters.activityTypes.length > 0) {
      matchQuery.activityType = { $in: filters.activityTypes };
    }
    
    if (filters.dateRange) {
      matchQuery.createdAt = {};
      if (filters.dateRange.startDate) {
        matchQuery.createdAt.$gte = new Date(filters.dateRange.startDate);
      }
      if (filters.dateRange.endDate) {
        matchQuery.createdAt.$lte = new Date(filters.dateRange.endDate);
      }
    }
    
    if (filters.blogs && filters.blogs.length > 0) {
      matchQuery.blog = { $in: filters.blogs };
    }
    
    if (filters.status) {
      matchQuery.status = filters.status;
    }
    
    if (filters.priority) {
      matchQuery.priority = filters.priority;
    }

    // Add search functionality
    if (filters.search) {
      const searchRegex = new RegExp(filters.search, 'i');
      matchQuery.$or = [
        { action: searchRegex },
        { description: searchRegex },
        { activityType: searchRegex }
      ];
    }
    
    // Get total count for pagination
    const totalCount = await BlogActivity.countDocuments(matchQuery);
    const totalPages = Math.ceil(totalCount / limit);
    
    // Get paginated activities
    const activities = await BlogActivity.find(matchQuery)
      .populate("user", "name email firstName lastName")
      .populate("targetUser", "name email firstName lastName")  
      .populate("blog", "title slug status approved")
      .populate("blogCategory", "name slug")
      .populate("blogTag", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    return {
      activities,
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };
  }

  /**
   * Helper method to generate tags based on activity type
   * @param {string} activityType - Activity type
   * @param {Object} activity - Activity data
   * @returns {Array} Generated tags
   */
  static generateTags(activityType, activity) {
    const tags = [];
    
    if (activityType.startsWith("blog_")) {
      tags.push("blog");
    }
    
    if (activityType.startsWith("category_")) {
      tags.push("category");
    }
    
    if (activityType.startsWith("tag_")) {
      tags.push("tag");
    }
    
    if (activityType.startsWith("email_")) {
      tags.push("email", "notification");
    }
    
    if (activityType.includes("approval") || activityType.includes("approved")) {
      tags.push("approval");
    }
    
    if (activityType.includes("publish")) {
      tags.push("publication");
    }
    
    if (activityType.includes("schedule")) {
      tags.push("scheduling");
    }
    
    if (activity.priority === "high" || activity.priority === "critical") {
      tags.push("important");
    }
    
    return tags;
  }

  /**
   * Helper method to detect changes between objects
   * @param {Object} original - Original object
   * @param {Object} updated - Updated object
   * @returns {Object} Changes detected
   */
  static detectChanges(original, updated) {
    const changes = {};
    const fieldsToCheck = ["title", "content", "status", "approved", "category", "tags", "description", "slug"];
    
    fieldsToCheck.forEach(field => {
      if (original[field] !== updated[field]) {
        changes[field] = {
          from: original[field],
          to: updated[field],
        };
      }
    });
    
    return changes;
  }

  /**
   * Helper method to extract blog data for logging
   * @param {Object} blog - Blog object
   * @returns {Object} Extracted blog data
   */
  static extractBlogData(blog) {
    return {
      title: blog.title,
      status: blog.status,
      approved: blog.approved,
      category: blog.category,
      tags: blog.tags,
      author: blog.author,
      slug: blog.slug,
      isScheduled: blog.isScheduled,
      publishAt: blog.publishAt,
    };
  }

  /**
   * Helper method to extract category data for logging
   * @param {Object} category - Category object
   * @returns {Object} Extracted category data
   */
  static extractCategoryData(category) {
    return {
      name: category.name,
      description: category.description,
      slug: category.slug,
    };
  }

  /**
   * Helper method to extract tag data for logging
   * @param {Object} tag - Tag object
   * @returns {Object} Extracted tag data
   */
  static extractTagData(tag) {
    return {
      name: tag.name,
      description: tag.description,
      slug: tag.slug,
    };
  }

  /**
   * Get filter options for activity logs
   * @returns {Promise<Object>} Filter options
   */
  static async getFilterOptions() {
    try {
      // Get unique users who have activities
      const users = await BlogActivity.aggregate([
        {
          $group: {
            _id: "$user",
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "userInfo"
          }
        },
        {
          $unwind: "$userInfo"
        },
        {
          $project: {
            _id: 1,
            name: {
              $cond: {
                if: { $ne: ["$userInfo.name", null] },
                then: "$userInfo.name",
                else: {
                  $concat: [
                    { $ifNull: ["$userInfo.firstName", ""] },
                    " ",
                    { $ifNull: ["$userInfo.lastName", ""] }
                  ]
                }
              }
            },
            email: "$userInfo.email",
            count: 1
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      // Get unique activity types with their counts
      const activityTypes = await BlogActivity.aggregate([
        {
          $group: {
            _id: "$activityType",
            count: { $sum: 1 },
            lastUsed: { $max: "$createdAt" }
          }
        },
        {
          $project: {
            value: "$_id",
            label: "$_id", // Use raw value for now, format on client side
            count: 1,
            lastUsed: 1,
            category: {
              $switch: {
                branches: [
                  { case: { $regexMatch: { input: "$_id", regex: "^blog_" } }, then: "Blog Management" },
                  { case: { $regexMatch: { input: "$_id", regex: "^category_" } }, then: "Category Management" },
                  { case: { $regexMatch: { input: "$_id", regex: "^tag_" } }, then: "Tag Management" },
                  { case: { $regexMatch: { input: "$_id", regex: "^email_" } }, then: "Email Notifications" },
                  { case: { $regexMatch: { input: "$_id", regex: "approval|approved|rejected" } }, then: "Blog Approval" },
                  { case: { $regexMatch: { input: "$_id", regex: "publish|schedule" } }, then: "Publishing" }
                ],
                default: "Other"
              }
            }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      // Get activity categories (grouped activity types)
      const categories = activityTypes.reduce((acc, type) => {
        if (!acc.find(cat => cat.value === type.category)) {
          acc.push({
            value: type.category,
            label: type.category,
            count: 0
          });
        }
        const category = acc.find(cat => cat.value === type.category);
        category.count += type.count;
        return acc;
      }, []).sort((a, b) => b.count - a.count);

      return {
        users: users.map(user => ({
          value: user._id,
          label: `${user.name || 'Unknown'} (${user.email})`,
          email: user.email,
          name: user.name,
          count: user.count
        })),
        activityTypes: activityTypes.map(type => ({
          value: type.value,
          label: this.formatActivityTypeLabel(type.value),
          category: type.category,
          count: type.count,
          lastUsed: type.lastUsed
        })),
        categories: categories,
        statuses: [
          { value: 'success', label: 'Success' },
          { value: 'failed', label: 'Failed' },
          { value: 'pending', label: 'Pending' },
          { value: 'partial', label: 'Partial' }
        ],
        priorities: [
          { value: 'critical', label: 'Critical' },
          { value: 'high', label: 'High' },
          { value: 'normal', label: 'Normal' },
          { value: 'low', label: 'Low' }
        ],
        perPageOptions: [
          { value: 10, label: '10 per page' },
          { value: 20, label: '20 per page' },
          { value: 50, label: '50 per page' },
          { value: 100, label: '100 per page' }
        ]
      };
    } catch (error) {
      logger.error("Error getting filter options:", error);
      return {
        users: [],
        activityTypes: [],
        categories: []
      };
    }
  }

  /**
   * Helper method to format activity type labels
   * @param {string} activityType - Raw activity type
   * @returns {string} Formatted label
   */
  static formatActivityTypeLabel(activityType) {
    const labelMap = {
      // Blog activities
      'blog_created': 'Blog Created',
      'blog_updated': 'Blog Updated',
      'blog_deleted': 'Blog Deleted',
      'blog_approved': 'Blog Approved',
      'blog_rejected': 'Blog Rejected',
      'blog_published': 'Blog Published',
      'blog_scheduled': 'Blog Scheduled',
      'blog_unscheduled': 'Blog Unscheduled',
      
      // Category activities
      'category_created': 'Category Created',
      'category_updated': 'Category Updated',
      'category_deleted': 'Category Deleted',
      
      // Tag activities
      'tag_created': 'Tag Created',
      'tag_updated': 'Tag Updated',
      'tag_deleted': 'Tag Deleted',
      
      // Email activities
      'email_approval_sent': 'Approval Email Sent',
      'email_rejection_sent': 'Rejection Email Sent',
      'email_publication_sent': 'Publication Email Sent',
      'email_schedule_sent': 'Schedule Email Sent',
      'email_status_update_sent': 'Status Update Email Sent',
      
      // Media activities
      'blog_cover_image_uploaded': 'Cover Image Uploaded',
      'blog_content_image_uploaded': 'Content Image Uploaded',
      'blog_media_uploaded': 'Media Uploaded'
    };

    return labelMap[activityType] || activityType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}

module.exports = BlogActivityService;