const express = require("express");
const router = express.Router();

// ** MIDDLEWARES ** //
const { authCheck, adminCheck, superAdminCheck } = require("@middlewares/auth");
const { uploadProfilePictureToS3 } = require("@middlewares/profilePictureMulter");

// ** CONTROLLERS ** //
const {
  uploadProfilePicture,
  getProfilePicture,
  deleteProfilePicture,
  getUserProfilePicture,
  getProfilePictureStats,
  bulkDeleteProfilePictures,
} = require("@controllers/user/profilePictureController");

// ** USER PROFILE PICTURE ROUTES ** //

/**
 * @route   POST /api/v1/user/profile-picture/upload
 * @desc    Upload/Update user profile picture
 * @access  Private (Authenticated users)
 * @limits  File size: 300KB, Dimensions: Auto-cropped to 800x800px
 */
router.post(
  "/user/profile-picture/upload", 
  authCheck, 
  uploadProfilePictureToS3, 
  uploadProfilePicture
);

/**
 * @route   GET /api/v1/user/profile-picture
 * @desc    Get current user's profile picture
 * @access  Private (Authenticated users)
 */
router.get("/user/profile-picture", authCheck, getProfilePicture);

// TEMPORARY DEBUG ROUTE - Remove auth check to test
router.get("/user/profile-picture-debug", getProfilePicture);

/**
 * @route   DELETE /api/v1/user/profile-picture
 * @desc    Delete current user's profile picture
 * @access  Private (Authenticated users)
 */
router.delete("/user/profile-picture", authCheck, deleteProfilePicture);

// ** ADMIN PROFILE PICTURE ROUTES ** //

/**
 * @route   GET /api/v1/user/profile-picture/user/:userId
 * @desc    Get specific user's profile picture (Admin only)
 * @access  Private (Admin/Super Admin)
 */
router.get("/user/profile-picture/user/:userId", authCheck, adminCheck, getUserProfilePicture);

/**
 * @route   GET /api/v1/user/profile-picture/stats
 * @desc    Get profile picture statistics (Admin only)
 * @access  Private (Admin/Super Admin)
 */
router.get("/user/profile-picture/stats", authCheck, adminCheck, getProfilePictureStats);

// ** SUPER ADMIN PROFILE PICTURE ROUTES ** //

/**
 * @route   DELETE /api/v1/user/profile-picture/bulk-delete
 * @desc    Bulk delete profile pictures for multiple users (Super Admin only)
 * @access  Private (Super Admin)
 * @body    { userIds: ["userId1", "userId2", ...] }
 */
router.delete("/user/profile-picture/bulk-delete", authCheck, superAdminCheck, bulkDeleteProfilePictures);

module.exports = router;