// ** PACKAGES ** //
const mongoose = require("mongoose");
const ExcelJS = require('exceljs');

// ** MODELS ** //
const LoginActivity = require("@models/user/loginActivity");
const User = require("@models/user/user");

// ** UTILS ** //
// const { validationResult } = require("express-validator"); // Not used, removed to avoid module error

/**********************************
  Get current user's login history
***********************************/
exports.getUserLoginHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      page = 1,
      limit = 20,
      status = null,
      days = null,
      sortBy = "loginAttemptedAt",
      sortOrder = "desc",
    } = req.query;

    // Build query
    const query = { userId: new mongoose.Types.ObjectId(userId) };
    
    if (status && ["success", "failed"].includes(status)) {
      query.loginStatus = status;
    }
    
    if (days && !isNaN(days)) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
      query.loginAttemptedAt = { $gte: startDate };
    }

    // Build sort object
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get login activities
    const [activities, total] = await Promise.all([
      LoginActivity.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      LoginActivity.countDocuments(query),
    ]);

    // Get user statistics
    const stats = await LoginActivity.getUserStats(userId, 30);

    const responseData = {
      success: true,
      data: {
        activities,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit),
        },
        statistics: stats[0] || {
          totalLogins: 0,
          successfulLogins: 0,
          failedLogins: 0,
          uniqueLocationCount: 0,
          uniqueIPCount: 0,
          uniqueDeviceCount: 0,
          suspiciousLogins: 0,
          avgRiskScore: 0,
          lastLogin: null,
        },
      },
    };

    // Disable caching for this endpoint
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching user login history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch login history",
      error: error.message,
    });
  }
};

/**********************************
  Get current user's login statistics
***********************************/
exports.getUserLoginStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const { days = 30 } = req.query;

    const stats = await LoginActivity.getUserStats(userId, parseInt(days));
    const recentActivity = await LoginActivity.getRecentActivity(userId, {
      limit: 5,
    });

    // Get login trends (daily counts for the last 30 days)
    const trendsStartDate = new Date();
    trendsStartDate.setDate(trendsStartDate.getDate() - 30);

    const trends = await LoginActivity.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          loginAttemptedAt: { $gte: trendsStartDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$loginAttemptedAt" },
            month: { $month: "$loginAttemptedAt" },
            day: { $dayOfMonth: "$loginAttemptedAt" },
          },
          totalLogins: { $sum: 1 },
          successfulLogins: {
            $sum: { $cond: [{ $eq: ["$loginStatus", "success"] }, 1, 0] },
          },
          failedLogins: {
            $sum: { $cond: [{ $eq: ["$loginStatus", "failed"] }, 1, 0] },
          },
          date: { $first: "$loginAttemptedAt" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$date",
            },
          },
          totalLogins: 1,
          successfulLogins: 1,
          failedLogins: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        statistics: stats[0] || {
          totalLogins: 0,
          successfulLogins: 0,
          failedLogins: 0,
          uniqueLocationCount: 0,
          uniqueIPCount: 0,
          uniqueDeviceCount: 0,
          suspiciousLogins: 0,
          avgRiskScore: 0,
          lastLogin: null,
        },
        recentActivity,
        trends,
      },
    });
  } catch (error) {
    console.error("Error fetching user login statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch login statistics",
      error: error.message,
    });
  }
};

/**********************************
  Get all users' login activities (Admin/Super Admin only)
***********************************/
exports.getAllLoginActivities = async (req, res) => {
  try {
    // Role check is handled by adminCheck middleware

    const {
      page = 1,
      limit = 50,
      status = null,
      userRole = null,
      days = null,
      search = null,
      sortBy = "loginAttemptedAt",
      sortOrder = "desc",
    } = req.query;

    // Build query
    const query = {};
    
    if (status && ["success", "failed"].includes(status)) {
      query.loginStatus = status;
    }
    
    if (userRole) {
      query.userRole = new RegExp(userRole, "i");
    }
    
    if (search) {
      query.$or = [
        { userEmail: new RegExp(search, "i") },
        { userName: new RegExp(search, "i") },
        { "network.ipAddress": new RegExp(search, "i") },
        { "location.city": new RegExp(search, "i") },
        { "location.country": new RegExp(search, "i") },
      ];
    }
    
    if (days && !isNaN(days)) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
      query.loginAttemptedAt = { $gte: startDate };
    }

    // Build sort object
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get login activities
    const [activities, total] = await Promise.all([
      LoginActivity.find(query)
        .populate("userId", "name email role")
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      LoginActivity.countDocuments(query),
    ]);


    // Get overall statistics
    const overallStats = await LoginActivity.aggregate([
      {
        $match: query,
      },
      {
        $group: {
          _id: null,
          totalActivities: { $sum: 1 },
          successfulLogins: {
            $sum: { $cond: [{ $eq: ["$loginStatus", "success"] }, 1, 0] },
          },
          failedLogins: {
            $sum: { $cond: [{ $eq: ["$loginStatus", "failed"] }, 1, 0] },
          },
          uniqueUsers: { $addToSet: "$userId" },
          uniqueIPs: { $addToSet: "$network.ipAddress" },
          suspiciousActivities: {
            $sum: {
              $cond: [
                { $or: [
                  { $gt: ["$security.riskScore", 70] },
                  { $eq: ["$security.isProxy", true] },
                  { $eq: ["$security.isVPN", true] },
                ]},
                1,
                0,
              ],
            },
          },
          avgRiskScore: { $avg: "$security.riskScore" },
        },
      },
      {
        $project: {
          _id: 0,
          totalActivities: 1,
          successfulLogins: 1,
          failedLogins: 1,
          uniqueUserCount: { $size: "$uniqueUsers" },
          uniqueIPCount: { $size: "$uniqueIPs" },
          suspiciousActivities: 1,
          avgRiskScore: { $round: ["$avgRiskScore", 2] },
        },
      },
    ]);

    // Disable caching for this endpoint
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.status(200).json({
      success: true,
      data: {
        activities,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit),
        },
        statistics: overallStats[0] || {
          totalActivities: 0,
          successfulLogins: 0,
          failedLogins: 0,
          uniqueUserCount: 0,
          uniqueIPCount: 0,
          suspiciousActivities: 0,
          avgRiskScore: 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching all login activities:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch login activities",
      error: error.message,
    });
  }
};

