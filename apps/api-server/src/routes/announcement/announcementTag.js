const express = require("express");
const router = express.Router();
const { authCheck, superAdminCheck } = require("@middlewares/auth");
const {
  createAnnouncementTag,
  getAllAnnouncementTags,
  getAnnouncementTagById,
  updateAnnouncementTagById,
  deleteAnnouncementTagById,
} = require("@controllers/announcement/announcementTagController");

// Create tag
router.post(
  "/announcement-tag",
  authCheck,
  superAdminCheck,
  createAnnouncementTag,
);
// Get all tags
router.get("/announcement-tags", authCheck, getAllAnnouncementTags);
// Get tag by id
router.get("/announcement-tag/:id", authCheck, getAnnouncementTagById);
// Update tag
router.put(
  "/announcement-tag/:id",
  authCheck,
  superAdminCheck,
  updateAnnouncementTagById,
);
// Delete tag
router.delete(
  "/announcement-tag/:id",
  authCheck,
  superAdminCheck,
  deleteAnnouncementTagById,
);

module.exports = router;
