const CvDownload = require("@models/cv-download/cvDownload");
const logger = require("@utils/logger");

/**
 * Parse user agent string into browser/os/device info
 */
function parseUserAgent(ua) {
  if (!ua) return { browser: "", browserVersion: "", os: "", osVersion: "", device: "", deviceType: "unknown" };

  let browser = "", browserVersion = "", os = "", osVersion = "", device = "", deviceType = "unknown";

  // Browser detection
  if (ua.includes("Chrome") && !ua.includes("Edg")) {
    browser = "Chrome";
    browserVersion = ua.match(/Chrome\/([\d.]+)/)?.[1] || "";
  } else if (ua.includes("Firefox")) {
    browser = "Firefox";
    browserVersion = ua.match(/Firefox\/([\d.]+)/)?.[1] || "";
  } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
    browser = "Safari";
    browserVersion = ua.match(/Version\/([\d.]+)/)?.[1] || "";
  } else if (ua.includes("Edg")) {
    browser = "Edge";
    browserVersion = ua.match(/Edg\/([\d.]+)/)?.[1] || "";
  }

  // OS detection
  if (ua.includes("Windows")) {
    os = "Windows";
    osVersion = ua.match(/Windows NT ([\d.]+)/)?.[1] || "";
  } else if (ua.includes("Mac OS X")) {
    os = "macOS";
    osVersion = ua.match(/Mac OS X ([\d_]+)/)?.[1]?.replace(/_/g, ".") || "";
  } else if (ua.includes("Linux")) {
    os = "Linux";
  } else if (ua.includes("Android")) {
    os = "Android";
    osVersion = ua.match(/Android ([\d.]+)/)?.[1] || "";
  } else if (ua.includes("iPhone") || ua.includes("iPad")) {
    os = "iOS";
    osVersion = ua.match(/OS ([\d_]+)/)?.[1]?.replace(/_/g, ".") || "";
  }

  // Device type detection
  if (ua.includes("Mobile") || ua.includes("Android") || ua.includes("iPhone")) {
    deviceType = "mobile";
  } else if (ua.includes("iPad") || ua.includes("Tablet")) {
    deviceType = "tablet";
  } else if (ua.includes("bot") || ua.includes("Bot") || ua.includes("crawl")) {
    deviceType = "bot";
  } else {
    deviceType = "desktop";
  }

  return { browser, browserVersion, os, osVersion, device, deviceType };
}

/**
 * Get real IP from request headers
 */
function getRealIP(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    req.headers["cf-connecting-ip"] ||
    req.connection?.remoteAddress ||
    req.ip ||
    "unknown"
  );
}

/**
 * Fetch geolocation from IP (using free ip-api.com)
 */
