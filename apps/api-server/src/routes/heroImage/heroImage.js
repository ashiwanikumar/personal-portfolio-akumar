const express = require("express");
const router = express.Router();

// Middlewares
// Authentication middleware to check if the user is authenticated
const { authCheck } = require("@middlewares/auth");
// Middleware for handling multipart/form-data, primarily used for uploading files
const { uploadImageToS3, uploadVideoToS3 } = require("@middlewares/multer");

// Controllers
// Importing controller functions for handling various hero image-related operations
const {
  createHeroImage,
  getAllHeroImages,
  getAllHeroImagesApproved,
  getHeroImageById,
  updateHeroImageById,
  updateHeroImageApprovalById,
  deleteHeroImageById,
  getHeroImagesPaginated,
  getApprovedHeroImagesPaginated,
  uploadHeroImage, // Controller function for uploading hero images
  uploadHeroVideo, // Controller function for uploading hero videos
} = require("@controllers/heroImage/heroImageController");

// Routes
// Route to create a new hero image
router.post("/hero/image", authCheck, createHeroImage);

// Route to create a new hero video
router.post("/hero/video", authCheck, createHeroImage);

// Route to retrieve all hero images
router.get("/hero/images", getAllHeroImages);

// Route to get hero images with pagination
router.get("/hero-images/paginated", authCheck, getHeroImagesPaginated);

// Route to get all approved hero images
router.get("/hero/images/approved", getAllHeroImagesApproved);

// Route to get paginated approved hero images
router.get("/hero-images/approved/paginated", getApprovedHeroImagesPaginated);

// Route to retrieve a single hero image by its ID
router.get("/hero/image/:id", getHeroImageById);

// Route to update a hero image by its ID
router.put("/hero/image/:id", authCheck, updateHeroImageById);

// Route to update the approval status of a hero image
router.put("/hero/image/:id/approval", authCheck, updateHeroImageApprovalById);

// Route to delete a hero image by its ID
router.delete("/hero/image/:id", authCheck, deleteHeroImageById);

// Uploads
// Route to handle the uploading of hero images
router.post("/hero/upload-image", uploadImageToS3, uploadHeroImage);

// Route to handle the uploading of hero videos
router.post("/hero/upload-video", uploadVideoToS3, uploadHeroVideo);

module.exports = router;
