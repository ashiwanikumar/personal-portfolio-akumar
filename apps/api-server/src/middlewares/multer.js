// ** DEPENDENCIES ** //
const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const path = require("path");

// ** AWS S3 CONFIGURATION (lazy) ** //
let _s3 = null;
const getS3 = () => {
  if (!_s3) {
    _s3 = new AWS.S3({
      region: process.env.AWS_BUCKET_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
  }
  return _s3;
};

// ** AWS CLOUDFRONT CONFIGURATION ** //
const getFormattedPrivateKey = () => {
  let privateKey = process.env.CLOUDFRONT_PRIVATE_KEY;

  if (!privateKey) {
    console.warn("CLOUDFRONT_PRIVATE_KEY not found");
    return null;
  }

  // Handle different private key formats - remove quotes and handle newlines
  privateKey = privateKey.replace(/^['"]|['"]$/g, ""); // Remove surrounding quotes

  // Handle escaped newlines if they exist
  if (privateKey.includes("\\n")) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  // If it's all on one line (common .env issue), try to fix it
  if (
    !privateKey.includes("\n") &&
    privateKey.includes("-----BEGIN PRIVATE KEY----------")
  ) {
    // Split the key into proper lines
    privateKey = privateKey.replace(
      "-----BEGIN PRIVATE KEY-----",
      "-----BEGIN PRIVATE KEY-----\n"
    );
    privateKey = privateKey.replace(
      "-----END PRIVATE KEY-----",
      "\n-----END PRIVATE KEY-----"
    );
  }

  // The key should be in proper PKCS#8 format
  privateKey = privateKey.trim();

  // Validate the format
  if (!privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
    console.error(
      "Invalid private key format. Expected PKCS#8 format with BEGIN PRIVATE KEY header"
    );
    return null;
  }

  return privateKey;
};

let _cloudfront = undefined;
const getCloudFront = () => {
  if (_cloudfront !== undefined) return _cloudfront;
  try {
    const keyPairId = process.env.CLOUDFRONT_KEY_PAIR_ID;
    const privateKey = getFormattedPrivateKey();

    if (!keyPairId || !privateKey) {
      console.warn(
        "CloudFront signing not configured (missing key pair ID or private key)"
      );
      _cloudfront = null;
      return _cloudfront;
    }

    // Test the private key format first
    const keyObject = crypto.createPrivateKey(privateKey);
    console.log("CloudFront signed URLs configured successfully");

    _cloudfront = new AWS.CloudFront.Signer(keyPairId, privateKey);
    return _cloudfront;
  } catch (error) {
    console.error("CloudFront signer initialization failed:", error.message);
    console.warn("Will use regular CloudFront URLs instead of signed URLs");
    _cloudfront = null;
    return _cloudfront;
  }
};

// ** MULTER S3 STORAGE CONFIGURATION (lazy) ** //
let _upload = null;
const getUpload = () => {
  if (!_upload) {
    _upload = multer({
      storage: multerS3({
        s3: getS3(),
        bucket: process.env.AWS_BUCKET_NAME,

    // Set proper content type for images
    contentType: multerS3.AUTO_CONTENT_TYPE,

    // Set metadata for better file handling
    metadata: function (req, file, cb) {
      cb(null, {
        "original-name": file.originalname,
        "upload-time": new Date().toISOString(),
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

      // Default to hero-images for hero upload route
      const uploadType = "hero-images";

      // Structure: upload-type/filename
      const fileName = `${uploadType}/${sanitizedName}-${new Date().getTime()}.${extension}`;

      cb(null, fileName);
    },
  }),

  limits: {
    fileSize: 1 * 1024 * 1024 * 1024, // 1GB limit for videos
  },

  fileFilter: (req, file, cb) => {
    // Security: Enhanced file validation for images and videos
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

    // Check MIME type
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        new Error(
          `Invalid file type: ${file.mimetype}. Only image and video files are allowed.`
        ),
        false
      );
    }

    // Check file extension
    if (!allowedExtensions.includes(fileExtension)) {
      return cb(
        new Error(
          `Invalid file extension: ${fileExtension}. Only image and video files are allowed.`
        ),
        false
      );
    }

    // Security: Basic file signature validation
    if (!validateFileSignature(file)) {
      return cb(
        new Error(
          "File signature validation failed. File may be corrupted or malicious."
        ),
        false
      );
    }

    // Log security event
    logSecurityEvent("FILE_UPLOAD_VALIDATED", {
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      fileType: file.mimetype.startsWith("video/") ? "video" : "image",
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
    });

    cb(null, true);
  },
});
  }
  return _upload;
};

// ** UPLOAD HANDLERS (lazy) ** //
const singleFileUpload = (req, res, cb) => getUpload().single("image")(req, res, cb);
const singleVideoUpload = (req, res, cb) => getUpload().single("video")(req, res, cb);
const multipleFileUpload = (req, res, cb) => getUpload().array("images", 10)(req, res, cb);

// ** HELPER FUNCTIONS ** //
const generateCloudFrontSignedUrl = (s3Key, customExpiration = null) => {
  const url = `https://${process.env.CLOUDFRONT_DOMAIN}/${s3Key}`;

  // Check if CloudFront signing is properly configured
  const cloudfront = getCloudFront();
  if (!cloudfront) {
    console.warn("CloudFront signing not configured, using regular URL");
    return url;
  }

  // For permanent access (blog images, gallery, videos), set expiration to 20 years
  // This is effectively "infinite" access while still being a signed URL
  const expirationTime = customExpiration
    ? Math.floor(customExpiration.getTime() / 1000)
    : Math.floor(Date.now() / 1000) + 20 * 365 * 24 * 60 * 60; // 20 years

  try {
    const signedUrl = cloudfront.getSignedUrl({
      url: url,
      expires: expirationTime,
    });
    console.log("Generated signed URL successfully (20 year expiration)");
    console.log("Debug - Expires timestamp:", expirationTime);
    console.log(
      "Debug - Signed URL snippet:",
      signedUrl.substring(0, 150) + "..."
    );
    return signedUrl;
  } catch (error) {
    console.error("Error generating signed URL:", error.message);
    console.log("Falling back to regular CloudFront URL");
    return url;
  }
};

const generateCloudFrontUrl = (s3Key) => {
  return `https://${process.env.CLOUDFRONT_DOMAIN}/${s3Key}`;
};

const generateS3Url = (s3Key) => {
  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${s3Key}`;
};

// ** SINGLE FILE UPLOAD HANDLER ** //
const handleUploadToS3 = (req, res) => {
  return new Promise((resolve, reject) => {
    // Security: Check upload limits before processing
    const limitCheck = checkUploadLimits(req);
    if (!limitCheck.allowed) {
      logSecurityEvent("UPLOAD_RATE_LIMIT_EXCEEDED", {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get("User-Agent"),
        message: limitCheck.message,
      });
      return reject(new Error(limitCheck.message));
    }

    singleFileUpload(req, res, (err) => {
      if (err) {
        console.error("Single upload error:", err);
        logSecurityEvent("UPLOAD_ERROR", {
          error: err.message,
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get("User-Agent"),
        });
        return reject(err);
      }

      const signedUrl = generateCloudFrontSignedUrl(req.file.key);

      // Security: Log successful upload
      logSecurityEvent("UPLOAD_SUCCESS", {
        filename: req.file.originalname,
        s3Key: req.file.key,
        fileSize: req.file.size,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get("User-Agent"),
      });

      return resolve(signedUrl);
    });
  });
};

// ** SINGLE VIDEO UPLOAD HANDLER ** //
const handleVideoUploadToS3 = (req, res) => {
  return new Promise((resolve, reject) => {
    // Security: Check upload limits before processing
    const limitCheck = checkUploadLimits(req);
    if (!limitCheck.allowed) {
      logSecurityEvent("UPLOAD_RATE_LIMIT_EXCEEDED", {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get("User-Agent"),
        message: limitCheck.message,
      });
      return reject(new Error(limitCheck.message));
    }

    singleVideoUpload(req, res, (err) => {
      if (err) {
        console.error("Single video upload error:", err);
        logSecurityEvent("UPLOAD_ERROR", {
          error: err.message,
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get("User-Agent"),
        });
        return reject(err);
      }

      const signedUrl = generateCloudFrontSignedUrl(req.file.key);

      // Security: Log successful upload
      logSecurityEvent("VIDEO_UPLOAD_SUCCESS", {
        filename: req.file.originalname,
        s3Key: req.file.key,
        fileSize: req.file.size,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get("User-Agent"),
      });

      return resolve(signedUrl);
    });
  });
};

// ** MULTIPLE FILES UPLOAD HANDLER ** //
const handleMultipleUploadsToS3 = (req, res) => {
  return new Promise((resolve, reject) => {
    // Security: Check upload limits before processing
    const limitCheck = checkUploadLimits(req);
    if (!limitCheck.allowed) {
      logSecurityEvent("UPLOAD_RATE_LIMIT_EXCEEDED", {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get("User-Agent"),
        message: limitCheck.message,
      });
      return reject(new Error(limitCheck.message));
    }

    multipleFileUpload(req, res, (err) => {
      if (err) {
        console.error("Multiple upload error:", err);
        logSecurityEvent("UPLOAD_ERROR", {
          error: err.message,
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get("User-Agent"),
        });
        return reject(err);
      }

      const uploadedFiles = req.files || [];
      const signedUrls = uploadedFiles.map((file) =>
        generateCloudFrontSignedUrl(file.key)
      );

      // Security: Log successful multiple upload
      logSecurityEvent("MULTIPLE_UPLOAD_SUCCESS", {
        fileCount: uploadedFiles.length,
        totalSize: uploadedFiles.reduce((sum, file) => sum + file.size, 0),
        files: uploadedFiles.map((file) => ({
          filename: file.originalname,
          s3Key: file.key,
          size: file.size,
        })),
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get("User-Agent"),
      });

      return resolve(signedUrls);
    });
  });
};

// ** MIDDLEWARE FUNCTIONS ** //
const uploadImageToS3 = (req, res, next) => {
  handleUploadToS3(req, res)
    .then((signedUrl) => {
      req.uploadUrl = signedUrl;
      req.uploadOgName = req.file.originalname;
      req.uploadItemSize = req.file.size;
      req.uploadItemType = req.file.mimetype;
      req.s3Key = req.file.key;
      req.s3Url = generateS3Url(req.file.key);
      req.cloudFrontUrl = generateCloudFrontUrl(req.file.key);

      console.log("Single file uploaded successfully:", {
        signedUrl: req.uploadUrl,
        cloudFrontUrl: req.cloudFrontUrl,
        s3Key: req.s3Key,
        originalName: req.uploadOgName,
        size: req.uploadItemSize,
        type: req.uploadItemType,
      });

      return next();
    })
    .catch((err) => {
      console.error("Single upload error:", err);
      return res.status(500).json({
        message: "Single file upload failed",
        error: err.message,
        status: "error",
        timestamp: new Date().toISOString(),
      });
    });
};

const uploadVideoToS3 = (req, res, next) => {
  handleVideoUploadToS3(req, res)
    .then((signedUrl) => {
      req.uploadUrl = signedUrl;
      req.uploadOgName = req.file.originalname;
      req.uploadItemSize = req.file.size;
      req.uploadItemType = req.file.mimetype;
      req.s3Key = req.file.key;
      req.s3Url = generateS3Url(req.file.key);
      req.cloudFrontUrl = generateCloudFrontUrl(req.file.key);

      console.log("Single video uploaded successfully:", {
        signedUrl: req.uploadUrl,
        cloudFrontUrl: req.cloudFrontUrl,
        s3Key: req.s3Key,
        originalName: req.uploadOgName,
        size: req.uploadItemSize,
        type: req.uploadItemType,
      });

      return next();
    })
    .catch((err) => {
      console.error("Single video upload error:", err);
      return res.status(500).json({
        message: "Single video upload failed",
        error: err.message,
        status: "error",
        timestamp: new Date().toISOString(),
      });
    });
};

const uploadMultipleImagesToS3 = (req, res, next) => {
  handleMultipleUploadsToS3(req, res)
    .then((signedUrls) => {
      if (req.files && req.files.length > 0) {
        req.uploadedImages = req.files.map((file, index) => ({
          url: signedUrls[index],
          cloudFrontUrl: generateCloudFrontUrl(file.key),
          s3Url: generateS3Url(file.key),
          s3Key: file.key,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          fileId: uuidv4(),
          uploadedAt: new Date().toISOString(),
          expiresAt: new Date(
            Date.now() + 20 * 365 * 24 * 60 * 60 * 1000
          ).toISOString(), // 20 years
          variants: {},
        }));

        req.uploadCount = req.files.length;
        req.totalSize = req.files.reduce((total, file) => total + file.size, 0);

        console.log("Multiple files uploaded successfully:", {
          count: req.uploadCount,
          totalSize: req.totalSize,
          files: req.uploadedImages.map((img) => ({
            url: img.url,
            originalName: img.originalName,
            size: img.size,
            expiresAt: img.expiresAt,
          })),
        });
      } else {
        req.uploadedImages = [];
        req.uploadCount = 0;
        req.totalSize = 0;

        console.log("No files uploaded");
      }

      return next();
    })
    .catch((err) => {
      console.error("Multiple upload error:", err);
      return res.status(500).json({
        message: "Multiple files upload failed",
        error: err.message,
        status: "error",
        timestamp: new Date().toISOString(),
      });
    });
};

// ** UTILITY FUNCTIONS ** //
const generateSignedUrlForExistingFile = (s3Key, customExpiration = null) => {
  const dateLessThan =
    customExpiration || new Date(Date.now() + 20 * 365 * 24 * 60 * 60 * 1000); // 20 years
  return generateCloudFrontSignedUrl(s3Key, dateLessThan);
};

const invalidateCloudFrontCache = async (s3Keys) => {
  const cloudfrontService = new AWS.CloudFront();

  const paths = Array.isArray(s3Keys)
    ? s3Keys.map((key) => `/${key}`)
    : [`/${s3Keys}`];

  const params = {
    DistributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID,
    InvalidationBatch: {
      CallerReference: `invalidation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      Paths: {
        Quantity: paths.length,
        Items: paths,
      },
    },
  };

  try {
    const result = await cloudfrontService.createInvalidation(params).promise();
    console.log("CloudFront cache invalidated:", result.Invalidation.Id);
    return result;
  } catch (error) {
    console.error("CloudFront invalidation failed:", error);
    throw error;
  }
};

const deleteFileFromS3 = async (s3Key) => {
  try {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
    };

    const result = await getS3().deleteObject(params).promise();
    console.log("File deleted from S3:", s3Key);
    return result;
  } catch (error) {
    console.error("S3 delete failed:", error);
    throw error;
  }
};

const deleteFileWithCacheInvalidation = async (s3Key) => {
  try {
    // Delete from S3
    await deleteFileFromS3(s3Key);

    // Invalidate CloudFront cache
    await invalidateCloudFrontCache(s3Key);

    console.log("File deleted and cache invalidated:", s3Key);
    return { success: true, message: "File deleted successfully" };
  } catch (error) {
    console.error("Delete operation failed:", error);
    throw error;
  }
};

// ** VALIDATION FUNCTIONS ** //
const testPrivateKeyFormat = () => {
  try {
    const privateKey = getFormattedPrivateKey();
    if (!privateKey) {
      return { valid: false, error: "Private key not found" };
    }

    // Test if the key can be loaded
    crypto.createPrivateKey(privateKey);

    return { valid: true, message: "Private key format is valid" };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

const validateCloudFrontConfig = () => {
  const requiredEnvVars = [
    "CLOUDFRONT_DOMAIN",
    "AWS_BUCKET_NAME",
    "AWS_BUCKET_REGION",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.error("Missing required environment variables:", missingVars);
    return false;
  }

  // Check CloudFront signing configuration
  if (
    !process.env.CLOUDFRONT_KEY_PAIR_ID ||
    !process.env.CLOUDFRONT_PRIVATE_KEY
  ) {
    console.warn(
      "CloudFront signing not configured (CLOUDFRONT_KEY_PAIR_ID or CLOUDFRONT_PRIVATE_KEY missing)"
    );
    console.warn("Will use regular CloudFront URLs instead of signed URLs");
  } else {
    const keyTest = testPrivateKeyFormat();
    if (keyTest.valid) {
      console.log("CloudFront signed URLs are properly configured");
    } else {
      console.error("CloudFront private key format error:", keyTest.error);
      console.warn("Will use regular CloudFront URLs instead of signed URLs");
    }
  }

  console.log("Basic CloudFront environment variables are configured");
  return true;
};

// ** SECURITY FUNCTIONS ** //
const validateFileSignature = (file) => {
  // Note: This is a basic validation. In production, you'd want more sophisticated checks
  // For now, we'll do basic validation based on file buffer when available
  return true; // Placeholder - implement actual signature validation
};

const logSecurityEvent = (event, data) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    ...data,
    severity: "INFO",
  };

  console.log(`SECURITY_LOG :: ${event} ::`, logEntry);

  // In production, you might want to send this to a security monitoring service
  // or write to a dedicated security log file
};

const checkUploadLimits = (req) => {
  // Rate limiting check - implement your preferred rate limiting logic
  // This is a placeholder for demonstration
  const userIp = req.ip || req.connection.remoteAddress;
  const now = Date.now();

  // Simple in-memory rate limiting (in production, use Redis or similar)
  if (!global.uploadLimits) {
    global.uploadLimits = new Map();
  }

  const userLimits = global.uploadLimits.get(userIp) || {
    count: 0,
    lastReset: now,
  };

  // Reset counter every hour
  if (now - userLimits.lastReset > 3600000) {
    userLimits.count = 0;
    userLimits.lastReset = now;
  }

  // Allow 20 uploads per hour per IP (reduced for video uploads)
  if (userLimits.count >= 20) {
    return {
      allowed: false,
      message: "Upload rate limit exceeded. Try again later.",
    };
  }

  userLimits.count++;
  global.uploadLimits.set(userIp, userLimits);

  return { allowed: true };
};

// ** EXPORTS ** //
module.exports = {
  uploadImageToS3,
  uploadVideoToS3,
  uploadMultipleImagesToS3,
  generateCloudFrontSignedUrl,
  generateCloudFrontUrl,
  generateS3Url,
  generateSignedUrlForExistingFile,
  invalidateCloudFrontCache,
  deleteFileFromS3,
  deleteFileWithCacheInvalidation,
  validateCloudFrontConfig,
  testPrivateKeyFormat,
  getFormattedPrivateKey,
  handleUploadToS3,
  handleVideoUploadToS3,
  handleMultipleUploadsToS3,
  upload: getUpload,
  getS3,
  logSecurityEvent,
  checkUploadLimits,
};
