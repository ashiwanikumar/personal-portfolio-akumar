const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Initialize S3 client (commented out for local storage)
// const s3Client = new S3Client({
//   region: process.env.AWS_REGION || "us-east-1",
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   },
// });

/**
 * Upload a single file to S3 (or local storage)
 * @param {Object} file - The file object from multer
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result with URL and metadata
 */
const uploadToS3 = async (file, options = {}) => {
  try {
    const { folder = "uploads" } = options;

    // For local storage implementation
    const fileName = `${uuidv4()}-${Date.now()}-${file.originalname}`;
    const filePath = path.join(folder, fileName);

    // Ensure the upload directory exists
    const uploadDir = path.join(process.cwd(), folder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // If file has already been processed by multer, just return the info
    if (file.path) {
      return {
        url: file.path,
        fileId: uuidv4(),
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        variants: {}, // Placeholder for image variants
      };
    }

    // For S3 upload (commented out)
    // const uploadParams = {
    //   Bucket: process.env.AWS_S3_BUCKET,
    //   Key: `${folder}/${fileName}`,
    //   Body: file.buffer,
    //   ContentType: file.mimetype,
    // };

    // const command = new PutObjectCommand(uploadParams);
    // await s3Client.send(command);

    // const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${folder}/${fileName}`;

    return {
      url: filePath,
      fileId: uuidv4(),
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      variants: {}, // Placeholder for image variants
    };
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("Failed to upload file");
  }
};

/**
 * Upload multiple files to S3 (or local storage)
 * @param {Array} files - Array of file objects from multer
 * @param {Object} options - Upload options
 * @returns {Promise<Array>} Array of upload results
 */
const uploadMultipleToS3 = async (files, options = {}) => {
  try {
    const uploadPromises = files.map((file) => uploadToS3(file, options));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error("Error uploading multiple files to S3:", error);
    throw new Error("Failed to upload multiple files");
  }
};

/**
 * Delete a file from S3 (or local storage)
 * @param {string} fileUrl - The URL or path of the file to delete
 * @returns {Promise<void>}
 */
const deleteFromS3 = async (fileUrl) => {
  try {
    // Clean the file URL by removing query parameters (for signed URLs)
    let cleanFileUrl = fileUrl;
    if (cleanFileUrl.includes('?')) {
      cleanFileUrl = cleanFileUrl.split('?')[0];
    }
    if (cleanFileUrl.includes('#')) {
      cleanFileUrl = cleanFileUrl.split('#')[0];
    }

    console.log(`🔍 Cleaning single file URL: ${fileUrl} → ${cleanFileUrl}`);

    // For local storage
    if (fs.existsSync(cleanFileUrl)) {
      fs.unlinkSync(cleanFileUrl);
    }

    // For S3 (commented out)
    // const key = cleanFileUrl.split(".com/")[1]; // Extract key from URL
    // const deleteParams = {
    //   Bucket: process.env.AWS_S3_BUCKET,
    //   Key: key,
    // };

    // const command = new DeleteObjectCommand(deleteParams);
    // await s3Client.send(command);
  } catch (error) {
    console.error("Error deleting from S3:", error);
    throw new Error("Failed to delete file");
  }
};

/**
 * Delete multiple files from S3 (or local storage)
 * @param {Array<string>} fileUrls - Array of file URLs or paths to delete
 * @returns {Promise<Object>} Result object with success/error counts
 */
const deleteMultipleFromS3 = async (fileUrls) => {
  try {
    if (!Array.isArray(fileUrls) || fileUrls.length === 0) {
      return {
        success: 0,
        failed: 0,
        errors: []
      };
    }

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    // Process deletions concurrently with error handling
    const deletePromises = fileUrls.map(async (fileUrl, index) => {
      try {
        if (!fileUrl) {
          results.failed++;
          results.errors.push(`File URL at index ${index} is empty or null`);
          return;
        }

        // Clean the file URL by removing query parameters (for signed URLs)
        let cleanFileUrl = fileUrl;
        if (cleanFileUrl.includes('?')) {
          cleanFileUrl = cleanFileUrl.split('?')[0];
        }
        if (cleanFileUrl.includes('#')) {
          cleanFileUrl = cleanFileUrl.split('#')[0];
        }

        console.log(`🔍 Cleaning file URL: ${fileUrl} → ${cleanFileUrl}`);

        // For local storage
        if (fs.existsSync(cleanFileUrl)) {
          fs.unlinkSync(cleanFileUrl);
          results.success++;
        } else {
          // File doesn't exist, but we'll count it as success (already deleted)
          results.success++;
        }

        // For S3 (commented out)
        // const key = fileUrl.split(".com/")[1]; // Extract key from URL
        // if (key) {
        //   const deleteParams = {
        //     Bucket: process.env.AWS_S3_BUCKET,
        //     Key: key,
        //   };
        //   const command = new DeleteObjectCommand(deleteParams);
        //   await s3Client.send(command);
        //   results.success++;
        // } else {
        //   results.failed++;
        //   results.errors.push(`Invalid file URL: ${fileUrl}`);
        // }

      } catch (error) {
        results.failed++;
        results.errors.push(`Failed to delete ${fileUrl}: ${error.message}`);
        console.error(`Error deleting file ${fileUrl}:`, error);
      }
    });

    // Wait for all deletion attempts to complete
    await Promise.all(deletePromises);

    return results;
  } catch (error) {
    console.error("Error in deleteMultipleFromS3:", error);
    throw new Error("Failed to delete multiple files");
  }
};

module.exports = {
  uploadToS3,
  uploadMultipleToS3,
  deleteFromS3,
  deleteMultipleFromS3,
};
