const rateLimit = require("express-rate-limit");
const { logger } = require("@utils/logger");

/**
 * MFA-specific middleware for rate limiting and security
 */

/**
 * Rate limiter for MFA verification attempts
 * Allows 10 attempts per 15 minutes per IP
 */
const mfaVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use IP + user ID (if available) for more granular rate limiting
    const userId = req.user?._id || req.body?.userId || "anonymous";
    return `${req.ip}-${userId}`;
  },
  handler: (req, res) => {
    logger.warn("MFA verification rate limit exceeded", {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      userId: req.user?._id,
      endpoint: req.path,
      timestamp: new Date().toISOString(),
    });
    
    res.status(429).json({
      success: false,
      message: "Too many MFA verification attempts. Please try again in 15 minutes.",
      error: "RATE_LIMIT_EXCEEDED",
    });
  },
});

/**
 * Rate limiter for MFA setup attempts
 * Allows 5 setup attempts per hour per IP
 */
const mfaSetupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 setup requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const userId = req.user?._id || "anonymous";
    return `${req.ip}-${userId}`;
  },
  handler: (req, res) => {
    logger.warn("MFA setup rate limit exceeded", {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      userId: req.user?._id,
      endpoint: req.path,
      timestamp: new Date().toISOString(),
    });
    
    res.status(429).json({
      success: false,
      message: "Too many MFA setup attempts. Please try again in an hour.",
      error: "RATE_LIMIT_EXCEEDED",
    });
  },
});

/**
 * Rate limiter for backup code generation
 * Allows 3 backup code generations per hour per user
 */
const backupCodeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each user to 3 backup code generations per hour
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use user ID for user-specific rate limiting
    const userId = req.user?._id || req.ip;
    return `backup-codes-${userId}`;
  },
  handler: (req, res) => {
    logger.warn("Backup code generation rate limit exceeded", {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      userId: req.user?._id,
      endpoint: req.path,
      timestamp: new Date().toISOString(),
    });
    
    res.status(429).json({
      success: false,
      message: "Too many backup code generation attempts. Please try again in an hour.",
      error: "RATE_LIMIT_EXCEEDED",
    });
  },
});

/**
 * Rate limiter for admin MFA operations
 * Allows 20 admin operations per hour per admin user
 */
const adminMFALimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each admin to 20 operations per hour
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const userId = req.user?._id || req.ip;
    return `admin-mfa-${userId}`;
  },
  handler: (req, res) => {
    logger.warn("Admin MFA operation rate limit exceeded", {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      userId: req.user?._id,
      endpoint: req.path,
      timestamp: new Date().toISOString(),
    });
    
    res.status(429).json({
      success: false,
      message: "Too many admin MFA operations. Please try again in an hour.",
      error: "RATE_LIMIT_EXCEEDED",
    });
  },
});

/**
 * Middleware to validate MFA-related request body
 */
const validateMFARequest = (req, res, next) => {
  const { code } = req.body;
  
  // Basic validation for MFA codes
  if (code) {
    // Remove any spaces and convert to uppercase for backup codes
    req.body.code = code.toString().replace(/\s/g, '').toUpperCase();
    
    // Log suspicious requests with non-numeric TOTP codes
    if (req.path.includes('verify-login') && !/^\d{6}$/.test(req.body.code)) {
      logger.warn("Suspicious MFA verification attempt with non-numeric code", {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        endpoint: req.path,
        codeFormat: typeof code,
        timestamp: new Date().toISOString(),
      });
    }
  }
  
  next();
};

/**
 * Middleware to log MFA-related requests
 */
const logMFARequest = (req, res, next) => {
  logger.info("MFA request received", {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    userId: req.user?._id,
    hasCode: !!req.body.code,
    hasTempToken: !!req.body.tempToken,
    timestamp: new Date().toISOString(),
  });
  
  next();
};

/**
 * Middleware to check if user's MFA is enforced
 * Used to prevent users from disabling enforced MFA
 */
const checkMFAEnforcement = async (req, res, next) => {
  try {
    const User = require("@models/user/user");
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    
    // Check if MFA is enforced for this user
    if (user.mfa && user.mfa.enforced) {
      return res.status(403).json({
        success: false,
        message: "MFA is enforced by administrator and cannot be disabled",
      });
    }
    
    next();
  } catch (error) {
    logger.error("MFA enforcement check failed:", {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id,
      timestamp: new Date().toISOString(),
    });
    
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Middleware to ensure user has admin permissions for MFA operations
 */
const requireAdminForMFA = async (req, res, next) => {
  try {
    const User = require("@models/user/user");
    const admin = await User.findById(req.user._id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin user not found",
      });
    }
    
    // Check if user has admin permissions
    if (admin.role !== "superadmin" && admin.role !== "admin") {
      logger.warn("Unauthorized MFA admin operation attempt", {
        userId: admin._id,
        userEmail: admin.email,
        userRole: admin.role,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        endpoint: req.path,
        timestamp: new Date().toISOString(),
      });
      
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions for MFA administration",
      });
    }
    
    next();
  } catch (error) {
    logger.error("Admin permission check failed:", {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id,
      timestamp: new Date().toISOString(),
    });
    
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Middleware to ensure user has super admin permissions for sensitive MFA operations
 */
const requireSuperAdminForMFA = async (req, res, next) => {
  try {
    const User = require("@models/user/user");
    const admin = await User.findById(req.user._id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin user not found",
      });
    }
    
    // Check if user has super admin permissions
    if (admin.role !== "superadmin") {
      logger.warn("Unauthorized MFA super admin operation attempt", {
        userId: admin._id,
        userEmail: admin.email,
        userRole: admin.role,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        endpoint: req.path,
        timestamp: new Date().toISOString(),
      });
      
      return res.status(403).json({
        success: false,
        message: "Super administrator permissions required for this operation",
      });
    }
    
    next();
  } catch (error) {
    logger.error("Super admin permission check failed:", {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id,
      timestamp: new Date().toISOString(),
    });
    
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  mfaVerificationLimiter,
  mfaSetupLimiter,
  backupCodeLimiter,
  adminMFALimiter,
  validateMFARequest,
  logMFARequest,
  checkMFAEnforcement,
  requireAdminForMFA,
  requireSuperAdminForMFA,
};