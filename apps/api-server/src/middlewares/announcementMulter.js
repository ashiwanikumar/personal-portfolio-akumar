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

// ** ANNOUNCEMENT MULTER S3 STORAGE CONFIGURATION (lazy) ** //
let _announcementUpload = null;
const getAnnouncementUpload = () => {
  if (!_announcementUpload) {
    _announcementUpload = multer({
      storage: multerS3({
        s3: getS3(),
        bucket: process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,

    metadata: function (req, file, cb) {
      cb(null, {
        "original-name": file.originalname,
        "upload-time": new Date().toISOString(),
        "upload-type": "announcement",
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

      // Determine upload path based on file type
      const isVideo = file.mimetype.startsWith("video/");
      const uploadPath = isVideo
        ? "announcements/videos"
        : "announcements/images";

      // Structure: announcements/{images|videos}/filename
      const fileName = `${uploadPath}/${sanitizedName}-${new Date().getTime()}.${extension}`;

      cb(null, fileName);
    },
  }),

  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit for announcement media
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
    const uploadPath = isVideo ? "announcements/videos" : "announcements/images";

    logSecurityEvent("ANNOUNCEMENT_FILE_UPLOAD_VALIDATED", {
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      fileType: file.mimetype.startsWith("video/") ? "video" : "image",
      uploadPath: uploadPath,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
    });

    cb(null, true);
  },
});
  }
  return _announcementUpload;
};

// ** ANNOUNCEMENT UPLOAD HANDLERS (lazy) ** //
const singleAnnouncementFileUpload = (req, res, cb) =>
  getAnnouncementUpload().fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
    { name: "modalImage", maxCount: 1 },
  ])(req, res, cb);
const multipleAnnouncementFileUpload = (req, res, cb) =>
  getAnnouncementUpload().fields([
    { name: "images", maxCount: 10 },
    { name: "videos", maxCount: 10 },
    { name: "media", maxCount: 10 },
  ])(req, res, cb);

// ** SINGLE ANNOUNCEMENT FILE UPLOAD HANDLER ** //
const handleAnnouncementUploadToS3 = (req, res) => {
  return new Promise((resolve, reject) => {
    const limitCheck = checkUploadLimits(req);
    if (!limitCheck.allowed) {
      logSecurityEvent("ANNOUNCEMENT_UPLOAD_RATE_LIMIT_EXCEEDED", {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get("User-Agent"),
        message: limitCheck.message,
      });
      return reject(new Error(limitCheck.message));
    }

    singleAnnouncementFileUpload(req, res, (err) => {
      if (err) {
        console.error("Announcement upload error:", err);
        logSecurityEvent("ANNOUNCEMENT_UPLOAD_ERROR", {
          error: err.message,
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get("User-Agent"),
        });
        return reject(err);
      }

      // Extract the uploaded file from any of the fields
      let uploadedFile = null;
      if (req.files && req.files.image && req.files.image[0]) {
        uploadedFile = req.files.image[0];
      } else if (req.files && req.files.video && req.files.video[0]) {
        uploadedFile = req.files.video[0];
      } else if (req.files && req.files.modalImage && req.files.modalImage[0]) {
        uploadedFile = req.files.modalImage[0];
      }

      if (!uploadedFile) {
        const error = new Error("No file uploaded");
        logSecurityEvent("ANNOUNCEMENT_UPLOAD_ERROR", {
          error: error.message,
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get("User-Agent"),
        });
        return reject(error);
      }

      const signedUrl = generateCloudFrontSignedUrl(uploadedFile.key);
      const isVideo = uploadedFile.mimetype.startsWith("video/");
      const uploadPath = isVideo
        ? "announcements/videos"
        : "announcements/images";

      logSecurityEvent("ANNOUNCEMENT_UPLOAD_SUCCESS", {
        filename: uploadedFile.originalname,
        s3Key: uploadedFile.key,
        fileSize: uploadedFile.size,
        fileType: isVideo ? "video" : "image",
        uploadPath: uploadPath,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get("User-Agent"),
      });

      return resolve(signedUrl);
    });
  });
};

