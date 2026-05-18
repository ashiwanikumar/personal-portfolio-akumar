const crypto = require("crypto");

// Enhanced browser detection patterns
const BROWSER_PATTERNS = {
  // Standard browsers
  Chrome: /Chrome\/(\d+\.\d+)/,
  Firefox: /Firefox\/(\d+\.\d+)/,
  Safari: /Safari\/(\d+\.\d+)/,
  Edge: /Edge\/(\d+\.\d+)/,
  Opera: /Opera\/(\d+\.\d+)/,
  Brave: /Brave\/(\d+\.\d+)/,
  Samsung: /SamsungBrowser\/(\d+\.\d+)/,
  UC: /UCBrowser\/(\d+\.\d+)/,
  // Privacy browsers
  Tor: /Tor\/(\d+\.\d+)/,
  DuckDuckGo: /DuckDuckGo\/(\d+\.\d+)/,
  // Developer/Testing browsers
  Chromium: /Chromium\/(\d+\.\d+)/,
  Electron: /Electron\/(\d+\.\d+)/,
  // Headless browsers
  HeadlessChrome: /HeadlessChrome\/(\d+\.\d+)/,
  PhantomJS: /PhantomJS\/(\d+\.\d+)/,
  Puppeteer: /Puppeteer/,
};

// OS detection patterns
const OS_PATTERNS = {
  Windows: /Windows NT (\d+\.\d+)/,
  macOS: /Mac OS X (\d+[._]\d+)/,
  Linux: /Linux/,
  Android: /Android (\d+\.\d+)/,
  iOS: /iPhone OS (\d+[._]\d+)/,
  iPadOS: /iPad; CPU OS (\d+[._]\d+)/,
};

// Device detection patterns
const DEVICE_PATTERNS = {
  iPhone: /iPhone/,
  iPad: /iPad/,
  iPod: /iPod/,
  Android: /Android/,
  BlackBerry: /BlackBerry/,
  WindowsPhone: /Windows Phone/,
  Kindle: /Kindle/,
  PlayStation: /PlayStation/,
  Xbox: /Xbox/,
  Nintendo: /Nintendo/,
};

// Advanced bot patterns
const BOT_PATTERNS = {
  // Search engine bots
  searchBots:
    /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegram/i,
  // Automation tools
  automationTools:
    /selenium|puppeteer|playwright|cypress|webdriver|phantomjs|slimerjs|headless/i,
  // Crawlers and scrapers
  crawlers:
    /crawler|spider|scraper|bot|crawl|slurp|archiver|transcoder|loader|reaper/i,
  // Security scanners
  securityScanners:
    /nmap|nikto|sqlmap|openvas|nessus|qualys|rapid7|acunetix|burp|zap/i,
  // Performance tools
  performanceTools: /lighthouse|gtmetrix|pingdom|uptimerobot|statuscake/i,
};

// Network quality indicators
const NETWORK_QUALITY = {
  CONNECTION_TYPES: {
    "4g": { minLatency: 50, maxLatency: 100, minBandwidth: 10 },
    "3g": { minLatency: 100, maxLatency: 300, minBandwidth: 1 },
    "2g": { minLatency: 300, maxLatency: 1000, minBandwidth: 0.1 },
    wifi: { minLatency: 10, maxLatency: 50, minBandwidth: 20 },
    ethernet: { minLatency: 1, maxLatency: 10, minBandwidth: 100 },
  },
};

// VPN/Proxy detection patterns
const PROXY_HEADERS = [
  "via",
  "x-forwarded-for",
  "x-forwarded-host",
  "x-forwarded-proto",
  "forwarded",
  "x-real-ip",
  "x-originating-ip",
  "x-remote-ip",
  "x-remote-addr",
  "client-ip",
  "x-client-ip",
  "x-host",
  "x-forwarded-server",
  "x-proxyuser-ip",
];

// Privacy signals
const PRIVACY_SIGNALS = {
  DNT: "dnt",
  GPC: "sec-gpc",
  PRIVACY_MODE: ["private", "incognito", "inprivate"],
};

/**
 * Advanced browser detection with headless and automation detection
 */
function extractAdvancedBrowserInfo(userAgent, headers = {}) {
  const basicInfo = extractBrowserInfo(userAgent);

  // Check for headless indicators
  const headlessIndicators = {
    isHeadless: false,
    indicators: [],
  };

  // User agent checks
  if (userAgent.includes("HeadlessChrome")) {
    headlessIndicators.isHeadless = true;
    headlessIndicators.indicators.push("headless_chrome_ua");
  }

  // Missing headers that real browsers send
  const expectedHeaders = ["accept-language", "accept-encoding", "accept"];
  expectedHeaders.forEach((header) => {
    if (!headers[header]) {
      headlessIndicators.indicators.push(`missing_${header}`);
    }
  });

  // WebDriver detection
  if (headers["webdriver"] || headers["x-webdriver"]) {
    headlessIndicators.isHeadless = true;
    headlessIndicators.indicators.push("webdriver_header");
  }

  return {
    ...basicInfo,
    headless: headlessIndicators,
    automationTool: detectAutomationTool(userAgent),
  };
}

