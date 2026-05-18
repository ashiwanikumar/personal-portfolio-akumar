/**
 * Enhanced Visitor Controller
 * 
 * Advanced visitor tracking controller with real-time capabilities
 * Provides comprehensive analytics, live tracking, and performance optimization
 */

const VisitorService = require("@services/visitor/visitorService");
const Visitor = require("@models/visitor/visitor");
const { handleError } = require("@utils/handleError");

/**
 * Get all visitors with enhanced pagination and filtering
 */
exports.getVisitorsPaginated = async (req, res) => {
  try {
    const { 
      page = 1, 
      perPage = 12, 
      searchText, 
      country, 
      city, 
      deviceType,
      browser,
      dateRange,
      isActive,
      eventType,
      referrerType,
      utmSource
    } = req.query;

    const filters = {
      searchText,
      country,
      city,
      deviceType,
      browser,
      dateRange: dateRange ? parseInt(dateRange) : null,
      isActive: isActive !== undefined ? isActive === 'true' : null,
      eventType,
      referrerType,
      utmSource
    };

    // Remove null values
    Object.keys(filters).forEach(key => {
      if (filters[key] === null || filters[key] === undefined || filters[key] === '') {
        delete filters[key];
      }
    });

    const visitors = await VisitorService.findAllVisitorsPaginated(
      parseInt(page),
      parseInt(perPage),
      filters
    );

    const totalVisitors = await VisitorService.countAllVisitors(filters);
    const totalPages = Math.ceil(totalVisitors / perPage);

    const paginationData = {
      page: parseInt(page),
      perPage: parseInt(perPage),
      totalVisitors,
      totalPages,
    };

    res.status(200).json({
      success: true,
      visitors,
      paginationData,
      filters: filters,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Enhanced Visitors Paginated Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching enhanced visitors",
      error: handleError(error)
    });
  }
};

/**
 * Get real-time active visitors
 */
