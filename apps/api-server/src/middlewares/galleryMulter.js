// ** DEPENDENCIES ** //
const multer = require("multer");
const multerS3 = require("multer-s3");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

// ** IMPORT EXISTING CONFIGURATIONS ** //
const {
  getS3,
  generateCloudFrontSignedUrl,
  generateCloudFrontUrl,
  generateS3Url,
  logSecurityEvent,
  checkUploadLimits,
  invalidateCloudFrontCache,
} = require("./multer");

// ** GALLERY SECTION MULTER S3 STORAGE CONFIGURATION (lazy) ** //
let _galleryUpload = null;
const getGalleryUpload = () => {
  if (!_galleryUpload) {
    _galleryUpload = multer({
      storage: multerS3({
        s3: getS3(),
        bucket: process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,

    metadata: function (req, file, cb) {
      // Sanitize the original filename to prevent invalid characters in HTTP headers
      const sanitizedOriginalName = file.originalname
        .replace(/[^\x00-\x7F]/g, "") // Remove non-ASCII characters
        .replace(/[^\w\s.-]/g, "") // Remove special characters except alphanumeric, spaces, dots, and hyphens
        .replace(/\s+/g, " ") // Replace multiple spaces with single space
        .trim(); // Remove leading/trailing spaces

      cb(null, {
        "original-name": sanitizedOriginalName,
        "upload-time": new Date().toISOString(),
        "upload-type": "gallery-section",
      });
    },

    key: function (req, file, cb) {
      const fileNameParts = file.originalname.split(".");
      const extension = fileNameParts[fileNameParts.length - 1];
      const baseName = fileNameParts.slice(0, -1).join(".");

      const sanitizedName = baseName
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9-_]/g, "")
        .toLowerCase();

      // Determine upload path based on file type and archive status
      const isVideo = file.mimetype.startsWith("video/");
      const isArchiveUpload =
        req.body.isArchived === "true" || 
        req.body.archiveFolder || 
        req.originalUrl?.includes('/archive/');

      let uploadPath;
      if (isArchiveUpload) {
        // Archive uploads go to archive folders
        const archiveFolder =
          req.body.archiveFolder || (isVideo ? "old-videos" : "old-photos");
        uploadPath = `gallery-section/archive/${archiveFolder}`;
      } else {
        // Regular uploads go to main folders
        uploadPath = isVideo
          ? "gallery-section/videos"
          : "gallery-section/images";
      }

      // Structure: gallery-section/{images|videos|archive/old-photos|archive/old-videos}/filename
      const fileName = `${uploadPath}/${sanitizedName}-${new Date().getTime()}.${extension}`;

      cb(null, fileName);
    },
  }),

  limits: {
    fileSize: 1 * 1024 * 1024 * 1024, // 1GB limit for videos
  },

  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      // Image formats
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      // Video formats
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/avi",
      "video/mov",
      "video/quicktime",
      "video/x-msvideo",
    ];

    const allowedExtensions = [
      // Image extensions
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
      ".svg",
      // Video extensions
      ".mp4",
      ".webm",
      ".ogg",
      ".avi",
      ".mov",
    ];

    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        new Error(
          `Invalid file type: ${file.mimetype}. Only image and video files are allowed.`
        ),
        false
      );
    }

    if (!allowedExtensions.includes(fileExtension)) {
      return cb(
        new Error(
          `Invalid file extension: ${fileExtension}. Only image and video files are allowed.`
        ),
        false
      );
    }

    // Determine upload path for logging
    const isVideo = file.mimetype.startsWith("video/");
    const isArchiveUpload = 
      req.body.isArchived === "true" || 
      req.body.archiveFolder || 
      req.originalUrl?.includes('/archive/');
    let uploadPath;
    if (isArchiveUpload) {
      const archiveFolder =
        req.body.archiveFolder || (isVideo ? "old-videos" : "old-photos");
      uploadPath = `gallery-section/archive/${archiveFolder}`;
    } else {
      uploadPath = isVideo
        ? "gallery-section/videos"
        : "gallery-section/images";
    }

    logSecurityEvent("GALLERY_FILE_UPLOAD_VALIDATED", {
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size || 0, // Ensure size is always a number
      fileType: file.mimetype.startsWith("video/") ? "video" : "image",
      uploadPath: uploadPath,
      isArchiveUpload: isArchiveUpload,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
    });

    cb(null, true);
  },
});
  }
  return _galleryUpload;
};

// ** GALLERY UPLOAD HANDLERS (lazy) ** //
const singleGalleryFileUpload = (req, res, cb) =>
  getGalleryUpload().fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ])(req, res, cb);
const multipleGalleryFileUpload = (req, res, cb) =>
  getGalleryUpload().fields([
    { name: "images", maxCount: 10 },
    { name: "videos", maxCount: 10 },
  ])(req, res, cb);

