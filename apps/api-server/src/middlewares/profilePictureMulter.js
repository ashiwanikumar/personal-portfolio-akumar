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

// ** PROFILE PICTURE MULTER S3 STORAGE CONFIGURATION ** //
const profilePictureUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,

    metadata: function (req, file, cb) {
      const userId = req.user._id || req.user.id;
      cb(null, {
        "original-name": file.originalname,
        "upload-time": new Date().toISOString(),
        "upload-type": "profile-picture",
        "user-id": userId.toString(),
      });
    },

    key: function (req, file, cb) {
      const userId = req.user._id || req.user.id;
      const fileNameParts = file.originalname.split(".");
      const extension = fileNameParts[fileNameParts.length - 1];
      
      const timestamp = Date.now();
      const uniqueId = uuidv4().substr(0, 8);
      
      // Structure: profile-pictures/user-{userId}/profile-{timestamp}-{uniqueId}.{extension}
      const fileName = `profile-pictures/user-${userId}/profile-${timestamp}-${uniqueId}.${extension}`;

      cb(null, fileName);
    },
  }),

  limits: {
    fileSize: 300 * 1024, // 300KB limit
    files: 1, // Only one file at a time
  },

  fileFilter: (req, file, cb) => {
    // Only allow image files
    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg", 
      "image/png",
      "image/webp",
    ];

    const allowedExtensions = [
      ".jpg",
      ".jpeg", 
      ".png",
      ".webp",
    ];

    const fileExtension = path.extname(file.originalname).toLowerCase();

    // Check MIME type
    if (!allowedMimeTypes.includes(file.mimetype)) {
      logSecurityEvent("PROFILE_PICTURE_INVALID_MIME_TYPE", {
        filename: file.originalname,
        mimetype: file.mimetype,
        userId: req.user._id || req.user.id,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get("User-Agent"),
      });
      
      return cb(
        new Error(
          `Invalid file type: ${file.mimetype}. Only JPEG, JPG, PNG, and WebP images are allowed.`
        ),
        false
      );
    }

    // Check file extension
    if (!allowedExtensions.includes(fileExtension)) {
      logSecurityEvent("PROFILE_PICTURE_INVALID_EXTENSION", {
        filename: file.originalname,
        extension: fileExtension,
        userId: req.user._id || req.user.id,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get("User-Agent"),
      });
      
      return cb(
        new Error(
          `Invalid file extension: ${fileExtension}. Only .jpg, .jpeg, .png, and .webp files are allowed.`
        ),
        false
      );
    }

    logSecurityEvent("PROFILE_PICTURE_UPLOAD_VALIDATED", {
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      userId: req.user._id || req.user.id,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
    });

    cb(null, true);
  },
});

// ** SINGLE PROFILE PICTURE UPLOAD ** //
const singleProfilePictureUpload = profilePictureUpload.fields([
  { name: "profilePicture", maxCount: 1 },
]);

// ** PROFILE PICTURE UPLOAD HANDLER ** //
const handleProfilePictureUploadToS3 = (req, res) => {
  return new Promise((resolve, reject) => {
    // Security: Check upload limits before processing
    const limitCheck = checkUploadLimits(req);
    if (!limitCheck.allowed) {
      logSecurityEvent("PROFILE_PICTURE_RATE_LIMIT_EXCEEDED", {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get("User-Agent"),
        message: limitCheck.message,
      });
      return reject(new Error(limitCheck.message));
    }

    singleProfilePictureUpload(req, res, (err) => {
      if (err) {
        console.error("Profile picture upload error:", err);
        
        logSecurityEvent("PROFILE_PICTURE_UPLOAD_ERROR", {
          error: err.message,
          userId: req.user._id || req.user.id,
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get("User-Agent"),
        });
        
        return reject(err);
      }

      // Extract the uploaded file from profilePicture field (same pattern as hero section)
      let uploadedFile = null;
      if (req.files && req.files.profilePicture && req.files.profilePicture[0]) {
        uploadedFile = req.files.profilePicture[0];
      }

      if (!uploadedFile) {
        const error = new Error("No profile picture file uploaded");
        logSecurityEvent("PROFILE_PICTURE_UPLOAD_ERROR", {
          error: error.message,
          userId: req.user._id || req.user.id,
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get("User-Agent"),
        });
        return reject(error);
      }

      // Generate URLs for the uploaded file
      const signedUrl = generateCloudFrontSignedUrl(uploadedFile.key);
      const cloudFrontUrl = generateCloudFrontUrl(uploadedFile.key);
      const s3Url = generateS3Url(uploadedFile.key);

      logSecurityEvent("PROFILE_PICTURE_UPLOAD_SUCCESS", {
        filename: uploadedFile.originalname,
        s3Key: uploadedFile.key,
        fileSize: uploadedFile.size,
        userId: req.user._id || req.user.id,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get("User-Agent"),
      });

      console.log("✅ Profile picture uploaded successfully:", {
        signedUrl,
        cloudFrontUrl,
        s3Key: uploadedFile.key,
        originalName: uploadedFile.originalname,
        size: uploadedFile.size,
        type: uploadedFile.mimetype,
      });

      const uploadResult = {
        signedUrl,
        cloudFrontUrl,
        s3Url,
        s3Key: uploadedFile.key,
        originalName: uploadedFile.originalname,
        originalSize: uploadedFile.size,
        processedSize: uploadedFile.size, // No processing, so same size
        mimetype: uploadedFile.mimetype,
        dimensions: 'original', // No resizing applied
        uploadedAt: new Date().toISOString(),
      };

      return resolve(uploadResult);
    });
  });
};

