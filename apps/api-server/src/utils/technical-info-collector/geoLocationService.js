/**
 * GeoLocation Service Utility
 * Provides IP geolocation services with multiple fallbacks
 * Can be used across multiple pages for consistent geolocation data
 *
 * Features:
 * - Multiple geolocation service providers
 * - Automatic fallback mechanism
 * - ISP and organization information
 * - Device and browser detection
 * - Local network detection
 */

const axios = require("axios");
const UAParser = require("ua-parser-js");

class GeoLocationService {
  constructor() {
    // Free IP geolocation services (no API key required)
    this.geoServices = [
      {
        name: "ip-api",
        url: "http://ip-api.com/json/",
        fields:
          "status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,mobile,proxy,hosting,query",
      },
      {
        name: "ipapi",
        url: "https://ipapi.co/",
        format: "json",
      },
      {
        name: "ipinfo",
        url: "https://ipinfo.io/",
        format: "json",
      },
      {
        name: "ipapi-json",
        url: "https://ipapi.com/",
        format: "json",
      },
      {
        name: "freegeoip",
        url: "https://freegeoip.app/json/",
        format: "json",
      },
    ];
  }

  /**
   * Extract IP address from request
   */
  extractIPAddress(req) {
    return (
      req.ip ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.connection?.socket?.remoteAddress ||
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.headers["x-real-ip"] ||
      req.headers["x-client-ip"] ||
      "127.0.0.1"
    );
  }

  /**
   * Parse User Agent to extract device information
   */
  parseUserAgent(userAgent) {
    if (!userAgent) {
      return {
        browser: {},
        os: {},
        device: {},
      };
    }

    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    return {
      browser: {
        name: result.browser.name || "Unknown",
        version: result.browser.version || "Unknown",
        engine: result.engine.name || "Unknown",
      },
      os: {
        name: result.os.name || "Unknown",
        version: result.os.version || "Unknown",
      },
      device: {
        type: result.device.type || "desktop",
        vendor: result.device.vendor || "Unknown",
        model: result.device.model || "Unknown",
      },
    };
  }

  /**
   * Get geolocation data using ip-api.com (primary service)
   */
  async getGeoLocationFromIPAPI(ip) {
    try {
      const url = `${this.geoServices[0].url}${ip}?fields=${this.geoServices[0].fields}`;
      const response = await axios.get(url, { timeout: 5000 });

      if (response.data && response.data.status === "success") {
        return {
          country: response.data.country,
          countryCode: response.data.countryCode,
          region: response.data.regionName,
          regionCode: response.data.region,
          city: response.data.city,
          zipCode: response.data.zip,
          latitude: response.data.lat,
          longitude: response.data.lon,
          timezone: response.data.timezone,
          isp: response.data.isp,
          org: response.data.org,
          as: response.data.as,
          query: response.data.query,
          mobile: response.data.mobile || false,
          proxy: response.data.proxy || false,
          hosting: response.data.hosting || false,
        };
      }
      return null;
    } catch (error) {
      console.warn("IP-API geolocation failed:", error.message);
      return null;
    }
  }

  /**
   * Get geolocation data using ipapi.co (fallback)
   */
  async getGeoLocationFromIPAPICO(ip) {
    try {
      const url = `${this.geoServices[1].url}${ip}/${this.geoServices[1].format}/`;
      const response = await axios.get(url, { timeout: 5000 });

      if (response.data && !response.data.error) {
        return {
          country: response.data.country_name,
          countryCode: response.data.country,
          region: response.data.region,
          regionCode: response.data.region_code,
          city: response.data.city,
          zipCode: response.data.postal,
          latitude: response.data.latitude,
          longitude: response.data.longitude,
          timezone: response.data.timezone,
          isp: response.data.org,
          org: response.data.org,
          as: response.data.asn,
          query: ip,
          mobile: false,
          proxy: false,
          hosting: false,
        };
      }
      return null;
    } catch (error) {
      console.warn("IPAPI.CO geolocation failed:", error.message);
      return null;
    }
  }

  /**
   * Get geolocation data using ipinfo.io (secondary fallback)
   */
  async getGeoLocationFromIPInfo(ip) {
    try {
      const url = `${this.geoServices[2].url}${ip}/${this.geoServices[2].format}`;
      const response = await axios.get(url, { timeout: 5000 });

      if (response.data && !response.data.error) {
        const [lat, lon] = response.data.loc
          ? response.data.loc.split(",")
          : [null, null];

        return {
          country: response.data.country,
          countryCode: response.data.country,
          region: response.data.region,
          regionCode: response.data.region,
          city: response.data.city,
          zipCode: response.data.postal,
          latitude: lat ? parseFloat(lat) : null,
          longitude: lon ? parseFloat(lon) : null,
          timezone: response.data.timezone,
          isp: response.data.org,
          org: response.data.org,
          as: null,
          query: ip,
          mobile: false,
          proxy: false,
          hosting: false,
        };
      }
      return null;
    } catch (error) {
      console.warn("IPInfo geolocation failed:", error.message);
      return null;
    }
  }

  /**
   * Get geolocation data using ipapi.com (third fallback)
   */
  async getGeoLocationFromIPAPICOM(ip) {
    try {
      const url = `${this.geoServices[3].url}${ip}/${this.geoServices[3].format}`;
      const response = await axios.get(url, { timeout: 5000 });

      if (response.data && !response.data.error) {
        return {
          country: response.data.country_name,
          countryCode: response.data.country_code,
          region: response.data.region,
          regionCode: response.data.region_code,
          city: response.data.city,
          zipCode: response.data.postal,
          latitude: response.data.latitude,
          longitude: response.data.longitude,
          timezone: response.data.timezone,
          isp: response.data.connection?.isp || response.data.org,
          org: response.data.org,
          as: response.data.connection?.asn,
          query: ip,
          mobile: response.data.connection?.type === "mobile",
          proxy: response.data.security?.proxy || false,
          hosting: response.data.security?.hosting || false,
        };
      }
      return null;
    } catch (error) {
      console.warn("IPAPI.COM geolocation failed:", error.message);
      return null;
    }
  }

