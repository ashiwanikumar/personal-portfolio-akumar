const express = require("express");
const router = express.Router();

// Middlewares
const { authCheck } = require("@middlewares/auth");
const { uploadGalleryFileToS3 } = require("@middlewares/galleryMulter");
const {
  logActivity,
  logMediaUpload,
  logMediaApproval,
  logMediaEdit,
  logMediaDelete,
  logCategoryAction,
  logTagAction,
} = require("@middlewares/gallerySectionActivityLogger");

// Controllers
const {
  createGalleryCategory,
  getAllGalleryCategories,
  getGalleryCategoryById,
  updateGalleryCategoryById,
  deleteGalleryCategoryById,
} = require("@controllers/gallerySection/gallerySectionCategoryController");

const {
  createGallerySectionTag,
  getAllGallerySectionTags,
  getAllGallerySectionTagsSimple,
  getGallerySectionTagById,
  getGallerySectionTagBySlug,
  updateGallerySectionTagById,
  deleteGallerySectionTagById,
  toggleTagActiveStatus,
  getPopularGallerySectionTags,
  createBulkGallerySectionTags,
  updateBulkGallerySectionTags,
  deleteBulkGallerySectionTags,
  getTagStatistics,
} = require("@controllers/gallerySection/gallerySectionTagController");

const {
  createGalleryImage,
  getAllGalleryImages,
  getAllGalleryImagesApproved,
  getGalleryImagesPaginated,
  getFeaturedGalleryImages,
  getPopularGalleryImages,
  getGalleryImagesByTags,
  getGalleryImageById,
  updateGalleryImageById,
  updateGalleryImageMetadata,
  updateGalleryImageApprovalById,
  updateGalleryImageFeaturedById,
  deleteGalleryImageById,
  deleteMultipleGalleryImages,
  createMultipleGalleryImages,
  uploadGalleryImage,
} = require("@controllers/gallerySection/gallerySectionController");

// Archive Controllers
const {
  archiveGalleryMedia,
  unarchiveGalleryMedia,
  getAllArchivedGalleryMedia,
  getArchivedMediaByFolder,
  bulkArchiveGalleryMedia,
  bulkUnarchiveGalleryMedia,
  getArchiveStatistics,
  uploadToArchive,
} = require("@controllers/gallerySection/gallerySectionArchiveController");

// Gallery Section Category Routes
router.post("/gallery-section/category", authCheck, logCategoryAction, createGalleryCategory);
router.get("/gallery-section/categories", getAllGalleryCategories);
router.get("/gallery-section/category/:id", getGalleryCategoryById);
router.put(
  "/gallery-section/category/:id",
  authCheck,
  logCategoryAction,
  updateGalleryCategoryById
);
router.delete(
  "/gallery-section/category/:id",
  authCheck,
  logCategoryAction,
  deleteGalleryCategoryById
);

// Gallery Section Tag Routes
router.post("/gallery-section/tag", authCheck, logTagAction, createGallerySectionTag);
router.get("/gallery-section/tags", getAllGallerySectionTagsSimple); // Simple endpoint for all tags
router.get("/gallery-section-tags/paginated", getAllGallerySectionTags);
router.get("/gallery-section/tag/:id", getGallerySectionTagById);
router.get("/gallery-section/tag/slug/:slug", getGallerySectionTagBySlug);
router.put("/gallery-section/tag/:id", authCheck, logTagAction, updateGallerySectionTagById);
router.delete(
  "/gallery-section/tag/:id",
  authCheck,
  logTagAction,
  deleteGallerySectionTagById
);
router.patch(
  "/gallery-section/tag/:id/toggle-status",
  authCheck,
  logTagAction,
  toggleTagActiveStatus
);
router.get("/gallery-section/tags/popular", getPopularGallerySectionTags);
router.post(
  "/gallery-section/tags/bulk",
  authCheck,
  logTagAction,
  createBulkGallerySectionTags
);
router.put(
  "/gallery-section/tags/bulk",
  authCheck,
  logTagAction,
  updateBulkGallerySectionTags
);
router.delete(
  "/gallery-section/tags/bulk",
  authCheck,
  logTagAction,
  deleteBulkGallerySectionTags
);
router.get("/gallery-section/tags/statistics", getTagStatistics);

