// ** DEPENDENCIES ** //
const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

// ** IMPORT EXISTING CONFIGURATIONS ** //
const {
  generateCloudFrontSignedUrl,
  generateCloudFrontUrl,
  generateS3Url,
  logSecurityEvent,
  checkUploadLimits,
  invalidateCloudFrontCache,
} = require("./multer");

// ** AWS S3 CONFIGURATION ** //
const s3 = new AWS.S3({
  region: process.env.AWS_BUCKET_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// ** BLOG MULTER S3 STORAGE CONFIGURATION ** //
const blogUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,

    metadata: function (req, file, cb) {
      cb(null, {
        "original-name": file.originalname,
        "upload-time": new Date().toISOString(),
        "upload-type": "blog",
        "field-name": file.fieldname,
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

      // Determine upload path based on field name and file type
      let uploadPath = "blog";

      if (file.fieldname === "coverImage") {
        uploadPath = "blog/cover-images";
      } else if (
        file.fieldname === "contentImage" ||
        file.fieldname === "contentImages"
      ) {
        uploadPath = "blog/content-images";
      } else if (file.fieldname === "video" || file.fieldname === "videos") {
        uploadPath = "blog/videos";
      } else if (file.fieldname === "image" || file.fieldname === "images") {
        uploadPath = "blog/images";
      } else {
        // Default path based on MIME type
        const isVideo = file.mimetype.startsWith("video/");
        uploadPath = isVideo ? "blog/videos" : "blog/images";
      }

      // Add date-based organization for better file management
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");

      // Structure: blog/{type}/{year}/{month}/filename
      const fileName = `${uploadPath}/${year}/${month}/${sanitizedName}-${date.getTime()}.${extension}`;

      cb(null, fileName);
    },
  }),

  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit for videos, 100MB for images
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
    ];

    const fileExtension = path.extname(file.originalname).toLowerCase();
    const isVideo = file.mimetype.startsWith("video/");

    // Apply different size limits based on file type
    const maxSize = isVideo ? 500 * 1024 * 1024 : 100 * 1024 * 1024; // 500MB for videos, 100MB for images

    if (file.size > maxSize) {
      return cb(
        new Error(
          `File size exceeds limit. Maximum size for ${
            isVideo ? "videos" : "images"
          } is ${isVideo ? "500MB" : "100MB"}.`
        ),
        false
      );
    }

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

    logSecurityEvent("BLOG_FILE_UPLOAD_VALIDATED", {
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      fileType: isVideo ? "video" : "image",
      fieldName: file.fieldname,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
    });

    cb(null, true);
  },
});

// ** BLOG UPLOAD HANDLERS ** //
// Single file uploads for different purposes
const singleBlogCoverImageUpload = blogUpload.single("coverImage");
const singleBlogContentImageUpload = blogUpload.single("contentImage");
const singleBlogVideoUpload = blogUpload.single("video");

// Multiple file uploads
const multipleBlogContentImagesUpload = blogUpload.array("contentImages", 20);
const multipleBlogMediaUpload = blogUpload.fields([
  { name: "images", maxCount: 20 },
  { name: "videos", maxCount: 5 },
]);

// ** SINGLE BLOG FILE UPLOAD HANDLER ** //
const handleSingleBlogUploadToS3 = (uploadHandler, uploadType) => {
  return (req, res) => {
    return new Promise((resolve, reject) => {
      const limitCheck = checkUploadLimits(req);
      if (!limitCheck.allowed) {
        logSecurityEvent("BLOG_UPLOAD_RATE_LIMIT_EXCEEDED", {
          uploadType,
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get("User-Agent"),
          message: limitCheck.message,
        });
        return reject(new Error(limitCheck.message));
      }

      uploadHandler(req, res, (err) => {
        if (err) {
          console.error(`Blog ${uploadType} upload error:`, err);
          logSecurityEvent("BLOG_UPLOAD_ERROR", {
            uploadType,
            error: err.message,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get("User-Agent"),
          });
          return reject(err);
        }

        if (!req.file) {
          const error = new Error("No file uploaded");
          logSecurityEvent("BLOG_UPLOAD_ERROR", {
            uploadType,
            error: error.message,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get("User-Agent"),
          });
          return reject(error);
        }

        const signedUrl = generateCloudFrontSignedUrl(req.file.key);
        const isVideo = req.file.mimetype.startsWith("video/");

        logSecurityEvent("BLOG_UPLOAD_SUCCESS", {
          uploadType,
          filename: req.file.originalname,
          s3Key: req.file.key,
          fileSize: req.file.size,
          fileType: isVideo ? "video" : "image",
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get("User-Agent"),
        });

        return resolve({
          signedUrl,
          cloudFrontUrl: generateCloudFrontUrl(req.file.key),
          s3Url: generateS3Url(req.file.key),
          s3Key: req.file.key,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          fileType: isVideo ? "video" : "image",
        });
      });
    });
  };
};