/**
 * Detect specific automation tools
 */
function detectAutomationTool(userAgent) {
  const tools = {
    selenium: /selenium/i,
    puppeteer: /puppeteer/i,
    playwright: /playwright/i,
    cypress: /cypress/i,
    phantomjs: /phantomjs/i,
  };

  for (const [tool, pattern] of Object.entries(tools)) {
    if (pattern.test(userAgent)) {
      return tool;
    }
  }

  return null;
}

/**
 * Enhanced bot detection with pattern matching and behavior analysis
 */
function detectAdvancedBots(req) {
  const userAgent = req.headers["user-agent"] || "";
  const results = {
    isBot: false,
    botType: null,
    confidence: 0,
    indicators: [],
  };

  // Check against bot patterns
  for (const [type, pattern] of Object.entries(BOT_PATTERNS)) {
    if (pattern.test(userAgent)) {
      results.isBot = true;
      results.botType = type;
      results.confidence += 40;
      results.indicators.push(`${type}_pattern`);
    }
  }

  // Behavioral analysis
  const behaviorChecks = performBehaviorAnalysis(req);
  results.indicators.push(...behaviorChecks.indicators);
  results.confidence += behaviorChecks.score;

  // Request rate analysis (if available)
  if (req.session?.requestCount > 100) {
    results.indicators.push("high_request_rate");
    results.confidence += 20;
  }

  results.confidence = Math.min(results.confidence, 100);
  results.isBot = results.confidence > 50;

  return results;
}

/**
 * Analyze request behavior for bot-like patterns
 */
function performBehaviorAnalysis(req) {
  const indicators = [];
  let score = 0;

  // Check request timing patterns
  const requestTime = new Date().getTime();
  if (req.session?.lastRequestTime) {
    const timeDiff = requestTime - req.session.lastRequestTime;
    if (timeDiff < 100) {
      // Less than 100ms between requests
      indicators.push("rapid_requests");
      score += 30;
    }
  }

  // Check for missing common headers
  if (!req.headers["accept-language"]) {
    indicators.push("missing_language_header");
    score += 15;
  }

  if (!req.headers["accept-encoding"]) {
    indicators.push("missing_encoding_header");
    score += 15;
  }

  // Check for suspicious header combinations
  if (req.headers["user-agent"] && req.headers["user-agent"].length < 20) {
    indicators.push("short_user_agent");
    score += 20;
  }

  return { indicators, score };
}

/**
 * Enhanced security threat detection
 */
function detectAdvancedSecurityThreats(req) {
  const threats = {
    isProxy: false,
    isVPN: false,
    isTor: false,
    isBot: false,
    isSuspicious: false,
    isDataCenter: false,
    riskScore: 0,
    flags: [],
    details: {},
  };

  // Proxy/VPN detection
  const proxyDetection = detectProxyVPN(req);
  threats.isProxy = proxyDetection.isProxy;
  threats.isVPN = proxyDetection.isVPN;
  threats.details.proxy = proxyDetection;

  if (proxyDetection.isProxy || proxyDetection.isVPN) {
    threats.riskScore += proxyDetection.confidence;
    threats.flags.push(...proxyDetection.indicators);
  }

  // Tor detection
  const torDetection = detectTor(req);
  threats.isTor = torDetection.isTor;
  threats.details.tor = torDetection;

  if (torDetection.isTor) {
    threats.riskScore += 40;
    threats.flags.push("tor_detected");
  }

  // Bot detection
  const botDetection = detectAdvancedBots(req);
  threats.isBot = botDetection.isBot;
  threats.details.bot = botDetection;

  if (botDetection.isBot) {
    threats.riskScore += botDetection.confidence * 0.5;
    threats.flags.push(...botDetection.indicators);
  }

  // Data center IP detection
  const dcDetection = detectDataCenterIP(req);
  threats.isDataCenter = dcDetection.isDataCenter;
  threats.details.dataCenter = dcDetection;

  if (dcDetection.isDataCenter) {
    threats.riskScore += 25;
    threats.flags.push("datacenter_ip");
  }

  // SSL/TLS fingerprinting
  const tlsFingerprint = getTLSFingerprint(req);
  threats.details.tls = tlsFingerprint;

  // Calculate overall risk
  threats.riskScore = Math.min(threats.riskScore, 100);
  threats.isSuspicious = threats.riskScore > 30;

  return threats;
}

/**
 * Detect proxy and VPN usage
 */
