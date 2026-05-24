const winston = require("winston");
const { createLogger, transports, format } = winston;
const path = require("path");
const fs = require("fs");
const os = require("os");
const crypto = require("crypto");
require("winston-daily-rotate-file");

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
const LOG_DIR = path.join(__dirname, "../../logs");
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const isProduction = process.env.NODE_ENV === "production";

// ---------------------------------------------------------------------------
// Sensitive field redaction — prevent secrets from leaking into logs
// ---------------------------------------------------------------------------
const REDACT_KEYS = new Set([
  "password",
  "token",
  "accessToken",
  "refreshToken",
  "apiToken",
  "apiKey",
  "secret",
  "authorization",
  "cookie",
  "creditCard",
  "ssn",
  "privateKey",
  "encryptionKey",
  "otp",
  "pin",
]);

function redact(obj, depth = 0) {
  if (depth > 6 || obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;
  if (obj instanceof Error) return obj;
  if (Array.isArray(obj)) return obj.map((item) => redact(item, depth + 1));

  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    if (REDACT_KEYS.has(key) || REDACT_KEYS.has(key.toLowerCase())) {
      clean[key] = "[REDACTED]";
    } else if (
      typeof value === "object" &&
      value !== null &&
      !(value instanceof Error)
    ) {
      clean[key] = redact(value, depth + 1);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

// ---------------------------------------------------------------------------
// Custom log levels
// ---------------------------------------------------------------------------
const logLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
    performance: 5,
  },
};

// ---------------------------------------------------------------------------
// Formats
// ---------------------------------------------------------------------------

// Structured JSON — every log line is a parseable JSON object
const structuredFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DDTHH:mm:ss.SSSZ" }),
  format.errors({ stack: true }),
  format((info) => {
    if (global.__requestId) info.requestId = global.__requestId;
    const { level, message, timestamp, stack, service, requestId, ...meta } =
      info;
    const cleaned =
      Object.keys(meta).length > 0 ? redact(meta) : undefined;
    info._meta = cleaned;
    return info;
  })(),
  format.printf(
    ({ timestamp, level, message, stack, service, requestId, _meta }) => {
      const entry = {
        timestamp,
        level,
        service: service || "ashiwanikumar-api",
        message: typeof message === "object" ? JSON.stringify(message) : message,
      };
      if (requestId) entry.requestId = requestId;
      if (_meta) entry.meta = _meta;
      if (stack) entry.stack = stack;
      return JSON.stringify(entry);
    }
  )
);

// ANSI color codes for dev console
const c = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  blue: "\x1b[34m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
  bgRed: "\x1b[41m",
  bgYellow: "\x1b[43m",
};

const LEVEL_STYLES = {
  error: {
    badge: `${c.bgRed}${c.bold}${c.white} ERR ${c.reset}`,
    color: c.red,
  },
  warn: {
    badge: `${c.bgYellow}${c.bold} WRN ${c.reset}`,
    color: c.yellow,
  },
  info: {
    badge: `${c.green}${c.bold} INF ${c.reset}`,
    color: c.green,
  },
  http: {
    badge: `${c.magenta}${c.bold} HTTP${c.reset}`,
    color: c.magenta,
  },
  debug: {
    badge: `${c.blue}${c.bold} DBG ${c.reset}`,
    color: c.blue,
  },
  performance: {
    badge: `${c.gray}${c.bold} PERF${c.reset}`,
    color: c.gray,
  },
};

const devFormat = format.combine(
  format.timestamp({
    format: isProduction ? "YYYY-MM-DD HH:mm:ss.SSS" : "HH:mm:ss.SSS",
  }),
  format.errors({ stack: true }),
  format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const style = LEVEL_STYLES[level] || LEVEL_STYLES.info;
    const metaKeys = Object.keys(meta).filter(
      (k) => !["service", "requestId", "splat"].includes(k)
    );

    // Extract [Module] prefix from message if present
    const moduleMatch =
      typeof message === "string" && message.match(/^\[([^\]]+)\]\s*(.*)/);
    let moduleTag = "";
    let msgBody =
      typeof message === "object" ? JSON.stringify(message) : message;
    if (moduleMatch) {
      moduleTag = `${c.cyan}[${moduleMatch[1]}]${c.reset} `;
      msgBody = moduleMatch[2];
    }

    // Format metadata as key=value pairs
    let metaStr = "";
    if (metaKeys.length > 0) {
      const cleaned = redact(meta);
      const pairs = Object.entries(cleaned)
        .map(
          ([k, v]) =>
            `${c.gray}${k}=${c.reset}${c.white}${
              typeof v === "object" ? JSON.stringify(v) : v
            }${c.reset}`
        )
        .join(" ");
      metaStr = ` ${c.dim}│${c.reset} ${pairs}`;
    }

    const time = `${c.gray}${timestamp}${c.reset}`;
    const line = `${time} ${style.badge} ${moduleTag}${style.color}${msgBody}${c.reset}${metaStr}`;
    return stack ? `${line}\n${c.red}${stack}${c.reset}` : line;
  })
);

