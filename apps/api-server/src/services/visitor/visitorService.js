/**
 * Enhanced Visitor Service
 * 
 * Advanced visitor tracking service with real-time capabilities
 * Includes comprehensive analytics, live tracking, and performance optimization
 */

const Visitor = require("@models/visitor/visitor");
const VisitorGeoLocationService = require("@utils/technical-info-collector/visitorGeoLocationService");
const crypto = require("crypto");

class VisitorService {
  
  /**
   * Build advanced search query with multiple filters
   */
  static buildSearchQuery(filters = {}) {
    const {
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
    } = filters;

    let query = {};

    // Text search across multiple fields
    if (searchText) {
      query.$or = [
        { country: { $regex: searchText, $options: "i" } },
        { city: { $regex: searchText, $options: "i" } },
        { realIP: { $regex: searchText, $options: "i" } },
        { path: { $regex: searchText, $options: "i" } },
        { referrerDomain: { $regex: searchText, $options: "i" } },
        { "utm.campaign": { $regex: searchText, $options: "i" } }
      ];
    }

    // Filter by country
    if (country) {
      query.countryCode = country;
    }

    // Filter by city
    if (city) {
      query.city = { $regex: city, $options: "i" };
    }

    // Filter by device type
    if (deviceType) {
      query["device.type"] = deviceType;
    }

    // Filter by browser
    if (browser) {
      query["browser.name"] = browser;
    }

    // Filter by active status
    if (typeof isActive === 'boolean') {
      query["status.isActive"] = isActive;
    }

    // Filter by event type
    if (eventType) {
      query.eventType = eventType;
    }

    // Filter by referrer type
    if (referrerType) {
      query.referrerType = referrerType;
    }

    // Filter by UTM source
    if (utmSource) {
      query["utm.source"] = utmSource;
    }

    // Date range filter
    if (dateRange) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));
      query.createdAt = { $gte: startDate };
    }

    return query;
  }

  /**
   * Find all visitors with advanced pagination and filters
   */
  static async findAllVisitorsPaginated(page = 1, perPage = 10, filters = {}) {
    try {
      const searchQuery = this.buildSearchQuery(filters);
      const skip = (page - 1) * perPage;

      // Execute query with population of related data
      const visitors = await Visitor.find(searchQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage)
        .lean(); // Use lean() for better performance

      return visitors;
    } catch (error) {
      console.error("Enhanced Visitor Service - Find Paginated Error:", error);
      throw error;
    }
  }

  /**
   * Count visitors with filters
   */
  static async countAllVisitors(filters = {}) {
    try {
      const searchQuery = this.buildSearchQuery(filters);
      const count = await Visitor.countDocuments(searchQuery);
      return count;
    } catch (error) {
      console.error("Enhanced Visitor Service - Count Error:", error);
      throw error;
    }
  }

  /**
   * Get real-time active visitors
   */
  static async getActiveVisitors(minutesThreshold = 30) {
    try {
      const cutoff = new Date(Date.now() - minutesThreshold * 60 * 1000);
      
      const activeVisitors = await Visitor.find({
        'status.isActive': true,
        'status.lastActivity': { $gte: cutoff }
      })
      .sort({ 'status.lastActivity': -1 })
      .limit(100)
      .lean();

      // Add computed fields
      const enrichedVisitors = activeVisitors.map(visitor => ({
        ...visitor,
        sessionAge: Math.round((Date.now() - new Date(visitor.status.lastActivity).getTime()) / (1000 * 60)),
        isRecentSession: Math.round((Date.now() - new Date(visitor.status.lastActivity).getTime()) / (1000 * 60)) <= 30
      }));

      return enrichedVisitors;
    } catch (error) {
      console.error("Enhanced Visitor Service - Active Visitors Error:", error);
      throw error;
    }
  }

  /**
   * Enhanced Real-Time Active Users with Granular Tracking
   */
  static async getEnhancedActiveUsers(options = {}) {
    try {
      const {
        minutesThreshold = 30,
        includeDetails = true,
        groupBy = 'none', // 'country', 'browser', 'device', 'page'
        realTimeWindow = 5 // minutes for real-time updates
      } = options;

      const cutoff = new Date(Date.now() - minutesThreshold * 60 * 1000);
      const realTimeCutoff = new Date(Date.now() - realTimeWindow * 60 * 1000);

      // Get active users with detailed analytics
      const activeUsersPipeline = [
        { 
          $match: { 
            'status.isActive': true,
            'status.lastActivity': { $gte: cutoff }
          } 
        },
        {
          $addFields: {
            activityLevel: {
              $switch: {
                branches: [
                  { 
                    case: { $gte: ["$status.lastActivity", realTimeCutoff] }, 
                    then: "real-time" 
                  },
                  { 
                    case: { $gte: ["$status.lastActivity", new Date(Date.now() - 10 * 60 * 1000)] }, 
                    then: "recent" 
                  },
                  { 
                    case: { $gte: ["$status.lastActivity", new Date(Date.now() - 20 * 60 * 1000)] }, 
                    then: "active" 
                  }
                ],
                default: "idle"
              }
            },
            sessionDurationMinutes: {
              $divide: [
                { $subtract: ["$status.lastActivity", "$createdAt"] },
                60000
              ]
            },
            minutesSinceLastActivity: {
              $divide: [
                { $subtract: [new Date(), "$status.lastActivity"] },
                60000
              ]
            }
          }
        }
      ];

      if (groupBy !== 'none') {
        let groupField;
        switch (groupBy) {
          case 'country':
            groupField = '$countryCode';
            break;
          case 'browser':
            groupField = '$browser.name';
            break;
          case 'device':
            groupField = '$device.type';
            break;
          case 'page':
            groupField = '$path';
            break;
          default:
            groupField = null;
        }

        if (groupField) {
          activeUsersPipeline.push(
            {
              $group: {
                _id: groupField,
                activeUsers: { $sum: 1 },
                realTimeUsers: {
                  $sum: {
                    $cond: [{ $eq: ["$activityLevel", "real-time"] }, 1, 0]
                  }
                },
                recentUsers: {
                  $sum: {
                    $cond: [{ $eq: ["$activityLevel", "recent"] }, 1, 0]
                  }
                },
                averageSessionDuration: { $avg: "$sessionDurationMinutes" },
                averageTimeSinceActivity: { $avg: "$minutesSinceLastActivity" },
                uniqueIPs: { $addToSet: "$realIP" },
                countries: { $addToSet: "$countryCode" },
                pages: { $addToSet: "$path" },
                lastActivity: { $max: "$status.lastActivity" },
                heartbeats: { $sum: "$status.heartbeatCount" }
              }
            },
            {
              $project: {
                _id: 0,
                [groupBy]: "$_id",
                activeUsers: 1,
                realTimeUsers: 1,
                recentUsers: 1,
                averageSessionDuration: { $round: ["$averageSessionDuration", 2] },
                averageTimeSinceActivity: { $round: ["$averageTimeSinceActivity", 2] },
                uniqueVisitors: { $size: "$uniqueIPs" },
                countriesReached: { $size: "$countries" },
                pagesVisited: { $size: "$pages" },
                lastActivity: 1,
                totalHeartbeats: 1,
                engagementScore: {
                  $round: [
                    {
                      $multiply: [
                        {
                          $add: [
                            { $multiply: ["$realTimeUsers", 3] },
                            { $multiply: ["$recentUsers", 2] },
                            "$activeUsers"
                          ]
                        },
                        {
                          $divide: [
                            "$averageSessionDuration",
                            { $add: ["$averageSessionDuration", 1] }
                          ]
                        }
                      ]
                    },
                    2
                  ]
                }
              }
            },
            { $sort: { activeUsers: -1 } }
          );
        }
      }

      const activeUsersData = await Visitor.aggregate(activeUsersPipeline);

      // Get activity timeline for the last hour
      const timelinePipeline = [
        { 
          $match: { 
            'status.lastActivity': { $gte: new Date(Date.now() - 60 * 60 * 1000) }
          } 
        },
        {
          $group: {
            _id: {
              minute: {
                $dateToString: {
                  format: "%Y-%m-%d %H:%M",
                  date: "$status.lastActivity"
                }
              }
            },
            activeUsers: { $sum: 1 },
            newSessions: {
              $sum: {
                $cond: [
                  { $gte: ["$createdAt", new Date(Date.now() - 60 * 60 * 1000)] },
                  1, 0
                ]
              }
            },
            uniqueCountries: { $addToSet: "$countryCode" },
            topPages: { $addToSet: "$path" }
          }
        },
        {
          $project: {
            _id: 0,
            timestamp: { $dateFromString: { dateString: "$_id.minute" } },
            timeLabel: "$_id.minute",
            activeUsers: 1,
            newSessions: 1,
            countriesActive: { $size: "$uniqueCountries" },
            topPages: { $slice: ["$topPages", 3] }
          }
        },
        { $sort: { timestamp: 1 } }
      ];

      const activityTimeline = await Visitor.aggregate(timelinePipeline);

      // Get current real-time statistics
      const realTimeStats = await Visitor.aggregate([
        { 
          $match: { 
            'status.isActive': true,
            'status.lastActivity': { $gte: cutoff }
          } 
        },
        {
          $group: {
            _id: null,
            totalActiveUsers: { $sum: 1 },
            realTimeUsers: {
              $sum: {
                $cond: [
                  { $gte: ["$status.lastActivity", realTimeCutoff] },
                  1, 0
                ]
              }
            },
            uniqueCountries: { $addToSet: "$countryCode" },
            uniquePages: { $addToSet: "$path" },
            uniqueBrowsers: { $addToSet: "$browser.name" },
            uniqueDevices: { $addToSet: "$device.type" },
            totalHeartbeats: { $sum: "$status.heartbeatCount" },
            avgSessionDuration: { $avg: "$status.sessionDuration" },
            avgEngagementTime: { $avg: "$engagement.timeOnPage" },
            avgScrollDepth: { $avg: "$engagement.scrollDepth" },
            newVisitors: {
              $sum: {
                $cond: [{ $eq: ["$visit.isFirstVisit", true] }, 1, 0]
              }
            },
            returningVisitors: {
              $sum: {
                $cond: [{ $eq: ["$visit.isReturning", true] }, 1, 0]
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            totalActiveUsers: 1,
            realTimeUsers: 1,
            activeCountries: { $size: "$uniqueCountries" },
            activePagesCount: { $size: "$uniquePages" },
            activeBrowsers: { $size: "$uniqueBrowsers" },
            activeDevices: { $size: "$uniqueDevices" },
            totalHeartbeats: 1,
            avgSessionDuration: { $round: ["$avgSessionDuration", 2] },
            avgEngagementTime: { $round: ["$avgEngagementTime", 2] },
            avgScrollDepth: { $round: ["$avgScrollDepth", 2] },
            newVisitors: 1,
            returningVisitors: 1,
            activityScore: {
              $round: [
                {
                  $multiply: [
                    { $add: ["$realTimeUsers", { $multiply: ["$totalActiveUsers", 0.5] }] },
                    { $divide: ["$avgEngagementTime", 30000] }
                  ]
                },
                2
              ]
            }
          }
        }
      ]);

      const result = {
        realTimeStats: realTimeStats[0] || {},
        activityTimeline,
        activeUsersData: groupBy !== 'none' ? activeUsersData : await this.getActiveVisitors(minutesThreshold),
        meta: {
          minutesThreshold,
          realTimeWindow,
          groupBy,
          includeDetails,
          totalDataPoints: activityTimeline.length,
          generatedAt: new Date().toISOString(),
          nextUpdateIn: `${realTimeWindow} minutes`
        }
      };

      return result;
    } catch (error) {
      console.error("Enhanced Active Users Error:", error);
      throw error;
    }
  }

  /**
   * Get comprehensive analytics overview
   */
  static async getAnalyticsOverview(dateRange = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);

      const pipeline = [
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: null,
            totalVisitors: { $sum: 1 },
            uniqueIPs: { $addToSet: "$realIP" },
            uniqueCountries: { $addToSet: "$countryCode" },
            uniqueSessions: { $addToSet: "$sessionId" },
            totalPageViews: { $sum: 1 },
            avgEngagementTime: { $avg: "$engagement.timeOnPage" },
            avgScrollDepth: { $avg: "$engagement.scrollDepth" },
            mobileVisitors: {
              $sum: { $cond: [{ $eq: ["$device.type", "mobile"] }, 1, 0] }
            },
            desktopVisitors: {
              $sum: { $cond: [{ $eq: ["$device.type", "desktop"] }, 1, 0] }
            },
            tabletVisitors: {
              $sum: { $cond: [{ $eq: ["$device.type", "tablet"] }, 1, 0] }
            },
            botVisitors: {
              $sum: { $cond: [{ $eq: ["$isBot", true] }, 1, 0] }
            },
            returningVisitors: {
              $sum: { $cond: [{ $eq: ["$visit.isReturning", true] }, 1, 0] }
            },
            newVisitors: {
              $sum: { $cond: [{ $eq: ["$visit.isFirstVisit", true] }, 1, 0] }
            }
          }
        },
        {
          $project: {
            _id: 0,
            totalVisitors: 1,
            uniqueVisitors: { $size: "$uniqueIPs" },
            uniqueCountries: { $size: "$uniqueCountries" },
            uniqueSessions: { $size: "$uniqueSessions" },
            totalPageViews: 1,
            avgEngagementTime: { $round: ["$avgEngagementTime", 2] },
            avgScrollDepth: { $round: ["$avgScrollDepth", 2] },
            deviceBreakdown: {
              mobile: "$mobileVisitors",
              desktop: "$desktopVisitors",
              tablet: "$tabletVisitors"
            },
            visitorTypes: {
              returning: "$returningVisitors",
              new: "$newVisitors",
              bots: "$botVisitors"
            },
            bounceRate: {
              $round: [
                {
                  $multiply: [
                    { $divide: ["$botVisitors", "$totalVisitors"] },
                    100
                  ]
                },
                2
              ]
            }
          }
        }
      ];

      const result = await Visitor.aggregate(pipeline);
      return result[0] || {};
    } catch (error) {
      console.error("Enhanced Visitor Service - Analytics Overview Error:", error);
      throw error;
    }
  }

  /**
   * Get URL performance analytics
   */
  static async getUrlAnalytics(dateRange = 30, limit = 50) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);

      const pipeline = [
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: "$path",
            visits: { $sum: 1 },
            uniqueVisitors: { $addToSet: "$realIP" },
            uniqueCountries: { $addToSet: "$countryCode" },
            avgEngagementTime: { $avg: "$engagement.timeOnPage" },
            avgScrollDepth: { $avg: "$engagement.scrollDepth" },
            totalClicks: { $sum: "$engagement.clickCount" },
            bounces: {
              $sum: {
                $cond: [
                  { $and: [
                    { $lte: ["$engagement.timeOnPage", 3000] }, // Less than 3 seconds
                    { $lte: ["$engagement.scrollDepth", 25] }   // Less than 25% scroll
                  ]},
                  1,
                  0
                ]
              }
            },
            lastVisit: { $max: "$createdAt" },
            firstVisit: { $min: "$createdAt" },
            topReferrers: { $addToSet: "$referrerDomain" },
            deviceTypes: { $addToSet: "$device.type" },
            browsers: { $addToSet: "$browser.name" }
          }
        },
        {
          $project: {
            url: "$_id",
            visits: 1,
            uniqueVisitors: { $size: "$uniqueVisitors" },
            uniqueCountries: { $size: "$uniqueCountries" },
            avgEngagementTime: { $round: ["$avgEngagementTime", 2] },
            avgScrollDepth: { $round: ["$avgScrollDepth", 2] },
            totalClicks: 1,
            bounceRate: {
              $round: [
                { $multiply: [{ $divide: ["$bounces", "$visits"] }, 100] },
                2
              ]
            },
            lastVisit: 1,
            firstVisit: 1,
            topReferrers: { $slice: ["$topReferrers", 5] },
            deviceTypes: 1,
            browsers: 1,
            pageType: {
              $switch: {
                branches: [
                  { case: { $regexMatch: { input: "$url", regex: /^\/engage/ } }, then: "engagement" },
                  { case: { $regexMatch: { input: "$url", regex: /^\/initiatives/ } }, then: "initiatives" },
                  { case: { $regexMatch: { input: "$url", regex: /^\/about/ } }, then: "about" },
                  { case: { $regexMatch: { input: "$url", regex: /^\/blog/ } }, then: "blog" },
                  { case: { $eq: ["$url", "/"] }, then: "homepage" }
                ],
                default: "other"
              }
            }
          }
        },
        { $sort: { visits: -1 } },
        { $limit: limit }
      ];

      const result = await Visitor.aggregate(pipeline);
      return result;
    } catch (error) {
      console.error("Enhanced Visitor Service - URL Analytics Error:", error);
      throw error;
    }
  }

  /**
   * Enhanced Top Pages Analytics with Hourly/Daily Trends
   */
  static async getEnhancedTopPagesAnalytics(dateRange = 30, timeUnit = 'daily', limit = 20) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);

      let dateFormat, timeGroup;
      if (timeUnit === 'hourly') {
        dateFormat = "%Y-%m-%d %H:00";
        timeGroup = {
          hour: { $hour: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" }
        };
      } else {
        dateFormat = "%Y-%m-%d";
        timeGroup = {
          day: { $dayOfMonth: "$createdAt" },
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" }
        };
      }

      // Get trending pages with time-series data
      const trendingPagesPipeline = [
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              path: "$path",
              timeFrame: { $dateToString: { format: dateFormat, date: "$createdAt" } },
              ...timeGroup
            },
            visits: { $sum: 1 },
            uniqueVisitors: { $addToSet: "$realIP" },
            uniqueSessions: { $addToSet: "$sessionId" },
            avgEngagementTime: { $avg: "$engagement.timeOnPage" },
            avgScrollDepth: { $avg: "$engagement.scrollDepth" },
            totalEngagementTime: { $sum: "$engagement.timeOnPage" },
            clickCount: { $sum: "$engagement.clickCount" },
            countries: { $addToSet: "$countryCode" },
            devices: { $addToSet: "$device.type" },
            browsers: { $addToSet: "$browser.name" },
            trafficSources: { $addToSet: "$utm.source" },
            referrerTypes: { $addToSet: "$referrerType" },
            bounces: {
              $sum: {
                $cond: [
                  { $and: [
                    { $lt: ["$engagement.timeOnPage", 3000] },
                    { $lt: ["$engagement.scrollDepth", 25] }
                  ]},
                  1, 0
                ]
              }
            },
            newVisitors: {
              $sum: {
                $cond: [{ $eq: ["$visit.isFirstVisit", true] }, 1, 0]
              }
            },
            returningVisitors: {
              $sum: {
                $cond: [{ $eq: ["$visit.isReturning", true] }, 1, 0]
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            path: "$_id.path",
            timeFrame: "$_id.timeFrame",
            timestamp: { $dateFromString: { dateString: "$_id.timeFrame" } },
            visits: 1,
            uniqueVisitors: { $size: "$uniqueVisitors" },
            uniqueSessions: { $size: "$uniqueSessions" },
            avgEngagementTime: { $round: ["$avgEngagementTime", 2] },
            avgScrollDepth: { $round: ["$avgScrollDepth", 2] },
            totalEngagementTime: { $round: ["$totalEngagementTime", 2] },
            clickCount: 1,
            countriesReached: { $size: "$countries" },
            deviceTypes: 1,
            browsers: 1,
            trafficSources: { $filter: { input: "$trafficSources", cond: { $ne: ["$$this", null] } } },
            referrerTypes: 1,
            bounceRate: {
              $round: [
                { $multiply: [{ $divide: ["$bounces", "$visits"] }, 100] },
                2
              ]
            },
            newVisitorRate: {
              $round: [
                { $multiply: [{ $divide: ["$newVisitors", "$visits"] }, 100] },
                2
              ]
            },
            engagementScore: {
              $round: [
                {
                  $multiply: [
                    { $add: ["$visits", { $multiply: ["$uniqueVisitors", 2] }] },
                    { $divide: ["$avgEngagementTime", 30000] },
                    { $divide: ["$avgScrollDepth", 100] }
                  ]
                },
                2
              ]
            }
          }
        },
        { $sort: { timestamp: 1, path: 1 } }
      ];

      const timeSeriesData = await Visitor.aggregate(trendingPagesPipeline);

      // Get top pages summary with overall metrics
      const topPagesSummaryPipeline = [
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: "$path",
            totalVisits: { $sum: 1 },
            uniqueVisitors: { $addToSet: "$realIP" },
            uniqueSessions: { $addToSet: "$sessionId" },
            totalEngagementTime: { $sum: "$engagement.timeOnPage" },
            avgEngagementTime: { $avg: "$engagement.timeOnPage" },
            avgScrollDepth: { $avg: "$engagement.scrollDepth" },
            totalClicks: { $sum: "$engagement.clickCount" },
            firstVisit: { $min: "$createdAt" },
            lastVisit: { $max: "$createdAt" },
            countries: { $addToSet: "$countryCode" },
            devices: { $addToSet: "$device.type" },
            browsers: { $addToSet: "$browser.name" },
            topReferrers: { $addToSet: "$referrerDomain" },
            utmSources: { $addToSet: "$utm.source" },
            bounces: {
              $sum: {
                $cond: [
                  { $and: [
                    { $lt: ["$engagement.timeOnPage", 3000] },
                    { $lt: ["$engagement.scrollDepth", 25] }
                  ]},
                  1, 0
                ]
              }
            },
            newVisitors: {
              $sum: {
                $cond: [{ $eq: ["$visit.isFirstVisit", true] }, 1, 0]
              }
            },
            performanceMetrics: {
              $push: {
                loadTime: "$performance.pageLoadTime",
                dnsTime: "$performance.dnsTime",
                connectTime: "$performance.connectTime"
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            path: "$_id",
            totalVisits: 1,
            uniqueVisitors: { $size: "$uniqueVisitors" },
            uniqueSessions: { $size: "$uniqueSessions" },
            totalEngagementTime: { $round: ["$totalEngagementTime", 2] },
            avgEngagementTime: { $round: ["$avgEngagementTime", 2] },
            avgScrollDepth: { $round: ["$avgScrollDepth", 2] },
            totalClicks: 1,
            firstVisit: 1,
            lastVisit: 1,
            daysSinceFirstVisit: {
              $round: [
                { $divide: [{ $subtract: [new Date(), "$firstVisit"] }, 86400000] },
                1
              ]
            },
            countriesReached: { $size: "$countries" },
            deviceTypes: 1,
            browsers: { $slice: ["$browsers", 5] },
            topReferrers: { 
              $slice: [
                { $filter: { input: "$topReferrers", cond: { $ne: ["$$this", null] } } },
                5
              ]
            },
            trafficSources: { 
              $slice: [
                { $filter: { input: "$utmSources", cond: { $ne: ["$$this", null] } } },
                5
              ]
            },
            bounceRate: {
              $round: [
                { $multiply: [{ $divide: ["$bounces", "$totalVisits"] }, 100] },
                2
              ]
            },
            newVisitorRate: {
              $round: [
                { $multiply: [{ $divide: ["$newVisitors", "$totalVisits"] }, 100] },
                2
              ]
            },
            popularityScore: {
              $round: [
                {
                  $add: [
                    { $multiply: ["$totalVisits", 1] },
                    { $multiply: ["$uniqueVisitors", 3] },
                    { $multiply: [{ $divide: ["$avgEngagementTime", 1000] }, 2] },
                    { $multiply: ["$avgScrollDepth", 0.1] }
                  ]
                },
                2
              ]
            },
            pageType: {
              $switch: {
                branches: [
                  { case: { $regexMatch: { input: "$path", regex: /^\/$/ } }, then: "homepage" },
                  { case: { $regexMatch: { input: "$path", regex: /^\/engage/ } }, then: "engagement" },
                  { case: { $regexMatch: { input: "$path", regex: /^\/initiatives/ } }, then: "initiatives" },
                  { case: { $regexMatch: { input: "$path", regex: /^\/about/ } }, then: "about" },
                  { case: { $regexMatch: { input: "$path", regex: /^\/blog/ } }, then: "blog" },
                  { case: { $regexMatch: { input: "$path", regex: /^\/contact/ } }, then: "contact" }
                ],
                default: "other"
              }
            },
            avgPerformance: {
              $let: {
                vars: {
                  validMetrics: {
                    $filter: {
                      input: "$performanceMetrics",
                      cond: { $gt: ["$$this.loadTime", 0] }
                    }
                  }
                },
                in: {
                  $cond: [
                    { $gt: [{ $size: "$$validMetrics" }, 0] },
                    {
                      avgLoadTime: { $round: [{ $avg: "$$validMetrics.loadTime" }, 2] },
                      avgDnsTime: { $round: [{ $avg: "$$validMetrics.dnsTime" }, 2] },
                      avgConnectTime: { $round: [{ $avg: "$$validMetrics.connectTime" }, 2] }
                    },
                    null
                  ]
                }
              }
            }
          }
        },
        { $sort: { popularityScore: -1 } },
        { $limit: limit }
      ];

      const topPagesData = await Visitor.aggregate(topPagesSummaryPipeline);

      // Calculate trends for each top page
      const pageNames = topPagesData.map(page => page.path);
      const trendsMap = new Map();

      // Group time series data by page
      timeSeriesData.forEach(item => {
        if (pageNames.includes(item.path)) {
          if (!trendsMap.has(item.path)) {
            trendsMap.set(item.path, []);
          }
          trendsMap.get(item.path).push(item);
        }
      });

      // Add trends to top pages data
      const enrichedTopPages = topPagesData.map(page => ({
        ...page,
        trends: trendsMap.get(page.path) || [],
        trendAnalysis: this.calculatePageTrends(trendsMap.get(page.path) || [])
      }));

      return {
        topPages: enrichedTopPages,
        timeSeriesData,
        meta: {
          dateRange,
          timeUnit,
          totalPages: enrichedTopPages.length,
          totalDataPoints: timeSeriesData.length,
          topPerformers: enrichedTopPages.slice(0, 5).map(p => ({
            path: p.path,
            visits: p.totalVisits,
            score: p.popularityScore,
            type: p.pageType
          })),
          generatedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error("Enhanced Top Pages Analytics Error:", error);
      throw error;
    }
  }

  /**
   * Calculate page trends from time series data
   */
  static calculatePageTrends(timeSeriesData) {
    if (!timeSeriesData || timeSeriesData.length < 2) {
      return {
        trend: 'stable',
        growthRate: 0,
        volatility: 0
      };
    }

    const sortedData = timeSeriesData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const visits = sortedData.map(d => d.visits);
    
    // Calculate growth rate
    const firstPeriod = visits.slice(0, Math.ceil(visits.length / 2));
    const secondPeriod = visits.slice(Math.ceil(visits.length / 2));
    
    const firstAvg = firstPeriod.reduce((a, b) => a + b, 0) / firstPeriod.length;
    const secondAvg = secondPeriod.reduce((a, b) => a + b, 0) / secondPeriod.length;
    
    const growthRate = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
    
    // Calculate volatility (standard deviation)
    const mean = visits.reduce((a, b) => a + b, 0) / visits.length;
    const variance = visits.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / visits.length;
    const volatility = Math.sqrt(variance);
    
    // Determine trend
    let trend = 'stable';
    if (growthRate > 10) trend = 'growing';
    else if (growthRate < -10) trend = 'declining';
    else if (volatility > mean * 0.5) trend = 'volatile';
    
    return {
      trend,
      growthRate: Math.round(growthRate * 100) / 100,
      volatility: Math.round(volatility * 100) / 100,
      dataPoints: visits.length
    };
  }

  /**
   * Get geographic analytics with enhanced data
   */
  static async getGeographicAnalytics(dateRange = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);

      const pipeline = [
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              country: "$country",
              countryCode: "$countryCode",
              city: "$city"
            },
            visitors: { $sum: 1 },
            uniqueIPs: { $addToSet: "$realIP" },
            avgLatitude: { $avg: "$latitude" },
            avgLongitude: { $avg: "$longitude" },
            topPages: { $addToSet: "$path" },
            topBrowsers: { $addToSet: "$browser.name" },
            deviceTypes: { $addToSet: "$device.type" },
            avgEngagementTime: { $avg: "$engagement.timeOnPage" },
            totalPageViews: { $sum: 1 },
            lastVisit: { $max: "$createdAt" }
          }
        },
        {
          $project: {
            _id: 0,
            country: "$_id.country",
            countryCode: "$_id.countryCode",
            city: "$_id.city",
            visitors: 1,
            uniqueVisitors: { $size: "$uniqueIPs" },
            avgLatitude: { $round: ["$avgLatitude", 6] },
            avgLongitude: { $round: ["$avgLongitude", 6] },
            topPages: { $slice: ["$topPages", 3] },
            topBrowsers: { $slice: ["$topBrowsers", 3] },
            deviceTypes: 1,
            avgEngagementTime: { $round: ["$avgEngagementTime", 2] },
            totalPageViews: 1,
            lastVisit: 1
          }
        },
        { $sort: { visitors: -1 } },
        { $limit: 100 }
      ];

      const result = await Visitor.aggregate(pipeline);

      // Also get country-level summary
      const countryPipeline = [
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              country: "$country",
              countryCode: "$countryCode"
            },
            visitors: { $sum: 1 },
            uniqueVisitors: { $addToSet: "$realIP" },
            cities: { $addToSet: "$city" }
          }
        },
        {
          $project: {
            _id: 0,
            country: "$_id.country",
            countryCode: "$_id.countryCode",
            visitors: 1,
            uniqueVisitors: { $size: "$uniqueVisitors" },
            citiesCount: { $size: "$cities" }
          }
        },
        { $sort: { visitors: -1 } },
        { $limit: 50 }
      ];

      const countryData = await Visitor.aggregate(countryPipeline);

      return {
        cityData: result,
        countryData
      };
    } catch (error) {
      console.error("Enhanced Visitor Service - Geographic Analytics Error:", error);
      throw error;
    }
  }

  /**
   * Enhanced Country Analytics with Time-Series Data and Trends
   */
  static async getEnhancedCountryAnalytics(dateRange = 30, timeUnit = 'daily') {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);

      let dateFormat, timeGroup;
      if (timeUnit === 'hourly') {
        dateFormat = "%Y-%m-%d %H:00";
        timeGroup = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
          hour: { $hour: "$createdAt" }
        };
      } else {
        dateFormat = "%Y-%m-%d";
        timeGroup = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" }
        };
      }

      // Get time-series data by country
      const timeSeriesPipeline = [
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              country: "$country",
              countryCode: "$countryCode",
              timeFrame: { $dateToString: { format: dateFormat, date: "$createdAt" } },
              ...timeGroup
            },
            visitors: { $sum: 1 },
            uniqueVisitors: { $addToSet: "$realIP" },
            sessions: { $addToSet: "$sessionId" },
            pageViews: { $sum: 1 },
            avgEngagementTime: { $avg: "$engagement.timeOnPage" },
            avgScrollDepth: { $avg: "$engagement.scrollDepth" },
            bounces: {
              $sum: {
                $cond: [
                  { $and: [
                    { $lt: ["$engagement.timeOnPage", 3000] },
                    { $lt: ["$engagement.scrollDepth", 25] }
                  ]},
                  1, 0
                ]
              }
            },
            newVisitors: {
              $sum: {
                $cond: [{ $eq: ["$visit.isFirstVisit", true] }, 1, 0]
              }
            },
            returningVisitors: {
              $sum: {
                $cond: [{ $eq: ["$visit.isReturning", true] }, 1, 0]
              }
            },
            topPages: { $addToSet: "$path" },
            browsers: { $addToSet: "$browser.name" },
            devices: { $addToSet: "$device.type" },
            utmSources: { $addToSet: "$utm.source" }
          }
        },
        {
          $project: {
            _id: 0,
            country: "$_id.country",
            countryCode: "$_id.countryCode",
            timeFrame: "$_id.timeFrame",
            timestamp: { $dateFromString: { dateString: "$_id.timeFrame" } },
            visitors: 1,
            uniqueVisitors: { $size: "$uniqueVisitors" },
            uniqueSessions: { $size: "$sessions" },
            pageViews: 1,
            avgEngagementTime: { $round: ["$avgEngagementTime", 2] },
            avgScrollDepth: { $round: ["$avgScrollDepth", 2] },
            bounceRate: {
              $round: [
                { $multiply: [{ $divide: ["$bounces", "$visitors"] }, 100] },
                2
              ]
            },
            newVisitors: 1,
            returningVisitors: 1,
            conversionRate: {
              $round: [
                { $multiply: [{ $divide: ["$returningVisitors", "$visitors"] }, 100] },
                2
              ]
            },
            topPages: { $slice: ["$topPages", 3] },
            browsers: 1,
            devices: 1,
            utmSources: { $filter: { input: "$utmSources", cond: { $ne: ["$$this", null] } } }
          }
        },
        { $sort: { timestamp: 1, country: 1 } }
      ];

      const timeSeriesData = await Visitor.aggregate(timeSeriesPipeline);

      // Get country trends and comparisons
      const trendsPipeline = [
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: "$countryCode",
            country: { $first: "$country" },
            totalVisitors: { $sum: 1 },
            uniqueVisitors: { $addToSet: "$realIP" },
            totalSessions: { $addToSet: "$sessionId" },
            avgEngagementTime: { $avg: "$engagement.timeOnPage" },
            totalEngagementTime: { $sum: "$engagement.timeOnPage" },
            avgScrollDepth: { $avg: "$engagement.scrollDepth" },
            totalPageViews: { $sum: 1 },
            firstVisit: { $min: "$createdAt" },
            lastVisit: { $max: "$createdAt" },
            topCities: {
              $push: {
                city: "$city",
                visitors: 1
              }
            },
            browsers: { $addToSet: "$browser.name" },
            devices: { $addToSet: "$device.type" },
            trafficSources: { $addToSet: "$utm.source" },
            referrerTypes: { $addToSet: "$referrerType" }
          }
        },
        {
          $project: {
            _id: 0,
            countryCode: "$_id",
            country: 1,
            totalVisitors: 1,
            uniqueVisitors: { $size: "$uniqueVisitors" },
            totalSessions: { $size: "$totalSessions" },
            avgEngagementTime: { $round: ["$avgEngagementTime", 2] },
            totalEngagementTime: { $round: ["$totalEngagementTime", 2] },
            avgScrollDepth: { $round: ["$avgScrollDepth", 2] },
            totalPageViews: 1,
            firstVisit: 1,
            lastVisit: 1,
            daysSinceFirstVisit: {
              $divide: [
                { $subtract: [new Date(), "$firstVisit"] },
                86400000
              ]
            },
            topCities: { $slice: ["$topCities", 5] },
            browsers: 1,
            devices: 1,
            trafficSources: { $filter: { input: "$trafficSources", cond: { $ne: ["$$this", null] } } },
            referrerTypes: 1,
            growthPotential: {
              $cond: [
                { $gte: ["$totalVisitors", 100] },
                "high",
                { $cond: [
                  { $gte: ["$totalVisitors", 20] },
                  "medium",
                  "low"
                ]}
              ]
            }
          }
        },
        { $sort: { totalVisitors: -1 } },
        { $limit: 100 }
      ];

      const trendsData = await Visitor.aggregate(trendsPipeline);

      // Calculate growth rates for trending countries
      const growthPipeline = [
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              countryCode: "$countryCode",
              week: { $week: "$createdAt" }
            },
            weeklyVisitors: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: "$_id.countryCode",
            weeklyData: {
              $push: {
                week: "$_id.week",
                visitors: "$weeklyVisitors"
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            countryCode: "$_id",
            weeklyGrowth: {
              $let: {
                vars: {
                  sortedWeeks: { $sortArray: { input: "$weeklyData", sortBy: { week: 1 } } }
                },
                in: {
                  $cond: [
                    { $gte: [{ $size: "$$sortedWeeks" }, 2] },
                    {
                      $multiply: [
                        {
                          $divide: [
                            {
                              $subtract: [
                                { $arrayElemAt: ["$$sortedWeeks.visitors", -1] },
                                { $arrayElemAt: ["$$sortedWeeks.visitors", 0] }
                              ]
                            },
                            { $arrayElemAt: ["$$sortedWeeks.visitors", 0] }
                          ]
                        },
                        100
                      ]
                    },
                    0
                  ]
                }
              }
            }
          }
        }
      ];

      const growthData = await Visitor.aggregate(growthPipeline);

      // Merge growth data with trends
      const growthMap = new Map(growthData.map(item => [item.countryCode, item.weeklyGrowth]));
      trendsData.forEach(country => {
        country.weeklyGrowthRate = Math.round((growthMap.get(country.countryCode) || 0) * 100) / 100;
      });

      return {
        timeSeriesData,
        countryTrends: trendsData,
        meta: {
          dateRange,
          timeUnit,
          totalCountries: trendsData.length,
          totalDataPoints: timeSeriesData.length,
          topCountries: trendsData.slice(0, 10).map(c => ({
            country: c.country,
            countryCode: c.countryCode,
            visitors: c.totalVisitors,
            growth: c.weeklyGrowthRate
          })),
          generatedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error("Enhanced Country Analytics Error:", error);
      throw error;
    }
  }

  /**
   * Get traffic source analytics
   */
  static async getTrafficSourceAnalytics(dateRange = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);

      const pipeline = [
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              source: { $ifNull: ["$utm.source", "$referrerType"] },
              medium: "$utm.medium",
              campaign: "$utm.campaign",
              referrerDomain: "$referrerDomain"
            },
            visitors: { $sum: 1 },
            uniqueVisitors: { $addToSet: "$realIP" },
            avgEngagementTime: { $avg: "$engagement.timeOnPage" },
            totalClicks: { $sum: "$engagement.clickCount" },
            conversions: {
              $sum: {
                $cond: [
                  { $and: [
                    { $gte: ["$engagement.timeOnPage", 30000] }, // 30+ seconds
                    { $gte: ["$engagement.scrollDepth", 50] }    // 50%+ scroll
                  ]},
                  1,
                  0
                ]
              }
            },
            topPages: { $addToSet: "$path" },
            countries: { $addToSet: "$countryCode" },
            lastVisit: { $max: "$createdAt" }
          }
        },
        {
          $project: {
            _id: 0,
            source: "$_id.source",
            medium: "$_id.medium",
            campaign: "$_id.campaign",
            referrerDomain: "$_id.referrerDomain",
            visitors: 1,
            uniqueVisitors: { $size: "$uniqueVisitors" },
            avgEngagementTime: { $round: ["$avgEngagementTime", 2] },
            totalClicks: 1,
            conversionRate: {
              $round: [
                { $multiply: [{ $divide: ["$conversions", "$visitors"] }, 100] },
                2
              ]
            },
            topPages: { $slice: ["$topPages", 3] },
            countriesReached: { $size: "$countries" },
            lastVisit: 1
          }
        },
        { $sort: { visitors: -1 } },
        { $limit: 50 }
      ];

      const result = await Visitor.aggregate(pipeline);
      return result;
    } catch (error) {
      console.error("Enhanced Visitor Service - Traffic Source Analytics Error:", error);
      throw error;
    }
  }

  /**
   * Get real-time activity data
   */
  static async getRealTimeActivity(hoursBack = 24) {
    try {
      const startTime = new Date();
      startTime.setHours(startTime.getHours() - hoursBack);

      // Get active visitors
      const activeVisitors = await this.getActiveVisitors(30);

      // Get hourly activity breakdown
      const hourlyPipeline = [
        { $match: { createdAt: { $gte: startTime } } },
        {
          $group: {
            _id: {
              hour: { $hour: "$createdAt" },
              date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
            },
            visitors: { $sum: 1 },
            uniqueVisitors: { $addToSet: "$realIP" },
            pageViews: { $sum: 1 },
            countries: { $addToSet: "$countryCode" }
          }
        },
        {
          $project: {
            _id: 0,
            hour: "$_id.hour",
            date: "$_id.date",
            visitors: 1,
            uniqueVisitors: { $size: "$uniqueVisitors" },
            pageViews: 1,
            countriesCount: { $size: "$countries" }
          }
        },
        { $sort: { date: 1, hour: 1 } }
      ];

      const hourlyActivity = await Visitor.aggregate(hourlyPipeline);

      // Get top pages in the last hour
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      const topPagesPipeline = [
        { $match: { createdAt: { $gte: oneHourAgo } } },
        {
          $group: {
            _id: "$path",
            visitors: { $sum: 1 },
            uniqueVisitors: { $addToSet: "$realIP" }
          }
        },
        {
          $project: {
            _id: 0,
            path: "$_id",
            visitors: 1,
            uniqueVisitors: { $size: "$uniqueVisitors" }
          }
        },
        { $sort: { visitors: -1 } },
        { $limit: 10 }
      ];

      const topPages = await Visitor.aggregate(topPagesPipeline);

      // Get recent events
      const recentEvents = await Visitor.find({
        createdAt: { $gte: oneHourAgo },
        eventType: { $exists: true }
      })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('eventType eventName path country city createdAt')
      .lean();

      return {
        activeVisitors: activeVisitors.length,
        activeVisitorsList: activeVisitors.slice(0, 10), // Top 10 for display
        hourlyActivity,
        topPages,
        recentEvents,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error("Enhanced Visitor Service - Real Time Activity Error:", error);
      throw error;
    }
  }

  /**
   * Enhanced Session Tracking by Browser with Hourly/Daily Breakdown
   */
  static async getSessionTrackingByBrowser(dateRange = 30, timeUnit = 'hourly') {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);

      let dateFormat, groupBy;
      if (timeUnit === 'hourly') {
        dateFormat = "%Y-%m-%d %H:00";
        groupBy = {
          date: { $dateToString: { format: dateFormat, date: "$createdAt" } },
          browser: "$browser.name",
          browserVersion: "$browser.version"
        };
      } else {
        dateFormat = "%Y-%m-%d";
        groupBy = {
          date: { $dateToString: { format: dateFormat, date: "$createdAt" } },
          browser: "$browser.name",
          browserVersion: "$browser.version"
        };
      }

      const sessionPipeline = [
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: groupBy,
            sessions: { $addToSet: "$sessionId" },
            visitors: { $sum: 1 },
            uniqueIPs: { $addToSet: "$realIP" },
            avgSessionDuration: { $avg: "$status.sessionDuration" },
            totalEngagementTime: { $sum: "$engagement.timeOnPage" },
            avgScrollDepth: { $avg: "$engagement.scrollDepth" },
            countries: { $addToSet: "$countryCode" },
            devices: { $addToSet: "$device.type" },
            topPages: { $addToSet: "$path" }
          }
        },
        {
          $project: {
            _id: 0,
            date: "$_id.date",
            browser: "$_id.browser",
            browserVersion: "$_id.browserVersion",
            uniqueSessions: { $size: "$sessions" },
            totalVisitors: 1,
            uniqueVisitors: { $size: "$uniqueIPs" },
            avgSessionDuration: { $round: ["$avgSessionDuration", 2] },
            totalEngagementTime: { $round: ["$totalEngagementTime", 2] },
            avgScrollDepth: { $round: ["$avgScrollDepth", 2] },
            countriesReached: { $size: "$countries" },
            deviceTypes: 1,
            topPages: { $slice: ["$topPages", 5] },
            timestamp: { $dateFromString: { dateString: "$_id.date" } }
          }
        },
        { $sort: { timestamp: 1, browser: 1 } }
      ];

      const sessionData = await Visitor.aggregate(sessionPipeline);

      // Get browser summary with trends
      const browserSummaryPipeline = [
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: "$browser.name",
            totalSessions: { $addToSet: "$sessionId" },
            totalVisitors: { $sum: 1 },
            uniqueVisitors: { $addToSet: "$realIP" },
            avgSessionDuration: { $avg: "$status.sessionDuration" },
            avgEngagementTime: { $avg: "$engagement.timeOnPage" },
            marketShare: { $sum: 1 },
            lastSeen: { $max: "$createdAt" },
            versions: { 
              $addToSet: {
                version: "$browser.version",
                count: 1
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            browser: "$_id",
            totalSessions: { $size: "$totalSessions" },
            totalVisitors: 1,
            uniqueVisitors: { $size: "$uniqueVisitors" },
            avgSessionDuration: { $round: ["$avgSessionDuration", 2] },
            avgEngagementTime: { $round: ["$avgEngagementTime", 2] },
            marketShare: 1,
            lastSeen: 1,
            versions: 1
          }
        },
        { $sort: { totalVisitors: -1 } }
      ];

      const browserSummary = await Visitor.aggregate(browserSummaryPipeline);

      // Calculate market share percentages
      const totalMarketShare = browserSummary.reduce((sum, browser) => sum + browser.marketShare, 0);
      browserSummary.forEach(browser => {
        browser.marketSharePercentage = totalMarketShare > 0 ? 
          Math.round((browser.marketShare / totalMarketShare) * 100 * 100) / 100 : 0;
      });

      return {
        timelineData: sessionData,
        browserSummary,
        meta: {
          dateRange,
          timeUnit,
          totalDataPoints: sessionData.length,
          totalBrowsers: browserSummary.length,
          generatedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error("Enhanced Session Tracking by Browser Error:", error);
      throw error;
    }
  }

  /**
   * Create enhanced visitor record with proper data
   */
  static async createEnhancedVisitor(req, visitorData = {}) {
    try {
      // Get comprehensive device and location info using visitor service with fallback
      let deviceAndLocationInfo;
      try {
        deviceAndLocationInfo = await VisitorGeoLocationService.getVisitorDeviceAndLocationInfo(req);
        // DeviceAndLocationInfo success
      } catch (geoError) {
        // GeoLocation service failed, using defaults
        // Provide default values if geolocation service fails
        deviceAndLocationInfo = {
          deviceInfo: {
            realIP: req.ip || 'unknown',
            cdnIP: null,
            userAgent: req.headers['user-agent'] || 'unknown',
            browser: { name: 'Unknown', version: '0', engine: 'unknown' },
            os: { name: 'Unknown', version: '0' },
            device: { type: 'desktop', vendor: 'Unknown', model: 'Unknown' },
            fingerprint: 'fallback-' + Date.now()
          },
          geoLocation: {
            country: 'Unknown',
            countryCode: 'XX',
            region: 'Unknown',
            regionCode: 'XX',
            city: 'Unknown',
            latitude: null,
            longitude: null,
            timezone: 'UTC',
            isp: 'Unknown',
            org: 'Unknown',
            source: 'fallback',
            accuracy: 'none',
            timestamp: Date.now()
          },
          requestMetadata: {}
        };
      }

      // Extract and parse URL properly
      const url = visitorData.url || req.originalUrl || "/";
      const urlObj = new URL(url, "https://example.com");
      const path = urlObj.pathname;

      // Extract UTM parameters
      const utmParams = {
        source: visitorData.utm_source || urlObj.searchParams.get("utm_source") || null,
        medium: visitorData.utm_medium || urlObj.searchParams.get("utm_medium") || null,
        campaign: visitorData.utm_campaign || urlObj.searchParams.get("utm_campaign") || null,
        term: visitorData.utm_term || urlObj.searchParams.get("utm_term") || null,
        content: visitorData.utm_content || urlObj.searchParams.get("utm_content") || null
      };

      // Generate session and visitor IDs
      const sessionId = visitorData.sessionId || this.generateSessionId(
        deviceAndLocationInfo.deviceInfo.realIP, 
        deviceAndLocationInfo.deviceInfo.userAgent
      );
      
      const visitorId = visitorData.visitorId || this.generateVisitorId(
        deviceAndLocationInfo.deviceInfo.realIP,
        deviceAndLocationInfo.deviceInfo.fingerprint
      );

      // Analyze referrer
      const referrer = visitorData.referrer || req.headers.referer || req.headers.referrer || null;
      const referrerInfo = this.analyzeReferrer(referrer);

      // Prepare enhanced visitor data with safe defaults
      const enhancedVisitorData = {
        // Session tracking
        sessionId,
        fingerprint: deviceAndLocationInfo.deviceInfo.fingerprint,
        visitorId,

        // Network & IP - ensure string value
        realIP: deviceAndLocationInfo.deviceInfo.realIP || 'unknown',
        cdnIP: deviceAndLocationInfo.deviceInfo.cdnIP,
        ipType: this.detectIPType(deviceAndLocationInfo.deviceInfo.realIP),

        // Enhanced location data - ensure string values
        country: deviceAndLocationInfo.geoLocation.country || 'Unknown',
        countryCode: deviceAndLocationInfo.geoLocation.countryCode || 'XX',
        region: deviceAndLocationInfo.geoLocation.region || 'Unknown',
        regionCode: deviceAndLocationInfo.geoLocation.regionCode || 'XX',  
        city: deviceAndLocationInfo.geoLocation.city || 'Unknown',
        district: deviceAndLocationInfo.geoLocation.district,
        zipCode: deviceAndLocationInfo.geoLocation.zipCode,
        latitude: deviceAndLocationInfo.geoLocation.latitude,
        longitude: deviceAndLocationInfo.geoLocation.longitude,
        timezone: deviceAndLocationInfo.geoLocation.timezone,

        // Geospatial location for MongoDB
        location: {
          type: 'Point',
          coordinates: [
            deviceAndLocationInfo.geoLocation.longitude || 0, 
            deviceAndLocationInfo.geoLocation.latitude || 0
          ]
        },

        // ISP & Network
        isp: deviceAndLocationInfo.geoLocation.isp,
        org: deviceAndLocationInfo.geoLocation.org,
        as: deviceAndLocationInfo.geoLocation.as,

        // Security flags
        isBot: this.detectBot(deviceAndLocationInfo.deviceInfo.userAgent),
        isProxy: deviceAndLocationInfo.geoLocation.proxy || false,
        isVPN: false,
        isHosting: deviceAndLocationInfo.geoLocation.hosting || false,
        isMobile: deviceAndLocationInfo.geoLocation.mobile || false,

        // Device & Browser
        browser: {
          name: deviceAndLocationInfo.deviceInfo.browser?.name || 'Unknown',
          version: deviceAndLocationInfo.deviceInfo.browser?.version || '0',
          engine: deviceAndLocationInfo.deviceInfo.browser?.engine || 'unknown',
          engineVersion: deviceAndLocationInfo.deviceInfo.browser?.engineVersion || '0'
        },
        os: {
          name: deviceAndLocationInfo.deviceInfo.os?.name || 'Unknown',
          version: deviceAndLocationInfo.deviceInfo.os?.version || '0'
        },
        device: {
          type: deviceAndLocationInfo.deviceInfo.device?.type || 'desktop',
          vendor: deviceAndLocationInfo.deviceInfo.device?.vendor || 'Unknown',
          model: deviceAndLocationInfo.deviceInfo.device?.model || 'Unknown'
        },

        // Screen info (from frontend data)
        screen: {
          width: visitorData.screenResolution ? parseInt(visitorData.screenResolution.split('x')[0]) : null,
          height: visitorData.screenResolution ? parseInt(visitorData.screenResolution.split('x')[1]) : null,
          density: visitorData.screenDensity || null
        },

        // Page & Navigation - ensure string values
        url,
        path,
        domain: urlObj.hostname || 'unknown',
        referrer,
        referrerDomain: referrerInfo.domain || 'direct',
        referrerType: referrerInfo.type,

        // UTM parameters
        utm: utmParams,

        // Technical capabilities
        capabilities: {
          cookieEnabled: visitorData.cookieEnabled !== false,
          javascriptEnabled: visitorData.javascriptEnabled !== false,
          touchSupport: visitorData.touchSupport || false,
          localStorage: visitorData.localStorage || false,
          sessionStorage: visitorData.sessionStorage || false
        },

        // Language - safe string handling
        language: {
          primary: req.headers["accept-language"]?.split(",")[0] || 'en'
        },

        // Performance metrics
        performance: {
          pageLoadTime: visitorData.pageLoadTime || null,
          dnsTime: visitorData.dnsTime || null,
          connectTime: visitorData.connectTime || null
        },

        // Engagement (will be updated by frontend)
        engagement: {
          timeOnPage: 0,
          scrollDepth: 0,
          clickCount: 0
        },

        // Custom events
        eventType: visitorData.eventType || null,
        eventName: visitorData.eventName || null,
        eventData: visitorData.eventData || null,

        // Visit information
        visit: {
          isFirstVisit: true,
          isReturning: false,
          visitNumber: 1,
          sessionNumber: 1
        },

        // Real-time status
        status: {
          isActive: true,
          lastActivity: new Date(),
          heartbeatCount: 1
        },

        // Geolocation source
        geoSource: {
          provider: deviceAndLocationInfo.geoLocation.source || 'fallback',
          accuracy: deviceAndLocationInfo.geoLocation.accuracy || 'none'
        },

        // User agent details
        userAgent: {
          raw: deviceAndLocationInfo.deviceInfo.userAgent
        }
      };

      // Create and save visitor record
      const visitor = new Visitor(enhancedVisitorData);
      await visitor.save();

      // Enhanced visitor tracked successfully

      return visitor;
    } catch (error) {
      console.error("Enhanced Visitor Service - Create Error:", error);
      if (error.name === 'ValidationError') {
        console.error("Validation errors:", Object.keys(error.errors));
        for (let field in error.errors) {
          console.error(`- ${field}: ${error.errors[field].message}`);
        }
      }
      throw error;
    }
  }

  /**
   * Update visitor activity (heartbeat)
   */
  static async updateVisitorActivity(sessionId, activityData = {}) {
    try {
      const updateData = {
        'status.lastActivity': new Date(),
        'status.isActive': true,
        $inc: { 'status.heartbeatCount': 1 }
      };

      // Update engagement data if provided
      if (activityData.scrollDepth) {
        updateData['engagement.scrollDepth'] = Math.max(
          activityData.scrollDepth,
          0 // Keep maximum scroll depth
        );
      }

      if (activityData.timeOnPage) {
        updateData['engagement.timeOnPage'] = activityData.timeOnPage;
      }

      if (activityData.clickCount) {
        updateData['engagement.clickCount'] = activityData.clickCount;
      }

      const visitor = await Visitor.findOneAndUpdate(
        { sessionId, 'status.isActive': true },
        updateData,
        { new: true }
      );

      return visitor;
    } catch (error) {
      console.error("Enhanced Visitor Service - Update Activity Error:", error);
      throw error;
    }
  }

  // === UTILITY METHODS ===

  /**
   * Generate session ID
   */
  static generateSessionId(ip, userAgent) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const hash = crypto.createHash('md5').update(`${ip}-${userAgent}-${timestamp}`).digest('hex').substring(0, 8);
    return `${timestamp}-${random}-${hash}`;
  }

  /**
   * Generate visitor ID
   */
  static generateVisitorId(ip, fingerprint) {
    return crypto.createHash('sha256').update(`${ip}-${fingerprint}`).digest('hex').substring(0, 32);
  }

  /**
   * Detect IP type
   */
  static detectIPType(ip) {
    if (!ip) return 'unknown';
    if (ip.includes(':')) return 'ipv6';
    if (ip.includes('.')) return 'ipv4';
    return 'unknown';
  }

  /**
   * Analyze referrer information
   */
  static analyzeReferrer(referrer) {
    if (!referrer || referrer === '') {
      return { domain: null, type: 'direct' };
    }

    try {
      const url = new URL(referrer);
      const domain = url.hostname.toLowerCase();

      // Categorize referrer type
      let type = 'referral';
      
      if (domain.includes('google.') || domain.includes('bing.') || domain.includes('yahoo.') || domain.includes('duckduckgo.')) {
        type = 'search';
      } else if (domain.includes('facebook.') || domain.includes('twitter.') || domain.includes('linkedin.') || domain.includes('instagram.')) {
        type = 'social';
      } else if (domain.includes('gmail.') || domain.includes('outlook.') || domain.includes('mail.')) {
        type = 'email';
      }

      return { domain, type };
    } catch (error) {
      return { domain: null, type: 'unknown' };
    }
  }

  /**
   * Extract CDN information from request
   */
  static extractCDNInfo(req) {
    const cdn = {};

    if (req.headers['cf-ray']) {
      cdn.provider = 'cloudflare';
      cdn.ray = req.headers['cf-ray'];
      cdn.pop = req.headers['cf-ray']?.split('-')[1];
    } else if (req.headers['x-amz-cf-id']) {
      cdn.provider = 'aws-cloudfront';
      cdn.ray = req.headers['x-amz-cf-id'];
    } else if (req.headers['fastly-ff']) {
      cdn.provider = 'fastly';
    }

    return Object.keys(cdn).length > 0 ? cdn : null;
  }

  /**
   * Detect bot from user agent
   */
  static detectBot(userAgent) {
    if (!userAgent) return false;
    
    const ua = userAgent.toLowerCase();
    const botPatterns = [
      'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python',
      'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider'
    ];
    
    return botPatterns.some(pattern => ua.includes(pattern));
  }

  /**
   * Get visitor by ID
   */
  static async getVisitorById(id) {
    try {
      const visitor = await Visitor.findById(id).lean();
      return visitor;
    } catch (error) {
      console.error("Enhanced Visitor Service - Get By ID Error:", error);
      throw error;
    }
  }

  /**
   * Delete visitor
   */
  static async deleteVisitor(id) {
    try {
      const result = await Visitor.findByIdAndDelete(id);
      return result;
    } catch (error) {
      console.error("Enhanced Visitor Service - Delete Error:", error);
      throw error;
    }
  }

  /**
   * Bulk delete visitors
   */
  static async bulkDeleteVisitors(visitorIds) {
    try {
      const result = await Visitor.deleteMany({
        _id: { $in: visitorIds }
      });
      return result;
    } catch (error) {
      console.error("Enhanced Visitor Service - Bulk Delete Error:", error);
      throw error;
    }
  }

  /**
   * Clean up inactive sessions
   */
  static async cleanupInactiveSessions(minutesThreshold = 60) {
    try {
      const cutoff = new Date(Date.now() - minutesThreshold * 60 * 1000);
      
      const result = await Visitor.updateMany(
        {
          'status.isActive': true,
          'status.lastActivity': { $lt: cutoff }
        },
        {
          $set: { 'status.isActive': false }
        }
      );

      // Cleaned up inactive sessions
      return result;
    } catch (error) {
      console.error("Enhanced Visitor Service - Cleanup Error:", error);
      throw error;
    }
  }

  // ==================== PERFORMANCE MONITORING ==================== //

  /**
   * Get comprehensive performance analytics
   */
  static async getPerformanceAnalytics(dateRange = 30, timeUnit = 'daily') {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);

      let dateFormat, timeGroup;
      if (timeUnit === 'hourly') {
        dateFormat = "%Y-%m-%d %H:00";
        timeGroup = {
          hour: { $hour: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" }
        };
      } else {
        dateFormat = "%Y-%m-%d";
        timeGroup = {
          day: { $dayOfMonth: "$createdAt" },
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" }
        };
      }

      // Performance analytics pipeline
      const performancePipeline = [
        { 
          $match: { 
            createdAt: { $gte: startDate },
            'performance.pageLoadTime': { $exists: true, $gt: 0 }
          } 
        },
        {
          $group: {
            _id: {
              path: "$path",
              timeFrame: { $dateToString: { format: dateFormat, date: "$createdAt" } },
              ...timeGroup
            },
            avgLoadTime: { $avg: "$performance.pageLoadTime" },
            medianLoadTime: { $push: "$performance.pageLoadTime" },
            minLoadTime: { $min: "$performance.pageLoadTime" },
            maxLoadTime: { $max: "$performance.pageLoadTime" },
            avgDnsTime: { $avg: "$performance.dnsTime" },
            avgConnectTime: { $avg: "$performance.connectTime" },
            avgResponseTime: { $avg: "$performance.responseTime" },
            avgDomReadyTime: { $avg: "$performance.domReadyTime" },
            totalRequests: { $sum: 1 },
            slowRequests: {
              $sum: {
                $cond: [{ $gt: ["$performance.pageLoadTime", 3000] }, 1, 0]
              }
            },
            fastRequests: {
              $sum: {
                $cond: [{ $lt: ["$performance.pageLoadTime", 1000] }, 1, 0]
              }
            },
            countries: { $addToSet: "$countryCode" },
            browsers: { $addToSet: "$browser.name" },
            devices: { $addToSet: "$device.type" }
          }
        },
        {
          $project: {
            _id: 0,
            path: "$_id.path",
            timeFrame: "$_id.timeFrame",
            timestamp: { $dateFromString: { dateString: "$_id.timeFrame" } },
            avgLoadTime: { $round: ["$avgLoadTime", 2] },
            medianLoadTime: {
              $let: {
                vars: {
                  sorted: { $sortArray: { input: "$medianLoadTime", sortBy: 1 } },
                  length: { $size: "$medianLoadTime" }
                },
                in: {
                  $cond: [
                    { $eq: [{ $mod: ["$$length", 2] }, 0] },
                    {
                      $divide: [
                        {
                          $add: [
                            { $arrayElemAt: ["$$sorted", { $divide: ["$$length", 2] }] },
                            { $arrayElemAt: ["$$sorted", { $subtract: [{ $divide: ["$$length", 2] }, 1] }] }
                          ]
                        },
                        2
                      ]
                    },
                    { $arrayElemAt: ["$$sorted", { $floor: { $divide: ["$$length", 2] } }] }
                  ]
                }
              }
            },
            minLoadTime: 1,
            maxLoadTime: 1,
            avgDnsTime: { $round: ["$avgDnsTime", 2] },
            avgConnectTime: { $round: ["$avgConnectTime", 2] },
            avgResponseTime: { $round: ["$avgResponseTime", 2] },
            avgDomReadyTime: { $round: ["$avgDomReadyTime", 2] },
            totalRequests: 1,
            slowRequestsPercentage: {
              $round: [
                { $multiply: [{ $divide: ["$slowRequests", "$totalRequests"] }, 100] },
                2
              ]
            },
            fastRequestsPercentage: {
              $round: [
                { $multiply: [{ $divide: ["$fastRequests", "$totalRequests"] }, 100] },
                2
              ]
            },
            performanceScore: {
              $round: [
                {
                  $subtract: [
                    100,
                    {
                      $multiply: [
                        { $divide: ["$avgLoadTime", 5000] },
                        100
                      ]
                    }
                  ]
                },
                1
              ]
            },
            countriesCount: { $size: "$countries" },
            browsersCount: { $size: "$browsers" },
            devicesCount: { $size: "$devices" }
          }
        },
        { $sort: { timestamp: 1, path: 1 } }
      ];

      const performanceData = await Visitor.aggregate(performancePipeline);

      // Get overall performance summary
      const summaryPipeline = [
        { 
          $match: { 
            createdAt: { $gte: startDate },
            'performance.pageLoadTime': { $exists: true, $gt: 0 }
          } 
        },
        {
          $group: {
            _id: null,
            totalRequests: { $sum: 1 },
            avgLoadTime: { $avg: "$performance.pageLoadTime" },
            medianLoadTime: { $push: "$performance.pageLoadTime" },
            p95LoadTime: { $push: "$performance.pageLoadTime" },
            p99LoadTime: { $push: "$performance.pageLoadTime" },
            avgDnsTime: { $avg: "$performance.dnsTime" },
            avgConnectTime: { $avg: "$performance.connectTime" },
            avgResponseTime: { $avg: "$performance.responseTime" },
            slowPages: {
              $sum: {
                $cond: [{ $gt: ["$performance.pageLoadTime", 3000] }, 1, 0]
              }
            },
            fastPages: {
              $sum: {
                $cond: [{ $lt: ["$performance.pageLoadTime", 1000] }, 1, 0]
              }
            },
            uniquePages: { $addToSet: "$path" },
            performanceByBrowser: {
              $push: {
                browser: "$browser.name",
                loadTime: "$performance.pageLoadTime"
              }
            },
            performanceByDevice: {
              $push: {
                device: "$device.type",
                loadTime: "$performance.pageLoadTime"
              }
            },
            performanceByCountry: {
              $push: {
                country: "$countryCode",
                loadTime: "$performance.pageLoadTime"
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            totalRequests: 1,
            avgLoadTime: { $round: ["$avgLoadTime", 2] },
            medianLoadTime: {
              $let: {
                vars: {
                  sorted: { $sortArray: { input: "$medianLoadTime", sortBy: 1 } },
                  length: { $size: "$medianLoadTime" }
                },
                in: {
                  $round: [
                    {
                      $cond: [
                        { $eq: [{ $mod: ["$$length", 2] }, 0] },
                        {
                          $divide: [
                            {
                              $add: [
                                { $arrayElemAt: ["$$sorted", { $divide: ["$$length", 2] }] },
                                { $arrayElemAt: ["$$sorted", { $subtract: [{ $divide: ["$$length", 2] }, 1] }] }
                              ]
                            },
                            2
                          ]
                        },
                        { $arrayElemAt: ["$$sorted", { $floor: { $divide: ["$$length", 2] } }] }
                      ]
                    },
                    2
                  ]
                }
              }
            },
            p95LoadTime: {
              $round: [
                {
                  $arrayElemAt: [
                    { $sortArray: { input: "$p95LoadTime", sortBy: 1 } },
                    { $floor: { $multiply: [{ $size: "$p95LoadTime" }, 0.95] } }
                  ]
                },
                2
              ]
            },
            p99LoadTime: {
              $round: [
                {
                  $arrayElemAt: [
                    { $sortArray: { input: "$p99LoadTime", sortBy: 1 } },
                    { $floor: { $multiply: [{ $size: "$p99LoadTime" }, 0.99] } }
                  ]
                },
                2
              ]
            },
            avgDnsTime: { $round: ["$avgDnsTime", 2] },
            avgConnectTime: { $round: ["$avgConnectTime", 2] },
            avgResponseTime: { $round: ["$avgResponseTime", 2] },
            slowPagesPercentage: {
              $round: [
                { $multiply: [{ $divide: ["$slowPages", "$totalRequests"] }, 100] },
                2
              ]
            },
            fastPagesPercentage: {
              $round: [
                { $multiply: [{ $divide: ["$fastPages", "$totalRequests"] }, 100] },
                2
              ]
            },
            overallPerformanceScore: {
              $round: [
                {
                  $subtract: [
                    100,
                    {
                      $multiply: [
                        { $divide: ["$avgLoadTime", 5000] },
                        100
                      ]
                    }
                  ]
                },
                1
              ]
            },
            uniquePagesCount: { $size: "$uniquePages" },
            performanceByBrowser: 1,
            performanceByDevice: 1,
            performanceByCountry: 1
          }
        }
      ];

      const summary = await Visitor.aggregate(summaryPipeline);

      return {
        timeSeriesData: performanceData,
        summary: summary[0] || {},
        meta: {
          dateRange,
          timeUnit,
          totalDataPoints: performanceData.length,
          generatedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error("Performance Analytics Error:", error);
      throw error;
    }
  }

  /**
   * Get slow pages detection and alerts
   */
  static async getSlowPagesDetection(thresholdMs = 3000, dateRange = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);

      const slowPagesPipeline = [
        {
          $match: {
            createdAt: { $gte: startDate },
            'performance.pageLoadTime': { $gt: thresholdMs }
          }
        },
        {
          $group: {
            _id: "$path",
            slowLoadCount: { $sum: 1 },
            avgLoadTime: { $avg: "$performance.pageLoadTime" },
            maxLoadTime: { $max: "$performance.pageLoadTime" },
            minLoadTime: { $min: "$performance.pageLoadTime" },
            affectedCountries: { $addToSet: "$countryCode" },
            affectedBrowsers: { $addToSet: "$browser.name" },
            affectedDevices: { $addToSet: "$device.type" },
            recentSlowLoads: {
              $push: {
                timestamp: "$createdAt",
                loadTime: "$performance.pageLoadTime",
                country: "$country",
                browser: "$browser.name",
                device: "$device.type",
                ip: "$realIP"
              }
            },
            totalRequests: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            path: "$_id",
            slowLoadCount: 1,
            avgLoadTime: { $round: ["$avgLoadTime", 2] },
            maxLoadTime: 1,
            minLoadTime: 1,
            affectedCountriesCount: { $size: "$affectedCountries" },
            affectedBrowsersCount: { $size: "$affectedBrowsers" },
            affectedDevicesCount: { $size: "$affectedDevices" },
            recentSlowLoads: { $slice: [{ $sortArray: { input: "$recentSlowLoads", sortBy: { timestamp: -1 } } }, 10] },
            severity: {
              $switch: {
                branches: [
                  { case: { $gt: ["$avgLoadTime", 5000] }, then: "critical" },
                  { case: { $gt: ["$avgLoadTime", 4000] }, then: "high" },
                  { case: { $gt: ["$avgLoadTime", 3000] }, then: "medium" }
                ],
                default: "low"
              }
            },
            impactScore: {
              $round: [
                {
                  $multiply: [
                    { $add: ["$slowLoadCount", { $multiply: [{ $divide: ["$avgLoadTime", 1000] }, 10] }] },
                    { $size: "$affectedCountries" }
                  ]
                },
                2
              ]
            }
          }
        },
        { $sort: { impactScore: -1 } },
        { $limit: 50 }
      ];

      const slowPages = await Visitor.aggregate(slowPagesPipeline);

      // Get performance trends
      const trendsPipeline = [
        {
          $match: {
            createdAt: { $gte: startDate },
            'performance.pageLoadTime': { $exists: true, $gt: 0 }
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
            },
            avgLoadTime: { $avg: "$performance.pageLoadTime" },
            slowRequestsCount: {
              $sum: {
                $cond: [{ $gt: ["$performance.pageLoadTime", thresholdMs] }, 1, 0]
              }
            },
            totalRequests: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            date: "$_id.date",
            avgLoadTime: { $round: ["$avgLoadTime", 2] },
            slowRequestsPercentage: {
              $round: [
                { $multiply: [{ $divide: ["$slowRequestsCount", "$totalRequests"] }, 100] },
                2
              ]
            }
          }
        },
        { $sort: { date: 1 } }
      ];

      const trends = await Visitor.aggregate(trendsPipeline);

      return {
        slowPages,
        trends,
        thresholdMs,
        dateRange,
        summary: {
          totalSlowPages: slowPages.length,
          criticalPages: slowPages.filter(p => p.severity === 'critical').length,
          highImpactPages: slowPages.filter(p => p.impactScore > 100).length
        }
      };
    } catch (error) {
      console.error("Slow Pages Detection Error:", error);
      throw error;
    }
  }

  /**
   * Get Core Web Vitals analytics
   */
  static async getCoreWebVitals(dateRange = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);

      // Simulate Core Web Vitals from performance data
      const coreWebVitalsPipeline = [
        {
          $match: {
            createdAt: { $gte: startDate },
            'performance.pageLoadTime': { $exists: true, $gt: 0 }
          }
        },
        {
          $addFields: {
            // Simulate LCP (Largest Contentful Paint) - estimate based on load time
            lcp: { $multiply: ["$performance.pageLoadTime", 0.7] },
            // Simulate FID (First Input Delay) - estimate based on dom ready time
            fid: { $ifNull: [{ $subtract: ["$performance.domReadyTime", "$performance.pageLoadTime"] }, 100] },
            // Simulate CLS (Cumulative Layout Shift) - random simulation for now
            cls: { $divide: [{ $mod: [{ $toLong: "$_id" }, 100] }, 1000] }
          }
        },
        {
          $group: {
            _id: "$path",
            visits: { $sum: 1 },
            avgLCP: { $avg: "$lcp" },
            avgFID: { $avg: "$fid" },
            avgCLS: { $avg: "$cls" },
            goodLCP: {
              $sum: {
                $cond: [{ $lte: ["$lcp", 2500] }, 1, 0]
              }
            },
            goodFID: {
              $sum: {
                $cond: [{ $lte: ["$fid", 100] }, 1, 0]
              }
            },
            goodCLS: {
              $sum: {
                $cond: [{ $lte: ["$cls", 0.1] }, 1, 0]
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            path: "$_id",
            visits: 1,
            avgLCP: { $round: ["$avgLCP", 2] },
            avgFID: { $round: ["$avgFID", 2] },
            avgCLS: { $round: ["$avgCLS", 3] },
            lcpScore: {
              $round: [
                { $multiply: [{ $divide: ["$goodLCP", "$visits"] }, 100] },
                1
              ]
            },
            fidScore: {
              $round: [
                { $multiply: [{ $divide: ["$goodFID", "$visits"] }, 100] },
                1
              ]
            },
            clsScore: {
              $round: [
                { $multiply: [{ $divide: ["$goodCLS", "$visits"] }, 100] },
                1
              ]
            },
            overallScore: {
              $round: [
                {
                  $divide: [
                    {
                      $add: [
                        { $multiply: [{ $divide: ["$goodLCP", "$visits"] }, 100] },
                        { $multiply: [{ $divide: ["$goodFID", "$visits"] }, 100] },
                        { $multiply: [{ $divide: ["$goodCLS", "$visits"] }, 100] }
                      ]
                    },
                    3
                  ]
                },
                1
              ]
            }
          }
        },
        { $sort: { visits: -1 } },
        { $limit: 20 }
      ];

      const coreWebVitals = await Visitor.aggregate(coreWebVitalsPipeline);

      return {
        pages: coreWebVitals,
        summary: {
          totalPages: coreWebVitals.length,
          avgOverallScore: coreWebVitals.length > 0 ? 
            Math.round(coreWebVitals.reduce((sum, page) => sum + page.overallScore, 0) / coreWebVitals.length) : 0,
          goodPages: coreWebVitals.filter(p => p.overallScore >= 75).length,
          needsImprovement: coreWebVitals.filter(p => p.overallScore >= 50 && p.overallScore < 75).length,
          poorPages: coreWebVitals.filter(p => p.overallScore < 50).length
        },
        dateRange,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error("Core Web Vitals Error:", error);
      throw error;
    }
  }

  // ==================== VISITOR JOURNEY TRACKING ==================== //

  /**
   * Get visitor journey analytics - track user flow across pages
   */
  static async getVisitorJourneyAnalytics(dateRange = 30, limit = 100) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);

      // Get user sessions and their page flows
      const journeyPipeline = [
        { 
          $match: { 
            createdAt: { $gte: startDate },
            sessionId: { $exists: true }
          } 
        },
        {
          $group: {
            _id: "$sessionId",
            pages: {
              $push: {
                path: "$path",
                timestamp: "$createdAt",
                timeOnPage: "$engagement.timeOnPage",
                scrollDepth: "$engagement.scrollDepth",
                clickCount: "$engagement.clickCount",
                country: "$country",
                browser: "$browser.name",
                device: "$device.type",
                referrer: "$referrerDomain",
                utm: "$utm"
              }
            },
            totalPages: { $sum: 1 },
            sessionDuration: { $max: { $subtract: ["$status.lastActivity", "$createdAt"] } },
            country: { $first: "$country" },
            browser: { $first: "$browser.name" },
            device: { $first: "$device.type" },
            entryPage: { $first: "$path" },
            exitPage: { $last: "$path" },
            totalEngagement: { $sum: "$engagement.timeOnPage" },
            totalScrollDepth: { $avg: "$engagement.scrollDepth" },
            isBot: { $first: "$isBot" }
          }
        },
        {
          $match: {
            isBot: { $ne: true },
            totalPages: { $gte: 1 }
          }
        },
        {
          $addFields: {
            sortedPages: {
              $sortArray: { input: "$pages", sortBy: { timestamp: 1 } }
            },
            engagementScore: {
              $add: [
                { $multiply: ["$totalPages", 10] },
                { $divide: ["$totalEngagement", 1000] },
                { $multiply: ["$totalScrollDepth", 0.1] }
              ]
            }
          }
        },
        {
          $project: {
            _id: 0,
            sessionId: "$_id",
            pages: "$sortedPages",
            totalPages: 1,
            sessionDurationMinutes: { $round: [{ $divide: ["$sessionDuration", 60000] }, 2] },
            country: 1,
            browser: 1,
            device: 1,
            entryPage: 1,
            exitPage: 1,
            avgTimePerPage: { $round: [{ $divide: ["$totalEngagement", "$totalPages"] }, 2] },
            avgScrollDepth: { $round: ["$totalScrollDepth", 2] },
            engagementScore: { $round: ["$engagementScore", 2] },
            journeyType: {
              $switch: {
                branches: [
                  { case: { $eq: ["$totalPages", 1] }, then: "single-page" },
                  { case: { $and: [{ $gte: ["$totalPages", 2] }, { $lte: ["$totalPages", 3] }] }, then: "short-journey" },
                  { case: { $and: [{ $gte: ["$totalPages", 4] }, { $lte: ["$totalPages", 7] }] }, then: "medium-journey" },
                  { case: { $gte: ["$totalPages", 8] }, then: "long-journey" }
                ],
                default: "unknown"
              }
            }
          }
        },
        { $sort: { engagementScore: -1 } },
        { $limit: limit }
      ];

      const journeys = await Visitor.aggregate(journeyPipeline);

      // Get most common paths (funnels)
      const pathsPipeline = [
        { 
          $match: { 
            createdAt: { $gte: startDate },
            sessionId: { $exists: true }
          } 
        },
        {
          $group: {
            _id: "$sessionId",
            pages: {
              $push: {
                path: "$path",
                timestamp: "$createdAt"
              }
            }
          }
        },
        {
          $addFields: {
            sortedPages: {
              $sortArray: { input: "$pages", sortBy: { timestamp: 1 } }
            }
          }
        },
        {
          $addFields: {
            pathSequence: {
              $reduce: {
                input: "$sortedPages",
                initialValue: "",
                in: {
                  $concat: [
                    "$$value",
                    { $cond: [{ $eq: ["$$value", ""] }, "", " → "] },
                    "$$this.path"
                  ]
                }
              }
            }
          }
        },
        {
          $group: {
            _id: "$pathSequence",
            count: { $sum: 1 },
            sessions: { $addToSet: "$_id" }
          }
        },
        {
          $project: {
            _id: 0,
            pathSequence: "$_id",
            count: 1,
            percentage: {
              $round: [
                { $multiply: [{ $divide: ["$count", { $sum: "$count" }] }, 100] },
                2
              ]
            }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 20 }
      ];

      const commonPaths = await Visitor.aggregate(pathsPipeline);

      // Get entry and exit page analytics
      const entryExitPipeline = [
        { 
          $match: { 
            createdAt: { $gte: startDate },
            sessionId: { $exists: true }
          } 
        },
        {
          $group: {
            _id: "$sessionId",
            pages: {
              $push: {
                path: "$path",
                timestamp: "$createdAt",
                timeOnPage: "$engagement.timeOnPage"
              }
            }
          }
        },
        {
          $addFields: {
            sortedPages: {
              $sortArray: { input: "$pages", sortBy: { timestamp: 1 } }
            }
          }
        },
        {
          $project: {
            entryPage: { $arrayElemAt: ["$sortedPages.path", 0] },
            exitPage: { $arrayElemAt: ["$sortedPages.path", -1] },
            totalPages: { $size: "$sortedPages" },
            totalTimeOnSite: { $sum: "$sortedPages.timeOnPage" }
          }
        },
        {
          $group: {
            _id: null,
            entryPages: {
              $push: {
                page: "$entryPage",
                sessionLength: "$totalPages",
                timeOnSite: "$totalTimeOnSite"
              }
            },
            exitPages: {
              $push: {
                page: "$exitPage",
                sessionLength: "$totalPages",
                timeOnSite: "$totalTimeOnSite"
              }
            }
          }
        }
      ];

      const entryExitData = await Visitor.aggregate(entryExitPipeline);

      // Process entry/exit page statistics
      let entryPageStats = [];
      let exitPageStats = [];

      if (entryExitData.length > 0) {
        // Group entry pages
        const entryGroups = {};
        entryExitData[0].entryPages.forEach(entry => {
          if (!entryGroups[entry.page]) {
            entryGroups[entry.page] = { count: 0, totalSessions: 0, totalTime: 0 };
          }
          entryGroups[entry.page].count++;
          entryGroups[entry.page].totalSessions += entry.sessionLength;
          entryGroups[entry.page].totalTime += entry.timeOnSite || 0;
        });

        entryPageStats = Object.entries(entryGroups).map(([page, stats]) => ({
          page,
          sessions: stats.count,
          avgSessionLength: Math.round((stats.totalSessions / stats.count) * 100) / 100,
          avgTimeOnSite: Math.round((stats.totalTime / stats.count) * 100) / 100
        })).sort((a, b) => b.sessions - a.sessions).slice(0, 10);

        // Group exit pages
        const exitGroups = {};
        entryExitData[0].exitPages.forEach(exit => {
          if (!exitGroups[exit.page]) {
            exitGroups[exit.page] = { count: 0, totalSessions: 0, totalTime: 0 };
          }
          exitGroups[exit.page].count++;
          exitGroups[exit.page].totalSessions += exit.sessionLength;
          exitGroups[exit.page].totalTime += exit.timeOnSite || 0;
        });

        exitPageStats = Object.entries(exitGroups).map(([page, stats]) => ({
          page,
          sessions: stats.count,
          avgSessionLength: Math.round((stats.totalSessions / stats.count) * 100) / 100,
          avgTimeOnSite: Math.round((stats.totalTime / stats.count) * 100) / 100
        })).sort((a, b) => b.sessions - a.sessions).slice(0, 10);
      }

      // Get bounce rate analysis
      const bounceAnalysis = await Visitor.aggregate([
        { 
          $match: { 
            createdAt: { $gte: startDate },
            sessionId: { $exists: true }
          } 
        },
        {
          $group: {
            _id: "$sessionId",
            pageCount: { $sum: 1 },
            entryPage: { $first: "$path" },
            totalTime: { $sum: "$engagement.timeOnPage" }
          }
        },
        {
          $group: {
            _id: "$entryPage",
            totalSessions: { $sum: 1 },
            bounceSessions: {
              $sum: {
                $cond: [
                  { $and: [{ $eq: ["$pageCount", 1] }, { $lt: ["$totalTime", 3000] }] },
                  1, 0
                ]
              }
            },
            avgTimeOnPage: { $avg: "$totalTime" }
          }
        },
        {
          $project: {
            _id: 0,
            page: "$_id",
            totalSessions: 1,
            bounceSessions: 1,
            bounceRate: {
              $round: [
                { $multiply: [{ $divide: ["$bounceSessions", "$totalSessions"] }, 100] },
                2
              ]
            },
            avgTimeOnPage: { $round: ["$avgTimeOnPage", 2] }
          }
        },
        { $sort: { totalSessions: -1 } },
        { $limit: 15 }
      ]);

      return {
        journeys,
        commonPaths,
        entryPages: entryPageStats,
        exitPages: exitPageStats,
        bounceAnalysis,
        summary: {
          totalJourneys: journeys.length,
          avgPagesPerSession: journeys.length > 0 ? 
            Math.round((journeys.reduce((sum, j) => sum + j.totalPages, 0) / journeys.length) * 100) / 100 : 0,
          avgSessionDuration: journeys.length > 0 ? 
            Math.round((journeys.reduce((sum, j) => sum + j.sessionDurationMinutes, 0) / journeys.length) * 100) / 100 : 0,
          journeyTypes: {
            singlePage: journeys.filter(j => j.journeyType === 'single-page').length,
            shortJourney: journeys.filter(j => j.journeyType === 'short-journey').length,
            mediumJourney: journeys.filter(j => j.journeyType === 'medium-journey').length,
            longJourney: journeys.filter(j => j.journeyType === 'long-journey').length
          }
        },
        meta: {
          dateRange,
          limit,
          generatedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error("Visitor Journey Analytics Error:", error);
      throw error;
    }
  }

  /**
   * Get conversion funnel analysis
   */
  static async getConversionFunnelAnalysis(funnelSteps = [], dateRange = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);

      if (!funnelSteps || funnelSteps.length === 0) {
        // Default funnel for political website
        funnelSteps = [
          '/',
          '/about',
          '/initiatives',
          '/engage',
          '/contact'
        ];
      }

      const funnelPipeline = [
        { 
          $match: { 
            createdAt: { $gte: startDate },
            sessionId: { $exists: true },
            path: { $in: funnelSteps }
          } 
        },
        {
          $group: {
            _id: "$sessionId",
            pages: {
              $push: {
                path: "$path",
                timestamp: "$createdAt",
                country: "$country",
                browser: "$browser.name"
              }
            }
          }
        },
        {
          $addFields: {
            sortedPages: {
              $sortArray: { input: "$pages", sortBy: { timestamp: 1 } }
            }
          }
        },
        {
          $addFields: {
            funnelProgress: {
              $map: {
                input: funnelSteps,
                as: "step",
                in: {
                  step: "$$step",
                  reached: {
                    $anyElementTrue: {
                      $map: {
                        input: "$sortedPages",
                        as: "page",
                        in: { $eq: ["$$page.path", "$$step"] }
                      }
                    }
                  },
                  timestamp: {
                    $let: {
                      vars: {
                        matchedPage: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: "$sortedPages",
                                cond: { $eq: ["$$this.path", "$$step"] }
                              }
                            },
                            0
                          ]
                        }
                      },
                      in: "$$matchedPage.timestamp"
                    }
                  }
                }
              }
            }
          }
        }
      ];

      const funnelData = await Visitor.aggregate(funnelPipeline);

      // Calculate funnel metrics
      const funnelMetrics = funnelSteps.map((step, index) => {
        const reached = funnelData.filter(session => 
          session.funnelProgress[index] && session.funnelProgress[index].reached
        ).length;

        const previousStepReached = index === 0 ? funnelData.length :
          funnelData.filter(session => 
            session.funnelProgress[index - 1] && session.funnelProgress[index - 1].reached
          ).length;

        return {
          step,
          stepNumber: index + 1,
          usersReached: reached,
          conversionRate: previousStepReached > 0 ? 
            Math.round((reached / previousStepReached) * 100 * 100) / 100 : 0,
          dropOffRate: previousStepReached > 0 ? 
            Math.round(((previousStepReached - reached) / previousStepReached) * 100 * 100) / 100 : 0,
          previousStepUsers: previousStepReached
        };
      });

      return {
        funnelSteps,
        metrics: funnelMetrics,
        totalSessions: funnelData.length,
        overallConversionRate: funnelData.length > 0 && funnelMetrics.length > 0 ? 
          Math.round((funnelMetrics[funnelMetrics.length - 1].usersReached / funnelData.length) * 100 * 100) / 100 : 0,
        dateRange,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error("Conversion Funnel Analysis Error:", error);
      throw error;
    }
  }

  // ==================== TRAFFIC SPIKE DETECTION ==================== //

  /**
   * Detect traffic spikes and anomalies
   */
  static async detectTrafficSpikes(sensitivityLevel = 'medium', hoursBack = 24) {
    try {
      const startTime = new Date();
      startTime.setHours(startTime.getHours() - hoursBack);

      // Get hourly traffic data
      const trafficPipeline = [
        { $match: { createdAt: { $gte: startTime } } },
        {
          $group: {
            _id: {
              hour: { $hour: "$createdAt" },
              date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
            },
            visitors: { $sum: 1 },
            uniqueVisitors: { $addToSet: "$realIP" },
            countries: { $addToSet: "$countryCode" },
            pages: { $addToSet: "$path" },
            avgEngagement: { $avg: "$engagement.timeOnPage" }
          }
        },
        {
          $project: {
            _id: 0,
            hour: "$_id.hour",
            date: "$_id.date",
            timestamp: { 
              $dateFromString: { 
                dateString: { 
                  $concat: ["$_id.date", "T", { $toString: "$_id.hour" }, ":00:00.000Z"] 
                } 
              } 
            },
            visitors: 1,
            uniqueVisitors: { $size: "$uniqueVisitors" },
            countriesCount: { $size: "$countries" },
            pagesCount: { $size: "$pages" },
            avgEngagement: { $round: ["$avgEngagement", 2] }
          }
        },
        { $sort: { timestamp: 1 } }
      ];

      const hourlyTraffic = await Visitor.aggregate(trafficPipeline);

      if (hourlyTraffic.length < 3) {
        return {
          spikes: [],
          anomalies: [],
          summary: { message: "Insufficient data for spike detection" }
        };
      }

      // Calculate baseline metrics
      const visitors = hourlyTraffic.map(h => h.visitors);
      const mean = visitors.reduce((a, b) => a + b, 0) / visitors.length;
      const variance = visitors.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / visitors.length;
      const stdDev = Math.sqrt(variance);

      // Set thresholds based on sensitivity
      let threshold;
      switch (sensitivityLevel) {
        case 'high':
          threshold = mean + (1.5 * stdDev);
          break;
        case 'low':
          threshold = mean + (3 * stdDev);
          break;
        default: // medium
          threshold = mean + (2 * stdDev);
      }

      // Detect spikes
      const spikes = hourlyTraffic
        .filter(hour => hour.visitors > threshold)
        .map(hour => ({
          ...hour,
          intensity: Math.round(((hour.visitors - mean) / stdDev) * 100) / 100,
          severity: hour.visitors > mean + (3 * stdDev) ? 'high' : 
                   hour.visitors > mean + (2 * stdDev) ? 'medium' : 'low'
        }));

      // Detect other anomalies
      const anomalies = hourlyTraffic
        .filter(hour => 
          hour.visitors < mean - (2 * stdDev) || // Unusual drops
          hour.uniqueVisitors / hour.visitors < 0.3 || // Suspicious bot activity
          hour.avgEngagement < 1000 // Very low engagement
        )
        .map(hour => ({
          ...hour,
          type: hour.visitors < mean - (2 * stdDev) ? 'traffic_drop' :
                hour.uniqueVisitors / hour.visitors < 0.3 ? 'potential_bot_activity' :
                'low_engagement',
          severity: hour.visitors < mean - (3 * stdDev) ? 'high' : 'medium'
        }));

      return {
        spikes,
        anomalies,
        baseline: {
          mean: Math.round(mean * 100) / 100,
          stdDev: Math.round(stdDev * 100) / 100,
          threshold: Math.round(threshold * 100) / 100
        },
        summary: {
          totalSpikes: spikes.length,
          highSeveritySpikes: spikes.filter(s => s.severity === 'high').length,
          totalAnomalies: anomalies.length,
          timeRange: `${hoursBack} hours`,
          sensitivityLevel
        },
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error("Traffic Spike Detection Error:", error);
      throw error;
    }
  }
}

module.exports = VisitorService;