// ** MULTIPLE ANNOUNCEMENT FILES UPLOAD HANDLER ** //
const handleMultipleAnnouncementUploadsToS3 = (req, res) => {
  return new Promise((resolve, reject) => {
    const limitCheck = checkUploadLimits(req);
    if (!limitCheck.allowed) {
      logSecurityEvent("ANNOUNCEMENT_UPLOAD_RATE_LIMIT_EXCEEDED", {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get("User-Agent"),
        message: limitCheck.message,
      });
      return reject(new Error(limitCheck.message));
    }

    multipleAnnouncementFileUpload(req, res, (err) => {
      if (err) {
        console.error("Multiple announcement upload error:", err);
        logSecurityEvent("ANNOUNCEMENT_UPLOAD_ERROR", {
          error: err.message,
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get("User-Agent"),
        });
        return reject(err);
      }

      // Extract uploaded files from image, video, and media fields
      let uploadedFiles = [];
      if (req.files && req.files.images) {
        uploadedFiles = uploadedFiles.concat(req.files.images);
      }
      if (req.files && req.files.videos) {
        uploadedFiles = uploadedFiles.concat(req.files.videos);
      }
      if (req.files && req.files.media) {
        uploadedFiles = uploadedFiles.concat(req.files.media);
      }

      const signedUrls = uploadedFiles.map((file) =>
        generateCloudFrontSignedUrl(file.key)
      );

      logSecurityEvent("ANNOUNCEMENT_MULTIPLE_UPLOAD_SUCCESS", {
        fileCount: uploadedFiles.length,
        totalSize: uploadedFiles.reduce((sum, file) => sum + file.size, 0),
        files: uploadedFiles.map((file) => ({
          filename: file.originalname,
          s3Key: file.key,
          size: file.size,
          fileType: file.mimetype.startsWith("video/") ? "video" : "image",
          uploadPath: file.mimetype.startsWith("video/")
            ? "announcements/videos"
            : "announcements/images",
        })),
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get("User-Agent"),
      });

      return resolve(signedUrls);
    });
  });
};

// ** MIDDLEWARE FUNCTIONS ** //
const uploadAnnouncementFileToS3 = (req, res, next) => {
  handleAnnouncementUploadToS3(req, res)
    .then((signedUrl) => {
      // Extract the uploaded file from any of the fields
      let uploadedFile = null;
      if (req.files && req.files.image && req.files.image[0]) {
        uploadedFile = req.files.image[0];
      } else if (req.files && req.files.video && req.files.video[0]) {
        uploadedFile = req.files.video[0];
      } else if (req.files && req.files.modalImage && req.files.modalImage[0]) {
        uploadedFile = req.files.modalImage[0];
      }

      if (!uploadedFile) {
        throw new Error("No file found in request");
      }

      const isVideo = uploadedFile.mimetype.startsWith("video/");
      const uploadPath = isVideo
        ? "announcements/videos"
        : "announcements/images";

      req.uploadUrl = signedUrl;
      req.uploadOgName = uploadedFile.originalname;
      req.uploadItemSize = uploadedFile.size;
      req.uploadItemType = uploadedFile.mimetype;
      req.s3Key = uploadedFile.key;
      req.s3Url = generateS3Url(uploadedFile.key);
      req.cloudFrontUrl = generateCloudFrontUrl(uploadedFile.key);
      req.fileType = isVideo ? "video" : "image";
      req.uploadPath = uploadPath;

      console.log("✅ Announcement file uploaded successfully:", {
        signedUrl: req.uploadUrl,
        cloudFrontUrl: req.cloudFrontUrl,
        s3Key: req.s3Key,
        originalName: req.uploadOgName,
        size: req.uploadItemSize,
        type: req.uploadItemType,
        fileType: req.fileType,
        uploadPath: req.uploadPath,
      });

      return next();
    })
    .catch((err) => {
      console.error("❌ Announcement file upload error:", err);
      return res.status(500).json({
        message: "Announcement file upload failed",
        error: err.message,
        status: "error",
        timestamp: new Date().toISOString(),
      });
    });
};

