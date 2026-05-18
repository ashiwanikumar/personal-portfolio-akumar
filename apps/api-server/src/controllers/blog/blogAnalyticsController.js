// ** SERVICES ** //
const BlogActivityService = require("@services/blog/blogActivityService");
const { BlogService } = require("@services/blog/blogService");

// ** UTILS ** //
const logger = require("@utils/logger");

/**********************************
  Get blog activity analytics dashboard
***********************************/
const getBlogActivityAnalytics = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      users,
      activityTypes,
      status,
      blogs,
      priority
    } = req.query;

    // Build filters
    const filters = {};
    
    if (startDate || endDate) {
      filters.dateRange = {};
      if (startDate) filters.dateRange.startDate = startDate;
      if (endDate) filters.dateRange.endDate = endDate;
    }
    
    if (users) {
      filters.users = Array.isArray(users) ? users : users.split(',');
    }
    
    if (activityTypes) {
      filters.activityTypes = Array.isArray(activityTypes) ? activityTypes : activityTypes.split(',');
    }
    
    if (status) {
      filters.status = status;
    }
    
    if (blogs) {
      filters.blogs = Array.isArray(blogs) ? blogs : blogs.split(',');
    }
    
    if (priority) {
      filters.priority = priority;
    }

    const analytics = await BlogActivityService.getActivityAnalytics(filters);

    res.status(200).json({
      success: true,
      data: analytics[0] || {
        overallStats: [{}],
        activityTypeStats: [],
        userStats: [],
        dailyTrends: []
      }, // getActivityAnalytics returns array with faceted results
      filters: filters,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("GET_BLOG_ACTIVITY_ANALYTICS_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Error fetching blog activity analytics",
      status: "error",
    });
  }
};

/**********************************
  Get recent blog activities with pagination
***********************************/
const getRecentBlogActivities = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      startDate,
      endDate,
      users,
      activityTypes,
      status,
      blogs,
      priority,
      search
    } = req.query;

    // Build filters
    const filters = {};
    
    if (startDate || endDate) {
      filters.dateRange = {};
      if (startDate) filters.dateRange.startDate = startDate;
      if (endDate) filters.dateRange.endDate = endDate;
    }
    
    if (users) {
      filters.users = Array.isArray(users) ? users : users.split(',');
    }
    
    if (activityTypes) {
      filters.activityTypes = Array.isArray(activityTypes) ? activityTypes : activityTypes.split(',');
    }
    
    if (status) {
      filters.status = status;
    }
    
    if (blogs) {
      filters.blogs = Array.isArray(blogs) ? blogs : blogs.split(',');
    }
    
    if (priority) {
      filters.priority = priority;
    }

    if (search) {
      filters.search = search;
    }

    // Add pagination support
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const result = await BlogActivityService.getActivitiesPaginated(filters, {
      page: pageNumber,
      limit: limitNumber,
      skip: skip
    });

    res.status(200).json({
      success: true,
      data: result.activities,
      pagination: {
        currentPage: pageNumber,
        totalPages: result.totalPages,
        totalItems: result.totalCount,
        itemsPerPage: limitNumber,
        hasNextPage: pageNumber < result.totalPages,
        hasPrevPage: pageNumber > 1,
      },
      filters: filters,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("GET_RECENT_BLOG_ACTIVITIES_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Error fetching recent blog activities",
      status: "error",
    });
  }
};

/**********************************
  Get blog activity timeline
***********************************/
const getBlogActivityTimeline = async (req, res) => {
  try {
    const { blogId } = req.params;
    const {
      limit = 100,
      activityTypes,
      startDate,
      endDate
    } = req.query;

    // Validate blog exists
    const blog = await BlogService.findBlogById(blogId);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
        status: "error",
      });
    }

    // Build options
    const options = {};
    
    if (limit) options.limit = parseInt(limit);
    
    if (activityTypes) {
      options.activityTypes = Array.isArray(activityTypes) ? activityTypes : activityTypes.split(',');
    }
    
    if (startDate || endDate) {
      options.dateRange = {};
      if (startDate) options.dateRange.startDate = startDate;
      if (endDate) options.dateRange.endDate = endDate;
    }

    const timeline = await BlogActivityService.getBlogActivityTimeline(blogId, options);

    res.status(200).json({
      success: true,
      data: timeline,
      blog: {
        id: blog._id,
        title: blog.title,
        slug: blog.slug,
        status: blog.status,
        approved: blog.approved,
      },
      count: timeline.length,
      options: options,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("GET_BLOG_ACTIVITY_TIMELINE_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Error fetching blog activity timeline",
      status: "error",
    });
  }
};