/**********************************
  Get suspicious login activities (Admin/Super Admin only)
***********************************/
exports.getSuspiciousActivities = async (req, res) => {
  try {
    // Role check is handled by adminCheck middleware

    const {
      page = 1,
      limit = 25,
      days = 7,
      minRiskScore = 70,
    } = req.query;

    const suspiciousActivities = await LoginActivity.getSuspiciousActivities({
      page: parseInt(page),
      limit: parseInt(limit),
      days: parseInt(days),
    });

    // Get count for pagination
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const total = await LoginActivity.countDocuments({
      loginAttemptedAt: { $gte: startDate },
      $or: [
        { "security.riskScore": { $gt: parseInt(minRiskScore) } },
        { "security.threatLevel": { $in: ["high", "critical"] } },
        { "security.isProxy": true },
        { "security.isVPN": true },
        { "security.isTor": true },
        { "security.isBot": true },
      ],
    });

    res.status(200).json({
      success: true,
      data: {
        activities: suspiciousActivities,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching suspicious activities:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch suspicious activities",
      error: error.message,
    });
  }
};

/**********************************
  Get login activity details by ID
***********************************/
exports.getLoginActivityDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role?.toLowerCase();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid activity ID",
      });
    }

    // Build query based on user role
    const query = { _id: id };
    
    // Regular users can only see their own activities
    if (!["admin", "superadmin"].includes(userRole)) {
      query.userId = userId;
    }

    const activity = await LoginActivity.findOne(query)
      .populate("userId", "name email role")
      .lean();

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Login activity not found",
      });
    }

    res.status(200).json({
      success: true,
      data: activity,
    });
  } catch (error) {
    console.error("Error fetching login activity details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch login activity details",
      error: error.message,
    });
  }
};