// ---------------------------------------------------------------------------
// Transports
// ---------------------------------------------------------------------------
const fileTransports = [];

// Daily rotate: combined — max 5MB per file, keep 7 days, auto-remove old
fileTransports.push(
  new winston.transports.DailyRotateFile({
    dirname: LOG_DIR,
    filename: "combined-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    maxSize: "5m",
    maxFiles: "7d",
    zippedArchive: true,
    format: structuredFormat,
  })
);

// Daily rotate: errors only — max 5MB per file, keep 14 days, auto-remove old
fileTransports.push(
  new winston.transports.DailyRotateFile({
    dirname: LOG_DIR,
    filename: "error-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    level: "error",
    maxSize: "5m",
    maxFiles: "14d",
    zippedArchive: true,
    format: structuredFormat,
  })
);

// Console: colorized human-readable or structured JSON
const useColorConsole = process.env.LOG_FORMAT !== "json";
const consoleTransport = new transports.Console({
  format: useColorConsole ? devFormat : structuredFormat,
  stderrLevels: isProduction ? ["error", "warn"] : [],
});

// ---------------------------------------------------------------------------
// Logger class — wraps winston with convenience methods
// ---------------------------------------------------------------------------
class Logger {
  constructor() {
    this.performanceMetrics = new Map();
    this.logger = createLogger({
      levels: logLevels.levels,
      level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
      defaultMeta: { service: "ashiwanikumar-api" },
      transports: [...fileTransports, consoleTransport],
      exitOnError: false,
      silent: process.env.NODE_ENV === "test",
    });
    this.setupUncaughtExceptionHandler();
    this.setupUnhandledRejectionHandler();
    this.startPerformanceMonitoring();
  }

  // ---------------------------------------------------------------------------
  // Request correlation middleware
  // ---------------------------------------------------------------------------
  get requestIdMiddleware() {
    return (req, _res, next) => {
      req.requestId = req.headers["x-request-id"] || crypto.randomUUID();
      global.__requestId = req.requestId;
      next();
    };
  }

  // ---------------------------------------------------------------------------
  // Morgan stream — pipe HTTP access logs through Winston
  // ---------------------------------------------------------------------------
  get morganStream() {
    return {
      write: (message) => {
        this.logger.http(message.trim());
      },
    };
  }

  // ---------------------------------------------------------------------------
  // Convenience log methods
  // ---------------------------------------------------------------------------
  error(message, meta = {}) {
    this.logger.error(message, meta);
  }

  warn(message, meta = {}) {
    this.logger.warn(message, meta);
  }

  info(message, meta = {}) {
    this.logger.info(message, meta);
  }

  http(message, meta = {}) {
    this.logger.http(message, meta);
  }

  debug(message, meta = {}) {
    this.logger.debug(message, meta);
  }

  performance(message, metrics) {
    this.logger.log("performance", message, { metrics });
  }

  // ---------------------------------------------------------------------------
  // Morgan-compatible stream (legacy support)
  // ---------------------------------------------------------------------------
  get stream() {
    return {
      write: (message) => {
        this.logger.http(message.trim());
      },
    };
  }

  // ---------------------------------------------------------------------------
  // Performance monitoring
  // ---------------------------------------------------------------------------
  startPerformanceMonitoring() {
    setInterval(() => {
      const metrics = {
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        uptime: process.uptime(),
        activeHandles: process._getActiveHandles().length,
        activeRequests: process._getActiveRequests().length,
      };
      this.performance("System Metrics", metrics);
    }, 5 * 60 * 1000);
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
      const duration = (diff[0] * 1e9 + diff[1]) / 1e6;
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

  // ---------------------------------------------------------------------------
  // Safety nets
  // ---------------------------------------------------------------------------
  setupUncaughtExceptionHandler() {
    process.on("uncaughtException", (error) => {
      this.logger.error("Uncaught Exception:", {
        error: error.stack || error,
        hostname: os.hostname(),
        pid: process.pid,
      });
      setTimeout(() => process.exit(1), 1000);
    });
  }

  setupUnhandledRejectionHandler() {
    process.on("unhandledRejection", (reason) => {
      this.logger.error("Unhandled Rejection:", {
        reason: reason instanceof Error ? reason.stack : reason,
        hostname: os.hostname(),
        pid: process.pid,
      });
    });
  }
}

// Export singleton instance
module.exports = new Logger();
