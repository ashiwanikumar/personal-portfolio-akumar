/**
 * Enhanced Visitor Routes
 * 
 * Advanced visitor tracking routes with real-time capabilities
 * Provides comprehensive analytics, live tracking, and performance optimization
 */

const express = require('express');
const router = express.Router();

// Import visitor controller  
const visitorController = require('../../controllers/visitor/visitorController');

// Import middleware
const auth = require('../../middlewares/auth');
const permissionMiddleware = require('../../middlewares/permissionMiddleware');
const { apiLimiter, strictLimiter } = require('../../middlewares/rateLimiter');
const rateLimit = require('express-rate-limit');

// Create a sub-router with the /visitors prefix
const visitorsRouter = express.Router();

// ==================== PUBLIC TRACKING ENDPOINTS ==================== //

/**
 * @route   POST /api/v1/visitors/track
 * @desc    Track comprehensive visitor data (Public endpoint)
 * @access  Public
 * @body    Complete visitor tracking data with enhanced fields
 */
visitorsRouter.post(
  '/track',
  rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: 'Too many tracking requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  }),
  visitorController.trackVisitor
);

/**
 * @route   POST /api/v1/visitors/page-view
 * @desc    Track lightweight page view (Public endpoint)
 * @access  Public
 * @body    Essential page view data
 */
visitorsRouter.post(
  '/page-view',
  rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 200, // 200 requests per minute for page views
    message: 'Too many page view requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  }),
  visitorController.trackPageView
);

/**
 * @route   PUT /api/v1/visitors/activity/:sessionId
 * @desc    Update visitor activity (Heartbeat endpoint - Public)
 * @access  Public
 * @params  sessionId - Visitor session ID
 * @body    Activity data (scroll depth, time on page, etc.)
 */
visitorsRouter.put(
  '/activity/:sessionId',
  rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // 60 heartbeats per minute
    message: 'Too many activity updates, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  }),
  visitorController.updateVisitorActivity
);

/**
 * @route   GET /api/v1/visitors/health
 * @desc    Health check for enhanced visitor tracking (Public)
 * @access  Public
 */
visitorsRouter.get('/health', visitorController.getVisitorHealthCheck);

// ==================== PROTECTED ANALYTICS ENDPOINTS ==================== //

/**
 * @route   GET /api/v1/visitors/paginated
 * @desc    Get all visitors with enhanced pagination and filtering
 * @access  Private (Super Admin only)
 * @query   page, perPage, searchText, country, city, deviceType, browser, dateRange, isActive, eventType, referrerType, utmSource
 */
visitorsRouter.get(
  '/paginated',
  auth.authCheck,
  permissionMiddleware.superAdminOnly,
  visitorController.getVisitorsPaginated
);

/**
 * @route   GET /api/v1/visitors/active
 * @desc    Get real-time active visitors
 * @access  Private (Super Admin only)
 * @query   minutesThreshold - Minutes to consider as active (default: 30)
 */
visitorsRouter.get(
  '/active',
  auth.authCheck,
  permissionMiddleware.superAdminOnly,
  visitorController.getActiveVisitors
);

/**
 * @route   GET /api/v1/visitors/analytics/overview
 * @desc    Get comprehensive analytics overview
 * @access  Private (Super Admin only)
 * @query   dateRange - Days to include in analysis (default: 30)
 */
visitorsRouter.get(
  '/analytics/overview',
  auth.authCheck,
  permissionMiddleware.superAdminOnly,
  visitorController.getAnalyticsOverview
);

/**
 * @route   GET /api/v1/visitors/analytics/urls
 * @desc    Get URL performance analytics
 * @access  Private (Super Admin only)
 * @query   dateRange, limit - Number of top URLs to return (default: 50)
 */
visitorsRouter.get(
  '/analytics/urls',
  auth.authCheck,
  permissionMiddleware.superAdminOnly,
  visitorController.getUrlAnalytics
);

/**
 * @route   GET /api/v1/visitors/analytics/geographic
 * @desc    Get geographic analytics with enhanced data
 * @access  Private (Super Admin only)
 * @query   dateRange - Days to include in analysis (default: 30)
 */
visitorsRouter.get(
  '/analytics/geographic',
  auth.authCheck,
  permissionMiddleware.superAdminOnly,
  visitorController.getGeographicAnalytics
);

/**
 * @route   GET /api/v1/visitors/analytics/sources
 * @desc    Get traffic source analytics
 * @access  Private (Super Admin only)
 * @query   dateRange - Days to include in analysis (default: 30)
 */
visitorsRouter.get(
  '/analytics/sources',
  auth.authCheck,
  permissionMiddleware.superAdminOnly,
  visitorController.getTrafficSourceAnalytics
);

