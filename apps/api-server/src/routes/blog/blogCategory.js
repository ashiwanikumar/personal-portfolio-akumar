// ** LIBS ** //
const express = require("express");
const router = express.Router();

// ** MIDDLEWARES ** //
const { authCheck, superOrMarketingAdminCheck } = require("@middlewares/auth");

// ** CONTROLLERS ** //
const {
  createBlogCategory,
  getAllBlogCategories,
  getBlogCategoryById,
  updateBlogCategoryById,
  deleteBlogCategoryById,
  getBlogCategoriesPaginatedWithSearch,
} = require("@controllers/blog/blogCategoryController");

// ** ROUTES ** //
router.post(
  "/blog-category",
  authCheck,
  superOrMarketingAdminCheck,
  createBlogCategory
);
router.get("/blog-categories", getAllBlogCategories);
router.get(
  "/blog-categories/paginated/search",
  getBlogCategoriesPaginatedWithSearch
);
router.get("/blog-category/:id", getBlogCategoryById);
router.put(
  "/blog-category/:id",
  authCheck,
  superOrMarketingAdminCheck,
  updateBlogCategoryById
);
router.delete(
  "/blog-category/:id",
  authCheck,
  superOrMarketingAdminCheck,
  deleteBlogCategoryById
);

module.exports = router;
