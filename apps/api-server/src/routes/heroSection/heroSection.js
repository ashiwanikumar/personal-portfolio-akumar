const express = require("express");
const router = express.Router();

// Middlewares
// Authentication middleware to check if the user is authenticated
const { authCheck } = require("@middlewares/auth");
// Middleware for handling multipart/form-data, primarily used for uploading files
const { uploadHeroSectionFileToS3 } = require("@middlewares/heroSectionMulter");

// Controllers
// Importing controller functions for handling various hero-related operations
const {
  createHero,
  getAllHeroes,
  getAllHeroesApproved,
  getHeroById,
  updateHeroById,
  updateHeroApprovalById,
  deleteHeroById,
  getHeroesPaginated,
  getApprovedHeroesPaginated,
  uploadHeroMedia, // Controller function for uploading hero media
} = require("@controllers/heroSection/heroSectionController");

// Category Controllers
const {
  createHeroCategory,
  getAllHeroCategories,
  getHeroCategoryById,
  updateHeroCategoryById,
  deleteHeroCategoryById,
} = require("@controllers/heroSection/heroSectionCategoryController");

// Routes
// Route to create a new hero
router.post("/hero-section", authCheck, createHero);

// Route to retrieve all heroes
router.get("/heroes-section", getAllHeroes);

// Route to get heroes with pagination
router.get("/heroes-section/paginated", authCheck, getHeroesPaginated);

// Route to get all approved heroes
router.get("/heroes-section/approved", getAllHeroesApproved);

// Route to get paginated approved heroes
router.get("/heroes-section/approved/paginated", getApprovedHeroesPaginated);

// Uploads
// Route to handle the uploading of hero media (images and videos)
router.post("/hero-section/upload", uploadHeroSectionFileToS3, uploadHeroMedia);

// Category Routes (must come before generic :id routes)
router.post("/hero-section/category", authCheck, createHeroCategory);
router.get("/hero-section/category", getAllHeroCategories); // Add missing route for singular endpoint
router.get("/hero-section/categories", getAllHeroCategories);
router.get("/hero-section/category/:id", getHeroCategoryById);
router.put("/hero-section/category/:id", authCheck, updateHeroCategoryById);
router.delete("/hero-section/category/:id", authCheck, deleteHeroCategoryById);

// Route to retrieve a single hero by its ID (must be last to avoid conflicts)
router.get("/hero-section/:id", getHeroById);

// Route to update a hero by its ID
router.put("/hero-section/:id", authCheck, updateHeroById);

// Route to update the approval status of a hero
router.put("/hero-section/:id/approval", authCheck, updateHeroApprovalById);

// Route to delete a hero by its ID
router.delete("/hero-section/:id", authCheck, deleteHeroById);

module.exports = router;