exports.getActiveVisitors = async (req, res) => {
  try {
    const { minutesThreshold = 30 } = req.query;

    const activeVisitors = await VisitorService.getActiveVisitors(
      parseInt(minutesThreshold)
    );

    res.status(200).json({
      success: true,
      data: {
        activeVisitors,
        count: activeVisitors.length,
        minutesThreshold: parseInt(minutesThreshold),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Get Active Visitors Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching active visitors",
      error: handleError(error)
    });
  }
};

/**
 * Get comprehensive analytics overview
 */
exports.getAnalyticsOverview = async (req, res) => {
  try {
    const { dateRange = 30 } = req.query;

    const overview = await VisitorService.getAnalyticsOverview(
      parseInt(dateRange)
    );

    res.status(200).json({
      success: true,
      data: {
        ...overview,
        dateRange: parseInt(dateRange),
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Enhanced Analytics Overview Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching analytics overview",
      error: handleError(error)
    });
  }
};

/**
 * Get URL performance analytics
 */
exports.getUrlAnalytics = async (req, res) => {
  try {
    const { dateRange = 30, limit = 50 } = req.query;

    const urlStats = await VisitorService.getUrlAnalytics(
      parseInt(dateRange),
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      data: {
        urlStats,
        count: urlStats.length,
        dateRange: parseInt(dateRange),
        limit: parseInt(limit),
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Enhanced URL Analytics Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching URL analytics",
      error: handleError(error)
    });
  }
};

/**
 * Get geographic analytics with enhanced data
 */
exports.getGeographicAnalytics = async (req, res) => {
  try {
    const { dateRange = 30 } = req.query;

    const geoStats = await VisitorService.getGeographicAnalytics(
      parseInt(dateRange)
    );

    res.status(200).json({
      success: true,
      data: {
        ...geoStats,
        dateRange: parseInt(dateRange),
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Enhanced Geographic Analytics Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching geographic analytics",
      error: handleError(error)
    });
  }
};

/**
 * Get traffic source analytics
 */
exports.getTrafficSourceAnalytics = async (req, res) => {
  try {
    const { dateRange = 30 } = req.query;

    const sourceStats = await VisitorService.getTrafficSourceAnalytics(
      parseInt(dateRange)
    );

    res.status(200).json({
      success: true,
      data: {
        sourceStats,
        count: sourceStats.length,
        dateRange: parseInt(dateRange),
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Enhanced Traffic Source Analytics Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching traffic source analytics",
      error: handleError(error)
    });
  }
};

/**
 * Get real-time activity data
 */
exports.getRealTimeActivity = async (req, res) => {
  try {
    const { hoursBack = 24 } = req.query;

    const activity = await VisitorService.getRealTimeActivity(
      parseInt(hoursBack)
    );

    res.status(200).json({
      success: true,
      data: {
        ...activity,
        hoursBack: parseInt(hoursBack)
      }
    });
  } catch (error) {
    console.error("Enhanced Real Time Activity Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching real-time activity",
      error: handleError(error)
    });
  }
};

/**
 * Track enhanced visitor (Public endpoint)
 */
exports.trackVisitor = async (req, res) => {
  try {
    // Extract visitor data from request body with enhanced fields
    const visitorData = {
      // Basic tracking data
      url: req.body.url || req.originalUrl,
      referrer: req.body.referrer || req.headers.referer,
      sessionId: req.body.sessionId,
      fingerprint: req.body.fingerprint,
      visitorId: req.body.visitorId,

      // Screen and device data
      screenResolution: req.body.screenResolution,
      screenDensity: req.body.screenDensity,
      screenOrientation: req.body.screenOrientation,

      // Performance metrics
      pageLoadTime: req.body.pageLoadTime,
      dnsTime: req.body.dnsTime,
      connectTime: req.body.connectTime,
      responseTime: req.body.responseTime,
      domReadyTime: req.body.domReadyTime,

      // Technical capabilities
      cookieEnabled: req.body.cookieEnabled,
      javascriptEnabled: req.body.javascriptEnabled,
      touchSupport: req.body.touchSupport,
      localStorage: req.body.localStorage,
      sessionStorage: req.body.sessionStorage,
      webglEnabled: req.body.webglEnabled,

      // Connection info
      connectionType: req.body.connectionType,
      onlineStatus: req.body.onlineStatus,

      // UTM parameters
      utm_source: req.body.utm_source,
      utm_medium: req.body.utm_medium,
      utm_campaign: req.body.utm_campaign,
      utm_term: req.body.utm_term,
      utm_content: req.body.utm_content,

      // Engagement data (initial)
      initialScrollDepth: req.body.initialScrollDepth || 0,
      initialTimeOnPage: req.body.initialTimeOnPage || 0,

      // Custom event fields - handle performance data sent as eventName
      eventType: req.body.eventType || (typeof req.body.eventName === 'object' ? 'performance' : null),
      eventName: typeof req.body.eventName === 'string' ? req.body.eventName : 
                (typeof req.body.eventName === 'object' ? 'performance_tracking' : null),
      eventData: req.body.eventData || 
                (typeof req.body.eventName === 'object' ? req.body.eventName : null),
      eventCategory: req.body.eventCategory,
      eventValue: req.body.eventValue,

      // Additional metadata
      meta: req.body.meta || {},
      customData: req.body.customData || {}
    };

    // Create enhanced visitor record
    const visitor = await VisitorService.createEnhancedVisitor(req, visitorData);

    // Return success response with comprehensive data
    res.status(201).json({
      success: true,
      message: "Enhanced visitor tracked successfully",
      data: {
        visitorId: visitor._id,
        sessionId: visitor.sessionId,
        realIP: visitor.realIP,
        location: `${visitor.city}, ${visitor.country}`,
        deviceType: visitor.device.type,
        browser: `${visitor.browser.name} ${visitor.browser.version}`,
        isFirstVisit: visitor.visit.isFirstVisit,
        isActive: visitor.status.isActive,
        trackingVersion: visitor.trackingVersion,
        timestamp: visitor.createdAt
      }
    });
  } catch (error) {
    console.error("Track Enhanced Visitor Error:", error);

    // Return appropriate error response with detailed info
    const statusCode = error.name === 'ValidationError' ? 400 : 500;
    let errorDetails = {
      name: error.name,
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 3).join('\n') // First 3 lines of stack
    };
    
    if (error.name === 'ValidationError') {
      errorDetails.validationErrors = {};
      for (let field in error.errors) {
        errorDetails.validationErrors[field] = error.errors[field].message;
      }
    }
    
    res.status(statusCode).json({
      success: false,
      message: "Failed to track enhanced visitor",
      error: errorDetails,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Track page view with enhanced data (Lightweight endpoint)
 */
exports.trackPageView = async (req, res) => {
  try {
    // Simplified page view tracking with essential data
    const visitorData = {
      url: req.body.url || req.originalUrl || "/",
      referrer: req.body.referrer,
      sessionId: req.body.sessionId,
      
      // UTM parameters
      utm_source: req.body.utm_source,
      utm_medium: req.body.utm_medium,
      utm_campaign: req.body.utm_campaign,

      // Basic performance
      pageLoadTime: req.body.pageLoadTime,

      // Navigation data
      navigationTiming: req.body.navigationTiming,
      
      // Event data (if this is an event)
      eventType: req.body.eventType,
      eventName: req.body.eventName,
      eventData: req.body.eventData,

      // Meta information
      meta: {
        pageType: req.body.pageType || "page",
        trackingType: "page_view",
        ...req.body.meta
      }
    };

    const visitor = await VisitorService.createEnhancedVisitor(req, visitorData);

    // Lightweight response for performance
    res.status(201).json({
      success: true,
      visitorId: visitor._id,
      sessionId: visitor.sessionId,
      timestamp: visitor.createdAt
    });
  } catch (error) {
    console.error("Track Enhanced Page View Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to track enhanced page view"
    });
  }
};

/**
 * Update visitor activity (Heartbeat endpoint)
 */
exports.updateVisitorActivity = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const activityData = {
      scrollDepth: req.body.scrollDepth,
      timeOnPage: req.body.timeOnPage,
      clickCount: req.body.clickCount,
      keystrokes: req.body.keystrokes,
      mouseMovements: req.body.mouseMovements,
      focusTime: req.body.focusTime,
      idleTime: req.body.idleTime,
      currentUrl: req.body.currentUrl,
      customEvents: req.body.customEvents
    };

    const visitor = await VisitorService.updateVisitorActivity(sessionId, activityData);

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Session not found or inactive"
      });
    }

    res.status(200).json({
      success: true,
      message: "Activity updated successfully",
      data: {
        sessionId: visitor.sessionId,
        isActive: visitor.status.isActive,
        lastActivity: visitor.status.lastActivity,
        heartbeatCount: visitor.status.heartbeatCount
      }
    });
  } catch (error) {
    console.error("Update Visitor Activity Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update visitor activity",
      error: handleError(error)
    });
  }
};