const uploadMultipleAnnouncementFilesToS3 = (req, res, next) => {
  handleMultipleAnnouncementUploadsToS3(req, res)
    .then((signedUrls) => {
      // Extract uploaded files from image, video, and media fields
      let uploadedFiles = [];
      if (req.files && req.files.images) {
        uploadedFiles = uploadedFiles.concat(req.files.images);
      }
      if (req.files && req.files.videos) {
        uploadedFiles = uploadedFiles.concat(req.files.videos);
      }
      if (req.files && req.files.media) {
        uploadedFiles = uploadedFiles.concat(req.files.media);
      }

      if (uploadedFiles && uploadedFiles.length > 0) {
        req.uploadedAnnouncementFiles = uploadedFiles.map((file, index) => {
          const isVideo = file.mimetype.startsWith("video/");
          const uploadPath = isVideo
            ? "announcements/videos"
            : "announcements/images";

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

        console.log("✅ Multiple announcement files uploaded successfully:", {
          count: req.uploadCount,
          totalSize: req.totalSize,
          files: req.uploadedAnnouncementFiles.map((file) => ({
            url: file.url,
            originalName: file.originalName,
            size: file.size,
            fileType: file.fileType,
            uploadPath: file.uploadPath,
          })),
        });
      } else {
        req.uploadedAnnouncementFiles = [];
        req.uploadCount = 0;
        req.totalSize = 0;
        console.log("⚠️ No announcement files uploaded");
      }

      return next();
    })
    .catch((err) => {
      console.error("❌ Multiple announcement files upload error:", err);
      return res.status(500).json({
        message: "Multiple announcement files upload failed",
        error: err.message,
        status: "error",
        timestamp: new Date().toISOString(),
      });
    });
};

// ** DELETE FUNCTIONS ** //
const deleteAnnouncementFileFromS3 = async (s3Key) => {
  try {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
    };

    const result = await getS3().deleteObject(params).promise();
    console.log("✅ Announcement file deleted from S3:", s3Key);

    logSecurityEvent("ANNOUNCEMENT_FILE_S3_DELETE_SUCCESS", {
      s3Key: s3Key,
      result: result,
    });

    return result;
  } catch (error) {
    console.error("❌ Announcement S3 delete failed:", error);

    logSecurityEvent("ANNOUNCEMENT_FILE_S3_DELETE_ERROR", {
      s3Key: s3Key,
      error: error.message,
    });

    throw error;
  }
};

const deleteAnnouncementFileWithCacheInvalidation = async (s3Key) => {
  try {
    // Delete from S3
    await deleteAnnouncementFileFromS3(s3Key);

    // Invalidate CloudFront cache
    await invalidateCloudFrontCache(s3Key);

    console.log("✅ Announcement file deleted and cache invalidated:", s3Key);

    logSecurityEvent("ANNOUNCEMENT_FILE_DELETE_COMPLETE", {
      s3Key: s3Key,
      operations: ["s3_delete", "cloudfront_invalidation"],
    });

    return { success: true, message: "Announcement file deleted successfully" };
  } catch (error) {
    console.error("❌ Announcement delete operation failed:", error);

    logSecurityEvent("ANNOUNCEMENT_FILE_DELETE_FAILED", {
      s3Key: s3Key,
      error: error.message,
    });

    throw error;
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
    else if (url.startsWith("announcements/")) {
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

    console.log(`🔍 S3 Key extraction: ${url} → ${extractedKey}`);

    return extractedKey;
  } catch (error) {
    console.error("Error extracting S3 key from URL:", error);
    // Return clean URL without query params as fallback
    return url.split("?")[0].split("#")[0];
  }
};

// ** EXPORTS ** //
module.exports = {
  uploadAnnouncementFileToS3,
  uploadMultipleAnnouncementFilesToS3,
  handleAnnouncementUploadToS3,
  handleMultipleAnnouncementUploadsToS3,
  announcementUpload: getAnnouncementUpload,
  deleteAnnouncementFileFromS3,
  deleteAnnouncementFileWithCacheInvalidation,
  extractS3KeyFromUrl,
};