// ** MULTIPLE BLOG FILES UPLOAD HANDLER ** //
const handleMultipleBlogUploadsToS3 = (uploadHandler, uploadType) => {
  return (req, res) => {
    return new Promise((resolve, reject) => {
      const limitCheck = checkUploadLimits(req);
      if (!limitCheck.allowed) {
        logSecurityEvent("BLOG_UPLOAD_RATE_LIMIT_EXCEEDED", {
          uploadType,
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get("User-Agent"),
          message: limitCheck.message,
        });
        return reject(new Error(limitCheck.message));
      }

      uploadHandler(req, res, (err) => {
        if (err) {
          console.error(`Multiple blog ${uploadType} upload error:`, err);
          logSecurityEvent("BLOG_UPLOAD_ERROR", {
            uploadType,
            error: err.message,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get("User-Agent"),
          });
          return reject(err);
        }

        // Handle both array uploads and field uploads
        let uploadedFiles = [];
        if (req.files) {
          if (Array.isArray(req.files)) {
            uploadedFiles = req.files;
          } else {
            // Handle field uploads (images and videos)
            if (req.files.images) {
              uploadedFiles = uploadedFiles.concat(req.files.images);
            }
            if (req.files.videos) {
              uploadedFiles = uploadedFiles.concat(req.files.videos);
            }
          }
        }

        if (uploadedFiles.length === 0) {
          const error = new Error("No files uploaded");
          logSecurityEvent("BLOG_UPLOAD_ERROR", {
            uploadType,
            error: error.message,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get("User-Agent"),
          });
          return reject(error);
        }

        const uploadedFilesData = uploadedFiles.map((file) => {
          const isVideo = file.mimetype.startsWith("video/");
          return {
            signedUrl: generateCloudFrontSignedUrl(file.key),
            cloudFrontUrl: generateCloudFrontUrl(file.key),
            s3Url: generateS3Url(file.key),
            s3Key: file.key,
            originalName: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
            fileType: isVideo ? "video" : "image",
            fileId: uuidv4(),
            uploadedAt: new Date().toISOString(),
          };
        });

        logSecurityEvent("BLOG_MULTIPLE_UPLOAD_SUCCESS", {
          uploadType,
          fileCount: uploadedFiles.length,
          totalSize: uploadedFiles.reduce((sum, file) => sum + file.size, 0),
          files: uploadedFilesData.map((file) => ({
            filename: file.originalName,
            s3Key: file.s3Key,
            size: file.size,
            fileType: file.fileType,
          })),
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get("User-Agent"),
        });

        return resolve(uploadedFilesData);
      });
    });
  };
};

// ** MIDDLEWARE FUNCTIONS ** //
const uploadBlogCoverImageToS3 = (req, res, next) => {
  handleSingleBlogUploadToS3(singleBlogCoverImageUpload, "cover-image")(
    req,
    res
  )
    .then((uploadData) => {
      req.uploadUrl = uploadData.signedUrl;
      req.uploadOgName = uploadData.originalName;
      req.uploadItemSize = uploadData.size;
      req.uploadItemType = uploadData.mimetype;
      req.s3Key = uploadData.s3Key;
      req.s3Url = uploadData.s3Url;
      req.cloudFrontUrl = uploadData.cloudFrontUrl;
      req.fileType = uploadData.fileType;

      console.log("Blog cover image uploaded successfully:", {
        cloudFrontUrl: req.cloudFrontUrl,
        originalName: req.uploadOgName,
        size: req.uploadItemSize,
      });

      return next();
    })
    .catch((err) => {
      console.error("Blog cover image upload error:", err);
      return res.status(500).json({
        message: "Blog cover image upload failed",
        error: err.message,
        status: "error",
        timestamp: new Date().toISOString(),
      });
    });
};

const uploadBlogContentImageToS3 = (req, res, next) => {
  handleSingleBlogUploadToS3(singleBlogContentImageUpload, "content-image")(
    req,
    res
  )
    .then((uploadData) => {
      req.uploadUrl = uploadData.signedUrl;
      req.uploadOgName = uploadData.originalName;
      req.uploadItemSize = uploadData.size;
      req.uploadItemType = uploadData.mimetype;
      req.s3Key = uploadData.s3Key;
      req.s3Url = uploadData.s3Url;
      req.cloudFrontUrl = uploadData.cloudFrontUrl;
      req.fileType = uploadData.fileType;

      console.log("Blog content image uploaded successfully:", {
        cloudFrontUrl: req.cloudFrontUrl,
        originalName: req.uploadOgName,
        size: req.uploadItemSize,
      });

      return next();
    })
    .catch((err) => {
      console.error("Blog content image upload error:", err);
      return res.status(500).json({
        message: "Blog content image upload failed",
        error: err.message,
        status: "error",
        timestamp: new Date().toISOString(),
      });
    });
};