/**********************************
  Get user activity statistics
***********************************/
const getUserActivityStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    // Build date range
    const dateRange = {};
    if (startDate) dateRange.startDate = startDate;
    if (endDate) dateRange.endDate = endDate;

    const stats = await BlogActivityService.getUserActivityStats(userId, dateRange);

    res.status(200).json({
      success: true,
      data: stats,
      userId: userId,
      dateRange: dateRange,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("GET_USER_ACTIVITY_STATS_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user activity statistics",
      status: "error",
    });
  }
};

/**********************************
  Get activity types and their counts
***********************************/
const getActivityTypes = async (req, res) => {
  try {
    const activityTypes = [
      // Blog activities
      { value: "blog_created", label: "Blog Created", category: "Blog Management" },
      { value: "blog_updated", label: "Blog Updated", category: "Blog Management" },
      { value: "blog_deleted", label: "Blog Deleted", category: "Blog Management" },
      { value: "blog_approved", label: "Blog Approved", category: "Blog Approval" },
      { value: "blog_rejected", label: "Blog Rejected", category: "Blog Approval" },
      { value: "blog_published", label: "Blog Published", category: "Publishing" },
      { value: "blog_unpublished", label: "Blog Unpublished", category: "Publishing" },
      { value: "blog_scheduled", label: "Blog Scheduled", category: "Scheduling" },
      { value: "blog_unscheduled", label: "Blog Unscheduled", category: "Scheduling" },
      { value: "blog_draft_saved", label: "Draft Saved", category: "Blog Management" },
      { value: "blog_submitted_for_approval", label: "Submitted for Approval", category: "Blog Approval" },
      
      // Image and media activities
      { value: "blog_cover_image_uploaded", label: "Cover Image Uploaded", category: "Media Management" },
      { value: "blog_cover_image_updated", label: "Cover Image Updated", category: "Media Management" },
      { value: "blog_cover_image_deleted", label: "Cover Image Deleted", category: "Media Management" },
      { value: "blog_content_image_uploaded", label: "Content Image Uploaded", category: "Media Management" },
      { value: "blog_media_uploaded", label: "Media Uploaded", category: "Media Management" },
      { value: "blog_media_deleted", label: "Media Deleted", category: "Media Management" },
      
      // Category activities
      { value: "category_created", label: "Category Created", category: "Category Management" },
      { value: "category_updated", label: "Category Updated", category: "Category Management" },
      { value: "category_deleted", label: "Category Deleted", category: "Category Management" },
      { value: "category_blog_assigned", label: "Category Assigned to Blog", category: "Category Management" },
      { value: "category_blog_removed", label: "Category Removed from Blog", category: "Category Management" },
      
      // Tag activities
      { value: "tag_created", label: "Tag Created", category: "Tag Management" },
      { value: "tag_updated", label: "Tag Updated", category: "Tag Management" },
      { value: "tag_deleted", label: "Tag Deleted", category: "Tag Management" },
      { value: "tag_blog_assigned", label: "Tag Assigned to Blog", category: "Tag Management" },
      { value: "tag_blog_removed", label: "Tag Removed from Blog", category: "Tag Management" },
      
      // Permission activities
      { value: "blog_permission_granted", label: "Permission Granted", category: "Permissions" },
      { value: "blog_permission_revoked", label: "Permission Revoked", category: "Permissions" },
      { value: "blog_access_attempted", label: "Access Attempted", category: "Security" },
      { value: "blog_access_denied", label: "Access Denied", category: "Security" },
      
      // Email activities
      { value: "email_approval_sent", label: "Approval Email Sent", category: "Email Notifications" },
      { value: "email_rejection_sent", label: "Rejection Email Sent", category: "Email Notifications" },
      { value: "email_publication_sent", label: "Publication Email Sent", category: "Email Notifications" },
      { value: "email_schedule_sent", label: "Schedule Email Sent", category: "Email Notifications" },
      
      // System activities
      { value: "blog_auto_published", label: "Auto Published", category: "System Actions" },
      { value: "blog_auto_unpublished", label: "Auto Unpublished", category: "System Actions" },
      { value: "blog_expired", label: "Blog Expired", category: "System Actions" },
      { value: "blog_archived", label: "Blog Archived", category: "System Actions" },
      { value: "blog_restored", label: "Blog Restored", category: "System Actions" },
    ];

    // Group by category
    const groupedActivityTypes = activityTypes.reduce((acc, type) => {
      if (!acc[type.category]) {
        acc[type.category] = [];
      }
      acc[type.category].push(type);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        activityTypes: activityTypes,
        groupedActivityTypes: groupedActivityTypes,
        categories: Object.keys(groupedActivityTypes),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("GET_ACTIVITY_TYPES_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Error fetching activity types",
      status: "error",
    });
  }
};

/**********************************
  Export blog activities (CSV/Excel)
***********************************/
const exportBlogActivities = async (req, res) => {
  try {
    const {
      format = 'csv',
      startDate,
      endDate,
      users,
      activityTypes,
      status,
      blogs,
      priority
    } = req.query;

    // Build filters
    const filters = {};
    
    if (startDate || endDate) {
      filters.dateRange = {};
      if (startDate) filters.dateRange.startDate = startDate;
      if (endDate) filters.dateRange.endDate = endDate;
    }
    
    if (users) {
      filters.users = Array.isArray(users) ? users : users.split(',');
    }
    
    if (activityTypes) {
      filters.activityTypes = Array.isArray(activityTypes) ? activityTypes : activityTypes.split(',');
    }
    
    if (status) {
      filters.status = status;
    }
    
    if (blogs) {
      filters.blogs = Array.isArray(blogs) ? blogs : blogs.split(',');
    }
    
    if (priority) {
      filters.priority = priority;
    }

    // Get activities (no limit for export)
    const activities = await BlogActivityService.getRecentActivities(filters, 10000);

    if (format === 'csv') {
      // Convert to CSV
      const csvHeaders = [
        'Date',
        'Time',
        'Activity Type',
        'Action',
        'User',
        'Blog Title',
        'Status',
        'Priority',
        'Description',
        'IP Address'
      ];

      const csvData = activities.map(activity => [
        new Date(activity.createdAt).toLocaleDateString(),
        new Date(activity.createdAt).toLocaleTimeString(),
        activity.activityTypeDisplay || activity.activityType,
        activity.action,
        activity.user ? `${activity.user.name || activity.user.firstName + ' ' + activity.user.lastName} (${activity.user.email})` : 'Unknown',
        activity.blog ? activity.blog.title : 'N/A',
        activity.status,
        activity.priority,
        activity.description || '',
        activity.metadata?.ipAddress || ''
      ]);

      const csvContent = [csvHeaders, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="blog-activities-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
    } else {
      res.status(400).json({
        success: false,
        message: "Unsupported export format. Only 'csv' is currently supported.",
        status: "error",
      });
    }
  } catch (error) {
    logger.error("EXPORT_BLOG_ACTIVITIES_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Error exporting blog activities",
      status: "error",
    });
  }
};

/**********************************
  Get activity summary for dashboard
***********************************/
const getActivitySummary = async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    const filters = {
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      }
    };

    const analytics = await BlogActivityService.getActivityAnalytics(filters);
    const recentActivities = await BlogActivityService.getRecentActivities(filters, 10);

    const summary = analytics[0] || {
      overallStats: [{}],
      activityTypeStats: [],
      userStats: [],
      dailyTrends: []
    };

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalActivities: summary.overallStats[0]?.totalActivities || 0,
          uniqueUsers: summary.overallStats[0]?.uniqueUserCount || 0,
          uniqueBlogs: summary.overallStats[0]?.uniqueBlogCount || 0,
          successRate: summary.overallStats[0]?.successRate || 0,
          successCount: summary.overallStats[0]?.successCount || 0,
          failureCount: summary.overallStats[0]?.failureCount || 0,
        },
        topActivityTypes: summary.activityTypeStats?.slice(0, 5) || [],
        topUsers: summary.userStats?.slice(0, 5) || [],
        dailyTrends: summary.dailyTrends || [],
        recentActivities: recentActivities || [],
      },
      period: period,
      dateRange: filters.dateRange,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("GET_ACTIVITY_SUMMARY_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Error fetching activity summary",
      status: "error",
    });
  }
};