function detectProxyVPN(req) {
  const detection = {
    isProxy: false,
    isVPN: false,
    confidence: 0,
    indicators: [],
  };

  // Check proxy headers
  PROXY_HEADERS.forEach((header) => {
    if (req.headers[header]) {
      detection.isProxy = true;
      detection.confidence += 15;
      detection.indicators.push(`proxy_header_${header}`);
    }
  });

  // Check for multiple IPs in X-Forwarded-For
  const xForwardedFor = req.headers["x-forwarded-for"];
  if (xForwardedFor && xForwardedFor.split(",").length > 1) {
    detection.isProxy = true;
    detection.confidence += 20;
    detection.indicators.push("multiple_forwarded_ips");
  }

  // Port-based detection
  const commonVPNPorts = [1194, 1723, 500, 4500, 1701, 5060];
  const remotePort = req.connection.remotePort;
  if (commonVPNPorts.includes(remotePort)) {
    detection.isVPN = true;
    detection.confidence += 25;
    detection.indicators.push(`vpn_port_${remotePort}`);
  }

  detection.confidence = Math.min(detection.confidence, 100);
  return detection;
}

/**
 * Detect Tor usage
 */
function detectTor(req) {
  const detection = {
    isTor: false,
    confidence: 0,
    indicators: [],
  };

  const userAgent = req.headers["user-agent"] || "";

  // Tor browser user agent
  if (userAgent.includes("Tor")) {
    detection.isTor = true;
    detection.confidence += 80;
    detection.indicators.push("tor_browser_ua");
  }

  // Common Tor exit node ports
  const torPorts = [9001, 9030, 9050, 9051, 9150];
  if (torPorts.includes(req.connection.remotePort)) {
    detection.isTor = true;
    detection.confidence += 40;
    detection.indicators.push("tor_exit_port");
  }

  // Check for Tor-specific headers
  if (req.headers["x-tor"]) {
    detection.isTor = true;
    detection.confidence += 60;
    detection.indicators.push("tor_header");
  }

  detection.confidence = Math.min(detection.confidence, 100);
  return detection;
}

/**
 * Detect data center IPs
 */
function detectDataCenterIP(req) {
  const detection = {
    isDataCenter: false,
    provider: null,
    confidence: 0,
  };

  // Check Cloudflare headers for known data center ASNs
  const asn = req.headers["cf-asn"];
  const knownDataCenterASNs = {
    13335: "Cloudflare",
    16509: "Amazon AWS",
    15169: "Google Cloud",
    8075: "Microsoft Azure",
    14061: "DigitalOcean",
    16276: "OVH",
    24940: "Hetzner",
    20473: "Vultr",
  };

  if (asn && knownDataCenterASNs[asn]) {
    detection.isDataCenter = true;
    detection.provider = knownDataCenterASNs[asn];
    detection.confidence = 90;
  }

  return detection;
}

/**
 * Get TLS/SSL fingerprint
 */
function getTLSFingerprint(req) {
  const tlsInfo = {
    version: null,
    cipher: null,
    fingerprint: null,
  };

  if (req.connection.encrypted) {
    const tlsSocket = req.connection;
    tlsInfo.version = tlsSocket.getProtocol?.();
    tlsInfo.cipher = tlsSocket.getCipher?.();

    // Generate fingerprint from TLS parameters
    if (tlsInfo.version && tlsInfo.cipher) {
      const fingerprintData = `${tlsInfo.version}-${JSON.stringify(
        tlsInfo.cipher
      )}`;
      tlsInfo.fingerprint = crypto
        .createHash("sha256")
        .update(fingerprintData)
        .digest("hex")
        .substring(0, 16);
    }
  }

  return tlsInfo;
}

/**
 * Enhanced device fingerprinting
 */
function generateAdvancedFingerprint(req, clientData = {}) {
  const fingerprintComponents = {
    // Network layer
    network: {
      ip: req.ip,
      port: req.connection.remotePort,
      protocol: req.protocol,
    },
    // HTTP layer
    http: {
      userAgent: req.headers["user-agent"],
      acceptLanguage: req.headers["accept-language"],
      acceptEncoding: req.headers["accept-encoding"],
      accept: req.headers["accept"],
      dnt: req.headers["dnt"],
      connection: req.headers["connection"],
    },
    // Client-side data
    client: {
      screen: clientData.screen || {},
      timezone: clientData.timezone,
      platform: clientData.platform,
      hardwareConcurrency: clientData.hardwareConcurrency,
      deviceMemory: clientData.deviceMemory,
      colorDepth: clientData.colorDepth,
      pixelRatio: clientData.pixelRatio,
      touchSupport: clientData.touchSupport,
      // Canvas fingerprint
      canvas: clientData.canvasFingerprint,
      // WebGL fingerprint
      webgl: clientData.webglFingerprint,
      // Audio context fingerprint
      audio: clientData.audioFingerprint,
      // Font list
      fonts: clientData.fonts,
      // Plugin list
      plugins: clientData.plugins,
    },
    // Behavioral data
    behavior: {
      mouseMovements: clientData.mouseMovements,
      keyboardPatterns: clientData.keyboardPatterns,
      timestamp: new Date().toISOString(),
    },
  };

  // Generate composite fingerprint
  const fingerprintString = JSON.stringify(fingerprintComponents);
  const fingerprint = crypto
    .createHash("sha256")
    .update(fingerprintString)
    .digest("hex");

  // Calculate uniqueness score
  const uniquenessScore = calculateUniquenessScore(fingerprintComponents);

  return {
    fingerprint,
    uniquenessScore,
    components: fingerprintComponents,
  };
}

