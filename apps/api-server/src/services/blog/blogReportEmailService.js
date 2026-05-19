const ExcelJS = require('exceljs');
const AWS = require('aws-sdk');
const BlogActivity = require('@models/blog/blogActivity');
const EmailActivity = require('@models/blog/emailActivity');
const User = require('@models/user/user');
const sendEmail = require('@utils/sendEmail');
const logger = require('@utils/logger');
const { v4: uuidv4 } = require('uuid');

// ** AWS S3 CONFIGURATION ** //
const s3 = new AWS.S3({
  region: process.env.AWS_BUCKET_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

class BlogReportEmailService {
  /**
   * Generate and send blog activity report via email
   * @param {Object} user - User requesting the report
   * @param {Object} filters - Report filters (dateRange, activityTypes, etc.)
   * @param {string} reportType - Type of report ('activity', 'email', 'comprehensive')
   * @returns {Promise<Object>} Report generation result
   */
  static async generateAndSendReport(user, filters = {}, reportType = 'activity') {
    try {
      logger.info(`Generating ${reportType} report for user ${user._id}`, { user: user._id, filters, reportType });

      // Generate the Excel file
      const workbook = await this.createExcelReport(user, filters, reportType);
      
      // Convert workbook to buffer
      const buffer = await workbook.xlsx.writeBuffer();
      
      // Upload to S3
      const s3Result = await this.uploadReportToS3(buffer, user, reportType);
      
      // Send email with download link
      const emailResult = await this.sendReportEmail(user, s3Result, reportType, filters);
      
      // Log activity
      await this.logReportGeneration(user, reportType, filters, s3Result);
      
      return {
        success: true,
        reportId: s3Result.reportId,
        s3Key: s3Result.s3Key,
        downloadUrl: s3Result.cloudFrontUrl,
        emailSent: emailResult.success,
        message: `${reportType} report generated and sent successfully`
      };
    } catch (error) {
      logger.error('Error generating and sending report:', error);
      throw new Error(`Failed to generate ${reportType} report: ${error.message}`);
    }
  }

  /**
   * Create Excel report based on type and filters
   * @param {Object} user - User requesting the report
   * @param {Object} filters - Report filters
   * @param {string} reportType - Type of report
   * @returns {Promise<ExcelJS.Workbook>} Excel workbook
   */
  static async createExcelReport(user, filters, reportType) {
    const workbook = new ExcelJS.Workbook();
    
    // Set workbook properties
    workbook.creator = 'SSChouhan Blog Management System';
    workbook.lastModifiedBy = user.name || user.firstName + ' ' + user.lastName;
    workbook.created = new Date();
    workbook.modified = new Date();

    switch (reportType) {
      case 'activity':
        await this.addActivitySheet(workbook, user, filters);
        break;
      case 'email':
        await this.addEmailActivitySheet(workbook, user, filters);
        break;
      case 'comprehensive':
        await this.addActivitySheet(workbook, user, filters);
        await this.addEmailActivitySheet(workbook, user, filters);
        await this.addSummarySheet(workbook, user, filters);
        break;
      default:
        await this.addActivitySheet(workbook, user, filters);
    }

    return workbook;
  }

  /**
   * Add blog activity sheet to workbook
   * @param {ExcelJS.Workbook} workbook - Excel workbook
   * @param {Object} user - User requesting the report
   * @param {Object} filters - Report filters
   */
  static async addActivitySheet(workbook, user, filters) {
    const worksheet = workbook.addWorksheet('Blog Activities');
    
    // Set up headers
    const headers = [
      'Date/Time',
      'Activity Type',
      'Action',
      'Description',
      'User',
      'User Email',
      'Blog Title',
      'Blog Status',
      'Category',
      'Tags',
      'Status',
      'Priority',
      'Source',
      'IP Address'
    ];
    
    worksheet.addRow(headers);
    
    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '366092' }
    };
    
    // Set column widths
    worksheet.columns = [
      { width: 20 }, // Date/Time
      { width: 25 }, // Activity Type
      { width: 30 }, // Action
      { width: 40 }, // Description
      { width: 20 }, // User
      { width: 25 }, // User Email
      { width: 30 }, // Blog Title
      { width: 15 }, // Blog Status
      { width: 20 }, // Category
      { width: 25 }, // Tags
      { width: 12 }, // Status
      { width: 12 }, // Priority
      { width: 12 }, // Source
      { width: 15 }  // IP Address
    ];

    // Apply user-specific filters
    const activityFilters = {
      ...filters,
      users: [user._id] // Only show activities for the current user
    };

    // Get activities data
    const activities = await BlogActivity.find(this.buildActivityQuery(activityFilters))
      .populate('user', 'name email firstName lastName')
      .populate('blog', 'title status category tags')
      .populate('blogCategory', 'name')
      .populate('blogTag', 'name')
      .sort({ createdAt: -1 })
      .limit(filters.limit || 1000)
      .lean();

    // Add data rows
    activities.forEach((activity, index) => {
      const row = [
        activity.createdAt.toLocaleString(),
        this.formatActivityType(activity.activityType),
        activity.action,
        activity.description || '',
        activity.user?.name || activity.user?.firstName + ' ' + activity.user?.lastName || '',
        activity.user?.email || '',
        activity.blog?.title || '',
        activity.blog?.status || '',
        activity.blogCategory?.name || activity.blog?.category?.name || '',
        activity.blog?.tags?.map(tag => tag.name).join(', ') || '',
        activity.status,
        activity.priority,
        activity.metadata?.source || '',
        activity.metadata?.ipAddress || ''
      ];
      
      const worksheetRow = worksheet.addRow(row);
      
      // Alternate row colors
      if (index % 2 === 1) {
        worksheetRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'F8F9FA' }
        };
      }
      
      // Color code by priority
      if (activity.priority === 'high') {
        worksheetRow.getCell(12).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE6E6' }
        };
      } else if (activity.priority === 'critical') {
        worksheetRow.getCell(12).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFCCCC' }
        };
      }
    });

    // Auto-filter
    worksheet.autoFilter = `A1:N${activities.length + 1}`;
    
    // Freeze the header row
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];
  }

  /**
   * Add email activity sheet to workbook
   * @param {ExcelJS.Workbook} workbook - Excel workbook
   * @param {Object} user - User requesting the report
   * @param {Object} filters - Report filters
   */
  static async addEmailActivitySheet(workbook, user, filters) {
    const worksheet = workbook.addWorksheet('Email Activities');
    
    // Set up headers
    const headers = [
      'Date/Time',
      'Activity Type',
      'Blog Title',
      'Subject',
      'Template',
      'Recipients Count',
      'Success Count',
      'Failure Count',
      'Status',
      'Triggered By',
      'Email'
    ];
    
    worksheet.addRow(headers);
    
    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '0F5132' }
    };
    
    // Set column widths
    worksheet.columns = [
      { width: 20 }, // Date/Time
      { width: 20 }, // Activity Type
      { width: 30 }, // Blog Title
      { width: 40 }, // Subject
      { width: 25 }, // Template
      { width: 15 }, // Recipients Count
      { width: 15 }, // Success Count
      { width: 15 }, // Failure Count
      { width: 12 }, // Status
      { width: 20 }, // Triggered By
      { width: 25 }  // Email
    ];

    // Apply user-specific filters for email activities
    const emailFilters = {
      ...filters,
      triggeredBy: user._id // Only show emails triggered by the current user
    };

    // Get email activities data
    const emailActivities = await EmailActivity.find(this.buildEmailActivityQuery(emailFilters))
      .populate('blog', 'title slug')
      .populate('triggeredBy', 'name email firstName lastName')
      .sort({ createdAt: -1 })
      .limit(filters.limit || 1000)
      .lean();

    // Add data rows
    emailActivities.forEach((emailActivity, index) => {
      const row = [
        emailActivity.createdAt.toLocaleString(),
        this.formatActivityType(emailActivity.activityType),
        emailActivity.blog?.title || '',
        emailActivity.subject,
        emailActivity.template,
        emailActivity.statistics?.totalRecipients || 0,
        emailActivity.statistics?.successCount || 0,
        emailActivity.statistics?.failureCount || 0,
        emailActivity.status,
        emailActivity.triggeredBy?.name || emailActivity.triggeredBy?.firstName + ' ' + emailActivity.triggeredBy?.lastName || '',
        emailActivity.triggeredBy?.email || ''
      ];
      
      const worksheetRow = worksheet.addRow(row);
      
      // Alternate row colors
      if (index % 2 === 1) {
        worksheetRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'F8F9FA' }
        };
      }
      
      // Color code by status
      if (emailActivity.status === 'failed') {
        worksheetRow.getCell(9).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE6E6' }
        };
      } else if (emailActivity.status === 'partial') {
        worksheetRow.getCell(9).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF3CD' }
        };
      } else if (emailActivity.status === 'completed') {
        worksheetRow.getCell(9).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'E6F7E6' }
        };
      }
    });

    // Auto-filter
    worksheet.autoFilter = `A1:K${emailActivities.length + 1}`;
    
    // Freeze the header row
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];
  }

  /**
   * Add summary sheet to workbook
   * @param {ExcelJS.Workbook} workbook - Excel workbook
   * @param {Object} user - User requesting the report
   * @param {Object} filters - Report filters
   */
  static async addSummarySheet(workbook, user, filters) {
    const worksheet = workbook.addWorksheet('Summary');
    
    // Report header
    worksheet.addRow(['Blog Activity Report Summary']);
    worksheet.addRow(['Generated for:', user.name || user.firstName + ' ' + user.lastName]);
    worksheet.addRow(['Email:', user.email]);
    worksheet.addRow(['Generated on:', new Date().toLocaleString()]);
    worksheet.addRow([]); // Empty row

    // Style the title
    worksheet.getCell('A1').font = { bold: true, size: 16 };
    worksheet.getCell('A1').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'E6F3FF' }
    };

    // Get summary statistics
    const activityStats = await BlogActivity.getUserActivityStats(user._id, filters.dateRange || {});
    const emailStats = await EmailActivity.getUserEmailStats(user._id, filters.dateRange || {});

    // Activity Statistics
    worksheet.addRow(['Activity Statistics']);
    worksheet.getCell(`A${worksheet.lastRow.number}`).font = { bold: true, size: 14 };
    
    worksheet.addRow(['Activity Type', 'Count', 'Success', 'Failures', 'Last Activity']);
    const headerRow = worksheet.getRow(worksheet.lastRow.number);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'D4EDDA' }
    };

    activityStats.forEach(stat => {
      worksheet.addRow([
        this.formatActivityType(stat._id),
        stat.count,
        stat.successCount,
        stat.failureCount,
        stat.lastActivity ? stat.lastActivity.toLocaleString() : 'N/A'
      ]);
    });

    worksheet.addRow([]); // Empty row

    // Email Statistics
    worksheet.addRow(['Email Statistics']);
    worksheet.getCell(`A${worksheet.lastRow.number}`).font = { bold: true, size: 14 };
    
    worksheet.addRow(['Email Type', 'Count', 'Total Recipients', 'Success', 'Failures', 'Last Activity']);
    const emailHeaderRow = worksheet.getRow(worksheet.lastRow.number);
    emailHeaderRow.font = { bold: true };
    emailHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF3CD' }
    };

    emailStats.forEach(stat => {
      worksheet.addRow([
        this.formatActivityType(stat._id),
        stat.count,
        stat.totalRecipients,
        stat.successCount,
        stat.failureCount,
        stat.lastActivity ? stat.lastActivity.toLocaleString() : 'N/A'
      ]);
    });

    // Set column widths
    worksheet.columns = [
      { width: 25 },
      { width: 15 },
      { width: 15 },
      { width: 15 },
      { width: 20 }
    ];
  }

  /**
   * Upload report to S3
   * @param {Buffer} buffer - Excel file buffer
   * @param {Object} user - User requesting the report
   * @param {string} reportType - Type of report
   * @returns {Promise<Object>} S3 upload result
   */
  static async uploadReportToS3(buffer, user, reportType) {
    try {
      const reportId = uuidv4();
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `blog-activity-report-${reportType}-${user._id}-${timestamp}-${reportId}.xlsx`;
      
      // Create S3 key following the pattern: blog-activity-logs/year/month/filename
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const s3Key = `blog-activity-logs/${year}/${month}/${fileName}`;

      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: s3Key,
        Body: buffer,
        ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ContentDisposition: `attachment; filename="${fileName}"`,
        Metadata: {
          'report-type': reportType,
          'user-id': user._id.toString(),
          'generated-at': new Date().toISOString(),
          'report-id': reportId
        }
      };

      const result = await s3.upload(uploadParams).promise();
      
      // Generate CloudFront URL
      const cloudFrontUrl = `https://${process.env.CLOUDFRONT_DOMAIN}/${s3Key}`;

      logger.info('Report uploaded to S3 successfully', {
        s3Key,
        bucket: process.env.AWS_BUCKET_NAME,
        reportId,
        user: user._id
      });

      return {
        reportId,
        s3Key,
        s3Url: result.Location,
        cloudFrontUrl,
        fileName
      };
    } catch (error) {
      logger.error('Error uploading report to S3:', error);
      throw new Error(`Failed to upload report to S3: ${error.message}`);
    }
  }

  /**
   * Send report email to user
   * @param {Object} user - User to send email to
   * @param {Object} s3Result - S3 upload result
   * @param {string} reportType - Type of report
   * @param {Object} filters - Report filters
   * @returns {Promise<Object>} Email send result
   */
  static async sendReportEmail(user, s3Result, reportType, filters) {
    try {
      const subject = `Your Blog Activity Report (${reportType.toUpperCase()}) is Ready`;
      
      const html = this.generateReportEmailTemplate(user, s3Result, reportType, filters);

      const emailOptions = {
        to: user.email,
        subject,
        html,
        headers: {
          'X-Report-Type': reportType,
          'X-Report-ID': s3Result.reportId,
          'X-User-ID': user._id.toString(),
          'X-Generated-At': new Date().toISOString()
        }
      };

      const result = await sendEmail(emailOptions);
      
      if (result.success) {
        logger.info('Report email sent successfully', {
          user: user._id,
          email: user.email,
          reportType,
          reportId: s3Result.reportId
        });
      } else {
        logger.error('Failed to send report email', {
          user: user._id,
          email: user.email,
          error: result.error
        });
      }

      return result;
    } catch (error) {
      logger.error('Error sending report email:', error);
      throw new Error(`Failed to send report email: ${error.message}`);
    }
  }

  /**
   * Generate HTML email template for report
   * @param {Object} user - User receiving the email
   * @param {Object} s3Result - S3 upload result
   * @param {string} reportType - Type of report
   * @param {Object} filters - Report filters
   * @returns {string} HTML email template
   */
  static generateReportEmailTemplate(user, s3Result, reportType, filters) {
    const userName = user.name || `${user.firstName} ${user.lastName}`;
    const dateRange = filters.dateRange 
      ? `from ${new Date(filters.dateRange.startDate).toLocaleDateString()} to ${new Date(filters.dateRange.endDate).toLocaleDateString()}`
      : 'all time';

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Blog Activity Report</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px 20px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 600;
            }
            .content {
                padding: 30px 20px;
            }
            .greeting {
                font-size: 18px;
                margin-bottom: 20px;
                color: #2c3e50;
            }
            .report-info {
                background-color: #f8f9fa;
                border-left: 4px solid #007bff;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
            }
            .report-info h3 {
                margin: 0 0 10px 0;
                color: #007bff;
                font-size: 16px;
            }
            .report-info p {
                margin: 5px 0;
                font-size: 14px;
                color: #6c757d;
            }
            .download-btn {
                display: inline-block;
                background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                color: white;
                text-decoration: none;
                padding: 12px 30px;
                border-radius: 25px;
                font-weight: 600;
                margin: 20px 0;
                transition: transform 0.2s;
            }
            .download-btn:hover {
                transform: translateY(-2px);
                text-decoration: none;
                color: white;
            }
            .footer {
                background-color: #2c3e50;
                color: #ecf0f1;
                padding: 20px;
                text-align: center;
                font-size: 12px;
            }
            .footer a {
                color: #3498db;
                text-decoration: none;
            }
            .icon {
                font-size: 20px;
                margin-right: 8px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📊 Your Blog Activity Report is Ready!</h1>
            </div>
            
            <div class="content">
                <div class="greeting">
                    Hello ${userName},
                </div>
                
                <p>Your blog activity report has been generated successfully and is ready for download.</p>
                
                <div class="report-info">
                    <h3>📋 Report Details</h3>
                    <p><strong>Report Type:</strong> ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</p>
                    <p><strong>Date Range:</strong> ${dateRange}</p>
                    <p><strong>Generated On:</strong> ${new Date().toLocaleString()}</p>
                    <p><strong>File Name:</strong> ${s3Result.fileName}</p>
                    <p><strong>Report ID:</strong> ${s3Result.reportId}</p>
                </div>
                
                <p>This report contains detailed information about your blog activities, including:</p>
                <ul>
                    <li>📝 Blog creation, updates, and deletions</li>
                    <li>✅ Approval and publication activities</li>
                    <li>📧 Email notifications sent</li>
                    <li>🏷️ Category and tag management</li>
                    <li>📊 Activity statistics and summaries</li>
                </ul>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${s3Result.cloudFrontUrl}" class="download-btn">
                        <span class="icon">⬇️</span>Download Your Report
                    </a>
                </div>
                
                <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0; font-size: 14px; color: #856404;">
                        <strong>📌 Important:</strong> This download link will be available for 30 days. Please download your report within this time frame.
                    </p>
                </div>
                
                <p>If you have any questions about this report or need assistance, please don't hesitate to contact our support team.</p>
                
                <p>Best regards,<br>
                <strong>SSChouhan Blog Management Team</strong></p>
            </div>
            
            <div class="footer">
                <p>© ${new Date().getFullYear()} SSChouhan Blog Management System. All rights reserved.</p>
                <p>
                    <a href="mailto:info@shivrajsinghchouhan.co.in">Contact Support</a> | 
                    <a href="${process.env.NEXT_PUBLIC_FRONTEND_URL}">Visit Website</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Log report generation activity
   * @param {Object} user - User who generated the report
   * @param {string} reportType - Type of report
   * @param {Object} filters - Report filters
   * @param {Object} s3Result - S3 upload result
   */
  static async logReportGeneration(user, reportType, filters, s3Result) {
    try {
      const BlogActivityService = require('./blogActivityService');
      
      await BlogActivityService.logActivity({
        user: user._id,
        activityType: 'blog_report_generated',
        action: `Generated ${reportType} report`,
        description: `Generated and sent ${reportType} blog activity report via email`,
        metadata: {
          reportType,
          reportId: s3Result.reportId,
          s3Key: s3Result.s3Key,
          fileName: s3Result.fileName,
          filters,
          downloadUrl: s3Result.cloudFrontUrl,
          source: 'system'
        },
        priority: 'normal',
        visibility: 'internal'
      });
    } catch (error) {
      logger.error('Error logging report generation activity:', error);
      // Don't throw error to prevent breaking main functionality
    }
  }

  /**
   * Build MongoDB query for blog activities
   * @param {Object} filters - Filters to apply
   * @returns {Object} MongoDB query object
   */
  static buildActivityQuery(filters) {
    const query = {};
    
    if (filters.users && filters.users.length > 0) {
      query.user = { $in: filters.users };
    }
    
    if (filters.activityTypes && filters.activityTypes.length > 0) {
      query.activityType = { $in: filters.activityTypes };
    }
    
    if (filters.dateRange) {
      query.createdAt = {};
      if (filters.dateRange.startDate) {
        query.createdAt.$gte = new Date(filters.dateRange.startDate);
      }
      if (filters.dateRange.endDate) {
        query.createdAt.$lte = new Date(filters.dateRange.endDate);
      }
    }
    
    if (filters.status) {
      query.status = filters.status;
    }
    
    if (filters.priority) {
      query.priority = filters.priority;
    }
    
    return query;
  }

  /**
   * Build MongoDB query for email activities
   * @param {Object} filters - Filters to apply
   * @returns {Object} MongoDB query object
   */
  static buildEmailActivityQuery(filters) {
    const query = {};
    
    if (filters.triggeredBy) {
      query.triggeredBy = filters.triggeredBy;
    }
    
    if (filters.activityTypes && filters.activityTypes.length > 0) {
      query.activityType = { $in: filters.activityTypes };
    }
    
    if (filters.dateRange) {
      query.createdAt = {};
      if (filters.dateRange.startDate) {
        query.createdAt.$gte = new Date(filters.dateRange.startDate);
      }
      if (filters.dateRange.endDate) {
        query.createdAt.$lte = new Date(filters.dateRange.endDate);
      }
    }
    
    if (filters.status) {
      query.status = filters.status;
    }
    
    return query;
  }

  /**
   * Format activity type for display
   * @param {string} activityType - Raw activity type
   * @returns {string} Formatted activity type
   */
  static formatActivityType(activityType) {
    const typeMap = {
      'blog_created': 'Blog Created',
      'blog_updated': 'Blog Updated',
      'blog_deleted': 'Blog Deleted',
      'blog_approved': 'Blog Approved',
      'blog_rejected': 'Blog Rejected',
      'blog_published': 'Blog Published',
      'blog_scheduled': 'Blog Scheduled',
      'category_created': 'Category Created',
      'category_updated': 'Category Updated',
      'category_deleted': 'Category Deleted',
      'tag_created': 'Tag Created',
      'tag_updated': 'Tag Updated',
      'tag_deleted': 'Tag Deleted',
      'email_approval_sent': 'Approval Email Sent',
      'email_rejection_sent': 'Rejection Email Sent',
      'email_publication_sent': 'Publication Email Sent',
      'approval': 'Blog Approval',
      'unapproval': 'Blog Rejection',
      'blog_report_generated': 'Report Generated'
    };

    return typeMap[activityType] || activityType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}

module.exports = BlogReportEmailService;