// ** MIDDLEWARE FUNCTION ** //
const uploadProfilePictureToS3 = (req, res, next) => {
  handleProfilePictureUploadToS3(req, res)
    .then((uploadResult) => {
      // Set request properties in the same format as hero section
      req.uploadUrl = uploadResult.signedUrl;
      req.uploadOgName = uploadResult.originalName;
      req.uploadItemSize = uploadResult.originalSize;
      req.uploadItemType = uploadResult.mimetype;
      req.s3Key = uploadResult.s3Key;
      req.s3Url = uploadResult.s3Url;
      req.cloudFrontUrl = uploadResult.cloudFrontUrl;
      req.profilePictureUpload = uploadResult;

      console.log("✅ Profile picture middleware completed:", {
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
      console.error("❌ Profile picture upload error:", err);
      return res.status(500).json({
        success: false,
        message: "Profile picture upload failed",
        error: err.message,
        timestamp: new Date().toISOString(),
      });
    });
};

// ** DELETE PROFILE PICTURE UTILITY ** //
const deleteProfilePictureWithCacheInvalidation = async (s3Key) => {
  try {
    // Delete from S3
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
    };

    const result = await s3.deleteObject(params).promise();
    console.log("✅ Profile picture deleted from S3:", s3Key);

    // Invalidate CloudFront cache
    await invalidateCloudFrontCache(s3Key);

    logSecurityEvent("PROFILE_PICTURE_S3_DELETE_SUCCESS", {
      s3Key: s3Key,
      result: result,
    });

    console.log("✅ Profile picture deleted and cache invalidated:", s3Key);
    return { success: true, message: "Profile picture deleted successfully" };
  } catch (error) {
    console.error("❌ Profile picture delete operation failed:", error);
    
    logSecurityEvent("PROFILE_PICTURE_DELETE_ERROR", {
      s3Key: s3Key,
      error: error.message,
    });
    
    throw error;
  }
};

// ** EXTRACT S3 KEY FROM PROFILE PICTURE URL ** //
const extractS3KeyFromProfilePictureUrl = (url) => {
  if (!url) return null;
  
  try {
    // Handle CloudFront URLs
    if (url.includes(process.env.CLOUDFRONT_DOMAIN)) {
      const urlParts = url.split(process.env.CLOUDFRONT_DOMAIN + '/');
      return urlParts[1] ? urlParts[1].split('?')[0] : null;
    }
    
    // Handle S3 URLs
    if (url.includes('.s3.')) {
      const urlParts = url.split('.amazonaws.com/');
      return urlParts[1] ? urlParts[1].split('?')[0] : null;
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting S3 key from URL:', error);
    return null;
  }
};

module.exports = {
  uploadProfilePictureToS3,
  deleteProfilePictureWithCacheInvalidation,
  extractS3KeyFromProfilePictureUrl,
  singleProfilePictureUpload,
  handleProfilePictureUploadToS3,
};