/**
 * Calculate uniqueness score for fingerprint
 */
function calculateUniquenessScore(components) {
  let score = 0;

  // Screen resolution uniqueness
  if (components.client.screen?.width && components.client.screen?.height) {
    const resolution = `${components.client.screen.width}x${components.client.screen.height}`;
    const commonResolutions = ["1920x1080", "1366x768", "1280x720", "1440x900"];
    if (!commonResolutions.includes(resolution)) {
      score += 20;
    }
  }

  // Canvas fingerprint presence
  if (components.client.canvas) {
    score += 25;
  }

  // WebGL fingerprint presence
  if (components.client.webgl) {
    score += 25;
  }

  // Audio fingerprint presence
  if (components.client.audio) {
    score += 15;
  }

  // Font list length
  if (components.client.fonts?.length > 50) {
    score += 15;
  }

  return Math.min(score, 100);
}

/**
 * Analyze network quality and connection type
 */
function analyzeNetworkQuality(req, performanceData = {}) {
  const analysis = {
    connectionType: "unknown",
    estimatedBandwidth: null,
    latency: null,
    packetLoss: null,
    jitter: null,
    quality: "unknown",
  };

  // Use Navigation Timing API data if available
  if (performanceData.navigation) {
    const nav = performanceData.navigation;
    const loadTime = nav.loadEventEnd - nav.navigationStart;
    const dnsTime = nav.domainLookupEnd - nav.domainLookupStart;
    const connectTime = nav.connectEnd - nav.connectStart;

    // Estimate latency
    analysis.latency = Math.round((dnsTime + connectTime) / 2);

    // Estimate connection type based on timing
    if (analysis.latency < 50) {
      analysis.connectionType = "ethernet";
      analysis.quality = "excellent";
    } else if (analysis.latency < 100) {
      analysis.connectionType = "wifi";
      analysis.quality = "good";
    } else if (analysis.latency < 300) {
      analysis.connectionType = "4g";
      analysis.quality = "fair";
    } else {
      analysis.connectionType = "3g";
      analysis.quality = "poor";
    }
  }

  // Use Network Information API data if available
  if (performanceData.connection) {
    analysis.connectionType =
      performanceData.connection.effectiveType || analysis.connectionType;
    analysis.estimatedBandwidth = performanceData.connection.downlink;
    if (performanceData.connection.rtt) {
      analysis.latency = performanceData.connection.rtt;
    }
  }

  return analysis;
}

/**
 * Collect privacy preferences and compliance data
 */
function collectPrivacyPreferences(req) {
  const privacy = {
    doNotTrack: false,
    globalPrivacyControl: false,
    consentGiven: false,
    privacyMode: false,
    preferences: {},
  };

  // Check DNT header
  if (req.headers["dnt"] === "1") {
    privacy.doNotTrack = true;
  }

  // Check Global Privacy Control
  if (req.headers["sec-gpc"] === "1") {
    privacy.globalPrivacyControl = true;
  }

  // Check for privacy mode indicators
  const userAgent = req.headers["user-agent"] || "";
  PRIVACY_SIGNALS.PRIVACY_MODE.forEach((mode) => {
    if (userAgent.toLowerCase().includes(mode)) {
      privacy.privacyMode = true;
    }
  });

  // Check consent cookies or headers
  if (req.cookies?.consent || req.headers["x-consent"]) {
    privacy.consentGiven = true;
    privacy.preferences = parseConsentPreferences(
      req.cookies?.consent || req.headers["x-consent"]
    );
  }

  return privacy;
}

/**
 * Parse consent preferences
 */
function parseConsentPreferences(consentString) {
  try {
    if (typeof consentString === "string") {
      return JSON.parse(consentString);
    }
    return consentString;
  } catch {
    return {};
  }
}

/**
 * Get development environment location info for localhost
 */
function getDevLocationInfo(ip) {
  // For localhost/development environment, provide mock data
  if (ip === "::1" || ip === "127.0.0.1" || ip === "localhost") {
    return {
      country: "United States",
      countryCode: "US",
      region: "California",
      city: "San Francisco",
      timezone: "America/Los_Angeles",
      isp: "Local Development",
    };
  }

  // For other IPs in development, return null to indicate no data
  return {
    country: null,
    countryCode: null,
    region: null,
    city: null,
    timezone: null,
    isp: null,
  };
}

/**
 * Detect WebRTC leaks
 */