/**
 * @route   GET /api/v1/visitors/analytics/realtime
 * @desc    Get real-time activity data
 * @access  Private (Super Admin only)
 * @query   hoursBack - Hours to look back for real-time data (default: 24)
 */
visitorsRouter.get(
  '/analytics/realtime',
  auth.authCheck,
  permissionMiddleware.superAdminOnly,
  visitorController.getRealTimeActivity
);

/**
 * @route   GET /api/v1/visitors/analytics/events
 * @desc    Get event analytics
 * @access  Private (Super Admin only)
 * @query   dateRange, limit - Number of top events to return (default: 50)
 */
visitorsRouter.get(
  '/analytics/events',
  auth.authCheck,
  permissionMiddleware.superAdminOnly,
  visitorController.getEventAnalytics
);

/**
 * @route   GET /api/v1/visitors/analytics/devices
 * @desc    Get device analytics
 * @access  Private (Super Admin only)
 * @query   dateRange - Days to include in analysis (default: 30)
 */
visitorsRouter.get(
  '/analytics/devices',
  auth.authCheck,
  permissionMiddleware.superAdminOnly,
  visitorController.getDeviceAnalytics
);

/**
 * @route   GET /api/v1/visitors/analytics/browsers
 * @desc    Get browser analytics
 * @access  Private (Super Admin only)
 * @query   dateRange - Days to include in analysis (default: 30)
 */
visitorsRouter.get(
  '/analytics/browsers',
  auth.authCheck,
  permissionMiddleware.superAdminOnly,
  visitorController.getBrowserAnalytics
);

/**
 * @route   GET /api/v1/visitors/analytics/engagement
 * @desc    Get engagement metrics
 * @access  Private (Super Admin only)
 * @query   dateRange - Days to include in analysis (default: 30)
 */
visitorsRouter.get(
  '/analytics/engagement',
  auth.authCheck,
  permissionMiddleware.superAdminOnly,
  visitorController.getEngagementMetrics
);

/**
 * @route   GET /api/v1/visitors/analytics/top-pages
 * @desc    Get top pages analytics
 * @access  Private (Super Admin only)
 * @query   dateRange, limit - Number of top pages to return (default: 10)
 */
visitorsRouter.get(
  '/analytics/top-pages',
  auth.authCheck,
  permissionMiddleware.superAdminOnly,
  visitorController.getTopPagesAnalytics
);

// ==================== ENHANCED ANALYTICS ENDPOINTS ==================== //

/**
 * @route   GET /api/v1/visitors/analytics/sessions/browser
 * @desc    Enhanced Session Tracking by Browser with Hourly/Daily Breakdown
 * @access  Private (Super Admin only)
 * @query   dateRange, timeUnit (hourly/daily)
 */
visitorsRouter.get(
  '/analytics/sessions/browser',
  auth.authCheck,
  permissionMiddleware.superAdminOnly,
  visitorController.getSessionTrackingByBrowser
);

/**
 * @route   GET /api/v1/visitors/analytics/countries/enhanced
 * @desc    Enhanced Country Analytics with Time-Series Data and Trends
 * @access  Private (Super Admin only)
 * @query   dateRange, timeUnit (hourly/daily)
 */
visitorsRouter.get(
  '/analytics/countries/enhanced',
  auth.authCheck,
  permissionMiddleware.superAdminOnly,
  visitorController.getEnhancedCountryAnalytics
);

/**
 * @route   GET /api/v1/visitors/analytics/active/enhanced
 * @desc    Enhanced Active Users with Granular Real-Time Tracking
 * @access  Private (Super Admin only)
 * @query   minutesThreshold, includeDetails, groupBy (country/browser/device/page), realTimeWindow
 */
visitorsRouter.get(
  '/analytics/active/enhanced',
  auth.authCheck,
  permissionMiddleware.superAdminOnly,
  visitorController.getEnhancedActiveUsers
);

/**
 * @route   GET /api/v1/visitors/analytics/pages/enhanced
 * @desc    Enhanced Top Pages Analytics with Hourly/Daily Trends
 * @access  Private (Super Admin only)
 * @query   dateRange, timeUnit (hourly/daily), limit
 */
visitorsRouter.get(
  '/analytics/pages/enhanced',
  auth.authCheck,
  permissionMiddleware.superAdminOnly,
  visitorController.getEnhancedTopPagesAnalytics
);

// ==================== PERFORMANCE MONITORING ENDPOINTS ==================== //

/**
 * @route   GET /api/v1/visitors/analytics/performance
 * @desc    Get comprehensive performance analytics
 * @access  Private (Super Admin only)
 * @query   dateRange, timeUnit (hourly/daily)
 */
