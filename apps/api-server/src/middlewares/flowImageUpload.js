const { uploadMultipleImagesToS3, uploadImageToS3 } = require("./multer");
const s3Helper = require("@utils/s3Helper");

/**
 * Middleware for uploading a single flow image
 */
exports.uploadFlowImageToS3 = async (req, res, next) => {
  try {
    // Set a custom folder path for flow images
    const originalUploadMiddleware = uploadImageToS3;

    // Add the flow ID to the request object for use in the controller
    const flowId = req.params.id;
    req.flowId = flowId;

    // Use the existing upload middleware
    await originalUploadMiddleware(req, res, async () => {
      // This will execute after the original middleware completes
      if (req.file && req.file.buffer) {
        // Process the image using s3Helper if needed (with flow-specific settings)
        const uploadResult = await s3Helper.uploadToS3(req.file, {
          folder: `flows/${flowId}/images`,
          skipProcessing: false,
        });

        // Replace the original upload data with the processed result
        req.fileUploadResult = uploadResult;
      }
      next();
    });
  } catch (error) {
    console.error("Flow image upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Error uploading flow image",
      error: error.message,
    });
  }
};

/**
 * Middleware for uploading multiple flow images
 */
exports.uploadMultipleFlowImagesToS3 = async (req, res, next) => {
  try {
    // Set a custom folder path for flow images
    const flowId = req.params.id;
    req.flowId = flowId;

    // Use the existing upload middleware (which already uses s3Helper)
    await uploadMultipleImagesToS3(req, res, () => {
      // The original middleware already sets req.uploadedImages
      // Just make sure we have the results in the format expected by our service
      if (req.uploadedImages) {
        req.fileUploadResults = req.uploadedImages;
      }
      next();
    });
  } catch (error) {
    console.error("Multiple flow images upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Error uploading flow images",
      error: error.message,
    });
  }
};
