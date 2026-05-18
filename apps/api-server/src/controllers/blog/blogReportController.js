const BlogReportEmailService = require('@services/blog/blogReportEmailService');
const logger = require('@utils/logger');

/**
 * Generate and send blog activity report via email
 * @route POST /api/v1/blog/analytics/reports/email
 * @access Private (Authenticated users - only their own data)
 */
const generateAndSendEmailReport = async (req, res) => {
  try {
    const user = req.fullUser;
    const { 
      reportType = 'activity', 
      dateRange, 
      activityTypes, 
      limit = 1000 
    } = req.body;

    // Validate report type
    const validReportTypes = ['activity', 'email', 'comprehensive'];
    if (!validReportTypes.includes(reportType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report type. Must be one of: activity, email, comprehensive',
        validTypes: validReportTypes
      });
    }

    // Validate date range if provided
    if (dateRange) {
      if (dateRange.startDate && dateRange.endDate) {
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid date format. Please use ISO date format (YYYY-MM-DD)'
          });
        }
        
        if (startDate > endDate) {
          return res.status(400).json({
            success: false,
            message: 'Start date cannot be after end date'
          });
        }
        
        // Limit the date range to 1 year for performance
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        
        if (startDate < oneYearAgo) {
          return res.status(400).json({
            success: false,
            message: 'Date range cannot exceed 1 year from current date'
          });
        }
      }
    }

    // Validate limit
    if (limit && (limit < 1 || limit > 5000)) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be between 1 and 5000'
      });
    }

    // Prepare filters
    const filters = {
      dateRange,
      activityTypes,
      limit: Math.min(limit, 5000) // Cap at 5000 for performance
    };

    logger.info(`Generating ${reportType} report for user ${user._id}`, {
      userId: user._id,
      email: user.email,
      reportType,
      filters
    });

    // Generate and send the report
    const result = await BlogReportEmailService.generateAndSendReport(
      user,
      filters,
      reportType
    );

    res.status(200).json({
      success: true,
      message: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generated and sent successfully`,
      data: {
        reportId: result.reportId,
        reportType,
        emailSent: result.emailSent,
        downloadUrl: result.downloadUrl,
        generatedAt: new Date().toISOString(),
        filters: {
          dateRange: filters.dateRange || 'All time',
          activityTypes: filters.activityTypes || 'All types',
          limit: filters.limit
        }
      }
    });

  } catch (error) {
    logger.error('Error generating email report:', {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id,
      requestBody: req.body
    });

    // Check for specific error types
    if (error.message.includes('ExcelJS')) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate Excel report. Please try again later.',
        error: 'EXCEL_GENERATION_ERROR'
      });
    }

    if (error.message.includes('S3') || error.message.includes('upload')) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload report file. Please try again later.',
        error: 'FILE_UPLOAD_ERROR'
      });
    }

    if (error.message.includes('email') || error.message.includes('SMTP')) {
      return res.status(500).json({
        success: false,
        message: 'Report generated but failed to send email. Please contact support.',
        error: 'EMAIL_SEND_ERROR'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to generate blog activity report',
      error: error.message || 'INTERNAL_SERVER_ERROR'
    });
  }
};

/**
 * Get report generation history for current user
 * @route GET /api/v1/blog/analytics/reports/history
 * @access Private (Authenticated users - only their own data)
 */
const getReportHistory = async (req, res) => {
  try {
    const user = req.fullUser;
    const { page = 1, limit = 10 } = req.query;

    // This would require adding a reports collection to track history
    // For now, we'll get from blog activities
    const BlogActivity = require('@models/blog/blogActivity');
    
    const reportActivities = await BlogActivity.find({
      user: user._id,
      activityType: 'blog_report_generated'
    })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit))
    .lean();

    const totalReports = await BlogActivity.countDocuments({
      user: user._id,
      activityType: 'blog_report_generated'
    });

    const reports = reportActivities.map(activity => ({
      reportId: activity.metadata?.reportId,
      reportType: activity.metadata?.reportType,
      fileName: activity.metadata?.fileName,
      downloadUrl: activity.metadata?.downloadUrl,
      generatedAt: activity.createdAt,
      filters: activity.metadata?.filters || {}
    }));

    res.status(200).json({
      success: true,
      data: {
        reports,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReports / parseInt(limit)),
          totalReports,
          hasNext: page * limit < totalReports,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching report history:', {
      error: error.message,
      userId: req.user?._id
    });

    res.status(500).json({
      success: false,
      message: 'Failed to fetch report history',
      error: error.message
    });
  }
};

/**
 * Get report status by report ID
 * @route GET /api/v1/blog/analytics/reports/:reportId/status
 * @access Private (Authenticated users - only their own reports)
 */
const getReportStatus = async (req, res) => {
  try {
    const user = req.fullUser;
    const { reportId } = req.params;

    if (!reportId) {
      return res.status(400).json({
        success: false,
        message: 'Report ID is required'
      });
    }

    // Find the report activity for this user
    const BlogActivity = require('@models/blog/blogActivity');
    
    const reportActivity = await BlogActivity.findOne({
      user: user._id,
      activityType: 'blog_report_generated',
      'metadata.reportId': reportId
    }).lean();

    if (!reportActivity) {
      return res.status(404).json({
        success: false,
        message: 'Report not found or access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        reportId,
        reportType: reportActivity.metadata?.reportType,
        status: reportActivity.status === 'success' ? 'completed' : 'failed',
        fileName: reportActivity.metadata?.fileName,
        downloadUrl: reportActivity.metadata?.downloadUrl,
        generatedAt: reportActivity.createdAt,
        filters: reportActivity.metadata?.filters || {}
      }
    });

  } catch (error) {
    logger.error('Error fetching report status:', {
      error: error.message,
      userId: req.user?._id,
      reportId: req.params.reportId
    });

    res.status(500).json({
      success: false,
      message: 'Failed to fetch report status',
      error: error.message
    });
  }
};

module.exports = {
  generateAndSendEmailReport,
  getReportHistory,
  getReportStatus
};