function detectWebRTCLeaks(clientData = {}) {
  const webrtcInfo = {
    localIP: null,
    publicIP: null,
    hasLeak: false,
  };

  if (clientData.webrtc) {
    webrtcInfo.localIP = clientData.webrtc.localIP;
    webrtcInfo.publicIP = clientData.webrtc.publicIP;

    // Check if local IP is exposed (potential leak)
    if (
      webrtcInfo.localIP &&
      webrtcInfo.localIP.match(
        /^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/
      )
    ) {
      webrtcInfo.hasLeak = true;
    }
  }

  return webrtcInfo;
}

/**
 * Main function to collect comprehensive technical information
 */
function collectAdvancedTechnicalInfo(req, clientData = {}) {
  const startTime = Date.now();

  // Basic information
  const userAgent = req.headers["user-agent"] || "";
  const browserInfo = extractAdvancedBrowserInfo(userAgent, req.headers);
  const deviceInfo = extractDeviceInfo(userAgent);
  const osInfo = extractOSInfo(userAgent);

  // Advanced detection
  const securityThreats = detectAdvancedSecurityThreats(req);
  const fingerprint = generateAdvancedFingerprint(req, clientData);
  const networkQuality = analyzeNetworkQuality(req, clientData.performance);
  const privacyPreferences = collectPrivacyPreferences(req);
  const webrtcInfo = detectWebRTCLeaks(clientData);

  const technicalInfo = {
    // Network information
    network: {
      ip: {
        ipv4: req.ip || req.connection.remoteAddress,
        ipv6:
          req.headers["x-forwarded-for"]
            ?.split(",")
            .find((ip) => ip.includes(":"))
            ?.trim() || null,
        real:
          webrtcInfo.publicIP ||
          req.headers["x-real-ip"] ||
          req.headers["cf-connecting-ip"] ||
          req.ip,
        local: webrtcInfo.localIP,
        // Enhanced IP detection for VPN scenarios
        forwardedIPs:
          req.headers["x-forwarded-for"]?.split(",").map((ip) => ip.trim()) ||
          null,
        realIP: req.headers["x-real-ip"] || null,
        cfConnectingIP: req.headers["cf-connecting-ip"] || null,
        // Most likely real IP (prioritizes WebRTC public IP)
        mostLikelyReal:
          webrtcInfo.publicIP ||
          req.headers["x-real-ip"] ||
          req.headers["cf-connecting-ip"] ||
          (req.headers["x-forwarded-for"]?.split(",").length > 1
            ? req.headers["x-forwarded-for"]
                .split(",")
                .filter((ip) => {
                  // Filter out private IPs and Cloudflare IPs
                  return (
                    !ip
                      .trim()
                      .match(
                        /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.|127\.|::1$)/
                      ) &&
                    !ip
                      .trim()
                      .match(
                        /^(103\.21\.244\.|103\.22\.200\.|104\.16\.|131\.0\.72\.|141\.101\.|162\.158\.|172\.64\.|172\.65\.|172\.66\.|172\.67\.|173\.245\.48\.|188\.114\.96\.|188\.114\.97\.|188\.114\.98\.|188\.114\.99\.|190\.93\.240\.|190\.93\.241\.|190\.93\.242\.|190\.93\.243\.|197\.234\.240\.|197\.234\.241\.|197\.234\.242\.|197\.234\.243\.|199\.27\.128\.)/
                      )
                  );
                })
                .pop()
                ?.trim()
            : null) ||
          req.ip,
      },
      location: {
        country:
          req.headers["cf-ipcountry"] ||
          clientData.location?.country ||
          getDevLocationInfo(req.ip).country,
        countryCode:
          req.headers["cf-ipcountry"] ||
          clientData.location?.countryCode ||
          getDevLocationInfo(req.ip).countryCode,
        region:
          req.headers["cf-region"] ||
          clientData.location?.region ||
          getDevLocationInfo(req.ip).region,
        city:
          req.headers["cf-city"] ||
          clientData.location?.city ||
          getDevLocationInfo(req.ip).city,
        postal: req.headers["cf-postal"] || clientData.location?.postal,
        timezone:
          req.headers["cf-timezone"] ||
          clientData.timezone ||
          getDevLocationInfo(req.ip).timezone,
        coordinates: clientData.location?.coordinates || null,
      },
      isp: {
        name: req.headers["cf-isp"] || getDevLocationInfo(req.ip).isp,
        organization: req.headers["cf-org"] || null,
        asn: req.headers["cf-asn"] || null,
        domain: null, // Removed API domain collection as it's not useful
      },
      quality: networkQuality,
    },

    // Browser information
    browser: {
      ...browserInfo,
      userAgent: userAgent,
      language: req.headers["accept-language"]?.split(",")[0] || "",
      languages:
        req.headers["accept-language"]?.split(",").map((l) => l.trim()) || [],
      cookiesEnabled: req.headers["cookie"] ? true : false,
      javaScriptEnabled: clientData.jsEnabled !== false,
      plugins: clientData.plugins || [],
      mimeTypes: clientData.mimeTypes || [],
    },

    // Device information
    device: {
      ...deviceInfo,
      os: osInfo,
      screen: {
        width: clientData.screen?.width || null,
        height: clientData.screen?.height || null,
        colorDepth: clientData.screen?.colorDepth || null,
        pixelRatio: clientData.screen?.pixelRatio || null,
        orientation: clientData.screen?.orientation || null,
      },
      hardware: {
        concurrency: clientData.hardwareConcurrency || null,
        memory: clientData.deviceMemory || null,
        gpu: clientData.gpu || null,
      },
      sensors: {
        touch: clientData.touchSupport || false,
        gyroscope: clientData.sensors?.gyroscope || false,
        accelerometer: clientData.sensors?.accelerometer || false,
        magnetometer: clientData.sensors?.magnetometer || false,
      },
      battery: clientData.battery || null,
    },

    // Security analysis
    security: {
      ...securityThreats,
      webrtc: webrtcInfo,
      tls: securityThreats.details.tls,
    },

    // Fingerprinting
    fingerprint: {
      hash: fingerprint.fingerprint,
      uniqueness: fingerprint.uniquenessScore,
      components: {
        canvas: clientData.canvasFingerprint || null,
        webgl: clientData.webglFingerprint || null,
        audio: clientData.audioFingerprint || null,
        fonts: clientData.fonts?.length || 0,
      },
    },

    // Privacy settings
    privacy: privacyPreferences,

    // Performance metrics
    performance: {
      loadTime: clientData.performance?.loadTime || null,
      renderTime: clientData.performance?.renderTime || null,
      resourceTiming: clientData.performance?.resources || [],
      memory: clientData.performance?.memory || null,
    },

    // Metadata
    metadata: {
      collectedAt: new Date().toISOString(),
      collectionTime: Date.now() - startTime,
      referrer: req.headers["referer"] || req.headers["referrer"] || null,
      campaign: {
        source: req.query.utm_source || req.body.utm_source || null,
        medium: req.query.utm_medium || req.body.utm_medium || null,
        campaign: req.query.utm_campaign || req.body.utm_campaign || null,
        term: req.query.utm_term || req.body.utm_term || null,
        content: req.query.utm_content || req.body.utm_content || null,
      },
      version: "2.0",
    },
  };

  return technicalInfo;
}

