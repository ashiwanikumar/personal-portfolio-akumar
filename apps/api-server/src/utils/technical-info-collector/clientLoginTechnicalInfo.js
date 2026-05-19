const { collectAdvancedTechnicalInfo } = require("./technicalInfoCollector");
const geoLocationService = require("./geoLocationService");

/**
 * Collects technical info for client-side login with WebRTC priority
 * Returns: { technicalInfo, geoData, realClientIP, mergedTechnicalInfo }
 */
async function collectClientLoginTechnicalInfo(
  req,
  frontendTechnicalInfo = null
) {
  // Collect advanced technical information from server
  let technicalInfo = await collectAdvancedTechnicalInfo(
    req,
    frontendTechnicalInfo || {}
  );

  // Get real client IP with WebRTC priority
  const realClientIP = getRealClientIPWithWebRTCPriority(
    req,
    frontendTechnicalInfo || {}
  );

  // Get geolocation data for the real client IP
  const geoData = await geoLocationService.getGeoLocationData(realClientIP);

  // Merge frontend and server technical info if provided
  let mergedTechnicalInfo = technicalInfo;
  if (frontendTechnicalInfo) {
    mergedTechnicalInfo = {
      ...technicalInfo,
      frontend: {
        browser: frontendTechnicalInfo.browser || {},
        device: frontendTechnicalInfo.device || {},
        system: frontendTechnicalInfo.system || {},
        network: frontendTechnicalInfo.network || {},
        security: frontendTechnicalInfo.security || {},
        performance: frontendTechnicalInfo.performance || {},
        location: frontendTechnicalInfo.location || {},
        metadata: frontendTechnicalInfo.metadata || {},
        // Include WebRTC data specifically
        webrtc: frontendTechnicalInfo.webrtc || {},
        canvasFingerprint: frontendTechnicalInfo.canvasFingerprint || null,
        webglFingerprint: frontendTechnicalInfo.webglFingerprint || null,
        audioFingerprint: frontendTechnicalInfo.audioFingerprint || null,
        fonts: frontendTechnicalInfo.fonts || [],
      },
    };
  }

  return {
    technicalInfo,
    geoData,
    realClientIP,
    mergedTechnicalInfo,
  };
}

/**
 * Get real client IP with WebRTC priority (similar to abuse complaint approach)
 */
function getRealClientIPWithWebRTCPriority(req, clientData = {}) {
  // First, check if client sent WebRTC public IP (most accurate)
  if (clientData.webrtc && clientData.webrtc.publicIP) {
    console.log(
      "Using WebRTC public IP from client:",
      clientData.webrtc.publicIP
    );
    return clientData.webrtc.publicIP;
  }

  // Then check server headers in order of preference (existing logic)
  const cfConnectingIP = req.headers["cf-connecting-ip"];
  const xForwardedFor = req.headers["x-forwarded-for"];
  const xRealIP = req.headers["x-real-ip"];
  const reqIP = req.ip;

  // Log available IP options for debugging
  console.log("IP detection options:", {
    webrtcPublicIP: clientData.webrtc?.publicIP || null,
    cfConnectingIP,
    xForwardedFor: xForwardedFor ? xForwardedFor.split(",")[0].trim() : null,
    xRealIP,
    reqIP,
  });

  // Return the best available IP
  return (
    cfConnectingIP ||
    (xForwardedFor ? xForwardedFor.split(",")[0].trim() : null) ||
    xRealIP ||
    reqIP
  );
}

/**
 * Enhanced login technical info collection with detailed logging
 */
async function collectEnhancedLoginTechnicalInfo(
  req,
  frontendTechnicalInfo = null
) {
  console.log("Collecting enhanced login technical information...");
  console.log(
    "Frontend technical info received:",
    frontendTechnicalInfo ? "Yes" : "No"
  );

  if (frontendTechnicalInfo) {
    console.log("Frontend technical info details:", {
      hasWebRTC: !!frontendTechnicalInfo.webrtc,
      webrtcPublicIP: frontendTechnicalInfo.webrtc?.publicIP || null,
      webrtcLocalIP: frontendTechnicalInfo.webrtc?.localIP || null,
      browser: frontendTechnicalInfo.browser?.name || null,
      device: frontendTechnicalInfo.device?.type || null,
      os: frontendTechnicalInfo.system?.os || null,
      hasCanvasFingerprint: !!frontendTechnicalInfo.canvasFingerprint,
      hasWebGLFingerprint: !!frontendTechnicalInfo.webglFingerprint,
      hasAudioFingerprint: !!frontendTechnicalInfo.audioFingerprint,
      fontsCount: frontendTechnicalInfo.fonts?.length || 0,
    });
  }

  const result = await collectClientLoginTechnicalInfo(
    req,
    frontendTechnicalInfo
  );

  // Log the results
  console.log("Enhanced login technical data collected:", {
    ip: result.technicalInfo.network.ip.ipv4,
    realIP: result.realClientIP,
    country: result.geoData?.country,
    city: result.geoData?.city,
    device: result.technicalInfo.device.deviceType,
    browser: result.technicalInfo.browser.name,
    os: result.technicalInfo.device.os.name,
    frontendDataAvailable: !!frontendTechnicalInfo,
    frontendBrowser: frontendTechnicalInfo?.browser?.name,
    frontendDevice: frontendTechnicalInfo?.device?.type,
    frontendOS: frontendTechnicalInfo?.system?.os,
    webrtcUsed: !!frontendTechnicalInfo?.webrtc?.publicIP,
  });

  return result;
}

module.exports = {
  collectClientLoginTechnicalInfo,
  collectEnhancedLoginTechnicalInfo,
  getRealClientIPWithWebRTCPriority,
};
