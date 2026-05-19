/**
 * Visitor GeoLocation Service
 * 
 * Specialized geolocation service for visitor tracking with real IP detection
 * Separate from main geoLocationService.js to avoid disturbing existing functionality
 * 
 * Features:
 * - Real IP detection through CDN headers (Cloudflare, AWS CloudFront, etc.)
 * - Multiple geolocation service providers with intelligent fallbacks
 * - Enhanced ISP and organization information
 * - VPN/Proxy/Hosting detection for visitor analytics
 */

const axios = require("axios");
const UAParser = require("ua-parser-js");

const visitorGeoLocationTimeout = process.env.VISITOR_GEOLOCATION_TIMEOUT_MS
  ? Number(process.env.VISITOR_GEOLOCATION_TIMEOUT_MS)
  : undefined;

class VisitorGeoLocationService {
  constructor() {
    // Visitor-specific geolocation services
    this.geoServices = [
      {
        name: "ip-api",
        url: "http://ip-api.com/json/",
        fields: "status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,mobile,proxy,hosting,query,district",
        priority: 1,
        rateLimitPerMinute: 45,
      },
      {
        name: "ipapi-co",
        url: "https://ipapi.co/",
        format: "json",
        priority: 2,
        rateLimitPerMinute: 30,
      }
    ];

    // Rate limiting tracking for visitor requests
    this.rateLimitCounters = {};
  }

  /**
   * Enhanced IP address extraction specifically for visitor tracking
   */
  extractVisitorRealIP(req) {
    // Priority order for real IP detection in visitor tracking
    const ipSources = [
      // Cloudflare - most common CDN
      req.headers['cf-connecting-ip'],
      
      // AWS CloudFront
      req.headers['cloudfront-viewer-address']?.split(':')[0],
      
      // Standard proxy headers
      req.headers['x-forwarded-for']?.split(',')[0]?.trim(),
      req.headers['x-real-ip'],
      req.headers['x-client-ip'],
      
      // Fastly CDN
      req.headers['fastly-client-ip'],
      
      // Other CDN providers
      req.headers['true-client-ip'],
      
      // Fallback to connection IP
      req.ip,
      req.connection?.remoteAddress,
      req.socket?.remoteAddress,
    ];

    // Find first valid IP for visitor tracking
    for (const ip of ipSources) {
      if (ip && this.isValidVisitorIP(ip)) {
        // Log CDN detection for visitor analytics
        if (req.headers['cf-connecting-ip']) {
          console.log(`Visitor Real IP via Cloudflare: ${ip} (CDN: ${req.ip})`);
        } else if (req.headers['cloudfront-viewer-address']) {
          console.log(`Visitor Real IP via CloudFront: ${ip} (CDN: ${req.ip})`);
        }
        
        return ip;
      }
    }

    return "127.0.0.1";
  }

