const winston = require("winston");
const { createLogger, transports, format } = winston;
const path = require("path");
const fs = require("fs");
const os = require("os");
const crypto = require("crypto");
const colors = require("ansi-colors");

// Ensure logs directory exists
const LOG_DIR = path.join(__dirname, "../../logs");
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Custom log levels with corresponding colors
const logLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
    performance: 5,
  },
  colors: {
    error: "red",
    warn: "yellow",
    info: "green",
    http: "magenta",
    debug: "blue",
    performance: "gray",
  },
};

// Function to create rotated filename
const createFilename = (baseFilename) => (number) => {
  const ext = path.extname(baseFilename);
  const basename = path.basename(baseFilename, ext);
  return number ? `${basename}-${number}${ext}` : baseFilename;
};

// Base transport options
const baseOptions = {
  handleExceptions: true,
  maxsize: 5242880, // 5MB
  maxFiles: 5000,
  tailable: true,
  format: format.combine(format.timestamp(), format.json()),
};

class Logger {
  constructor() {
    this.performanceMetrics = new Map();
    this.logger = this.createLogger();
    this.setupUncaughtExceptionHandler();
    this.setupUnhandledRejectionHandler();
    this.startPerformanceMonitoring();
  }

  createLogger() {
    const logger = createLogger({
      levels: logLevels.levels,
      exitOnError: false,
    });

    // Main application logs
    logger.add(
      new transports.File({
        ...baseOptions,
        filename: path.join(LOG_DIR, "app.log"),
        level: "info",
        options: {
          flags: "a",
          createFileStream: createFilename("app.log"),
        },
      })
    );

    // Error logs
    logger.add(
      new transports.File({
        ...baseOptions,
        filename: path.join(LOG_DIR, "error.log"),
        level: "error",
        options: {
          flags: "a",
          createFileStream: createFilename("error.log"),
        },
      })
    );

    // Performance logs
    logger.add(
      new transports.File({
        ...baseOptions,
        filename: path.join(LOG_DIR, "performance.log"),
        level: "performance",
        options: {
          flags: "a",
          createFileStream: createFilename("performance.log"),
        },
      })
    );

    // Console transport for development
    if (process.env.NODE_ENV !== "production") {
      logger.add(
        new transports.Console({
          level: "debug",
          handleExceptions: true,
          format: format.combine(
            format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
            format.printf(({ level, message, timestamp, ...metadata }) => {
              const metaStr = Object.keys(metadata).length
                ? `\n${JSON.stringify(metadata, null, 2)}`
                : "";

              const levelColor = {
                error: colors.red,
                warn: colors.yellow,
                info: colors.green,
                http: colors.magenta,
                debug: colors.blue,
                performance: colors.gray,
              };

              return `${colors.gray(timestamp)} ${levelColor[level](
                level.toUpperCase()
              )} ${message}${metaStr}`;
            })
          ),
        })
      );
    }

    return logger;
  }

  startPerformanceMonitoring() {
    setInterval(() => {
      const metrics = {
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        uptime: process.uptime(),
        eventLoopLag: this.checkEventLoopLag(),
        activeHandles: process._getActiveHandles().length,
        activeRequests: process._getActiveRequests().length,
      };

      this.performance("System Metrics", metrics);
    }, 5 * 60 * 1000); // Run every 5 minutes
  }

  checkEventLoopLag() {
    return new Promise((resolve) => {
      const start = Date.now();
      setImmediate(() => {
        resolve(Date.now() - start);
      });
    });
  }

  startRequest(req) {
    const requestId = req.id || crypto.randomBytes(16).toString("hex");
    this.performanceMetrics.set(requestId, {
      startTime: process.hrtime(),
      url: req.url,
      method: req.method,
    });
    return requestId;
  }

  endRequest(requestId) {
    const metrics = this.performanceMetrics.get(requestId);
    if (metrics) {
      const diff = process.hrtime(metrics.startTime);
      const duration = (diff[0] * 1e9 + diff[1]) / 1e6; // Convert to milliseconds

      // Only log if request took longer than 1000ms (1 second)
      if (duration > 1000) {
        this.performance("Long running request detected", {
          duration,
          url: metrics.url,
          method: metrics.method,
        });
      }

      this.performanceMetrics.delete(requestId);
    }
  }

  performance(message, metrics) {
    this.logger.performance(message, {
      timestamp: new Date().toISOString(),
      metrics,
    });
  }

  error(message, meta = {}) {
    this.logger.error(message, {
      ...meta,
      timestamp: new Date().toISOString(),
    });
  }

  warn(message, meta = {}) {
    this.logger.warn(message, { ...meta, timestamp: new Date().toISOString() });
  }

  info(message, meta = {}) {
    this.logger.info(message, { ...meta, timestamp: new Date().toISOString() });
  }

  http(message, meta = {}) {
    this.logger.http(message, { ...meta, timestamp: new Date().toISOString() });
  }

  debug(message, meta = {}) {
    this.logger.debug(message, {
      ...meta,
      timestamp: new Date().toISOString(),
    });
  }

  get stream() {
    return {
      write: (message) => {
        this.info(message.trim());
      },
    };
  }

  setupUncaughtExceptionHandler() {
    process.on("uncaughtException", (error) => {
      this.logger.error("Uncaught Exception:", {
        error: error.stack || error,
        timestamp: new Date().toISOString(),
        hostname: os.hostname(),
        pid: process.pid,
      });

      setTimeout(() => {
        process.exit(1);
      }, 1000);
    });
  }

  setupUnhandledRejectionHandler() {
    process.on("unhandledRejection", (reason, promise) => {
      this.logger.error("Unhandled Rejection:", {
        reason: reason instanceof Error ? reason.stack : reason,
        timestamp: new Date().toISOString(),
        hostname: os.hostname(),
        pid: process.pid,
      });
    });
  }
}

// Export singleton instance
module.exports = new Logger();
