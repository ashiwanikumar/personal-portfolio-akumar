const rateLimit = require("express-rate-limit");

// Try to load rate-limit-mongo, but don't fail if it's not available
let MongoStore;
try {
  MongoStore = require("rate-limit-mongo");
} catch (error) {
  // Silently use memory store for rate limiting
  MongoStore = null;
}

// Create rate limiter for event registration
exports.eventRegistrationLimiter = rateLimit({
  store:
    process.env.DATABASE_URL && MongoStore
      ? new MongoStore({
          uri: process.env.DATABASE_URL,
          collectionName: "eventRegistrationRateLimit",
          expireTimeMs: 15 * 60 * 1000, // 15 minutes
        })
      : undefined,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP/email to 5 registration requests per windowMs
  message:
    "Too many registration attempts from this IP/email, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use combination of IP and email for rate limiting
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const email = req.body.email || "no-email";
    return `${ip}:${email}`;
  },
  skip: (req) => {
    // Skip rate limiting for authenticated admin users
    return (
      req.user && (req.user.role === "superadmin" || req.user.role === "admin")
    );
  },
});

// General API rate limiter
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for sensitive operations
exports.strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 requests per hour
  message: "Too many attempts, please try again after an hour",
  standardHeaders: true,
  legacyHeaders: false,
});
