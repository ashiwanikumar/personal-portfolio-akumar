const os = require('os');

class APIMetrics {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        success: 0,
        errors: 0,
        byEndpoint: new Map(),
        byMethod: new Map(),
        byStatusCode: new Map(),
        byMinute: new Map(),
        byHour: new Map()
      },
      performance: {
        avgResponseTime: 0,
        totalResponseTime: 0,
        slowestEndpoint: { path: '', time: 0 },
        fastestEndpoint: { path: '', time: Infinity },
        responseTimeBuckets: {
          fast: 0,    // < 100ms
          medium: 0,  // 100ms - 500ms
          slow: 0,    // 500ms - 2s
          verySlow: 0 // > 2s
        }
      },
      errors: {
        total: 0,
        byEndpoint: new Map(),
        byType: new Map(),
        recent: [] // Last 100 errors
      },
      realTime: {
        requestsPerMinute: 0,
        currentActiveRequests: 0,
        peakConcurrentRequests: 0,
        lastRequestTime: null
      }
    };

    // Clean up old minute/hour data periodically
    setInterval(() => this.cleanupTimeBasedMetrics(), 60000); // Every minute
  }

  // Middleware function
  middleware() {
    return (req, res, next) => {
      const startTime = Date.now();
      const timestamp = new Date();
      const minute = `${timestamp.getHours()}:${timestamp.getMinutes()}`;
      const hour = timestamp.getHours();

      // Track active requests
      this.metrics.realTime.currentActiveRequests++;
      if (this.metrics.realTime.currentActiveRequests > this.metrics.realTime.peakConcurrentRequests) {
        this.metrics.realTime.peakConcurrentRequests = this.metrics.realTime.currentActiveRequests;
      }

      // Track request by minute and hour
      this.incrementMapValue(this.metrics.requests.byMinute, minute);
      this.incrementMapValue(this.metrics.requests.byHour, hour);

      // Override res.end to capture response data
      const originalEnd = res.end;
      res.end = (...args) => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        const statusCode = res.statusCode;
        const endpoint = this.normalizeEndpoint(req.path);
        const method = req.method;

        // Update metrics
        this.updateMetrics(endpoint, method, statusCode, responseTime, req, res);

        // Decrease active requests
        this.metrics.realTime.currentActiveRequests--;
        this.metrics.realTime.lastRequestTime = endTime;

        // Call original end
        originalEnd.apply(res, args);
      };

      next();
    };
  }

  updateMetrics(endpoint, method, statusCode, responseTime, req, res) {
    // Total requests
    this.metrics.requests.total++;

    // Success/Error counting
    if (statusCode >= 200 && statusCode < 400) {
      this.metrics.requests.success++;
    } else {
      this.metrics.requests.errors++;
      this.trackError(endpoint, statusCode, req, res);
    }

    // By endpoint, method, status code
    this.incrementMapValue(this.metrics.requests.byEndpoint, endpoint);
    this.incrementMapValue(this.metrics.requests.byMethod, method);
    this.incrementMapValue(this.metrics.requests.byStatusCode, statusCode);

    // Performance metrics
    this.updatePerformanceMetrics(endpoint, responseTime);
  }

  updatePerformanceMetrics(endpoint, responseTime) {
    // Average response time
    this.metrics.performance.totalResponseTime += responseTime;
    this.metrics.performance.avgResponseTime = 
      this.metrics.performance.totalResponseTime / this.metrics.requests.total;

    // Slowest/Fastest endpoints
    if (responseTime > this.metrics.performance.slowestEndpoint.time) {
      this.metrics.performance.slowestEndpoint = { path: endpoint, time: responseTime };
    }
    if (responseTime < this.metrics.performance.fastestEndpoint.time) {
      this.metrics.performance.fastestEndpoint = { path: endpoint, time: responseTime };
    }

    // Response time buckets
    if (responseTime < 100) {
      this.metrics.performance.responseTimeBuckets.fast++;
    } else if (responseTime < 500) {
      this.metrics.performance.responseTimeBuckets.medium++;
    } else if (responseTime < 2000) {
      this.metrics.performance.responseTimeBuckets.slow++;
    } else {
      this.metrics.performance.responseTimeBuckets.verySlow++;
    }
  }

  trackError(endpoint, statusCode, req, res) {
    this.metrics.errors.total++;
    this.incrementMapValue(this.metrics.errors.byEndpoint, endpoint);
    this.incrementMapValue(this.metrics.errors.byType, statusCode);

    // Store recent errors (keep last 100)
    const errorInfo = {
      timestamp: new Date().toISOString(),
      endpoint,
      statusCode,
      method: req.method,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress
    };

    this.metrics.errors.recent.push(errorInfo);
    if (this.metrics.errors.recent.length > 100) {
      this.metrics.errors.recent.shift();
    }
  }

  incrementMapValue(map, key) {
    map.set(key, (map.get(key) || 0) + 1);
  }

  normalizeEndpoint(path) {
    // Normalize paths with IDs (e.g., /api/v1/users/123 -> /api/v1/users/:id)
    return path
      .replace(/\/[0-9a-fA-F]{24}/g, '/:id') // MongoDB ObjectIds
      .replace(/\/\d+/g, '/:id') // Numeric IDs
      .replace(/\/[a-f0-9-]{36}/g, '/:uuid'); // UUIDs
  }

  cleanupTimeBasedMetrics() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = `${currentHour}:${now.getMinutes()}`;

    // Keep only last 60 minutes of data
    const keysToDelete = [];
    for (const [key] of this.metrics.requests.byMinute) {
      const [hour, minute] = key.split(':').map(Number);
      const keyTime = new Date(now);
      keyTime.setHours(hour, minute, 0, 0);
      
      if (now - keyTime > 60 * 60 * 1000) { // Older than 1 hour
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.metrics.requests.byMinute.delete(key));

    // Calculate requests per minute
    const lastMinuteKey = `${currentHour}:${now.getMinutes() - 1}`;
    this.metrics.realTime.requestsPerMinute = this.metrics.requests.byMinute.get(lastMinuteKey) || 0;
  }

  getMetrics() {
    return {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      requests: {
        total: this.metrics.requests.total,
        success: this.metrics.requests.success,
        errors: this.metrics.requests.errors,
        successRate: this.metrics.requests.total > 0 
          ? (this.metrics.requests.success / this.metrics.requests.total * 100).toFixed(2)
          : 0,
        errorRate: this.metrics.requests.total > 0 
          ? (this.metrics.requests.errors / this.metrics.requests.total * 100).toFixed(2)
          : 0,
        topEndpoints: this.getTopFromMap(this.metrics.requests.byEndpoint, 10),
        byMethod: this.mapToObject(this.metrics.requests.byMethod),
        byStatusCode: this.mapToObject(this.metrics.requests.byStatusCode),
        recentMinutes: this.mapToObject(this.metrics.requests.byMinute)
      },
      performance: {
        avgResponseTime: Math.round(this.metrics.performance.avgResponseTime),
        slowestEndpoint: this.metrics.performance.slowestEndpoint,
        fastestEndpoint: this.metrics.performance.fastestEndpoint.time === Infinity 
          ? { path: 'N/A', time: 0 } 
          : this.metrics.performance.fastestEndpoint,
        responseTimeBuckets: this.metrics.performance.responseTimeBuckets,
        performanceScore: this.calculatePerformanceScore()
      },
      errors: {
        total: this.metrics.errors.total,
        topErrorEndpoints: this.getTopFromMap(this.metrics.errors.byEndpoint, 5),
        byStatusCode: this.mapToObject(this.metrics.errors.byType),
        recent: this.metrics.errors.recent.slice(-10) // Last 10 errors
      },
      realTime: {
        requestsPerMinute: this.metrics.realTime.requestsPerMinute,
        currentActiveRequests: this.metrics.realTime.currentActiveRequests,
        peakConcurrentRequests: this.metrics.realTime.peakConcurrentRequests,
        lastRequestTime: this.metrics.realTime.lastRequestTime,
        systemLoad: os.loadavg()[0]
      }
    };
  }

  calculatePerformanceScore() {
    const buckets = this.metrics.performance.responseTimeBuckets;
    const total = buckets.fast + buckets.medium + buckets.slow + buckets.verySlow;
    
    if (total === 0) return 100;
    
    const score = (
      (buckets.fast * 100) +
      (buckets.medium * 75) +
      (buckets.slow * 50) +
      (buckets.verySlow * 25)
    ) / total;
    
    return Math.round(score);
  }

  getTopFromMap(map, limit) {
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([key, value]) => ({ endpoint: key, count: value }));
  }

  mapToObject(map) {
    const obj = {};
    for (const [key, value] of map) {
      obj[key] = value;
    }
    return obj;
  }

  reset() {
    this.metrics = {
      requests: {
        total: 0,
        success: 0,
        errors: 0,
        byEndpoint: new Map(),
        byMethod: new Map(),
        byStatusCode: new Map(),
        byMinute: new Map(),
        byHour: new Map()
      },
      performance: {
        avgResponseTime: 0,
        totalResponseTime: 0,
        slowestEndpoint: { path: '', time: 0 },
        fastestEndpoint: { path: '', time: Infinity },
        responseTimeBuckets: {
          fast: 0,
          medium: 0,
          slow: 0,
          verySlow: 0
        }
      },
      errors: {
        total: 0,
        byEndpoint: new Map(),
        byType: new Map(),
        recent: []
      },
      realTime: {
        requestsPerMinute: 0,
        currentActiveRequests: 0,
        peakConcurrentRequests: 0,
        lastRequestTime: null
      }
    };
  }
}

// Singleton instance
const apiMetrics = new APIMetrics();

module.exports = {
  apiMetrics,
  middleware: () => apiMetrics.middleware()
};