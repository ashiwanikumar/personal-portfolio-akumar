const multer = require("multer");
const createError = require("http-errors");
const path = require("path");

// Configure storage
const storage = multer.memoryStorage();

// Allowed file types
const ALLOWED_MIME_TYPES = {
  "text/csv": [".csv"],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
    ".xlsx",
  ],
  "text/plain": [".txt"],
  "text/vcard": [".vcf"],
};

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  default: 10 * 1024 * 1024, // 10MB
  excel: 20 * 1024 * 1024, // 20MB for Excel files
};

// File filter function
const fileFilter = (req, file, cb) => {
  // Check mime type
  if (!ALLOWED_MIME_TYPES[file.mimetype]) {
    return cb(
      new Error(
        "Invalid file type. Only CSV, Excel, Text, and vCard files are allowed."
      ),
      false
    );
  }

  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ALLOWED_MIME_TYPES[file.mimetype];

  if (!allowedExts.includes(ext)) {
    return cb(
      new Error(
        `Invalid file extension. Allowed extensions: ${allowedExts.join(", ")}`
      ),
      false
    );
  }

  cb(null, true);
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: FILE_SIZE_LIMITS.default,
    files: 1, // Allow only 1 file at a time
  },
});

// Middleware function
const handleFileUpload = (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    // Log the request details for debugging
    console.log("Upload request received:", {
      contentType: req.headers["content-type"],
      hasFile: !!req.file,
      body: req.body,
    });

    if (err instanceof multer.MulterError) {
      // Multer errors
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(
          createError(400, "File size is too large. Maximum size is 10MB.")
        );
      }
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return next(
          createError(
            400,
            'Unexpected field name. Use "file" as the field name.'
          )
        );
      }
      return next(createError(400, err.message));
    } else if (err) {
      // Custom errors
      return next(createError(400, err.message));
    }

    // Validate if file exists
    if (!req.file) {
      // Add more detailed error message
      if (!req.headers["content-type"]?.includes("multipart/form-data")) {
        return next(
          createError(400, "Invalid content type. Must be multipart/form-data")
        );
      }
      return next(
        createError(
          400,
          'No file found in request. Please ensure a file is included with field name "file"'
        )
      );
    }

    // Add file type info
    req.file.fileType = path
      .extname(req.file.originalname)
      .substring(1)
      .toLowerCase();

    // Log successful file upload
    console.log("File successfully uploaded:", {
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      fileType: req.file.fileType,
    });

    next();
  });
};

// Utility function to get file type from extension
const getFileTypeFromExtension = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case ".csv":
      return "csv";
    case ".xlsx":
    case ".xls":
      return "excel";
    case ".txt":
      return "text";
    case ".vcf":
      return "vcard";
    default:
      return null;
  }
};

// Export middleware and utilities
module.exports = {
  handleFileUpload,
  getFileTypeFromExtension,
  ALLOWED_MIME_TYPES,
  FILE_SIZE_LIMITS,
};