/**********************************
  Get filter options for activity logs
***********************************/
const getActivityFilterOptions = async (req, res) => {
  try {
    const filterOptions = await BlogActivityService.getFilterOptions();

    res.status(200).json({
      success: true,
      data: {
        users: filterOptions.users || [],
        activityTypes: filterOptions.activityTypes || [],
        categories: filterOptions.categories || [],
        statuses: [
          { value: 'success', label: 'Success', color: 'success' },
          { value: 'failed', label: 'Failed', color: 'danger' },
          { value: 'warning', label: 'Warning', color: 'warning' },
          { value: 'info', label: 'Info', color: 'info' }
        ],
        priorities: [
          { value: 'low', label: 'Low', color: 'secondary' },
          { value: 'normal', label: 'Normal', color: 'primary' },
          { value: 'high', label: 'High', color: 'warning' },
          { value: 'critical', label: 'Critical', color: 'danger' }
        ],
        perPageOptions: [
          { value: 10, label: '10 per page' },
          { value: 20, label: '20 per page' },
          { value: 30, label: '30 per page' },
          { value: 50, label: '50 per page' },
          { value: 100, label: '100 per page' }
        ]
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("GET_ACTIVITY_FILTER_OPTIONS_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Error fetching activity filter options",
      status: "error",
    });
  }
};

module.exports = {
  getBlogActivityAnalytics,
  getRecentBlogActivities,
  getBlogActivityTimeline,
  getUserActivityStats,
  getActivityTypes,
  exportBlogActivities,
  getActivitySummary,
  getActivityFilterOptions,
};