  /**
   * Validate IP address format for visitor tracking
   */
  isValidVisitorIP(ip) {
    if (!ip || typeof ip !== 'string') return false;
    
    // IPv4 regex
    const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    
    // IPv6 regex (simplified)
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  /**
   * Enhanced User Agent parsing for visitor analytics
   */
  parseVisitorUserAgent(userAgent) {
    if (!userAgent) {
      return {
        browser: { name: "Unknown", version: "Unknown", engine: "Unknown" },
        os: { name: "Unknown", version: "Unknown" },
        device: { type: "desktop", vendor: "Unknown", model: "Unknown" },
        fingerprint: this.generateVisitorFingerprint("")
      };
    }

    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    // Enhanced device type detection for visitor tracking
    const deviceType = this.determineVisitorDeviceType(result, userAgent);
    
    // Generate visitor-specific fingerprint
    const fingerprint = this.generateVisitorFingerprint(userAgent);

    return {
      browser: {
        name: result.browser.name || "Unknown",
        version: result.browser.version || "Unknown",
        engine: result.engine.name || "Unknown",
        engineVersion: result.engine.version || "Unknown"
      },
      os: {
        name: result.os.name || "Unknown",
        version: result.os.version || "Unknown"
      },
      device: {
        type: deviceType,
        vendor: result.device.vendor || "Unknown",
        model: result.device.model || "Unknown"
      },
      fingerprint,
      rawUserAgent: userAgent
    };
  }

  /**
   * Determine device type for visitor analytics
   */
  determineVisitorDeviceType(uaResult, userAgent) {
    const ua = userAgent.toLowerCase();
    
    // Mobile detection for visitor tracking
    if (uaResult.device.type === 'mobile' || 
        ua.includes('mobile') || 
        ua.includes('android') && ua.includes('mobile') ||
        ua.includes('iphone') ||
        ua.includes('ipod') ||
        ua.includes('blackberry') ||
        ua.includes('windows phone')) {
      return 'mobile';
    }
    
    // Tablet detection for visitor tracking
    if (uaResult.device.type === 'tablet' ||
        ua.includes('tablet') ||
        ua.includes('ipad') ||
        (ua.includes('android') && !ua.includes('mobile'))) {
      return 'tablet';
    }
    
    // Smart TV detection for visitor tracking
    if (ua.includes('smart-tv') || ua.includes('smarttv') || ua.includes('googletv')) {
      return 'smart-tv';
    }
    
    // Bot detection for visitor tracking
    if (this.detectVisitorBot(userAgent)) {
      return 'bot';
    }
    
    return 'desktop';
  }

  /**
   * Generate visitor-specific fingerprint
   */
  generateVisitorFingerprint(userAgent) {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(userAgent || 'unknown').digest('hex').substring(0, 16);
  }

  /**
   * Bot detection for visitor analytics
   */
  detectVisitorBot(userAgent) {
    if (!userAgent) return false;
    
    const ua = userAgent.toLowerCase();
    const botPatterns = [
      'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python',
      'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
      'yandexbot', 'facebookexternalhit', 'twitterbot', 'linkedinbot',
      'whatsapp', 'telegram', 'discord', 'slack', 'postman', 'insomnia'
    ];
    
    return botPatterns.some(pattern => ua.includes(pattern));
  }

  /**
   * Get visitor geolocation from ip-api.com
   */
  async getVisitorGeoFromIPAPI(ip) {
    try {
      const url = `${this.geoServices[0].url}${ip}?fields=${this.geoServices[0].fields}`;
      const response = await axios.get(url, { 
        timeout: visitorGeoLocationTimeout,
        headers: {
          'User-Agent': 'Visitor-GeoLocation-Service/1.0'
        }
      });

      if (response.data && response.data.status === "success") {
        return {
          // Basic location data for visitor tracking
          country: response.data.country,
          countryCode: response.data.countryCode,
          region: response.data.regionName,
          regionCode: response.data.region,
          city: response.data.city,
          district: response.data.district,
          zipCode: response.data.zip,
          
          // Coordinates for visitor mapping
          latitude: response.data.lat,
          longitude: response.data.lon,
          
          // Time and network info for visitor analytics
          timezone: response.data.timezone,
          isp: response.data.isp,
          org: response.data.org,
          as: response.data.as,
          
          // Security flags for visitor classification
          mobile: response.data.mobile || false,
          proxy: response.data.proxy || false,
          hosting: response.data.hosting || false,
          
          // Metadata for visitor tracking
          query: response.data.query,
          source: 'ip-api-visitor',
          accuracy: 'high',
          timestamp: new Date().toISOString()
        };
      }
      return null;
    } catch (error) {
      console.warn("Visitor IP-API geolocation failed:", error.message);
      return null;
    }
  }

  /**
   * Get visitor geolocation from ipapi.co
   */
  async getVisitorGeoFromIPAPICO(ip) {
    try {
      const url = `${this.geoServices[1].url}${ip}/${this.geoServices[1].format}/`;
      const response = await axios.get(url, { 
        timeout: visitorGeoLocationTimeout,
        headers: {
          'User-Agent': 'Visitor-GeoLocation-Service/1.0'
        }
      });

      if (response.data && !response.data.error) {
        return {
          country: response.data.country_name,
          countryCode: response.data.country_code || response.data.country,
          region: response.data.region,
          regionCode: response.data.region_code,
          city: response.data.city,
          district: null,
          zipCode: response.data.postal,
          
          latitude: response.data.latitude,
          longitude: response.data.longitude,
          
          timezone: response.data.timezone,
          isp: response.data.org,
          org: response.data.org,
          as: response.data.asn,
          
          mobile: false,
          proxy: false,
          hosting: false,
          
          query: ip,
          source: 'ipapi-co-visitor',
          accuracy: 'medium',
          timestamp: new Date().toISOString()
        };
      }
      return null;
    } catch (error) {
      console.warn("Visitor IPAPI.CO geolocation failed:", error.message);
      return null;
    }
  }

  /**
   * Master visitor geolocation function with fallbacks
   */
  async getVisitorGeoLocationData(ip) {
    // Skip geolocation for localhost/private IPs
    if (this.isPrivateVisitorIP(ip)) {
      return this.getLocalVisitorNetworkData(ip);
    }

    console.log(`Visitor geolocation lookup for IP: ${ip}`);

    // Try services in priority order for visitor tracking
    const services = [
      () => this.getVisitorGeoFromIPAPI(ip),
      () => this.getVisitorGeoFromIPAPICO(ip)
    ];

    for (let i = 0; i < services.length; i++) {
      try {
        const geoData = await services[i]();
        if (geoData) {
          console.log(`Visitor geolocation success (${geoData.source}):`, geoData.country, geoData.city);
          return geoData;
        }
      } catch (error) {
        console.warn(`Visitor geolocation service ${i + 1} failed:`, error.message);
      }
    }

    // All services failed for visitor
    console.warn(`All visitor geolocation services failed for IP: ${ip}`);
    return this.getUnknownVisitorLocationData(ip);
  }

  /**
   * Check if IP is private/local for visitor tracking
   */
  isPrivateVisitorIP(ip) {
    if (!ip || ip === "127.0.0.1" || ip === "::1") return true;
    
    const privateRanges = [
      /^192\\.168\\./,
      /^10\\./,
      /^172\\.(1[6-9]|2[0-9]|3[01])\\./,
      /^169\\.254\\./,
      /^fc00:/,
      /^fe80:/
    ];
    
    return privateRanges.some(range => range.test(ip));
  }

  /**
   * Return data for local network IPs in visitor tracking
   */
  getLocalVisitorNetworkData(ip) {
    return {
      country: "Local Network",
      countryCode: "LN",
      region: "Private Network",
      regionCode: "PN",
      city: "Localhost",
      district: null,
      zipCode: null,
      latitude: null,
      longitude: null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      isp: "Local Network",
      org: "Private Network",
      as: null,
      mobile: false,
      proxy: false,
      hosting: false,
      query: ip,
      source: 'local-visitor',
      accuracy: 'exact',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Return data when all geolocation services fail for visitor
   */
  getUnknownVisitorLocationData(ip) {
    return {
      country: "Unknown",
      countryCode: "XX",
      region: "Unknown",
      regionCode: "XX",
      city: "Unknown",
      district: null,
      zipCode: null,
      latitude: null,
      longitude: null,
      timezone: null,
      isp: "Unknown",
      org: "Unknown",
      as: null,
      mobile: false,
      proxy: false,
      hosting: false,
      query: ip,
      source: 'fallback-visitor',
      accuracy: 'none',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get comprehensive visitor device and location information
   */
  async getVisitorDeviceAndLocationInfo(req) {
    const realIP = this.extractVisitorRealIP(req);
    const cdnIP = req.ip !== realIP ? req.ip : null;
    const userAgent = req.headers["user-agent"] || "";

    // Parse visitor device information
    const deviceInfo = this.parseVisitorUserAgent(userAgent);

    // Get visitor geolocation data
    const geoLocation = await this.getVisitorGeoLocationData(realIP);

    // Extract visitor request metadata
    const requestMetadata = this.extractVisitorRequestMetadata(req);

    return {
      deviceInfo: {
        realIP,
        cdnIP,
        userAgent,
        ...deviceInfo
      },
      geoLocation,
      requestMetadata,
      tracking: {
        sessionStart: new Date().toISOString(),
        trackingVersion: '2.0-visitor'
      }
    };
  }

  /**
   * Extract visitor-specific request metadata
   */
  extractVisitorRequestMetadata(req) {
    return {
      // Request headers for visitor tracking
      acceptLanguage: req.headers['accept-language'],
      acceptEncoding: req.headers['accept-encoding'],
      connection: req.headers.connection,
      
      // CDN information for visitor analytics
      cfRay: req.headers['cf-ray'], // Cloudflare Ray ID
      cfCountry: req.headers['cf-ipcountry'], // Cloudflare country
      cfConnectingIP: req.headers['cf-connecting-ip'],
      
      // Security headers for visitor classification
      xForwardedProto: req.headers['x-forwarded-proto'],
      xForwardedHost: req.headers['x-forwarded-host'],
      
      // Performance data for visitor experience
      requestTime: Date.now(),
      method: req.method,
      protocol: req.protocol,
      
      // Visitor tracking timestamp
      visitorTrackingTimestamp: new Date().toISOString()
    };
  }
}

module.exports = new VisitorGeoLocationService();
