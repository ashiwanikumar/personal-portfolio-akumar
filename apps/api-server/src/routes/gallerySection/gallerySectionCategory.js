const express = require("express");
const router = express.Router();

// Middlewares
const { authCheck } = require("@middlewares/auth");
const { logCategoryAction } = require("@middlewares/gallerySectionActivityLogger");

// Controllers
const {
  createGalleryCategory,
  getAllGalleryCategories,
  getGalleryCategoryById,
  updateGalleryCategoryById,
  deleteGalleryCategoryById,
} = require("@controllers/gallerySection/gallerySectionCategoryController");

// Routes
router.post("/gallery/category", authCheck, logCategoryAction, createGalleryCategory);
router.get("/gallery/categories", getAllGalleryCategories);
router.get("/gallery/category/:id", getGalleryCategoryById);
router.put("/gallery/category/:id", authCheck, logCategoryAction, updateGalleryCategoryById);
router.delete("/gallery/category/:id", authCheck, logCategoryAction, deleteGalleryCategoryById);

module.exports = router;
