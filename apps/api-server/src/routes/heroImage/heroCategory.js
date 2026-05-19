const express = require("express");
const router = express.Router();

// Middlewares
const { authCheck } = require("@middlewares/auth");

// Controllers
const {
  createHeroCategory,
  getAllHeroCategories,
  getHeroCategoryById,
  updateHeroCategoryById,
  deleteHeroCategoryById,
} = require("@controllers/heroImage/heroCategoryController");

// Routes
router.post("/hero/category", authCheck, createHeroCategory);
router.get("/hero/categories", getAllHeroCategories);
router.get("/hero/category/:id", getHeroCategoryById);
router.put("/hero/category/:id", authCheck, updateHeroCategoryById);
router.delete("/hero/category/:id", authCheck, deleteHeroCategoryById);

module.exports = router;