visitorsRouter.get(
  '/analytics/performance',
  auth.authCheck,
  permissionMiddleware.superAdminOnly,
  visitorController.getPerformanceAnalytics
);

/**
 * @route   GET /api/v1/visitors/analytics/performance/slow-pages
 * @desc    Get slow pages detection and alerts
 * @access  Private (Super Admin only)
 * @query   thresholdMs, dateRange
 */
visitorsRouter.get(
  '/analytics/performance/slow-pages',
  auth.authCheck,
  permissionMiddleware.superAdminOnly,
  visitorController.getSlowPagesDetection
);

/**
 * @route   GET /api/v1/visitors/analytics/performance/core-web-vitals
 * @desc    Get Core Web Vitals analytics
 * @access  Private (Super Admin only)
 * @query   dateRange
 */
visitorsRouter.get(
  '/analytics/performance/core-web-vitals',
  auth.authCheck,
  permissionMiddleware.superAdminOnly,
  visitorController.getCoreWebVitals
);

// ==================== VISITOR JOURNEY TRACKING ENDPOINTS ==================== //

/**
 * @route   GET /api/v1/visitors/analytics/journey
 * @desc    Get visitor journey analytics - track user flow across pages
 * @access  Private (Super Admin only)
 * @query   dateRange, limit
 */
visitorsRouter.get(
  '/analytics/journey',
  auth.authCheck,
  permissionMiddleware.superAdminOnly,
  visitorController.getVisitorJourneyAnalytics
);

/**
 * @route   POST /api/v1/visitors/analytics/funnel
 * @desc    Get conversion funnel analysis
 * @access  Private (Super Admin only)
 * @query   dateRange
 * @body    { funnelSteps: [array of page paths] }
 */
visitorsRouter.post(
  '/analytics/funnel',
  auth.authCheck,
  permissionMiddleware.superAdminOnly,
  visitorController.getConversionFunnelAnalysis
);

// ==================== TRAFFIC SPIKE DETECTION ENDPOINTS ==================== //

/**
 * @route   GET /api/v1/visitors/analytics/spikes
 * @desc    Detect traffic spikes and anomalies
 * @access  Private (Super Admin only)
 * @query   sensitivityLevel (high/medium/low), hoursBack
 */
visitorsRouter.get(
  '/analytics/spikes',
  auth.authCheck,
  permissionMiddleware.superAdminOnly,
  visitorController.detectTrafficSpikes
);

// ==================== SCHEDULED REPORTS ENDPOINTS ==================== //

/**
 * @route   POST /api/v1/visitors/reports/generate
 * @desc    Generate manual analytics report
 * @access  Private (Super Admin only)
 * @body    { type: 'daily'|'weekly', date?: 'YYYY-MM-DD' }
 */
visitorsRouter.post(
  '/reports/generate',
  auth.authCheck,
  permissionMiddleware.superAdminOnly,
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 3, // 3 reports per 5 minutes
    message: 'Report generation rate limited',
    standardHeaders: true,
    legacyHeaders: false,
  }),
  visitorController.generateReport
);

/**
 * @route   GET /api/v1/visitors/reports
 * @desc    List available analytics reports
 * @access  Private (Super Admin only)
 */
visitorsRouter.get(
  '/reports',
  auth.authCheck,
  permissionMiddleware.superAdminOnly,
  visitorController.listReports
);

/**
 * @route   GET /api/v1/visitors/reports/:filename
 * @desc    Get specific analytics report
 * @access  Private (Super Admin only)
 */
visitorsRouter.get(
  '/reports/:filename',
  auth.authCheck,
  permissionMiddleware.superAdminOnly,
  visitorController.getReport
);

/**
 * @route   GET /api/v1/visitors/dashboard/live
 * @desc    Get combined live dashboard data (single endpoint for efficiency)
 * @access  Private (Super Admin only)
 * @query   dateRange, minutesThreshold
 */
visitorsRouter.get(
  '/dashboard/live',
  auth.authCheck,
  permissionMiddleware.superAdminOnly,
  rateLimit({
    windowMs: 10 * 1000, // 10 seconds
    max: 6, // 6 requests per 10 seconds (once every ~1.7 seconds)
    message: 'Dashboard refresh rate limited',
    standardHeaders: true,
    legacyHeaders: false,
  }),
  visitorController.getLiveDashboardData
);

// ==================== VISITOR MANAGEMENT ENDPOINTS ==================== //

/**
 * @route   GET /api/v1/visitors/:id
 * @desc    Get visitor by ID with complete details
 * @access  Private (Super Admin only)
 * @params  id - Visitor ID
 */
visitorsRouter.get(
  '/:id',
  auth.authCheck,
  permissionMiddleware.superAdminOnly,
  visitorController.getVisitorById
);

