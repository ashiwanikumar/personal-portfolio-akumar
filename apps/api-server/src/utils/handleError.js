/**
 * Centralized error handling utility
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 * @param {string} defaultMessage - Default error message if none provided
 * @param {number} statusCode - HTTP status code (default: 500)
 */
const handleError = (res, error, defaultMessage = "Internal server error", statusCode = 500) => {
  console.error("ERROR:", error);

  // Extract error message
  let message = error.message || defaultMessage;
  let status = statusCode;

  // Handle specific error types
  if (error.name === "ValidationError") {
    status = 400;
    message = "Validation error: " + Object.values(error.errors).map(err => err.message).join(", ");
  } else if (error.name === "CastError") {
    status = 400;
    message = "Invalid ID format";
  } else if (error.code === 11000) {
    status = 409;
    message = "Duplicate entry error";
  } else if (error.name === "MongoServerError" && error.code === 11000) {
    status = 409;
    message = "Duplicate entry error";
  }

  // Send error response
  res.status(status).json({
    message,
    status: "error",
    error: process.env.NODE_ENV === "development" ? error.stack : undefined
  });
};

/**
 * Handle async errors in route handlers
 * @param {Function} fn - Async route handler function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Handle 404 errors
 * @param {Object} res - Express response object
 * @param {string} message - Custom 404 message
 */
const handleNotFound = (res, message = "Resource not found") => {
  res.status(404).json({
    message,
    status: "error"
  });
};

/**
 * Handle validation errors
 * @param {Object} res - Express response object
 * @param {string} message - Validation error message
 */
const handleValidationError = (res, message = "Validation failed") => {
  res.status(400).json({
    message,
    status: "error"
  });
};

module.exports = handleError;

// Export additional utilities for flexibility
module.exports.handleError = handleError;
module.exports.asyncHandler = asyncHandler;
module.exports.handleNotFound = handleNotFound;
module.exports.handleValidationError = handleValidationError;