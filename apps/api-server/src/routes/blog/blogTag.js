// ** LIBS ** //
const express = require("express");
const router = express.Router();

// ** MIDDLEWARES ** //
const { authCheck, superOrMarketingAdminCheck } = require("@middlewares/auth");

// ** CONTROLLERS ** //
const {
  createBlogTag,
  getAllBlogTags,
  getBlogTagById,
  updateBlogTagById,
  deleteBlogTagById,
  getBlogTagsPaginatedWithSearch,
} = require("@controllers/blog/blogTagController");

// ** ROUTES ** //
router.post("/blog-tag", authCheck, superOrMarketingAdminCheck, createBlogTag);
// Get all blog tags
router.get("/blog-tags", getAllBlogTags);
// Get all blog tags paginated with search
router.get("/blog-tags/paginated/search", getBlogTagsPaginatedWithSearch);
// Get blog tag by id
router.get("/blog-tag/:id", getBlogTagById);
// Update blog tag by id
router.put(
  "/blog-tag/:id",
  authCheck,
  superOrMarketingAdminCheck,
  updateBlogTagById
);
// Delete blog tag by id
router.delete(
  "/blog-tag/:id",
  authCheck,
  superOrMarketingAdminCheck,
  deleteBlogTagById
);

module.exports = router;