/**
 * Advanced middleware with caching and rate limiting
 */
function advancedTechnicalInfoMiddleware(options = {}) {
  const {
    cache = true,
    cacheTimeout = 300000, // 5 minutes
    rateLimit = true,
    rateLimitWindow = 60000, // 1 minute
    rateLimitMax = 100,
    respectPrivacy = true,
  } = options;

  const requestCache = new Map();
  const rateLimitMap = new Map();

  return (req, res, next) => {
    // Check privacy preferences
    if (
      respectPrivacy &&
      (req.headers["dnt"] === "1" || req.headers["sec-gpc"] === "1")
    ) {
      req.technicalInfo = { privacy: { respected: true } };
      return next();
    }

    // Rate limiting
    if (rateLimit) {
      const clientKey = req.ip || req.connection.remoteAddress;
      const now = Date.now();
      const clientRequests = rateLimitMap.get(clientKey) || [];

      // Clean old requests
      const recentRequests = clientRequests.filter(
        (time) => now - time < rateLimitWindow
      );

      if (recentRequests.length >= rateLimitMax) {
        res.status(429).json({ error: "Too many requests" });
        return;
      }

      recentRequests.push(now);
      rateLimitMap.set(clientKey, recentRequests);
    }

    // Check cache
    if (cache) {
      const cacheKey = `${req.ip}-${req.headers["user-agent"]}`;
      const cachedInfo = requestCache.get(cacheKey);

      if (cachedInfo && Date.now() - cachedInfo.timestamp < cacheTimeout) {
        req.technicalInfo = cachedInfo.data;
        return next();
      }
    }

    // Collect technical info
    const clientData = req.body.deviceInfo || {};
    const technicalInfo = collectAdvancedTechnicalInfo(req, clientData);

    // Cache the result
    if (cache) {
      const cacheKey = `${req.ip}-${req.headers["user-agent"]}`;
      requestCache.set(cacheKey, {
        data: technicalInfo,
        timestamp: Date.now(),
      });

      // Clean old cache entries
      if (requestCache.size > 1000) {
        const oldestKey = requestCache.keys().next().value;
        requestCache.delete(oldestKey);
      }
    }

    // Add security headers based on threat detection
    if (technicalInfo.security.riskScore > 70) {
      res.setHeader("X-Security-Risk", "high");
      res.setHeader("X-Security-Score", technicalInfo.security.riskScore);
    } else if (technicalInfo.security.riskScore > 40) {
      res.setHeader("X-Security-Risk", "medium");
      res.setHeader("X-Security-Score", technicalInfo.security.riskScore);
    }

    req.technicalInfo = technicalInfo;
    next();
  };
}