const uploadBlogVideoToS3 = (req, res, next) => {
  handleSingleBlogUploadToS3(singleBlogVideoUpload, "video")(req, res)
    .then((uploadData) => {
      req.uploadUrl = uploadData.signedUrl;
      req.uploadOgName = uploadData.originalName;
      req.uploadItemSize = uploadData.size;
      req.uploadItemType = uploadData.mimetype;
      req.s3Key = uploadData.s3Key;
      req.s3Url = uploadData.s3Url;
      req.cloudFrontUrl = uploadData.cloudFrontUrl;
      req.fileType = uploadData.fileType;

      console.log("Blog video uploaded successfully:", {
        cloudFrontUrl: req.cloudFrontUrl,
        originalName: req.uploadOgName,
        size: req.uploadItemSize,
      });

      return next();
    })
    .catch((err) => {
      console.error("Blog video upload error:", err);
      return res.status(500).json({
        message: "Blog video upload failed",
        error: err.message,
        status: "error",
        timestamp: new Date().toISOString(),
      });
    });
};

const uploadMultipleBlogContentImagesToS3 = (req, res, next) => {
  handleMultipleBlogUploadsToS3(
    multipleBlogContentImagesUpload,
    "content-images"
  )(req, res)
    .then((uploadedFilesData) => {
      req.uploadedBlogFiles = uploadedFilesData;
      req.uploadCount = uploadedFilesData.length;
      req.totalSize = uploadedFilesData.reduce(
        (total, file) => total + file.size,
        0
      );

      console.log("Multiple blog content images uploaded successfully:", {
        count: req.uploadCount,
        totalSize: req.totalSize,
      });

      return next();
    })
    .catch((err) => {
      console.error("Multiple blog content images upload error:", err);
      return res.status(500).json({
        message: "Multiple blog content images upload failed",
        error: err.message,
        status: "error",
        timestamp: new Date().toISOString(),
      });
    });
};

const uploadMultipleBlogMediaToS3 = (req, res, next) => {
  handleMultipleBlogUploadsToS3(multipleBlogMediaUpload, "mixed-media")(
    req,
    res
  )
    .then((uploadedFilesData) => {
      req.uploadedBlogMedia = uploadedFilesData;
      req.uploadCount = uploadedFilesData.length;
      req.totalSize = uploadedFilesData.reduce(
        (total, file) => total + file.size,
        0
      );

      // Separate images and videos
      req.uploadedImages = uploadedFilesData.filter(
        (file) => file.fileType === "image"
      );
      req.uploadedVideos = uploadedFilesData.filter(
        (file) => file.fileType === "video"
      );

      console.log("Multiple blog media uploaded successfully:", {
        totalCount: req.uploadCount,
        imageCount: req.uploadedImages.length,
        videoCount: req.uploadedVideos.length,
        totalSize: req.totalSize,
      });

      return next();
    })
    .catch((err) => {
      console.error("Multiple blog media upload error:", err);
      return res.status(500).json({
        message: "Multiple blog media upload failed",
        error: err.message,
        status: "error",
        timestamp: new Date().toISOString(),
      });
    });
};

// ** DELETE FUNCTIONS ** //
const deleteBlogFileFromS3 = async (s3Key) => {
  try {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
    };

    const result = await s3.deleteObject(params).promise();
    console.log("Blog file deleted from S3:", s3Key);

    logSecurityEvent("BLOG_FILE_S3_DELETE_SUCCESS", {
      s3Key: s3Key,
      result: result,
    });

    return result;
  } catch (error) {
    console.error("Blog S3 delete failed:", error);

    logSecurityEvent("BLOG_FILE_S3_DELETE_ERROR", {
      s3Key: s3Key,
      error: error.message,
    });

    throw error;
  }
};

const deleteBlogFileWithCacheInvalidation = async (s3Key) => {
  try {
    // Delete from S3
    await deleteBlogFileFromS3(s3Key);

    // Invalidate CloudFront cache
    await invalidateCloudFrontCache(s3Key);

    console.log("Blog file deleted and cache invalidated:", s3Key);

    logSecurityEvent("BLOG_FILE_DELETE_COMPLETE", {
      s3Key: s3Key,
      operations: ["s3_delete", "cloudfront_invalidation"],
    });

    return { success: true, message: "Blog file deleted successfully" };
  } catch (error) {
    console.error("Blog delete operation failed:", error);

    logSecurityEvent("BLOG_FILE_DELETE_FAILED", {
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
    else if (url.startsWith("blog/")) {
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
  // Upload handlers
  uploadBlogCoverImageToS3,
  uploadBlogContentImageToS3,
  uploadBlogVideoToS3,
  uploadMultipleBlogContentImagesToS3,
  uploadMultipleBlogMediaToS3,

  // Raw handlers for custom implementations
  handleSingleBlogUploadToS3,
  handleMultipleBlogUploadsToS3,

  // Multer instances
  blogUpload,
  singleBlogCoverImageUpload,
  singleBlogContentImageUpload,
  singleBlogVideoUpload,
  multipleBlogContentImagesUpload,
  multipleBlogMediaUpload,

  // Delete functions
  deleteBlogFileFromS3,
  deleteBlogFileWithCacheInvalidation,

  // Utility functions
  extractS3KeyFromUrl,
};