/**
 * @route   DELETE /api/v1/visitors/:id
 * @desc    Delete visitor by ID
 * @access  Private (Super Admin only)
 * @params  id - Visitor ID
 */
visitorsRouter.delete(
  '/:id',
  auth.authCheck,
  permissionMiddleware.superAdminOnly,
  visitorController.deleteVisitor
);

/**
 * @route   DELETE /api/v1/visitors/bulk
 * @desc    Bulk delete visitors
 * @access  Private (Super Admin only)
 * @body    { visitorIds: [array of visitor IDs] }
 */
visitorsRouter.delete(
  '/bulk',
  auth.authCheck,
  permissionMiddleware.superAdminOnly,
  visitorController.bulkDeleteVisitors
);

/**
 * @route   GET /api/v1/visitors/sessions/:visitorId
 * @desc    Get visitor session history
 * @access  Private (Super Admin only)
 * @params  visitorId - Visitor ID or fingerprint
 * @query   limit - Number of sessions to return (default: 50)
 */
visitorsRouter.get(
  '/sessions/:visitorId',
  auth.authCheck,
  permissionMiddleware.superAdminOnly,
  visitorController.getVisitorSessionHistory
);

// ==================== MAINTENANCE ENDPOINTS ==================== //

/**
 * @route   POST /api/v1/visitors/maintenance/cleanup
 * @desc    Clean up inactive sessions
 * @access  Private (Super Admin only)
 * @query   minutesThreshold - Minutes to consider as inactive (default: 60)
 */
visitorsRouter.post(
  '/maintenance/cleanup',
  auth.authCheck,
  permissionMiddleware.superAdminOnly,
  visitorController.cleanupInactiveSessions
);

// ==================== EXPORT ENDPOINTS ==================== //

/**
 * @route   POST /api/v1/visitors/export
 * @desc    Export visitor data in various formats
 * @access  Private (Super Admin only)
 * @body    { format, dateRange, filters, includeAnalytics }
 */
visitorsRouter.post(
  '/export',
  auth.authCheck,
  permissionMiddleware.superAdminOnly,
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 2, // 2 exports per 5 minutes
    message: 'Export rate limited, please wait before requesting another export',
    standardHeaders: true,
    legacyHeaders: false,
  }),
  visitorController.exportVisitorData
);

// ==================== ERROR HANDLING ==================== //

// Handle 404 for undefined routes
visitorsRouter.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Visitor endpoint not found',
    availableEndpoints: {
      public: [
        'POST /track - Track comprehensive visitor data',
        'POST /page-view - Track lightweight page view',
        'PUT /activity/:sessionId - Update visitor activity',
        'GET /health - Health check'
      ],
      protected: [
        'GET /paginated - Get paginated visitors',
        'GET /active - Get active visitors',
        'GET /analytics/overview - Analytics overview',
        'GET /analytics/geographic - Geographic analytics',
        'GET /analytics/sources - Traffic sources',
        'GET /analytics/events - Event analytics',
        'GET /analytics/devices - Device analytics',
        'GET /analytics/browsers - Browser analytics',
        'GET /analytics/engagement - Engagement metrics',
        'GET /analytics/top-pages - Top pages analytics',
        'GET /analytics/sessions/browser - Enhanced session tracking by browser',
        'GET /analytics/countries/enhanced - Enhanced country analytics with trends',
        'GET /analytics/active/enhanced - Enhanced active users tracking',
        'GET /analytics/pages/enhanced - Enhanced top pages with trends',
        'GET /analytics/performance - Comprehensive performance analytics',
        'GET /analytics/performance/slow-pages - Slow pages detection',
        'GET /analytics/performance/core-web-vitals - Core Web Vitals metrics',
        'GET /analytics/journey - Visitor journey tracking',
        'POST /analytics/funnel - Conversion funnel analysis',
        'GET /analytics/spikes - Traffic spike detection',
        'POST /reports/generate - Generate analytics report',
        'GET /reports - List available reports',
        'GET /reports/:filename - Get specific report',
        'GET /dashboard/live - Live dashboard data',
        'GET /:id - Get visitor details',
        'DELETE /:id - Delete visitor',
        'DELETE /bulk - Bulk delete visitors',
        'GET /sessions/:visitorId - Get session history',
        'POST /maintenance/cleanup - Cleanup inactive sessions',
        'POST /export - Export visitor data'
      ]
    }
  });
});

// Error handling middleware
visitorsRouter.use((error, req, res, next) => {
  console.error('Visitor Routes Error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error in visitor routes',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  });
});

// Mount the visitors router with /visitors prefix
router.use('/visitors', visitorsRouter);

module.exports = router;