/**
 * Generate detailed analytics report
 */
function generateAnalyticsReport(technicalInfoArray) {
  const report = {
    summary: {
      totalRequests: technicalInfoArray.length,
      uniqueUsers: new Set(
        technicalInfoArray.map((info) => info.fingerprint.hash)
      ).size,
      timeRange: {
        start: technicalInfoArray[0]?.metadata.collectedAt,
        end: technicalInfoArray[technicalInfoArray.length - 1]?.metadata
          .collectedAt,
      },
    },
    browsers: {},
    devices: {},
    operatingSystems: {},
    locations: {
      countries: {},
      cities: {},
    },
    security: {
      threats: {
        bots: 0,
        proxies: 0,
        vpns: 0,
        tor: 0,
        dataCenters: 0,
      },
      riskDistribution: {
        high: 0,
        medium: 0,
        low: 0,
      },
    },
    network: {
      connectionTypes: {},
      quality: {
        excellent: 0,
        good: 0,
        fair: 0,
        poor: 0,
      },
      averageLatency: 0,
    },
    privacy: {
      doNotTrack: 0,
      globalPrivacyControl: 0,
      privacyMode: 0,
    },
    performance: {
      averageLoadTime: 0,
      averageRenderTime: 0,
    },
  };

  // Process each technical info entry
  technicalInfoArray.forEach((info) => {
    // Browser stats
    const browser = info.browser.name;
    report.browsers[browser] = (report.browsers[browser] || 0) + 1;

    // Device stats
    const device = info.device.type;
    report.devices[device] = (report.devices[device] || 0) + 1;

    // OS stats
    const os = info.device.os.name;
    report.operatingSystems[os] = (report.operatingSystems[os] || 0) + 1;

    // Location stats
    if (info.network.location.country) {
      const country = info.network.location.country;
      report.locations.countries[country] =
        (report.locations.countries[country] || 0) + 1;
    }

    if (info.network.location.city) {
      const city = info.network.location.city;
      report.locations.cities[city] = (report.locations.cities[city] || 0) + 1;
    }

    // Security stats
    if (info.security.isBot) report.security.threats.bots++;
    if (info.security.isProxy) report.security.threats.proxies++;
    if (info.security.isVPN) report.security.threats.vpns++;
    if (info.security.isTor) report.security.threats.tor++;
    if (info.security.isDataCenter) report.security.threats.dataCenters++;

    if (info.security.riskScore > 70) {
      report.security.riskDistribution.high++;
    } else if (info.security.riskScore > 40) {
      report.security.riskDistribution.medium++;
    } else {
      report.security.riskDistribution.low++;
    }

    // Network stats
    const connectionType = info.network.quality.connectionType;
    report.network.connectionTypes[connectionType] =
      (report.network.connectionTypes[connectionType] || 0) + 1;

    const quality = info.network.quality.quality;
    if (quality && quality !== "unknown") {
      report.network.quality[quality]++;
    }

    if (info.network.quality.latency) {
      report.network.averageLatency += info.network.quality.latency;
    }

    // Privacy stats
    if (info.privacy.doNotTrack) report.privacy.doNotTrack++;
    if (info.privacy.globalPrivacyControl)
      report.privacy.globalPrivacyControl++;
    if (info.privacy.privacyMode) report.privacy.privacyMode++;

    // Performance stats
    if (info.performance.loadTime) {
      report.performance.averageLoadTime += info.performance.loadTime;
    }
    if (info.performance.renderTime) {
      report.performance.averageRenderTime += info.performance.renderTime;
    }
  });

  // Calculate averages
  const count = technicalInfoArray.length;
  if (count > 0) {
    report.network.averageLatency = Math.round(
      report.network.averageLatency / count
    );
    report.performance.averageLoadTime = Math.round(
      report.performance.averageLoadTime / count
    );
    report.performance.averageRenderTime = Math.round(
      report.performance.averageRenderTime / count
    );
  }

  return report;
}

/**
 * Basic browser detection (from original collector)
 */
function extractBrowserInfo(userAgent) {
  if (!userAgent) return { name: null, version: null, engine: null };

  // Check for each browser pattern
  for (const [browser, pattern] of Object.entries(BROWSER_PATTERNS)) {
    const match = userAgent.match(pattern);
    if (match) {
      return {
        name: browser,
        version: match[1],
        engine: extractBrowserEngine(userAgent, browser),
      };
    }
  }

  return { name: "Unknown", version: null, engine: null };
}

/**
 * Extract browser engine information
 */
