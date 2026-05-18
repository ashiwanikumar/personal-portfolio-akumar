const express = require("express");
const router = express.Router();

// Middlewares
const { authCheck } = require("@middlewares/auth");
const { logTagAction } = require("@middlewares/gallerySectionActivityLogger");

// Controllers
const {
  createGallerySectionTag,
  createBulkGallerySectionTags,
  getAllGallerySectionTags,
  getGallerySectionTagById,
  getGallerySectionTagBySlug,
  updateGallerySectionTagById,
  deleteGallerySectionTagById,
  getPopularGallerySectionTags,
  deleteBulkGallerySectionTags,
  updateBulkGallerySectionTags,
  toggleTagActiveStatus,
  getTagStatistics,
} = require("@controllers/gallerySection/gallerySectionTagController");

// Tag CRUD routes
router.post("/gallery/tag", authCheck, logTagAction, createGallerySectionTag);
router.get("/gallery/tag/:id", getGallerySectionTagById);
router.get("/gallery/tag/slug/:slug", getGallerySectionTagBySlug);
router.put(
  "/gallery/tag/:id",
  authCheck,
  logTagAction,
  updateGallerySectionTagById
);
router.delete(
  "/gallery/tag/:id",
  authCheck,
  logTagAction,
  deleteGallerySectionTagById
);

// Pagination and search
router.get("/gallery-tags/paginated", getAllGallerySectionTags);

// Bulk operations
router.post(
  "/gallery/tags/bulk",
  authCheck,
  logTagAction,
  createBulkGallerySectionTags
);
router.put(
  "/gallery/tags/bulk",
  authCheck,
  logTagAction,
  updateBulkGallerySectionTags
);
router.delete(
  "/gallery/tags/bulk",
  authCheck,
  logTagAction,
  deleteBulkGallerySectionTags
);

// Special operations
router.get("/gallery/tags/popular", getPopularGallerySectionTags);
router.patch(
  "/gallery/tag/:id/toggle-status",
  authCheck,
  logTagAction,
  toggleTagActiveStatus
);
router.get("/gallery/tags/statistics", authCheck, getTagStatistics);

module.exports = router;
