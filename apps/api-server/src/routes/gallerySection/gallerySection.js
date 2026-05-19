const express = require("express");
const router = express.Router();

// Middlewares
const { authCheck, superAdminCheck } = require("@middlewares/auth");
const {
  uploadGalleryFileToS3,
  uploadMultipleGalleryFilesToS3,
} = require("@middlewares/galleryMulter");
const {
  logMediaUpload,
  logMediaApproval,
  logMediaEdit,
  logMediaDelete,
} = require("@middlewares/gallerySectionActivityLogger");

// Controllers
const {
  createGalleryImage,
  createMultipleGalleryImages,
  getAllGalleryImages,
  getGalleryImageById,
  getPopularTags,
  updateGalleryImageById,
  updateGalleryImageMetadata,
  updateGalleryImageApprovalById,
  updateGalleryImageFeaturedById,
  deleteGalleryImageById,
  deleteMultipleGalleryImages,
  getGalleryImagesPaginated,
  getApprovedGalleryMediaPaginated,
  uploadGalleryImage,
  getGalleryCategoriesByState,
  getGalleryImagesByStateAndCategory,
} = require("@controllers/gallerySection/gallerySectionController");

// Analytics Controllers
const {
  getGalleryAnalytics,
  getMediaTypeAnalytics,
  getApprovalAnalytics,
  getActivityLogs,
  getUserActivitySummary,
  getActivityStatistics,
  downloadActivityLogs,
  getRecentActivity,
  getTopActiveUsers,
  trackActivity,
  seedSampleLogs,
  clearActivityLogs,
} = require("@controllers/gallerySection/galleryAnalyticsController");

// Public routes - Generic media endpoint for future video support
router.get(
  "/gallery/approved-gallery-section",
  getApprovedGalleryMediaPaginated
); // Main public endpoint - supports images + future videos
router.get("/gallery/media/:id", getGalleryImageById); // Single media item details (images/videos)

// State-based gallery routes (public)
router.get("/gallery/state/:stateName/categories", getGalleryCategoriesByState);
router.get("/gallery/state/:stateName/category/:categoryId", getGalleryImagesByStateAndCategory);

// Admin routes (for management)
router.get("/gallery/media/all", authCheck, getAllGalleryImages); // Admin: see all media without pagination
router.get("/gallery/tags/popular", authCheck, getPopularTags); // Admin: popular tags analytics

// Analytics routes
router.get(
  "/gallery/analytics",
  authCheck,
  superAdminCheck,
  getGalleryAnalytics
);
router.get(
  "/gallery/analytics/media-types",
  authCheck,
  superAdminCheck,
  getMediaTypeAnalytics
);
router.get(
  "/gallery/analytics/approval",
  authCheck,
  superAdminCheck,
  getApprovalAnalytics
);

// Activity Logs routes
router.get("/gallery/activity-logs", authCheck, getActivityLogs);
router.get("/gallery/activity-logs/summary", authCheck, getUserActivitySummary);
router.get(
  "/gallery/activity-logs/statistics",
  authCheck,
  getActivityStatistics
);
router.get("/gallery/activity-logs/download", authCheck, downloadActivityLogs);
router.get("/gallery/activity-logs/recent", authCheck, getRecentActivity);
router.get("/gallery/activity-logs/top-users", authCheck, getTopActiveUsers);
router.post("/gallery/activity-logs/track", authCheck, trackActivity);
router.post("/gallery/activity-logs/seed-sample", authCheck, seedSampleLogs);
router.delete("/gallery/activity-logs/clear", authCheck, clearActivityLogs);

// Legacy endpoints (for backward compatibility - will be deprecated)
router.get("/gallery/images", getApprovedGalleryMediaPaginated); // Legacy: redirects to new endpoint

// Gallery media management
router.post("/gallery/media", authCheck, logMediaUpload, createGalleryImage);
router.post(
  "/gallery/media/bulk",
  authCheck,
  logMediaUpload,
  uploadMultipleGalleryFilesToS3,
  createMultipleGalleryImages
);
router.put(
  "/gallery/media/:id",
  authCheck,
  logMediaEdit,
  updateGalleryImageById
);
router.put(
  "/gallery/media/:id/metadata",
  authCheck,
  logMediaEdit,
  updateGalleryImageMetadata
);
router.put(
  "/gallery/media/:id/approval",
  authCheck,
  logMediaApproval,
  updateGalleryImageApprovalById
);
router.put(
  "/gallery/media/:id/featured",
  authCheck,
  logMediaEdit,
  updateGalleryImageFeaturedById
);
router.delete(
  "/gallery/media/bulk",
  authCheck,
  logMediaDelete,
  deleteMultipleGalleryImages
);
router.delete(
  "/gallery/media/:id",
  authCheck,
  logMediaDelete,
  deleteGalleryImageById
);

// Admin pagination and search
router.get("/gallery-media/paginated", authCheck, getGalleryImagesPaginated); // Admin paginated endpoint - all media

// Media upload
router.post(
  "/gallery/upload-media",
  authCheck,
  logMediaUpload,
  uploadGalleryFileToS3,
  createGalleryImage
);

module.exports = router;
