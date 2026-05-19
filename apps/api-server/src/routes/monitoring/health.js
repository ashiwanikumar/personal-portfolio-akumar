const express = require("express");
const router = express.Router();
const os = require("os");
const fs = require("fs");
const { exec } = require("child_process");
const { promisify } = require("util");
const { apiMetrics } = require("../../middlewares/apiMonitoring");

const execAsync = promisify(exec);

/**
 * Basic health check endpoint for monitoring
 */
router.get("/health", (req, res) => {
  const healthcheck = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    status: "healthy",
    version: process.version,
    environment: process.env.NODE_ENV || "development",
    memory: {
      rss: process.memoryUsage().rss,
      heapTotal: process.memoryUsage().heapTotal,
      heapUsed: process.memoryUsage().heapUsed,
      external: process.memoryUsage().external,
      arrayBuffers: process.memoryUsage().arrayBuffers
    },
    cpu: process.cpuUsage(),
    pid: process.pid
  };

  try {
    res.status(200).json(healthcheck);
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Detailed system metrics for monitoring
 */
router.get("/metrics", async (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      system: {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        loadAverage: os.loadavg(),
        uptime: os.uptime()
      },
      process: {
        pid: process.pid,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        version: process.version,
        platform: process.platform,
        arch: process.arch
      },
      nodejs: {
        activeHandles: process._getActiveHandles().length,
        activeRequests: process._getActiveRequests().length
      }
    };

    // Add disk usage if available
    try {
      const { stdout } = await execAsync("df -h /");
      const lines = stdout.trim().split("\n");
      if (lines.length > 1) {
        const diskData = lines[1].split(/\s+/);
        metrics.disk = {
          filesystem: diskData[0],
          size: diskData[1],
          used: diskData[2],
          available: diskData[3],
          usedPercentage: diskData[4],
          mountPoint: diskData[5]
        };
      }
    } catch (diskError) {
      metrics.disk = { error: "Unable to fetch disk metrics" };
    }

    res.status(200).json(metrics);
  } catch (error) {
    res.status(500).json({
      error: "Failed to collect metrics",
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * PM2 process metrics
 */
router.get("/pm2", async (req, res) => {
  try {
    const { stdout } = await execAsync("pm2 jlist");
    const pm2Processes = JSON.parse(stdout);
    
    const processMetrics = pm2Processes.map(proc => ({
      name: proc.name,
      pid: proc.pid,
      status: proc.pm2_env.status,
      restarts: proc.pm2_env.restart_time,
      uptime: proc.pm2_env.pm_uptime,
      memory: proc.pm2_env.axm_monitor ? proc.pm2_env.axm_monitor["Heap Usage"]?.value : "N/A",
      cpu: proc.pm2_env.axm_monitor ? proc.pm2_env.axm_monitor["CPU usage"]?.value : "N/A"
    }));

    res.status(200).json({
      timestamp: new Date().toISOString(),
      processes: processMetrics,
      totalProcesses: pm2Processes.length
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch PM2 metrics",
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Nginx status metrics
 */
router.get("/nginx", async (req, res) => {
  try {
    // Check if nginx is running
    const { stdout: nginxStatus } = await execAsync("systemctl is-active nginx");
    
    let nginxMetrics = {
      timestamp: new Date().toISOString(),
      status: nginxStatus.trim(),
      active: nginxStatus.trim() === "active"
    };

    // Try to get nginx stats if stub_status is enabled
    try {
      const { stdout: statsOutput } = await execAsync("curl -s http://localhost/nginx_status");
      const lines = statsOutput.split("\n");
      
      if (lines.length >= 3) {
        const activeConnections = lines[0].match(/(\d+)/);
        const serverStats = lines[2].split(" ");
        
        nginxMetrics.connections = {
          active: activeConnections ? parseInt(activeConnections[1]) : 0,
          accepts: parseInt(serverStats[1]) || 0,
          handled: parseInt(serverStats[2]) || 0,
          requests: parseInt(serverStats[3]) || 0
        };
      }
    } catch (statsError) {
      nginxMetrics.note = "Nginx status module not configured";
    }

    res.status(200).json(nginxMetrics);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch Nginx metrics",
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * API metrics and statistics
 */
router.get("/api-stats", (req, res) => {
  try {
    const stats = apiMetrics.getMetrics();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch API statistics",
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Real-time API metrics for dashboards
 */
router.get("/api-realtime", (req, res) => {
  try {
    const metrics = apiMetrics.getMetrics();
    const realtimeData = {
      timestamp: new Date().toISOString(),
      currentRequests: metrics.realTime.currentActiveRequests,
      requestsPerMinute: metrics.realTime.requestsPerMinute,
      avgResponseTime: metrics.performance.avgResponseTime,
      errorRate: metrics.requests.errorRate,
      successRate: metrics.requests.successRate,
      totalRequests: metrics.requests.total,
      performanceScore: metrics.performance.performanceScore,
      systemLoad: os.loadavg()[0],
      memoryUsage: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        percentage: (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal * 100).toFixed(2)
      }
    };

    res.status(200).json(realtimeData);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch real-time metrics",
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Endpoint performance analysis
 */
router.get("/endpoint-performance", (req, res) => {
  try {
    const metrics = apiMetrics.getMetrics();
    
    const endpointPerformance = {
      timestamp: new Date().toISOString(),
      topEndpoints: metrics.requests.topEndpoints,
      slowestEndpoint: metrics.performance.slowestEndpoint,
      fastestEndpoint: metrics.performance.fastestEndpoint,
      responseTimeBuckets: metrics.performance.responseTimeBuckets,
      errorEndpoints: metrics.errors.topErrorEndpoints,
      methodDistribution: metrics.requests.byMethod,
      statusCodeDistribution: metrics.requests.byStatusCode
    };

    res.status(200).json(endpointPerformance);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch endpoint performance",
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Error analysis and recent errors
 */
router.get("/error-analysis", (req, res) => {
  try {
    const metrics = apiMetrics.getMetrics();
    
    const errorAnalysis = {
      timestamp: new Date().toISOString(),
      totalErrors: metrics.errors.total,
      errorRate: metrics.requests.errorRate,
      topErrorEndpoints: metrics.errors.topErrorEndpoints,
      errorsByStatusCode: metrics.errors.byStatusCode,
      recentErrors: metrics.errors.recent,
      errorTrends: {
        // Add trend analysis if needed
        increasing: false, // Implement trend calculation
        stable: true
      }
    };

    res.status(200).json(errorAnalysis);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch error analysis",
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Traffic analysis
 */
router.get("/traffic-analysis", (req, res) => {
  try {
    const metrics = apiMetrics.getMetrics();
    
    const trafficAnalysis = {
      timestamp: new Date().toISOString(),
      totalRequests: metrics.requests.total,
      requestsPerMinute: metrics.realTime.requestsPerMinute,
      peakConcurrentRequests: metrics.realTime.peakConcurrentRequests,
      currentActiveRequests: metrics.realTime.currentActiveRequests,
      requestsByMethod: metrics.requests.byMethod,
      recentActivity: metrics.requests.recentMinutes,
      lastRequestTime: metrics.realTime.lastRequestTime
    };

    res.status(200).json(trafficAnalysis);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch traffic analysis",
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Application-specific metrics
 */
router.get("/app-metrics", async (req, res) => {
  try {
    const apiStats = apiMetrics.getMetrics();
    
    const appMetrics = {
      timestamp: new Date().toISOString(),
      database: {
        status: "connected", // This should be dynamic based on your DB
      },
      api: {
        totalRequests: apiStats.requests.total,
        errorRate: parseFloat(apiStats.requests.errorRate),
        avgResponseTime: apiStats.performance.avgResponseTime,
        successRate: parseFloat(apiStats.requests.successRate),
        performanceScore: apiStats.performance.performanceScore
      },
      services: {
        citizenFeedback: "healthy",
        askSschouhan: "healthy",
        suggestionsBox: "healthy"
      },
      performance: {
        responseTimeBuckets: apiStats.performance.responseTimeBuckets,
        slowestEndpoint: apiStats.performance.slowestEndpoint,
        topEndpoints: apiStats.requests.topEndpoints.slice(0, 5)
      }
    };

    res.status(200).json(appMetrics);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch application metrics",
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Reset API metrics (Admin only)
 */
router.post("/reset-metrics", (req, res) => {
  try {
    apiMetrics.reset();
    res.status(200).json({
      success: true,
      message: "API metrics reset successfully",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to reset metrics",
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Simple status endpoint that returns just HTTP status codes
 * Useful for simple monitoring web scenarios
 */
router.get("/status", (req, res) => {
  res.status(200).send("OK");
});

module.exports = router;