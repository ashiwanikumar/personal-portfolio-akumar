const express = require("express");
const { body, param } = require("express-validator");
const router = express.Router();

// Import controllers
const {
  scheduleBlogPost,
  unscheduleBlogPost,
  updateBlogSchedule,
  getScheduledBlogsDashboard,
  getCronJobsStatus,
  controlCronJob,
  manualProcessScheduledBlogs,
  manualProcessUnpublications,
  cleanupExpiredSchedules,
  bulkScheduleBlogs,
} = require("../../controllers/blog/blogSchedulerController");

// Import middlewares
const { authCheck, superOrMarketingAdminCheck, adminCheck } = require("../../middlewares/auth");

// Validation rules
const scheduleValidation = [
  body("publishAt")
    .optional()
    .isISO8601()
    .withMessage("publishAt must be a valid ISO 8601 date"),
  body("unpublishAt")
    .optional()
    .isISO8601()
    .withMessage("unpublishAt must be a valid ISO 8601 date"),
  body("scheduleType")
    .optional()
    .isIn(["once", "recurring", "conditional"])
    .withMessage("scheduleType must be one of: once, recurring, conditional"),
  body("recurringPattern.frequency")
    .if(body("scheduleType").equals("recurring"))
    .isIn(["daily", "weekly", "monthly", "yearly"])
    .withMessage("frequency must be one of: daily, weekly, monthly, yearly"),
  body("recurringPattern.interval")
    .if(body("scheduleType").equals("recurring"))
    .isInt({ min: 1 })
    .withMessage("interval must be a positive integer"),
  body("recurringPattern.daysOfWeek")
    .if(body("recurringPattern.frequency").equals("weekly"))
    .optional()
    .isArray()
    .withMessage("daysOfWeek must be an array")
    .custom((daysOfWeek) => {
      if (daysOfWeek.some(day => day < 0 || day > 6)) {
        throw new Error("daysOfWeek must contain values between 0-6");
      }
      return true;
    }),
  body("recurringPattern.dayOfMonth")
    .if(body("recurringPattern.frequency").equals("monthly"))
    .optional()
    .isInt({ min: 1, max: 31 })
    .withMessage("dayOfMonth must be between 1-31"),
  body("recurringPattern.endDate")
    .if(body("scheduleType").equals("recurring"))
    .optional()
    .isISO8601()
    .withMessage("endDate must be a valid ISO 8601 date"),
];

const bulkScheduleValidation = [
  body("blogs")
    .isArray({ min: 1 })
    .withMessage("blogs must be a non-empty array"),
  body("blogs.*.id")
    .isMongoId()
    .withMessage("Each blog must have a valid MongoDB ID"),
  body("blogs.*.publishAt")
    .optional()
    .isISO8601()
    .withMessage("publishAt must be a valid ISO 8601 date"),
  body("blogs.*.scheduleType")
    .optional()
    .isIn(["once", "recurring", "conditional"])
    .withMessage("scheduleType must be one of: once, recurring, conditional"),
];

const blogIdValidation = [
  param("id")
    .isMongoId()
    .withMessage("Blog ID must be a valid MongoDB ID"),
];

const jobNameValidation = [
  param("jobName")
    .isIn(["publication", "unpublication", "cleanup", "healthCheck"])
    .withMessage("Invalid job name"),
];

// Blog scheduling routes (for content creators and admins)
router.post(
  "/:id/schedule",
  authCheck,
  superOrMarketingAdminCheck,
  blogIdValidation,
  scheduleValidation,
  scheduleBlogPost
);

router.put(
  "/:id/schedule",
  authCheck,
  superOrMarketingAdminCheck,
  blogIdValidation,
  scheduleValidation,
  updateBlogSchedule
);

router.delete(
  "/:id/schedule",
  authCheck,
  superOrMarketingAdminCheck,
  blogIdValidation,
  unscheduleBlogPost
);

// Dashboard and status routes
router.get(
  "/scheduled/dashboard",
  authCheck,
  superOrMarketingAdminCheck,
  getScheduledBlogsDashboard
);

// Admin-only bulk operations
router.post(
  "/bulk-schedule",
  authCheck,
  adminCheck,
  bulkScheduleValidation,
  bulkScheduleBlogs
);

// Admin-only system management routes
router.get(
  "/system/cron-status",
  authCheck,
  adminCheck,
  getCronJobsStatus
);

router.post(
  "/system/cron/:jobName/control",
  authCheck,
  adminCheck,
  jobNameValidation,
  body("action")
    .isIn(["start", "stop", "restart", "trigger"])
    .withMessage("Invalid action"),
  controlCronJob
);

router.post(
  "/system/process-scheduled",
  authCheck,
  adminCheck,
  manualProcessScheduledBlogs
);

router.post(
  "/system/process-unpublications",
  authCheck,
  adminCheck,
  manualProcessUnpublications
);

router.post(
  "/system/cleanup",
  authCheck,
  adminCheck,
  cleanupExpiredSchedules
);

module.exports = router;