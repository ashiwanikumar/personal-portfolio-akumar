const express = require("express");
const router = express.Router();
const https = require("https");
const { URL } = require("url");

// Staging API configuration
const STAGING_API_BASE =
  "https://v1-api-staging.shivrajsinghchouhan.co.in/api/v1";

/**
 * Make HTTP request with timing
 */
function makeTimedRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const urlObj = new URL(url);

    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || "GET",
      headers: {
        "User-Agent": "Staging-Monitor/1.0",
        Accept: "application/json",
        ...options.headers,
      },
      timeout: options.timeout || 10000,
    };

    const req = https.request(requestOptions, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData,
            responseTime,
            success: res.statusCode >= 200 && res.statusCode < 300,
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data,
            responseTime,
            success: res.statusCode >= 200 && res.statusCode < 300,
            parseError: error.message,
          });
        }
      });
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    req.on("error", (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

/**
 * Check staging API health
 */
router.get("/staging-health", async (req, res) => {
  try {
    const healthUrl = `${STAGING_API_BASE}/healthCheck`;
    const result = await makeTimedRequest(healthUrl);

    const healthData = {
      timestamp: new Date().toISOString(),
      endpoint: healthUrl,
      status: result.success ? "healthy" : "unhealthy",
      httpCode: result.statusCode,
      responseTime: result.responseTime,
      apiResponse: result.data,
      success: result.success ? 1 : 0,
    };

    res.status(result.success ? 200 : 503).json(healthData);
  } catch (error) {
    res.status(500).json({
      timestamp: new Date().toISOString(),
      status: "error",
      httpCode: 0,
      responseTime: 0,
      error: error.message,
      success: 0,
    });
  }
});

/**
 * Staging API performance metrics
 */
router.get("/staging-performance", async (req, res) => {
  try {
    const healthUrl = `${STAGING_API_BASE}/healthCheck`;
    const measurements = [];
    const numTests = 5; // Run 5 quick tests

    for (let i = 0; i < numTests; i++) {
      try {
        const result = await makeTimedRequest(healthUrl);
        measurements.push({
          responseTime: result.responseTime,
          success: result.success,
          statusCode: result.statusCode,
        });
      } catch (error) {
        measurements.push({
          responseTime: 0,
          success: false,
          statusCode: 0,
          error: error.message,
        });
      }
    }

    const successfulMeasurements = measurements.filter((m) => m.success);
    const responseTimes = successfulMeasurements.map((m) => m.responseTime);

    const performance = {
      timestamp: new Date().toISOString(),
      endpoint: healthUrl,
      measurements: numTests,
      successfulMeasurements: successfulMeasurements.length,
      successRate: ((successfulMeasurements.length / numTests) * 100).toFixed(
        2
      ),
      avgResponseTime:
        responseTimes.length > 0
          ? Math.round(
              responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
            )
          : 0,
      minResponseTime:
        responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
      maxResponseTime:
        responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
      availability: successfulMeasurements.length > 0 ? 1 : 0,
    };

    res.status(200).json(performance);
  } catch (error) {
    res.status(500).json({
      timestamp: new Date().toISOString(),
      error: error.message,
      availability: 0,
    });
  }
});

/**
 * Staging API status summary
 */
router.get("/staging-status", async (req, res) => {
  try {
    const healthUrl = `${STAGING_API_BASE}/healthCheck`;
    const result = await makeTimedRequest(healthUrl);

    // Simple status for monitoring
    const status = {
      timestamp: new Date().toISOString(),
      available: result.success ? 1 : 0,
      responseTime: result.responseTime,
      httpCode: result.statusCode,
      apiStatus: result.data?.status || "unknown",
      apiMessage: result.data?.message || "No message",
    };

    res.status(200).json(status);
  } catch (error) {
    res.status(200).json({
      timestamp: new Date().toISOString(),
      available: 0,
      responseTime: 0,
      httpCode: 0,
      apiStatus: "error",
      apiMessage: error.message,
    });
  }
});

/**
 * Test multiple staging endpoints (if you add more later)
 */
router.get("/staging-endpoints", async (req, res) => {
  const endpoints = [
    { name: "healthCheck", path: "/healthCheck" },
    // Add more endpoints here as you develop them
    // { name: "status", path: "/status" },
    // { name: "version", path: "/version" }
  ];

  const results = [];

  for (const endpoint of endpoints) {
    try {
      const url = `${STAGING_API_BASE}${endpoint.path}`;
      const result = await makeTimedRequest(url);

      results.push({
        name: endpoint.name,
        url: url,
        available: result.success ? 1 : 0,
        responseTime: result.responseTime,
        httpCode: result.statusCode,
        response: result.data,
      });
    } catch (error) {
      results.push({
        name: endpoint.name,
        url: `${STAGING_API_BASE}${endpoint.path}`,
        available: 0,
        responseTime: 0,
        httpCode: 0,
        error: error.message,
      });
    }
  }

  res.status(200).json({
    timestamp: new Date().toISOString(),
    totalEndpoints: endpoints.length,
    availableEndpoints: results.filter((r) => r.available === 1).length,
    endpoints: results,
  });
});

/**
 * Simple status check (returns just 1 or 0)
 */
router.get("/staging-up", async (req, res) => {
  try {
    const healthUrl = `${STAGING_API_BASE}/healthCheck`;
    const result = await makeTimedRequest(healthUrl, { timeout: 5000 });

    // Return simple response for monitoring
    res
      .status(200)
      .send(result.success && result.data?.status === "success" ? "1" : "0");
  } catch (error) {
    res.status(200).send("0");
  }
});

/**
 * Response time only (for monitoring)
 */
router.get("/staging-response-time", async (req, res) => {
  try {
    const healthUrl = `${STAGING_API_BASE}/healthCheck`;
    const result = await makeTimedRequest(healthUrl, { timeout: 5000 });

    res.status(200).send(result.responseTime.toString());
  } catch (error) {
    res.status(200).send("0");
  }
});

module.exports = router;