// ** SINGLE GALLERY FILE UPLOAD HANDLER ** //
const handleGalleryUploadToS3 = (req, res) => {
  return new Promise((resolve, reject) => {
    const limitCheck = checkUploadLimits(req);
    if (!limitCheck.allowed) {
      logSecurityEvent("GALLERY_UPLOAD_RATE_LIMIT_EXCEEDED", {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get("User-Agent"),
        message: limitCheck.message,
      });
      return reject(new Error(limitCheck.message));
    }

    singleGalleryFileUpload(req, res, (err) => {
      if (err) {
        console.error("Gallery upload error:", err);
        logSecurityEvent("GALLERY_UPLOAD_ERROR", {
          error: err.message,
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get("User-Agent"),
        });
        return reject(err);
      }

      // Extract the uploaded file from either image or video field
      let uploadedFile = null;
      if (req.files && req.files.image && req.files.image[0]) {
        uploadedFile = req.files.image[0];
      } else if (req.files && req.files.video && req.files.video[0]) {
        uploadedFile = req.files.video[0];
      }

      if (!uploadedFile) {
        const error = new Error("No file uploaded");
        logSecurityEvent("GALLERY_UPLOAD_ERROR", {
          error: error.message,
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get("User-Agent"),
        });
        return reject(error);
      }

      const signedUrl = generateCloudFrontSignedUrl(uploadedFile.key);
      const isVideo = uploadedFile.mimetype.startsWith("video/");
      const isArchiveUpload =
        req.body.isArchived === "true" || 
        req.body.archiveFolder || 
        req.originalUrl?.includes('/archive/');
      let uploadPath;
      if (isArchiveUpload) {
        const archiveFolder =
          req.body.archiveFolder || (isVideo ? "old-videos" : "old-photos");
        uploadPath = `gallery-section/archive/${archiveFolder}`;
      } else {
        uploadPath = isVideo
          ? "gallery-section/videos"
          : "gallery-section/images";
      }

      logSecurityEvent("GALLERY_UPLOAD_SUCCESS", {
        filename: uploadedFile.originalname,
        s3Key: uploadedFile.key,
        fileSize: uploadedFile.size,
        fileType: isVideo ? "video" : "image",
        uploadPath: uploadPath,
        isArchiveUpload: isArchiveUpload,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get("User-Agent"),
      });

      return resolve(signedUrl);
    });
  });
};

// ** MULTIPLE GALLERY FILES UPLOAD HANDLER ** //
const handleMultipleGalleryUploadsToS3 = (req, res) => {
  return new Promise((resolve, reject) => {
    const limitCheck = checkUploadLimits(req);
    if (!limitCheck.allowed) {
      logSecurityEvent("GALLERY_UPLOAD_RATE_LIMIT_EXCEEDED", {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get("User-Agent"),
        message: limitCheck.message,
      });
      return reject(new Error(limitCheck.message));
    }

    multipleGalleryFileUpload(req, res, (err) => {
      if (err) {
        console.error("Multiple gallery upload error:", err);
        logSecurityEvent("GALLERY_UPLOAD_ERROR", {
          error: err.message,
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get("User-Agent"),
        });
        return reject(err);
      }

      // Extract uploaded files from both image and video fields
      let uploadedFiles = [];
      if (req.files && req.files.images) {
        uploadedFiles = uploadedFiles.concat(req.files.images);
      }
      if (req.files && req.files.videos) {
        uploadedFiles = uploadedFiles.concat(req.files.videos);
      }

      const signedUrls = uploadedFiles.map((file) =>
        generateCloudFrontSignedUrl(file.key)
      );

      const isArchiveUpload =
        req.body.isArchived === "true" || 
        req.body.archiveFolder || 
        req.originalUrl?.includes('/archive/');

      logSecurityEvent("GALLERY_MULTIPLE_UPLOAD_SUCCESS", {
        fileCount: uploadedFiles.length,
        totalSize: uploadedFiles.reduce((sum, file) => sum + file.size, 0),
        isArchiveUpload: isArchiveUpload,
        files: uploadedFiles.map((file) => ({
          filename: file.originalname,
          s3Key: file.key,
          size: file.size,
          fileType: file.mimetype.startsWith("video/") ? "video" : "image",
          uploadPath: file.mimetype.startsWith("video/")
            ? isArchiveUpload
              ? "gallery-section/archive/old-videos"
              : "gallery-section/videos"
            : isArchiveUpload
            ? "gallery-section/archive/old-photos"
            : "gallery-section/images",
        })),
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get("User-Agent"),
      });

      return resolve(signedUrls);
    });
  });
};