// Gallery Section Media Routes (Updated to be media-agnostic)
router.post("/gallery-section/media", authCheck, logMediaUpload, createGalleryImage);
router.get("/gallery-section/media", getAllGalleryImages);
router.get("/gallery-section/media/approved", getAllGalleryImagesApproved);
router.get("/gallery-section/media/paginated", getGalleryImagesPaginated);
router.get("/gallery-section/media/featured", getFeaturedGalleryImages);
router.get("/gallery-section/media/popular", getPopularGalleryImages);
router.get("/gallery-section/media/tags", getGalleryImagesByTags);
router.get("/gallery-section/media/:id", getGalleryImageById);
router.put("/gallery-section/media/:id", authCheck, logMediaEdit, updateGalleryImageById);
router.put(
  "/gallery-section/media/:id/metadata",
  authCheck,
  logMediaEdit,
  updateGalleryImageMetadata
);
router.put(
  "/gallery-section/media/:id/approval",
  authCheck,
  logMediaApproval,
  updateGalleryImageApprovalById
);
router.put(
  "/gallery-section/media/:id/featured",
  authCheck,
  logMediaEdit,
  updateGalleryImageFeaturedById
);
router.delete("/gallery-section/media/:id", authCheck, logMediaDelete, deleteGalleryImageById);
router.delete(
  "/gallery-section/media/bulk",
  authCheck,
  logMediaDelete,
  deleteMultipleGalleryImages
);
router.post(
  "/gallery-section/media/bulk",
  authCheck,
  logMediaUpload,
  createMultipleGalleryImages
);
router.post(
  "/gallery-section/upload-media",
  authCheck,
  uploadGalleryFileToS3,
  logMediaUpload,
  uploadGalleryImage
);

// Legacy routes for backward compatibility
router.post("/gallery-section/image", authCheck, logMediaUpload, createGalleryImage);
router.get("/gallery-section/images", getAllGalleryImages);
router.get("/gallery-section/images/approved", getAllGalleryImagesApproved);
router.get("/gallery-section/paginated", getGalleryImagesPaginated);
router.get("/gallery-section/images/featured", getFeaturedGalleryImages);
router.get("/gallery-section/images/popular", getPopularGalleryImages);
router.get("/gallery-section/images/tags", getGalleryImagesByTags);
router.get("/gallery-section/image/:id", getGalleryImageById);
router.put("/gallery-section/image/:id", authCheck, logMediaEdit, updateGalleryImageById);
router.put(
  "/gallery-section/image/:id/metadata",
  authCheck,
  logMediaEdit,
  updateGalleryImageMetadata
);
router.put(
  "/gallery-section/image/:id/approval",
  authCheck,
  logMediaApproval,
  updateGalleryImageApprovalById
);
router.put(
  "/gallery-section/image/:id/featured",
  authCheck,
  logMediaEdit,
  updateGalleryImageFeaturedById
);
router.delete("/gallery-section/image/:id", authCheck, logMediaDelete, deleteGalleryImageById);
router.delete(
  "/gallery-section/images/bulk",
  authCheck,
  logMediaDelete,
  deleteMultipleGalleryImages
);
router.post(
  "/gallery-section/images/bulk",
  authCheck,
  logMediaUpload,
  createMultipleGalleryImages
);
router.post(
  "/gallery-section/upload-image",
  authCheck,
  uploadGalleryFileToS3,
  logMediaUpload,
  uploadGalleryImage
);
router.post(
  "/gallery-section/upload-video",
  authCheck,
  uploadGalleryFileToS3,
  logMediaUpload,
  uploadGalleryImage
);

// Gallery Section Archive Routes
router.post(
  "/gallery-section/media/:id/archive",
  authCheck,
  logActivity('archive_media'),
  archiveGalleryMedia
);
router.post(
  "/gallery-section/media/:id/unarchive",
  authCheck,
  logActivity('restore_media'),
  unarchiveGalleryMedia
);
router.get("/gallery-section/archive", getAllArchivedGalleryMedia);
router.get("/gallery-section/archive/folder/:folder", getArchivedMediaByFolder);
router.post(
  "/gallery-section/archive/bulk",
  authCheck,
  logActivity('archive_media'),
  bulkArchiveGalleryMedia
);
router.post(
  "/gallery-section/unarchive/bulk",
  authCheck,
  logActivity('restore_media'),
  bulkUnarchiveGalleryMedia
);
router.get(
  "/gallery-section/archive/statistics",
  authCheck,
  getArchiveStatistics
);
router.post(
  "/gallery-section/archive/upload",
  authCheck,
  uploadGalleryFileToS3,
  logMediaUpload,
  uploadToArchive
);

module.exports = router;
