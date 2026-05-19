const express = require("express");
const router = express.Router();

// Middlewares
const {
  authCheck,
  superAdminCheck,
  superOrAdminCheck,
  adminSuperOrMarketingAdminCheck,
} = require("@middlewares/auth");
const { uploadImageToS3 } = require("@middlewares/multer");
const {
  uploadAnnouncementFileToS3,
  uploadMultipleAnnouncementFilesToS3,
} = require("@middlewares/announcementMulter");

// Controllers
const {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncementById,
  updateAnnouncementById,
  deleteAnnouncementById,
  getAllAnnouncementsApproved,
  updateAnnouncementApprovalById,
  getAnnouncementsPaginated,

  // Enhanced upload controllers
  uploadAnnouncementMedia,
  uploadMultipleAnnouncementMedia,
  deleteAnnouncementMedia,

  // Analytics controllers
  incrementAnnouncementViews,
  incrementAnnouncementClicks,
  incrementAnnouncementDismissals,
  getAnnouncementAnalytics,

  // Legacy upload (for backward compatibility)
  uploadAnnouncementImage,
} = require("@controllers/announcement/announcementController");

const announcementTagRoutes = require("./announcementTag");
router.use(announcementTagRoutes);

// ========== CORE ANNOUNCEMENT ROUTES ========== //

// Create announcement
router.post("/announcement", authCheck, superOrAdminCheck, createAnnouncement);

// Get all announcements (admin access)
router.get(
  "/announcements",
  authCheck,
  adminSuperOrMarketingAdminCheck,
  getAllAnnouncements
);

// Get announcement by ID
router.get("/announcement/:id", getAnnouncementById);

// Get approved announcements (public access)
router.get("/announcements-approved", getAllAnnouncementsApproved);

// Get announcements paginated (admin access)
router.get(
  "/announcements/paginated",
  authCheck,
  adminSuperOrMarketingAdminCheck,
  getAnnouncementsPaginated
);

// Update announcement
router.put(
  "/announcement/:id",
  authCheck,
  superOrAdminCheck,
  updateAnnouncementById
);

// Delete announcement
router.delete(
  "/announcement/:id",
  authCheck,
  superAdminCheck,
  deleteAnnouncementById
);

// Update announcement approval status
router.put(
  "/announcement/:id/approval",
  authCheck,
  superOrAdminCheck,
  updateAnnouncementApprovalById
);

// ========== MEDIA UPLOAD ROUTES ========== //

// Upload single announcement media (images/videos)
router.post(
  "/announcement/media/upload",
  authCheck,
  adminSuperOrMarketingAdminCheck,
  uploadAnnouncementFileToS3,
  uploadAnnouncementMedia
);

// Upload multiple announcement media files
router.post(
  "/announcement/media/upload-multiple",
  authCheck,
  adminSuperOrMarketingAdminCheck,
  uploadMultipleAnnouncementFilesToS3,
  uploadMultipleAnnouncementMedia
);

// Delete announcement media
router.delete(
  "/announcement/media/:mediaId",
  authCheck,
  superOrAdminCheck,
  deleteAnnouncementMedia
);

// Legacy upload endpoint (for backward compatibility)
router.post(
  "/announcement/image",
  authCheck,
  adminSuperOrMarketingAdminCheck,
  uploadImageToS3,
  uploadAnnouncementImage
);

// ========== MEDIA TAGS CRUD ROUTES ========== //

// Add a tag to a media file
router.post(
  "/announcement/:announcementId/media/:mediaId/tags",
  authCheck,
  adminSuperOrMarketingAdminCheck,
  require("@controllers/announcement/announcementController").addTagToMedia
);

// Update all tags for a media file
router.put(
  "/announcement/:announcementId/media/:mediaId/tags",
  authCheck,
  adminSuperOrMarketingAdminCheck,
  require("@controllers/announcement/announcementController").updateTagsForMedia
);

// Remove a tag from a media file
router.delete(
  "/announcement/:announcementId/media/:mediaId/tags",
  authCheck,
  adminSuperOrMarketingAdminCheck,
  require("@controllers/announcement/announcementController").removeTagFromMedia
);

// Get tags for a media file (public)
router.get(
  "/announcement/:announcementId/media/:mediaId/tags",
  require("@controllers/announcement/announcementController").getTagsForMedia
);

// ========== ANALYTICS ROUTES ========== //

// Increment announcement views (public access for tracking)
router.post("/announcement/:id/view", incrementAnnouncementViews);

// Increment announcement clicks (public access for tracking)
router.post("/announcement/:id/click", incrementAnnouncementClicks);

// Increment announcement dismissals (public access for tracking)
router.post("/announcement/:id/dismiss", incrementAnnouncementDismissals);

// Get announcement analytics (admin access)
router.get(
  "/announcement/:id/analytics",
  authCheck,
  adminSuperOrMarketingAdminCheck,
  getAnnouncementAnalytics
);

// ========== ACTIVE ANNOUNCEMENTS ROUTES ========== //

// Get active announcements by type (public access)
router.get("/announcements/active/:type", getAllAnnouncementsApproved);

// Get all active announcements (public access)
router.get("/announcements/active", getAllAnnouncementsApproved);

// ========== SECURE MEDIA ACCESS ROUTE ========== //

// Secure media proxy endpoint (public access with token validation)
router.get(
  "/announcement/media/secure/:token",
  require("@controllers/announcement/announcementController").serveSecureMedia
);

module.exports = router;