/**********************************
  Export login activities (Admin/Super Admin only or User's own data)
***********************************/
exports.exportLoginActivities = async (req, res) => {
  try {
    const userRole = req.user.role?.toLowerCase();
    const userId = req.user._id;
    const isAdmin = ["admin", "superadmin"].includes(userRole);
    const isUserExport = req.path.includes('export-my-data');

    const {
      format = "csv",
      days = 30,
      status = null,
      userRole: filterUserRole = null,
    } = req.query;

    // Build query
    const query = {};
    
    // If this is a user export or regular user, restrict to their data only
    if (isUserExport || !isAdmin) {
      query.userId = new mongoose.Types.ObjectId(userId);
    }
    
    if (status && ["success", "failed"].includes(status)) {
      query.loginStatus = status;
    }
    
    // Only allow userRole filtering for admins on admin exports
    if (filterUserRole && isAdmin && !isUserExport) {
      query.userRole = new RegExp(filterUserRole, "i");
    }
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    query.loginAttemptedAt = { $gte: startDate };

    // Get activities for export
    const activities = await LoginActivity.find(query)
      .populate("userId", "name email role")
      .sort({ loginAttemptedAt: -1 })
      .limit(10000) // Limit to prevent memory issues
      .lean();

    if (format === "csv") {
      // Generate CSV
      const fields = [
        "loginAttemptedAt",
        "userEmail",
        "userName",
        "userRole",
        "loginStatus",
        "failureReason",
        "network.ipAddress",
        "network.realIpAddress",
        "location.country",
        "location.region",
        "location.city",
        "device.type",
        "device.browser.name",
        "device.browser.version",
        "device.os.name",
        "security.riskScore",
        "security.threatLevel",
        "security.isProxy",
        "security.isVPN",
      ];

      let csv = fields.join(",") + "\n";

      activities.forEach((activity) => {
        const row = fields.map((field) => {
          const value = field.split(".").reduce((obj, key) => obj?.[key], activity);
          return `"${value || ""}"`;
        });
        csv += row.join(",") + "\n";
      });

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="login_activities_${new Date().toISOString().split("T")[0]}.csv"`
      );
      return res.send(csv);
    }

    if (format === "excel") {
      // Generate Excel file
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Login Activities');

      // Define columns
      worksheet.columns = [
        { header: 'Login Date', key: 'loginAttemptedAt', width: 18 },
        { header: 'User Email', key: 'userEmail', width: 30 },
        { header: 'User Name', key: 'userName', width: 25 },
        { header: 'User Role', key: 'userRole', width: 15 },
        { header: 'Login Status', key: 'loginStatus', width: 12 },
        { header: 'Failure Reason', key: 'failureReason', width: 20 },
        { header: 'IP Address', key: 'ipAddress', width: 15 },
        { header: 'Real IP Address', key: 'realIpAddress', width: 15 },
        { header: 'Country', key: 'country', width: 15 },
        { header: 'Region', key: 'region', width: 15 },
        { header: 'City', key: 'city', width: 15 },
        { header: 'Device Type', key: 'deviceType', width: 12 },
        { header: 'Browser', key: 'browser', width: 20 },
        { header: 'Browser Version', key: 'browserVersion', width: 15 },
        { header: 'Operating System', key: 'os', width: 20 },
        { header: 'Risk Score', key: 'riskScore', width: 12 },
        { header: 'Threat Level', key: 'threatLevel', width: 12 },
        { header: 'Is Proxy', key: 'isProxy', width: 10 },
        { header: 'Is VPN', key: 'isVPN', width: 10 },
        { header: 'Is Tor', key: 'isTor', width: 10 },
        { header: 'ISP', key: 'isp', width: 20 },
        { header: 'User Agent', key: 'userAgent', width: 40 }
      ];

      // Style the header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      // Add data rows
      activities.forEach((activity) => {
        worksheet.addRow({
          loginAttemptedAt: new Date(activity.loginAttemptedAt).toLocaleString(),
          userEmail: activity.userEmail || '',
          userName: activity.userName || '',
          userRole: activity.userRole || '',
          loginStatus: activity.loginStatus || '',
          failureReason: activity.failureReason || '',
          ipAddress: activity.network?.ipAddress || '',
          realIpAddress: activity.network?.realIpAddress || '',
          country: activity.location?.country || '',
          region: activity.location?.region || '',
          city: activity.location?.city || '',
          deviceType: activity.device?.type || '',
          browser: activity.device?.browser?.name || '',
          browserVersion: activity.device?.browser?.version || '',
          os: activity.device?.os?.name ? 
            `${activity.device.os.name} ${activity.device.os.version || ''}`.trim() : '',
          riskScore: activity.security?.riskScore || 0,
          threatLevel: activity.security?.threatLevel || '',
          isProxy: activity.security?.isProxy ? 'Yes' : 'No',
          isVPN: activity.security?.isVPN ? 'Yes' : 'No',
          isTor: activity.security?.isTor ? 'Yes' : 'No',
          isp: activity.location?.isp || '',
          userAgent: activity.network?.userAgent || ''
        });
      });

      // Apply conditional formatting for risk scores
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) { // Skip header row
          const riskScore = row.getCell('riskScore').value;
          if (riskScore > 70) {
            row.getCell('riskScore').fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFF9999' } // Light red
            };
          } else if (riskScore > 40) {
            row.getCell('riskScore').fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFFF99' } // Light yellow
            };
          }
          
          // Color code login status
          const loginStatus = row.getCell('loginStatus').value;
          if (loginStatus === 'failed') {
            row.getCell('loginStatus').fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFF9999' } // Light red
            };
          } else if (loginStatus === 'success') {
            row.getCell('loginStatus').fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FF99FF99' } // Light green
            };
          }
        }
      });

      // Set response headers for Excel download
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="login_activities_${new Date().toISOString().split('T')[0]}.xlsx"`
      );

      // Write the Excel file to response
      return await workbook.xlsx.write(res);
    }

    // Default to JSON export
    res.status(200).json({
      success: true,
      data: {
        activities,
        exportedAt: new Date().toISOString(),
        totalRecords: activities.length,
        filters: { days, status, userRole },
      },
    });
  } catch (error) {
    console.error("Error exporting login activities:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export login activities",
      error: error.message,
    });
  }
};

/**********************************
  Delete old login activities (Admin/Super Admin only)
***********************************/
exports.cleanupOldActivities = async (req, res) => {
  try {
    // Check if user has super admin role
    if (req.user.role?.toLowerCase() !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Super Admin privileges required.",
      });
    }

    const { days = 365 } = req.body; // Default to 1 year

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const result = await LoginActivity.deleteMany({
      loginAttemptedAt: { $lt: cutoffDate },
    });

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} old login activity records`,
      data: {
        deletedCount: result.deletedCount,
        cutoffDate,
        daysCleaned: parseInt(days),
      },
    });
  } catch (error) {
    console.error("Error cleaning up old activities:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cleanup old activities",
      error: error.message,
    });
  }
};