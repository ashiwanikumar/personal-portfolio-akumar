// ** LIBS ** //
const express = require("express");
const router = express.Router();

// ** MIDDLEWARES ** //
const { authCheck, superOrMarketingAdminCheck } = require("@middlewares/auth");
const {
  uploadBlogCoverImageToS3,
  uploadBlogContentImageToS3,
  uploadBlogVideoToS3,
  uploadMultipleBlogContentImagesToS3,
  uploadMultipleBlogMediaToS3,
} = require("@middlewares/blogMulter");

// ** CONTROLLERS ** //
const {
  createBlog,
  getAllBlogs,
  getBlogsPaginated,
  getBlogsPaginatedWithSearch,
  getBlogById,
  updateBlogById,
  deleteBlogById,
  updateBlogApprovalById,
  // Uploads
  uploadBlogCoverImage,
  uploadBlogContentImage,
  uploadBlogMedia,
  uploadMultipleBlogImages,
  // Media management
  addMediaToBlog,
  removeMediaFromBlog,
  getBlogMedia,
  // Public endpoints
  getAllPublicBlogs,
  getPublicBlogsPaginated,
  getPublicBlogsPaginatedWithSearch,
  getPublicBlogById,
  getPublicBlogBySlug,
} = require("@controllers/blog/blogController");

// ** ROUTES ** //
router.post("/blog", authCheck, superOrMarketingAdminCheck, createBlog);
router.get("/blogs", authCheck, getAllBlogs);
router.get("/blogs/paginated", authCheck, getBlogsPaginated);
router.get("/blogs/paginated/search", authCheck, getBlogsPaginatedWithSearch);
router.get("/blog/:id", authCheck, getBlogById);
router.put("/blog/:id", authCheck, superOrMarketingAdminCheck, updateBlogById);
router.delete(
  "/blog/:id",
  authCheck,
  superOrMarketingAdminCheck,
  deleteBlogById
);
router.put(
  "/blog/approve/:id",
  authCheck,
  superOrMarketingAdminCheck,
  updateBlogApprovalById
);
// Uploads
router.post(
  "/blog/cover-image",
  authCheck,
  superOrMarketingAdminCheck,
  uploadBlogCoverImageToS3,
  uploadBlogCoverImage
);
router.post(
  "/blog/content-image",
  authCheck,
  superOrMarketingAdminCheck,
  uploadBlogContentImageToS3,
  uploadBlogContentImage
);
router.post(
  "/blog/media",
  authCheck,
  superOrMarketingAdminCheck,
  uploadBlogVideoToS3,
  uploadBlogMedia
);
router.post(
  "/blog/content-images",
  authCheck,
  superOrMarketingAdminCheck,
  uploadMultipleBlogContentImagesToS3,
  uploadMultipleBlogImages
);

// Media management routes
router.post(
  "/blog/:blogId/media",
  authCheck,
  superOrMarketingAdminCheck,
  uploadBlogVideoToS3,
  addMediaToBlog
);
// Add route for multiple media upload (images and videos)
router.post(
  "/blog/multiple-media",
  authCheck,
  superOrMarketingAdminCheck,
  uploadMultipleBlogMediaToS3,
  uploadMultipleBlogImages
);
router.delete(
  "/blog/:blogId/media/:mediaId",
  authCheck,
  superOrMarketingAdminCheck,
  removeMediaFromBlog
);
router.get("/blog/:blogId/media", authCheck, getBlogMedia);

// PUBLIC BLOG ROUTES - No authentication required
router.get("/public/blogs", getPublicBlogsPaginatedWithSearch);
router.get("/public/blog/:id", getPublicBlogById);
router.get("/public/blogs/slug/:slug", getPublicBlogBySlug);

// Blog scheduler routes
router.use("/blog/scheduler", require("./blogScheduler"));

// Blog analytics routes
router.use("/blog/analytics", require("./blogAnalytics"));

module.exports = router;