async function getGeoLocation(ip) {
  // Skip for localhost/private IPs
  if (!ip || ip === "unknown" || ip === "::1" || ip.startsWith("127.") || ip.startsWith("192.168.") || ip.startsWith("10.")) {
    return { country: "Local", countryCode: "LO", region: "", city: "Localhost", latitude: 0, longitude: 0, timezone: "", isp: "" };
  }

  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=country,countryCode,regionName,city,lat,lon,timezone,isp`);
    if (!response.ok) throw new Error("GeoIP lookup failed");
    const data = await response.json();
    return {
      country: data.country || "Unknown",
      countryCode: data.countryCode || "XX",
      region: data.regionName || "",
      city: data.city || "",
      latitude: data.lat || 0,
      longitude: data.lon || 0,
      timezone: data.timezone || "",
      isp: data.isp || "",
    };
  } catch {
    return { country: "Unknown", countryCode: "XX", region: "", city: "", latitude: 0, longitude: 0, timezone: "", isp: "" };
  }
}

/**
 * @route   POST /api/v1/cv/track
 * @desc    Track CV view/download event
 * @access  Public
 */
exports.trackCvEvent = async (req, res) => {
  try {
    const { action, referrer, source, utmSource, utmMedium, utmCampaign, pageUrl, screenResolution, language } = req.body;

    if (!action || !["view", "download", "open_tab"].includes(action)) {
      return res.status(400).json({ success: false, message: "Valid action required (view, download, open_tab)" });
    }

    const ip = getRealIP(req);
    const ua = req.headers["user-agent"] || "";
    const { browser, browserVersion, os, osVersion, device, deviceType } = parseUserAgent(ua);
    const geo = await getGeoLocation(ip);

    const ipType = ip.includes(":") ? "ipv6" : "ipv4";

    const record = await CvDownload.create({
      action,
      ip,
      ipType,
      ...geo,
      userAgent: ua,
      browser,
      browserVersion,
      os,
      osVersion,
      device,
      deviceType,
      referrer: referrer || req.headers["referer"] || "",
      source: source || "direct",
      utmSource: utmSource || "",
      utmMedium: utmMedium || "",
      utmCampaign: utmCampaign || "",
      pageUrl: pageUrl || "",
      screenResolution: screenResolution || "",
      language: language || "",
    });

    logger.info(`CV ${action} tracked - IP: ${ip}, City: ${geo.city}, Country: ${geo.country}`);

    res.status(200).json({ success: true, id: record._id });
  } catch (error) {
    logger.error("CV_TRACK_ERROR", error);
    res.status(500).json({ success: false, message: "Failed to track event" });
  }
};

/**
 * @route   GET /api/v1/cv/analytics
 * @desc    Get CV download/view analytics
 * @access  Protected (Super Admin)
 */
exports.getCvAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - parseInt(days));

    const [
      totalDownloads,
      totalViews,
      totalOpenTab,
      recentEvents,
      byCountry,
      byCity,
      byDevice,
      byBrowser,
      dailyStats,
      uniqueIPs,
    ] = await Promise.all([
      CvDownload.countDocuments({ action: "download", createdAt: { $gte: since } }),
      CvDownload.countDocuments({ action: "view", createdAt: { $gte: since } }),
      CvDownload.countDocuments({ action: "open_tab", createdAt: { $gte: since } }),
      CvDownload.find({ createdAt: { $gte: since } })
        .sort({ createdAt: -1 })
        .limit(50)
        .select("-userAgent -__v")
        .lean(),
      CvDownload.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { country: "$country", countryCode: "$countryCode" }, count: { $sum: 1 }, downloads: { $sum: { $cond: [{ $eq: ["$action", "download"] }, 1, 0] } }, views: { $sum: { $cond: [{ $eq: ["$action", "view"] }, 1, 0] } } } },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]),
      CvDownload.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { city: "$city", country: "$country" }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]),
      CvDownload.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: "$deviceType", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      CvDownload.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: "$browser", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      CvDownload.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            downloads: { $sum: { $cond: [{ $eq: ["$action", "download"] }, 1, 0] } },
            views: { $sum: { $cond: [{ $eq: ["$action", "view"] }, 1, 0] } },
            total: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
        { $limit: 30 },
      ]),
      CvDownload.distinct("ip", { createdAt: { $gte: since } }),
    ]);

    // All-time totals
    const allTimeDownloads = await CvDownload.countDocuments({ action: "download" });
    const allTimeViews = await CvDownload.countDocuments({ action: "view" });
    const allTimeTotal = await CvDownload.countDocuments();

    res.status(200).json({
      success: true,
      period: `${days} days`,
      summary: {
        downloads: totalDownloads,
        views: totalViews,
        openTab: totalOpenTab,
        total: totalDownloads + totalViews + totalOpenTab,
        uniqueVisitors: uniqueIPs.length,
      },
      allTime: {
        downloads: allTimeDownloads,
        views: allTimeViews,
        total: allTimeTotal,
      },
      recentEvents,
      byCountry: byCountry.map((c) => ({
        country: c._id.country,
        countryCode: c._id.countryCode,
        total: c.count,
        downloads: c.downloads,
        views: c.views,
      })),
      byCity: byCity.map((c) => ({
        city: c._id.city,
        country: c._id.country,
        total: c.count,
      })),
      byDevice,
      byBrowser,
      dailyStats,
    });
  } catch (error) {
    logger.error("CV_ANALYTICS_ERROR", error);
    res.status(500).json({ success: false, message: "Failed to fetch analytics" });
  }
};

/**
 * @route   GET /api/v1/cv/analytics/paginated
 * @desc    Get paginated CV event log
 * @access  Protected (Super Admin)
 */
exports.getCvEventsPaginated = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 15;
    const { action, country } = req.query;

    const filter = {};
    if (action) filter.action = action;
    if (country) filter.country = country;

    const [events, total] = await Promise.all([
      CvDownload.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .select("-userAgent -__v")
        .lean(),
      CvDownload.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      events,
      paginationData: {
        currentPage: page,
        perPage,
        totalEvents: total,
        totalPages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    logger.error("CV_EVENTS_PAGINATED_ERROR", error);
    res.status(500).json({ success: false, message: "Failed to fetch events" });
  }
};