function extractBrowserEngine(userAgent, browserName) {
  if (userAgent.includes("Gecko")) return "Gecko";
  if (userAgent.includes("WebKit")) return "WebKit";
  if (userAgent.includes("Blink")) return "Blink";
  if (userAgent.includes("Trident")) return "Trident";
  if (userAgent.includes("EdgeHTML")) return "EdgeHTML";
  if (userAgent.includes("Presto")) return "Presto";

  // Default engines for known browsers
  const defaultEngines = {
    Chrome: "Blink",
    Firefox: "Gecko",
    Safari: "WebKit",
    Edge: "Blink",
    Opera: "Blink",
    Brave: "Blink",
    Samsung: "WebKit",
    UC: "WebKit",
    Maxthon: "WebKit",
    Vivaldi: "Blink",
  };

  return defaultEngines[browserName] || "Unknown";
}

/**
 * Extract device information
 */
function extractDeviceInfo(userAgent) {
  if (!userAgent) return { deviceType: "unknown", model: null, vendor: null };

  // Check for specific devices
  for (const [device, pattern] of Object.entries(DEVICE_PATTERNS)) {
    if (pattern.test(userAgent)) {
      return {
        deviceType: getDeviceType(device),
        model: extractDeviceModel(userAgent, device),
        vendor: extractDeviceVendor(device),
      };
    }
  }

  // Fallback to basic detection
  if (userAgent.includes("Mobile")) {
    return { deviceType: "mobile", model: null, vendor: null };
  }
  if (userAgent.includes("Tablet") || userAgent.includes("iPad")) {
    return { deviceType: "tablet", model: null, vendor: null };
  }

  return { deviceType: "desktop", model: null, vendor: null };
}

/**
 * Get device type from device name
 */
function getDeviceType(device) {
  const mobileDevices = ["iPhone", "Android", "BlackBerry", "WindowsPhone"];
  const tabletDevices = ["iPad", "Kindle"];
  const gamingDevices = ["PlayStation", "Xbox", "Nintendo"];

  if (mobileDevices.includes(device)) return "mobile";
  if (tabletDevices.includes(device)) return "tablet";
  if (gamingDevices.includes(device)) return "gaming";

  return "desktop";
}

/**
 * Extract device model from user agent
 */
function extractDeviceModel(userAgent, device) {
  if (device === "iPhone") {
    const match = userAgent.match(
      /iPhone\s*(?:OS\s*\d+[._]\d+)?\s*;\s*([^;)]+)/
    );
    return match ? match[1].trim() : "iPhone";
  }
  if (device === "iPad") {
    const match = userAgent.match(/iPad\s*(?:OS\s*\d+[._]\d+)?\s*;\s*([^;)]+)/);
    return match ? match[1].trim() : "iPad";
  }
  if (device === "Android") {
    const match = userAgent.match(/\(Linux.*?;\s*([^;)]+)/);
    return match ? match[1].trim() : "Android Device";
  }

  return device;
}

/**
 * Extract device vendor from device type
 */
function extractDeviceVendor(device) {
  const vendors = {
    iPhone: "Apple",
    iPad: "Apple",
    iPod: "Apple",
    Android: "Google",
    BlackBerry: "BlackBerry",
    WindowsPhone: "Microsoft",
    Kindle: "Amazon",
    PlayStation: "Sony",
    Xbox: "Microsoft",
    Nintendo: "Nintendo",
  };

  return vendors[device] || null;
}

/**
 * Extract operating system information
 */
function extractOSInfo(userAgent) {
  if (!userAgent) return { name: null, version: null };

  // Check for each OS pattern
  for (const [os, pattern] of Object.entries(OS_PATTERNS)) {
    const match = userAgent.match(pattern);
    if (match) {
      return {
        name: os,
        version: match[1] || null,
      };
    }
  }

  return { name: "Unknown", version: null };
}

/**
 * Utility to get the real client IP, preferring headers over req.ip
 */
function getRealClientIP(req) {
  // Prefer Cloudflare header, then x-forwarded-for, then x-real-ip, then req.ip
  return (
    req.headers["cf-connecting-ip"] ||
    (req.headers["x-forwarded-for"]
      ? req.headers["x-forwarded-for"].split(",")[0].trim()
      : null) ||
    req.headers["x-real-ip"] ||
    req.ip
  );
}

// Export all functions
module.exports = {
  // Main collection function
  collectAdvancedTechnicalInfo,

  // Middleware
  advancedTechnicalInfoMiddleware,

  // Detection functions
  extractAdvancedBrowserInfo,
  detectAdvancedBots,
  detectAdvancedSecurityThreats,
  detectProxyVPN,
  detectTor,
  detectDataCenterIP,
  detectWebRTCLeaks,

  // Analysis functions
  analyzeNetworkQuality,
  generateAdvancedFingerprint,
  collectPrivacyPreferences,

  // Reporting
  generateAnalyticsReport,

  // Helper functions (basic compatibility)
  extractBrowserInfo,
  extractDeviceInfo,
  extractOSInfo,
  getTLSFingerprint,

  // Constants for external use
  BROWSER_PATTERNS,
  BOT_PATTERNS,
  PROXY_HEADERS,
  NETWORK_QUALITY,
  getRealClientIP, // <-- Export the new utility
};
