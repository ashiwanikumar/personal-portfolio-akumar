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

// ** HERO SECTION MULTER S3 STORAGE CONFIGURATION (lazy) ** //
let _heroSectionUpload = null;
const getHeroSectionUpload = () => {
  if (!_heroSectionUpload) {
    _heroSectionUpload = multer({
      storage: multerS3({
        s3: getS3(),
        bucket: process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,

    metadata: function (req, file, cb) {
      cb(null, {
        "original-name": file.originalname,
        "upload-time": new Date().toISOString(),
        "upload-type": "hero-section",
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
        ? "hero-section/videos"
        : "hero-section/images";

      // Structure: hero-section/{images|videos}/filename
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
    const uploadPath = isVideo ? "hero-section/videos" : "hero-section/images";

    logSecurityEvent("HERO_SECTION_FILE_UPLOAD_VALIDATED", {
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
  return _heroSectionUpload;
};

// ** HERO SECTION UPLOAD HANDLERS (lazy) ** //
const singleHeroSectionFileUpload = (req, res, cb) =>
  getHeroSectionUpload().fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ])(req, res, cb);
const multipleHeroSectionFileUpload = (req, res, cb) =>
  getHeroSectionUpload().fields([
    { name: "images", maxCount: 10 },
    { name: "videos", maxCount: 10 },
  ])(req, res, cb);

// ** SINGLE HERO SECTION FILE UPLOAD HANDLER ** //
const handleHeroSectionUploadToS3 = (req, res) => {
  return new Promise((resolve, reject) => {
    const limitCheck = checkUploadLimits(req);
    if (!limitCheck.allowed) {
      logSecurityEvent("HERO_SECTION_UPLOAD_RATE_LIMIT_EXCEEDED", {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get("User-Agent"),
        message: limitCheck.message,
      });
      return reject(new Error(limitCheck.message));
    }

    singleHeroSectionFileUpload(req, res, (err) => {
      if (err) {
        console.error("Hero section upload error:", err);
        logSecurityEvent("HERO_SECTION_UPLOAD_ERROR", {
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
        logSecurityEvent("HERO_SECTION_UPLOAD_ERROR", {
          error: error.message,
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get("User-Agent"),
        });
        return reject(error);
      }

      const signedUrl = generateCloudFrontSignedUrl(uploadedFile.key);
      const isVideo = uploadedFile.mimetype.startsWith("video/");
      const uploadPath = isVideo
        ? "hero-section/videos"
        : "hero-section/images";

      logSecurityEvent("HERO_SECTION_UPLOAD_SUCCESS", {
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

// ** MULTIPLE HERO SECTION FILES UPLOAD HANDLER ** //
const handleMultipleHeroSectionUploadsToS3 = (req, res) => {
  return new Promise((resolve, reject) => {
    const limitCheck = checkUploadLimits(req);
    if (!limitCheck.allowed) {
      logSecurityEvent("HERO_SECTION_UPLOAD_RATE_LIMIT_EXCEEDED", {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get("User-Agent"),
        message: limitCheck.message,
      });
      return reject(new Error(limitCheck.message));
    }

    multipleHeroSectionFileUpload(req, res, (err) => {
      if (err) {
        console.error("Multiple hero section upload error:", err);
        logSecurityEvent("HERO_SECTION_UPLOAD_ERROR", {
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

      logSecurityEvent("HERO_SECTION_MULTIPLE_UPLOAD_SUCCESS", {
        fileCount: uploadedFiles.length,
        totalSize: uploadedFiles.reduce((sum, file) => sum + file.size, 0),
        files: uploadedFiles.map((file) => ({
          filename: file.originalname,
          s3Key: file.key,
          size: file.size,
          fileType: file.mimetype.startsWith("video/") ? "video" : "image",
          uploadPath: file.mimetype.startsWith("video/")
            ? "hero-section/videos"
            : "hero-section/images",
        })),
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get("User-Agent"),
      });

      return resolve(signedUrls);
    });
  });
};

// ** MIDDLEWARE FUNCTIONS ** //
const uploadHeroSectionFileToS3 = (req, res, next) => {
  handleHeroSectionUploadToS3(req, res)
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
      const uploadPath = isVideo
        ? "hero-section/videos"
        : "hero-section/images";

      req.uploadUrl = signedUrl;
      req.uploadOgName = uploadedFile.originalname;
      req.uploadItemSize = uploadedFile.size;
      req.uploadItemType = uploadedFile.mimetype;
      req.s3Key = uploadedFile.key;
      req.s3Url = generateS3Url(uploadedFile.key);
      req.cloudFrontUrl = generateCloudFrontUrl(uploadedFile.key);
      req.fileType = isVideo ? "video" : "image";
      req.uploadPath = uploadPath;

      console.log("✅ Hero section file uploaded successfully:", {
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
      console.error("❌ Hero section file upload error:", err);
      return res.status(500).json({
        message: "Hero section file upload failed",
        error: err.message,
        status: "error",
        timestamp: new Date().toISOString(),
      });
    });
};

const uploadMultipleHeroSectionFilesToS3 = (req, res, next) => {
  handleMultipleHeroSectionUploadsToS3(req, res)
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
        req.uploadedHeroSectionFiles = uploadedFiles.map((file, index) => {
          const isVideo = file.mimetype.startsWith("video/");
          const uploadPath = isVideo
            ? "hero-section/videos"
            : "hero-section/images";

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

        console.log("✅ Multiple hero section files uploaded successfully:", {
          count: req.uploadCount,
          totalSize: req.totalSize,
          files: req.uploadedHeroSectionFiles.map((file) => ({
            url: file.url,
            originalName: file.originalName,
            size: file.size,
            fileType: file.fileType,
            uploadPath: file.uploadPath,
          })),
        });
      } else {
        req.uploadedHeroSectionFiles = [];
        req.uploadCount = 0;
        req.totalSize = 0;
        console.log("⚠️ No hero section files uploaded");
      }

      return next();
    })
    .catch((err) => {
      console.error("❌ Multiple hero section files upload error:", err);
      return res.status(500).json({
        message: "Multiple hero section files upload failed",
        error: err.message,
        status: "error",
        timestamp: new Date().toISOString(),
      });
    });
};

// ** DELETE FUNCTIONS ** //
const deleteHeroSectionFileFromS3 = async (s3Key) => {
  try {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
    };

    const result = await getS3().deleteObject(params).promise();
    console.log("✅ Hero section file deleted from S3:", s3Key);

    logSecurityEvent("HERO_SECTION_FILE_S3_DELETE_SUCCESS", {
      s3Key: s3Key,
      result: result,
    });

    return result;
  } catch (error) {
    console.error("❌ Hero section S3 delete failed:", error);

    logSecurityEvent("HERO_SECTION_FILE_S3_DELETE_ERROR", {
      s3Key: s3Key,
      error: error.message,
    });

    throw error;
  }
};

const deleteHeroSectionFileWithCacheInvalidation = async (s3Key) => {
  try {
    // Delete from S3
    await deleteHeroSectionFileFromS3(s3Key);

    // Invalidate CloudFront cache
    await invalidateCloudFrontCache(s3Key);

    console.log("✅ Hero section file deleted and cache invalidated:", s3Key);

    logSecurityEvent("HERO_SECTION_FILE_DELETE_COMPLETE", {
      s3Key: s3Key,
      operations: ["s3_delete", "cloudfront_invalidation"],
    });

    return { success: true, message: "Hero section file deleted successfully" };
  } catch (error) {
    console.error("❌ Hero section delete operation failed:", error);

    logSecurityEvent("HERO_SECTION_FILE_DELETE_FAILED", {
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
    else if (url.startsWith("hero-section/")) {
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
  uploadHeroSectionFileToS3,
  uploadMultipleHeroSectionFilesToS3,
  handleHeroSectionUploadToS3,
  handleMultipleHeroSectionUploadsToS3,
  heroSectionUpload: getHeroSectionUpload,
  deleteHeroSectionFileFromS3,
  deleteHeroSectionFileWithCacheInvalidation,
  extractS3KeyFromUrl,
};
