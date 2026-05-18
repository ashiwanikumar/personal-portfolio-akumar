const express = require("express");
const router = express.Router();

// Middlewares
const { authCheck } = require("@middlewares/auth");
const {
  uploadGalleryFileToS3,
  uploadMultipleGalleryFilesToS3,
} = require("@middlewares/galleryMulter");
const {
  logActivity,
  logMediaUpload,
} = require("@middlewares/gallerySectionActivityLogger");

// Controllers
const {
  archiveGalleryMedia,
  unarchiveGalleryMedia,
  getAllArchivedGalleryMedia,
  getArchivedMediaByFolder,
  bulkArchiveGalleryMedia,
  bulkUnarchiveGalleryMedia,
  getArchiveStatistics,
  uploadToArchive,
  approveArchivedGalleryMedia,
  disapproveArchivedGalleryMedia,
  getPendingArchivedGalleryMedia,
} = require("@controllers/gallerySection/gallerySectionArchiveController");

// Archive management routes
router.post(
  "/gallerysection/media/:id/archive",
  authCheck,
  logActivity("archive_media"),
  archiveGalleryMedia
);
router.post(
  "/gallerysection/media/:id/unarchive",
  authCheck,
  logActivity("restore_media"),
  unarchiveGalleryMedia
);

// Archive approval routes
router.put(
  "/gallerysection/archive/media/:id/approve",
  authCheck,
  logActivity("approve_archived_media"),
  approveArchivedGalleryMedia
);
router.put(
  "/gallerysection/archive/media/:id/disapprove",
  authCheck,
  logActivity("disapprove_archived_media"),
  disapproveArchivedGalleryMedia
);

// Get pending archived media
router.get(
  "/gallerysection/archive/pending",
  authCheck,
  getPendingArchivedGalleryMedia
);

// Get archived media
router.get("/gallerysection/archive", getAllArchivedGalleryMedia);
router.get("/gallerysection/archive/folder/:folder", getArchivedMediaByFolder);

// Bulk archive operations
router.post(
  "/gallerysection/archive/bulk",
  authCheck,
  logActivity("archive_media"),
  bulkArchiveGalleryMedia
);
router.post(
  "/gallerysection/unarchive/bulk",
  authCheck,
  logActivity("restore_media"),
  bulkUnarchiveGalleryMedia
);

// Archive statistics
router.get(
  "/gallerysection/archive/statistics",
  authCheck,
  getArchiveStatistics
);

// Upload directly to archive
router.post(
  "/gallerysection/archive/upload",
  authCheck,
  uploadMultipleGalleryFilesToS3,
  logMediaUpload,
  uploadToArchive
);

module.exports = router;