// ** MIDDLEWARE FUNCTIONS ** //
const uploadGalleryFileToS3 = (req, res, next) => {
  handleGalleryUploadToS3(req, res)
    .then((signedUrl) => {
      // Extract the uploaded file from either image or video field
      let uploadedFile = null;
      if (req.files && req.files.image && req.files.image[0]) {
        uploadedFile = req.files.image[0];
      } else if (req.files && req.files.video && req.files.video[0]) {
        uploadedFile = req.files.video[0];
      }

      if (!uploadedFile) {
        throw new Error("No file found in request");
      }

      const isVideo = uploadedFile.mimetype.startsWith("video/");
      const isArchiveUpload =
        req.body.isArchived === "true" || 
        req.body.archiveFolder || 
        req.originalUrl?.includes('/archive/');
      let uploadPath;
      if (isArchiveUpload) {
        const archiveFolder =
          req.body.archiveFolder || (isVideo ? "old-videos" : "old-photos");
        uploadPath = `gallery-section/archive/${archiveFolder}`;
      } else {
        uploadPath = isVideo
          ? "gallery-section/videos"
          : "gallery-section/images";
      }

      req.uploadUrl = signedUrl;
      req.uploadOgName = uploadedFile.originalname;
      req.uploadItemSize = uploadedFile.size;
      req.uploadItemType = uploadedFile.mimetype;
      req.s3Key = uploadedFile.key;
      req.s3Url = generateS3Url(uploadedFile.key);
      req.cloudFrontUrl = generateCloudFrontUrl(uploadedFile.key);
      req.fileType = isVideo ? "video" : "image";
      req.uploadPath = uploadPath;
      req.isArchiveUpload = isArchiveUpload;

      console.log("Gallery file uploaded successfully:", {
        signedUrl: req.uploadUrl,
        cloudFrontUrl: req.cloudFrontUrl,
        s3Key: req.s3Key,
        originalName: req.uploadOgName,
        size: req.uploadItemSize,
        type: req.uploadItemType,
        fileType: req.fileType,
        uploadPath: req.uploadPath,
        isArchiveUpload: req.isArchiveUpload,
      });

      return next();
    })
    .catch((err) => {
      console.error("Gallery file upload error:", err);
      return res.status(500).json({
        message: "Gallery file upload failed",
        error: err.message,
        status: "error",
        timestamp: new Date().toISOString(),
      });
    });
};

const uploadMultipleGalleryFilesToS3 = (req, res, next) => {
  handleMultipleGalleryUploadsToS3(req, res)
    .then((signedUrls) => {
      // Extract uploaded files from both image and video fields
      let uploadedFiles = [];
      if (req.files && req.files.images) {
        uploadedFiles = uploadedFiles.concat(req.files.images);
      }
      if (req.files && req.files.videos) {
        uploadedFiles = uploadedFiles.concat(req.files.videos);
      }

      if (uploadedFiles && uploadedFiles.length > 0) {
        req.uploadedGalleryFiles = uploadedFiles.map((file, index) => {
          const isVideo = file.mimetype.startsWith("video/");
          const isArchiveUpload =
            req.body.isArchived === "true" || 
            req.body.archiveFolder || 
            req.originalUrl?.includes('/archive/');
          let uploadPath;
          if (isArchiveUpload) {
            const archiveFolder =
              req.body.archiveFolder || (isVideo ? "old-videos" : "old-photos");
            uploadPath = `gallery-section/archive/${archiveFolder}`;
          } else {
            uploadPath = isVideo
              ? "gallery-section/videos"
              : "gallery-section/images";
          }

          return {
            url: signedUrls[index],
            cloudFrontUrl: generateCloudFrontUrl(file.key),
            s3Url: generateS3Url(file.key),
            s3Key: file.key,
            originalName: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
            fileType: isVideo ? "video" : "image",
            uploadPath: uploadPath,
            isArchiveUpload: isArchiveUpload,
            fileId: uuidv4(),
            uploadedAt: new Date().toISOString(),
            expiresAt: new Date(
              Date.now() + 20 * 365 * 24 * 60 * 60 * 1000
            ).toISOString(),
            variants: {},
          };
        });

        req.uploadCount = uploadedFiles.length;
        req.totalSize = uploadedFiles.reduce(
          (total, file) => total + file.size,
          0
        );

        console.log("Multiple gallery files uploaded successfully:", {
          count: req.uploadCount,
          totalSize: req.totalSize,
          isArchiveUpload:
            req.uploadedGalleryFiles[0]?.isArchiveUpload || false,
          files: req.uploadedGalleryFiles.map((file) => ({
            url: file.url,
            originalName: file.originalName,
            size: file.size,
            fileType: file.fileType,
            uploadPath: file.uploadPath,
          })),
        });
      } else {
        req.uploadedGalleryFiles = [];
        req.uploadCount = 0;
        req.totalSize = 0;
        console.log("⚠️ No gallery files uploaded");
      }

      return next();
    })
    .catch((err) => {
      console.error("Multiple gallery files upload error:", err);
      return res.status(500).json({
        message: "Multiple gallery files upload failed",
        error: err.message,
        status: "error",
        timestamp: new Date().toISOString(),
      });
    });
};