  /**
   * Get geolocation data using freegeoip.app (fourth fallback)
   */
  async getGeoLocationFromFreeGeoIP(ip) {
    try {
      const url = `${this.geoServices[4].url}${ip}`;
      const response = await axios.get(url, { timeout: 5000 });

      if (response.data && !response.data.error) {
        return {
          country: response.data.country_name,
          countryCode: response.data.country_code,
          region: response.data.region_name,
          regionCode: response.data.region_code,
          city: response.data.city,
          zipCode: response.data.zip_code,
          latitude: response.data.latitude,
          longitude: response.data.longitude,
          timezone: response.data.time_zone?.id,
          isp: response.data.connection?.isp,
          org: response.data.connection?.organization,
          as: response.data.connection?.asn,
          query: ip,
          mobile: false,
          proxy: false,
          hosting: false,
        };
      }
      return null;
    } catch (error) {
      console.warn("FreeGeoIP geolocation failed:", error.message);
      return null;
    }
  }

  /**
   * Get comprehensive geolocation data with fallbacks
   */
  async getGeoLocationData(ip) {
    // Skip geolocation for localhost/private IPs
    if (
      !ip ||
      ip === "127.0.0.1" ||
      ip === "::1" ||
      ip.startsWith("192.168.") ||
      ip.startsWith("10.") ||
      ip.startsWith("172.")
    ) {
      return {
        country: "Unknown",
        countryCode: "XX",
        region: "Unknown",
        regionCode: "XX",
        city: "Unknown",
        zipCode: null,
        latitude: null,
        longitude: null,
        timezone: null,
        isp: "Local Network",
        org: "Private Network",
        as: null,
        query: ip,
        mobile: false,
        proxy: false,
        hosting: false,
      };
    }

    console.log(`Attempting geolocation for IP: ${ip}`);

    // Try primary service first (ip-api.com)
    let geoData = await this.getGeoLocationFromIPAPI(ip);
    if (geoData) {
      console.log(
        `Primary service (ip-api) succeeded for ${ip}:`,
        geoData.country,
        geoData.city
      );
      return geoData;
    }

    // Try second service (ipapi.co)
    geoData = await this.getGeoLocationFromIPAPICO(ip);
    if (geoData) {
      console.log(
        `Second service (ipapi.co) succeeded for ${ip}:`,
        geoData.country,
        geoData.city
      );
      return geoData;
    }

    // Try third service (ipinfo.io)
    geoData = await this.getGeoLocationFromIPInfo(ip);
    if (geoData) {
      console.log(
        `Third service (ipinfo.io) succeeded for ${ip}:`,
        geoData.country,
        geoData.city
      );
      return geoData;
    }

    // Try fourth service (ipapi.com)
    geoData = await this.getGeoLocationFromIPAPICOM(ip);
    if (geoData) {
      console.log(
        `Fourth service (ipapi.com) succeeded for ${ip}:`,
        geoData.country,
        geoData.city
      );
      return geoData;
    }

    // Try fifth service (freegeoip.app)
    geoData = await this.getGeoLocationFromFreeGeoIP(ip);
    if (geoData) {
      console.log(
        `Fifth service (freegeoip.app) succeeded for ${ip}:`,
        geoData.country,
        geoData.city
      );
      return geoData;
    }

    // If all services fail, return basic data
    console.warn(`All geolocation services failed for IP: ${ip}`);
    return {
      country: "Unknown",
      countryCode: "XX",
      region: "Unknown",
      regionCode: "XX",
      city: "Unknown",
      zipCode: null,
      latitude: null,
      longitude: null,
      timezone: null,
      isp: "Unknown",
      org: "Unknown",
      as: null,
      query: ip,
      mobile: false,
      proxy: false,
      hosting: false,
    };
  }

  /**
   * Get comprehensive device and location information from request
   */
  async getDeviceAndLocationInfo(req) {
    const ip = this.extractIPAddress(req);
    const userAgent = req.headers["user-agent"] || "";

    // Parse device information
    const deviceInfo = this.parseUserAgent(userAgent);

    // Get geolocation data
    const geoLocation = await this.getGeoLocationData(ip);

    return {
      deviceInfo: {
        ipAddress: ip,
        userAgent: userAgent,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        device: deviceInfo.device,
        screen: {
          width: null, // Would need to be sent from frontend
          height: null, // Would need to be sent from frontend
        },
      },
      geoLocation,
    };
  }

  /**
   * Update device info with screen resolution (if provided from frontend)
   */
  updateScreenInfo(deviceInfo, screenWidth, screenHeight) {
    if (deviceInfo && screenWidth && screenHeight) {
      deviceInfo.screen = {
        width: parseInt(screenWidth),
        height: parseInt(screenHeight),
      };
    }
    return deviceInfo;
  }

  /**
   * Test geolocation services
   */
  async testServices() {
    const testIP = "8.8.8.8"; // Google DNS
    console.log("Testing geolocation services with IP:", testIP);

    const results = {
      ipapi: await this.getGeoLocationFromIPAPI(testIP),
      ipapico: await this.getGeoLocationFromIPAPICO(testIP),
      ipinfo: await this.getGeoLocationFromIPInfo(testIP),
      combined: await this.getGeoLocationData(testIP),
    };

    return results;
  }
}

module.exports = new GeoLocationService();