/**
 * Get visitor by ID
 */
exports.getVisitorById = async (req, res) => {
  try {
    const { id } = req.params;
    const visitor = await VisitorService.getVisitorById(id);

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found"
      });
    }

    res.status(200).json({
      success: true,
      data: visitor
    });
  } catch (error) {
    console.error("Get Enhanced Visitor By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching visitor details",
      error: handleError(error)
    });
  }
};

/**
 * Delete visitor
 */
exports.deleteVisitor = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await VisitorService.deleteVisitor(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Visitor deleted successfully"
    });
  } catch (error) {
    console.error("Delete Enhanced Visitor Error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting visitor",
      error: handleError(error)
    });
  }
};

/**
 * Bulk delete visitors
 */
exports.bulkDeleteVisitors = async (req, res) => {
  try {
    const { visitorIds } = req.body;

    if (!Array.isArray(visitorIds) || visitorIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid visitor IDs provided"
      });
    }

    const result = await VisitorService.bulkDeleteVisitors(visitorIds);

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} visitors`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error("Bulk Delete Enhanced Visitors Error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting visitors",
      error: handleError(error)
    });
  }
};

/**
 * Get live dashboard data (Combined endpoint for dashboard)
 */
exports.getLiveDashboardData = async (req, res) => {
  try {
    const { dateRange = 30, minutesThreshold = 30 } = req.query;

    // Fetch all dashboard data in parallel
    const [
      analyticsOverview,
      activeVisitors,
      realTimeActivity,
      topPages,
      geoAnalytics,
      trafficSources
    ] = await Promise.all([
      VisitorService.getAnalyticsOverview(parseInt(dateRange)),
      VisitorService.getActiveVisitors(parseInt(minutesThreshold)),
      VisitorService.getRealTimeActivity(1), // Last 1 hour
      VisitorService.getUrlAnalytics(parseInt(dateRange), 10),
      VisitorService.getGeographicAnalytics(parseInt(dateRange)),
      VisitorService.getTrafficSourceAnalytics(parseInt(dateRange))
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: analyticsOverview,
        liveVisitors: {
          active: activeVisitors,
          count: activeVisitors.length
        },
        realTime: realTimeActivity,
        topPages: topPages.slice(0, 10),
        geographic: geoAnalytics,
        trafficSources: trafficSources.slice(0, 10),
        generatedAt: new Date().toISOString(),
        params: {
          dateRange: parseInt(dateRange),
          minutesThreshold: parseInt(minutesThreshold)
        }
      }
    });
  } catch (error) {
    console.error("Get Live Dashboard Data Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching live dashboard data",
      error: handleError(error)
    });
  }
};

/**
 * Clean up inactive sessions
 */
exports.cleanupInactiveSessions = async (req, res) => {
  try {
    const { minutesThreshold = 60 } = req.query;

    const result = await VisitorService.cleanupInactiveSessions(
      parseInt(minutesThreshold)
    );

    res.status(200).json({
      success: true,
      message: `Cleaned up ${result.modifiedCount} inactive sessions`,
      modifiedCount: result.modifiedCount,
      minutesThreshold: parseInt(minutesThreshold)
    });
  } catch (error) {
    console.error("Cleanup Inactive Sessions Error:", error);
    res.status(500).json({
      success: false,
      message: "Error cleaning up inactive sessions",
      error: handleError(error)
    });
  }
};

/**
 * Export visitor data (Enhanced)
 */
exports.exportVisitorData = async (req, res) => {
  try {
    const { 
      format = 'json',
      dateRange = 30,
      filters = {},
      includeAnalytics = false 
    } = req.body;

    // Build filters
    const searchFilters = {
      ...filters,
      dateRange: parseInt(dateRange)
    };

    // Get visitor data
    const visitors = await VisitorService.findAllVisitorsPaginated(
      1,
      10000, // Max export limit
      searchFilters
    );

    let exportData;
    let contentType;
    let filename;
    const timestamp = new Date().toISOString().split('T')[0];

    switch (format.toLowerCase()) {
      case 'csv':
        // Convert to CSV format
        const csvHeaders = [
          'Timestamp', 'Real IP', 'Country', 'City', 'Browser', 'OS', 
          'Device Type', 'Page', 'Referrer', 'UTM Source', 'UTM Campaign',
          'Time on Page', 'Scroll Depth', 'Is Bot', 'Session ID'
        ];
        
        const csvData = visitors.map(v => [
          v.createdAt,
          v.realIP,
          v.country,
          v.city,
          `${v.browser?.name} ${v.browser?.version}`,
          `${v.os?.name} ${v.os?.version}`,
          v.device?.type,
          v.path,
          v.referrerDomain,
          v.utm?.source,
          v.utm?.campaign,
          v.engagement?.timeOnPage,
          v.engagement?.scrollDepth,
          v.isBot,
          v.sessionId
        ]);

        exportData = [csvHeaders, ...csvData]
          .map(row => row.map(cell => `"${cell || ''}"`).join(','))
          .join('\n');
        
        contentType = 'text/csv';
        filename = `enhanced_visitors_${timestamp}.csv`;
        break;

      case 'xlsx':
        // For Excel format, you would need to implement XLSX generation
        // For now, return JSON with Excel content type
        exportData = JSON.stringify(visitors, null, 2);
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        filename = `enhanced_visitors_${timestamp}.xlsx`;
        break;

      default:
        exportData = JSON.stringify({
          exportInfo: {
            generatedAt: new Date().toISOString(),
            totalRecords: visitors.length,
            dateRange: parseInt(dateRange),
            filters: searchFilters
          },
          visitors,
          analytics: includeAnalytics ? await VisitorService.getAnalyticsOverview(parseInt(dateRange)) : null
        }, null, 2);
        contentType = 'application/json';
        filename = `enhanced_visitors_${timestamp}.json`;
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.status(200).send(exportData);

  } catch (error) {
    console.error("Export Enhanced Visitor Data Error:", error);
    res.status(500).json({
      success: false,
      message: "Error exporting visitor data",
      error: handleError(error)
    });
  }
};

/**
 * Get visitor session history
 */
exports.getVisitorSessionHistory = async (req, res) => {
  try {
    const { visitorId } = req.params;
    const { limit = 50 } = req.query;

    const sessions = await Visitor.find({
      $or: [
        { visitorId },
        { 'userAgent.fingerprint': visitorId }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .lean();

    res.status(200).json({
      success: true,
      data: {
        sessions,
        totalSessions: sessions.length,
        visitorId
      }
    });
  } catch (error) {
    console.error("Get Visitor Session History Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching visitor session history",
      error: handleError(error)
    });
  }
};

/**
 * Health check for enhanced visitor tracking
 */
exports.getVisitorHealthCheck = async (req, res) => {
  try {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '2.0-enhanced',
      services: {
        database: 'connected',
        geoLocation: 'active',
        tracking: 'operational'
      },
      stats: {
        activeVisitors: (await VisitorService.getActiveVisitors(30)).length,
        totalVisitorsToday: await VisitorService.countAllVisitors({ dateRange: 1 })
      }
    };

    res.status(200).json({
      success: true,
      data: healthData
    });
  } catch (error) {
    console.error("Enhanced Visitor Health Check Error:", error);
    res.status(500).json({
      success: false,
      message: "Health check failed",
      error: handleError(error)
    });
  }
};

/**
 * Get event analytics (custom events)
 */
exports.getEventAnalytics = async (req, res) => {
  try {
    const { dateRange = 30, limit = 50 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(dateRange));

    // Get event analytics with aggregation
    const eventsPipeline = [
      { 
        $match: { 
          createdAt: { $gte: startDate },
          eventType: { $exists: true, $ne: null }
        } 
      },
      {
        $group: {
          _id: {
            eventType: "$eventType",
            eventName: "$eventName"
          },
          count: { $sum: 1 },
          uniqueVisitors: { $addToSet: "$realIP" },
          countries: { $addToSet: "$countryCode" },
          avgEngagementTime: { $avg: "$engagement.timeOnPage" },
          lastOccurrence: { $max: "$createdAt" },
          eventData: { $first: "$eventData" }
        }
      },
      {
        $project: {
          _id: 0,
          eventType: "$_id.eventType",
          eventName: "$_id.eventName",
          count: 1,
          uniqueVisitors: { $size: "$uniqueVisitors" },
          countriesReached: { $size: "$countries" },
          avgEngagementTime: { $round: ["$avgEngagementTime", 2] },
          lastEvent: "$lastOccurrence",
          eventData: 1
        }
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) }
    ];

    const events = await Visitor.aggregate(eventsPipeline);

    // Get recent events
    const recentEventsRaw = await Visitor.find({
      createdAt: { $gte: startDate },
      eventType: { $exists: true, $ne: null }
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .select('eventType eventName eventData country city realIP createdAt sessionId device browser')
    .lean();

    // Map recent events to match client expectations
    const recentEvents = (recentEventsRaw || []).map(event => ({
      createdAt: event.createdAt || new Date(),
      eventType: event.eventType || 'unknown',
      eventName: event.eventName || 'Unknown Event',
      eventData: event.eventData || {},
      country: event.country || 'Unknown',
      city: event.city || 'Unknown',
      ip: event.realIP || 'Unknown',
      sessionId: event.sessionId || 'Unknown',
      device: event.device?.type || event.device || 'Unknown',
      browser: event.browser?.name || event.browser || 'Unknown'
    }));

    res.json({
      success: true,
      data: {
        eventStats: events || [],
        recentEvents: recentEvents || [],
        totalEvents: events ? events.reduce((sum, event) => sum + (event.count || 0), 0) : 0,
        dateRange: parseInt(dateRange),
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Event Analytics Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch event analytics",
      data: {
        eventStats: [],
        recentEvents: [],
        totalEvents: 0,
        dateRange: parseInt(req.query.dateRange || 30),
        generatedAt: new Date().toISOString()
      },
      error: handleError(error)
    });
  }
};

/**
 * Get device analytics
 */
exports.getDeviceAnalytics = async (req, res) => {
  try {
    const { dateRange = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(dateRange));

    const devicePipeline = [
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            deviceType: "$device.type",
            deviceVendor: "$device.vendor",
            deviceModel: "$device.model"
          },
          visitors: { $sum: 1 },
          uniqueIPs: { $addToSet: "$realIP" },
          avgEngagementTime: { $avg: "$engagement.timeOnPage" },
          topCountries: { $addToSet: "$countryCode" }
        }
      },
      {
        $project: {
          _id: 0,
          deviceType: "$_id.deviceType",
          deviceVendor: "$_id.deviceVendor",
          deviceModel: "$_id.deviceModel",
          visitors: 1,
          uniqueVisitors: { $size: "$uniqueIPs" },
          avgEngagementTime: { $round: ["$avgEngagementTime", 2] },
          topCountries: { $slice: ["$topCountries", 5] }
        }
      },
      { $sort: { visitors: -1 } }
    ];

    const devices = await Visitor.aggregate(devicePipeline);

    res.json({
      success: true,
      data: {
        devices: devices || [],
        summary: {
          totalDevices: (devices || []).length,
          dateRange: parseInt(dateRange)
        }
      }
    });
  } catch (error) {
    console.error("Device Analytics Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch device analytics",
      error: handleError(error)
    });
  }
};

/**
 * Get browser analytics
 */
exports.getBrowserAnalytics = async (req, res) => {
  try {
    const { dateRange = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(dateRange));

    const browserPipeline = [
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            browserName: "$browser.name",
            browserVersion: "$browser.version"
          },
          visitors: { $sum: 1 },
          uniqueIPs: { $addToSet: "$realIP" },
          avgEngagementTime: { $avg: "$engagement.timeOnPage" },
          topCountries: { $addToSet: "$countryCode" }
        }
      },
      {
        $project: {
          _id: 0,
          browserName: "$_id.browserName",
          browserVersion: "$_id.browserVersion",
          visitors: 1,
          uniqueVisitors: { $size: "$uniqueIPs" },
          avgEngagementTime: { $round: ["$avgEngagementTime", 2] },
          topCountries: { $slice: ["$topCountries", 5] }
        }
      },
      { $sort: { visitors: -1 } }
    ];

    const browsers = await Visitor.aggregate(browserPipeline);

    res.json({
      success: true,
      data: {
        browsers: browsers || [],
        summary: {
          totalBrowsers: (browsers || []).length,
          dateRange: parseInt(dateRange)
        }
      }
    });
  } catch (error) {
    console.error("Browser Analytics Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch browser analytics",
      error: handleError(error)
    });
  }
};

/**
 * Get engagement metrics
 */
exports.getEngagementMetrics = async (req, res) => {
  try {
    const { dateRange = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(dateRange));

    const engagementPipeline = [
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          avgTimeOnPage: { $avg: "$engagement.timeOnPage" },
          avgScrollDepth: { $avg: "$engagement.scrollDepth" },
          avgClickCount: { $avg: "$engagement.clickCount" },
          totalEngagementTime: { $sum: "$engagement.timeOnPage" },
          highEngagementSessions: {
            $sum: {
              $cond: [
                { $gte: ["$engagement.timeOnPage", 60000] }, // 1 minute+
                1, 0
              ]
            }
          },
          totalSessions: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          avgTimeOnPage: { $round: ["$avgTimeOnPage", 2] },
          avgScrollDepth: { $round: ["$avgScrollDepth", 2] },
          avgClickCount: { $round: ["$avgClickCount", 2] },
          totalEngagementTime: 1,
          engagementRate: {
            $round: [
              { $multiply: [{ $divide: ["$highEngagementSessions", "$totalSessions"] }, 100] },
              2
            ]
          }
        }
      }
    ];

    const engagement = await Visitor.aggregate(engagementPipeline);

    res.json({
      success: true,
      data: engagement[0] || {},
      dateRange: parseInt(dateRange)
    });
  } catch (error) {
    console.error("Engagement Metrics Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch engagement metrics",
      error: handleError(error)
    });
  }
};

/**
 * Get top pages analytics
 */
exports.getTopPagesAnalytics = async (req, res) => {
  try {
    const { dateRange = 30, limit = 10 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(dateRange));

    const topPagesPipeline = [
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: "$path",
          visits: { $sum: 1 },
          uniqueVisitors: { $addToSet: "$realIP" },
          avgTimeOnPage: { $avg: "$engagement.timeOnPage" },
          avgScrollDepth: { $avg: "$engagement.scrollDepth" }
        }
      },
      {
        $project: {
          _id: 0,
          path: "$_id",
          visits: 1,
          uniqueVisitors: { $size: "$uniqueVisitors" },
          avgTimeOnPage: { $round: ["$avgTimeOnPage", 2] },
          avgScrollDepth: { $round: ["$avgScrollDepth", 2] }
        }
      },
      { $sort: { visits: -1 } },
      { $limit: parseInt(limit) }
    ];

    const topPages = await Visitor.aggregate(topPagesPipeline);

    res.json({
      success: true,
      data: {
        pages: topPages || [],
        totalPages: (topPages || []).length,
        dateRange: parseInt(dateRange)
      }
    });
  } catch (error) {
    console.error("Top Pages Analytics Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch top pages analytics",
      error: handleError(error)
    });
  }
};

/**
 * Enhanced Session Tracking by Browser
 */
exports.getSessionTrackingByBrowser = async (req, res) => {
  try {
    const { dateRange = 30, timeUnit = 'daily' } = req.query;

    const sessionData = await VisitorService.getSessionTrackingByBrowser(
      parseInt(dateRange),
      timeUnit
    );

    res.status(200).json({
      success: true,
      data: sessionData,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Session Tracking by Browser Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching session tracking by browser",
      error: handleError(error)
    });
  }
};

/**
 * Enhanced Country Analytics with Trends
 */
exports.getEnhancedCountryAnalytics = async (req, res) => {
  try {
    const { dateRange = 30, timeUnit = 'daily' } = req.query;

    const countryAnalytics = await VisitorService.getEnhancedCountryAnalytics(
      parseInt(dateRange),
      timeUnit
    );

    res.status(200).json({
      success: true,
      data: countryAnalytics,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Enhanced Country Analytics Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching enhanced country analytics",
      error: handleError(error)
    });
  }
};

/**
 * Enhanced Active Users with Granular Tracking
 */
exports.getEnhancedActiveUsers = async (req, res) => {
  try {
    const { 
      minutesThreshold = 30, 
      includeDetails = true, 
      groupBy = 'none',
      realTimeWindow = 5 
    } = req.query;

    const options = {
      minutesThreshold: parseInt(minutesThreshold),
      includeDetails: includeDetails === 'true',
      groupBy,
      realTimeWindow: parseInt(realTimeWindow)
    };

    const activeUsersData = await VisitorService.getEnhancedActiveUsers(options);

    res.status(200).json({
      success: true,
      data: activeUsersData,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Enhanced Active Users Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching enhanced active users",
      error: handleError(error)
    });
  }
};

/**
 * Enhanced Top Pages Analytics with Trends
 */
exports.getEnhancedTopPagesAnalytics = async (req, res) => {
  try {
    const { dateRange = 30, timeUnit = 'daily', limit = 20 } = req.query;

    const topPagesData = await VisitorService.getEnhancedTopPagesAnalytics(
      parseInt(dateRange),
      timeUnit,
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      data: topPagesData,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Enhanced Top Pages Analytics Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching enhanced top pages analytics",
      error: handleError(error)
    });
  }
};

// ==================== PERFORMANCE MONITORING ENDPOINTS ==================== //

/**
 * Get comprehensive performance analytics
 */
exports.getPerformanceAnalytics = async (req, res) => {
  try {
    const { dateRange = 30, timeUnit = 'daily' } = req.query;

    const performanceData = await VisitorService.getPerformanceAnalytics(
      parseInt(dateRange),
      timeUnit
    );

    res.status(200).json({
      success: true,
      data: performanceData,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Performance Analytics Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching performance analytics",
      error: handleError(error)
    });
  }
};

/**
 * Get slow pages detection and alerts
 */
exports.getSlowPagesDetection = async (req, res) => {
  try {
    const { thresholdMs = 3000, dateRange = 7 } = req.query;

    const slowPagesData = await VisitorService.getSlowPagesDetection(
      parseInt(thresholdMs),
      parseInt(dateRange)
    );

    res.status(200).json({
      success: true,
      data: slowPagesData,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Slow Pages Detection Error:", error);
    res.status(500).json({
      success: false,
      message: "Error detecting slow pages",
      error: handleError(error)
    });
  }
};

/**
 * Get Core Web Vitals analytics
 */
exports.getCoreWebVitals = async (req, res) => {
  try {
    const { dateRange = 30 } = req.query;

    const coreWebVitalsData = await VisitorService.getCoreWebVitals(
      parseInt(dateRange)
    );

    res.status(200).json({
      success: true,
      data: coreWebVitalsData,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Core Web Vitals Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching Core Web Vitals",
      error: handleError(error)
    });
  }
};

// ==================== VISITOR JOURNEY TRACKING ENDPOINTS ==================== //

/**
 * Get visitor journey analytics
 */
exports.getVisitorJourneyAnalytics = async (req, res) => {
  try {
    const { dateRange = 30, limit = 100 } = req.query;

    const journeyData = await VisitorService.getVisitorJourneyAnalytics(
      parseInt(dateRange),
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      data: journeyData,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Visitor Journey Analytics Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching visitor journey analytics",
      error: handleError(error)
    });
  }
};

/**
 * Get conversion funnel analysis
 */
exports.getConversionFunnelAnalysis = async (req, res) => {
  try {
    const { dateRange = 30 } = req.query;
    const { funnelSteps } = req.body || {};

    const funnelData = await VisitorService.getConversionFunnelAnalysis(
      funnelSteps,
      parseInt(dateRange)
    );

    res.status(200).json({
      success: true,
      data: funnelData,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Conversion Funnel Analysis Error:", error);
    res.status(500).json({
      success: false,
      message: "Error analyzing conversion funnel",
      error: handleError(error)
    });
  }
};

// ==================== TRAFFIC SPIKE DETECTION ENDPOINTS ==================== //

/**
 * Detect traffic spikes and anomalies
 */
exports.detectTrafficSpikes = async (req, res) => {
  try {
    const { sensitivityLevel = 'medium', hoursBack = 24 } = req.query;

    const spikeData = await VisitorService.detectTrafficSpikes(
      sensitivityLevel,
      parseInt(hoursBack)
    );

    res.status(200).json({
      success: true,
      data: spikeData,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Traffic Spike Detection Error:", error);
    res.status(500).json({
      success: false,
      message: "Error detecting traffic spikes",
      error: handleError(error)
    });
  }
};

// ==================== SCHEDULED REPORTS ENDPOINTS ==================== //

/**
 * Generate manual report
 */
exports.generateReport = async (req, res) => {
  try {
    const { type = 'daily', date } = req.body;
    const scheduledReports = require('../../services/visitor/scheduledReports');

    let result;
    if (type === 'daily') {
      result = await scheduledReports.generateDailyReport(date ? new Date(date) : null);
    } else if (type === 'weekly') {
      result = await scheduledReports.generateWeeklyReport();
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid report type. Use 'daily' or 'weekly'"
      });
    }

    res.status(200).json({
      success: result.success,
      message: result.success ? 'Report generated successfully' : 'Failed to generate report',
      data: result.success ? {
        filename: result.filename,
        type,
        generatedAt: new Date().toISOString()
      } : null,
      error: result.success ? null : result.error
    });
  } catch (error) {
    console.error("Generate Report Error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating report",
      error: handleError(error)
    });
  }
};

/**
 * List available reports
 */
exports.listReports = async (req, res) => {
  try {
    const scheduledReports = require('../../services/visitor/scheduledReports');
    const reports = await scheduledReports.listReports();

    res.status(200).json({
      success: true,
      data: {
        reports,
        totalReports: reports.length
      }
    });
  } catch (error) {
    console.error("List Reports Error:", error);
    res.status(500).json({
      success: false,
      message: "Error listing reports",
      error: handleError(error)
    });
  }
};

/**
 * Get specific report
 */
exports.getReport = async (req, res) => {
  try {
    const { filename } = req.params;
    const scheduledReports = require('../../services/visitor/scheduledReports');
    
    const report = await scheduledReports.getReport(filename);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found"
      });
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error("Get Report Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching report",
      error: handleError(error)
    });
  }
};

module.exports = exports;