// ** DELETE FUNCTIONS ** //
const deleteGalleryFileFromS3 = async (s3Key) => {
  try {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
    };

    const result = await getS3().deleteObject(params).promise();
    console.log("Gallery file deleted from S3:", s3Key);

    logSecurityEvent("GALLERY_FILE_S3_DELETE_SUCCESS", {
      s3Key: s3Key,
      result: result,
    });

    return result;
  } catch (error) {
    console.error("Gallery S3 delete failed:", error);

    logSecurityEvent("GALLERY_FILE_S3_DELETE_ERROR", {
      s3Key: s3Key,
      error: error.message,
    });

    throw error;
  }
};

const deleteGalleryFileWithCacheInvalidation = async (s3Key) => {
  try {
    // Delete from S3
    await deleteGalleryFileFromS3(s3Key);

    // Invalidate CloudFront cache
    await invalidateCloudFrontCache(s3Key);

    console.log("Gallery file deleted and cache invalidated:", s3Key);

    logSecurityEvent("GALLERY_FILE_DELETE_COMPLETE", {
      s3Key: s3Key,
      operations: ["s3_delete", "cloudfront_invalidation"],
    });

    return { success: true, message: "Gallery file deleted successfully" };
  } catch (error) {
    console.error("Gallery delete operation failed:", error);

    logSecurityEvent("GALLERY_FILE_DELETE_FAILED", {
      s3Key: s3Key,
      error: error.message,
    });

    throw error;
  }
};

const deleteMultipleGalleryFilesFromS3 = async (s3Keys) => {
  try {
    if (!Array.isArray(s3Keys) || s3Keys.length === 0) {
      return {
        success: 0,
        failed: 0,
        errors: [],
      };
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [],
    };

    // Process deletions concurrently
    const deletePromises = s3Keys.map(async (s3Key, index) => {
      try {
        if (!s3Key) {
          results.failed++;
          results.errors.push(`S3 key at index ${index} is empty or null`);
          return;
        }

        await deleteGalleryFileWithCacheInvalidation(s3Key);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Failed to delete ${s3Key}: ${error.message}`);
        console.error(`Error deleting gallery file ${s3Key}:`, error);
      }
    });

    // Wait for all deletion attempts to complete
    await Promise.all(deletePromises);

    logSecurityEvent("GALLERY_BULK_DELETE_COMPLETE", {
      totalFiles: s3Keys.length,
      successCount: results.success,
      failedCount: results.failed,
      errors: results.errors,
    });

    return results;
  } catch (error) {
    console.error("Error in deleteMultipleGalleryFilesFromS3:", error);

    logSecurityEvent("GALLERY_BULK_DELETE_ERROR", {
      s3Keys: s3Keys,
      error: error.message,
    });

    throw new Error("Failed to delete multiple gallery files");
  }
};

// ** UTILITY FUNCTIONS ** //
const extractS3KeyFromUrl = (url) => {
  try {
    let extractedKey = url;

    // Handle CloudFront URLs
    if (url.includes(process.env.CLOUDFRONT_DOMAIN)) {
      extractedKey = url.split(`${process.env.CLOUDFRONT_DOMAIN}/`)[1];
    }
    // Handle S3 URLs
    else if (url.includes(".s3.") && url.includes(".amazonaws.com/")) {
      extractedKey = url.split(".amazonaws.com/")[1];
    }
    // Handle direct S3 keys
    else if (url.startsWith("gallery-section/")) {
      extractedKey = url;
    }

    // Remove query parameters (signed URL parameters)
    if (extractedKey.includes("?")) {
      extractedKey = extractedKey.split("?")[0];
    }

    // Remove any hash fragments
    if (extractedKey.includes("#")) {
      extractedKey = extractedKey.split("#")[0];
    }

    console.log(`S3 Key extraction: ${url} → ${extractedKey}`);

    return extractedKey;
  } catch (error) {
    console.error("Error extracting S3 key from URL:", error);
    // Return clean URL without query params as fallback
    return url.split("?")[0].split("#")[0];
  }
};

// ** EXPORTS ** //
module.exports = {
  uploadGalleryFileToS3,
  uploadMultipleGalleryFilesToS3,
  handleGalleryUploadToS3,
  handleMultipleGalleryUploadsToS3,
  galleryUpload: getGalleryUpload,
  deleteGalleryFileFromS3,
  deleteGalleryFileWithCacheInvalidation,
  deleteMultipleGalleryFilesFromS3,
  extractS3KeyFromUrl,
};
