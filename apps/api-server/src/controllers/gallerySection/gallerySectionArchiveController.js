const GallerySectionService = require("@services/gallerySection/gallerySectionService");

/**********************************
  Archive a gallery image/video
***********************************/
exports.archiveGalleryMedia = async (req, res) => {
  const { id } = req.params;
  const { archiveReason, archiveFolder } = req.body;

  try {
    const archivedMedia =
      await GallerySectionService.archiveGallerySectionMedia(id, {
        archivedBy: req.user._id,
        archiveReason,
        archiveFolder,
      });

    if (!archivedMedia) {
      return res.status(404).json({
        message: "Gallery media not found",
        status: "error",
      });
    }

    res.status(200).json({
      message: "Media archived successfully",
      media: archivedMedia,
      status: "success",
    });
  } catch (error) {
    console.error("ARCHIVE_GALLERY_MEDIA_ERROR", error);
    res.status(500).json({
      message: error.message || "Error archiving gallery media",
      status: "error",
    });
  }
};

/**********************************
  Approve archived gallery media
***********************************/
exports.approveArchivedGalleryMedia = async (req, res) => {
  const { id } = req.params;
  const { comments } = req.body;

  try {
    const approvedMedia =
      await GallerySectionService.approveArchivedGalleryMedia(
        id,
        req.user._id,
        comments
      );

    if (!approvedMedia) {
      return res.status(404).json({
        message: "Archived gallery media not found",
        status: "error",
      });
    }

    res.status(200).json({
      message: "Archived media approved successfully",
      media: approvedMedia,
      status: "success",
    });
  } catch (error) {
    console.error("APPROVE_ARCHIVED_GALLERY_MEDIA_ERROR", error);
    res.status(500).json({
      message: error.message || "Error approving archived gallery media",
      status: "error",
    });
  }
};

/**********************************
  Disapprove archived gallery media
***********************************/
exports.disapproveArchivedGalleryMedia = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  try {
    const disapprovedMedia =
      await GallerySectionService.disapproveArchivedGalleryMedia(
        id,
        req.user._id,
        reason
      );

    if (!disapprovedMedia) {
      return res.status(404).json({
        message: "Archived gallery media not found",
        status: "error",
      });
    }

    res.status(200).json({
      message: "Archived media disapproved successfully",
      media: disapprovedMedia,
      status: "success",
    });
  } catch (error) {
    console.error("DISAPPROVE_ARCHIVED_GALLERY_MEDIA_ERROR", error);
    res.status(500).json({
      message: error.message || "Error disapproving archived gallery media",
      status: "error",
    });
  }
};

/**********************************
  Get pending archived gallery media
***********************************/
exports.getPendingArchivedGalleryMedia = async (req, res) => {
  try {
    const {
      page = 1,
      perPage = 12,
      searchText,
      category,
      state,
      tags,
      mediaType,
      archiveFolder,
      startDate,
      endDate,
    } = req.query;

    // Build search parameters
    const searchParams = {
      searchText,
      category,
      state,
      tags: tags
        ? Array.isArray(tags)
          ? tags
          : tags.split(",").map((tag) => tag.trim())
        : undefined,
      mediaType,
      archiveFolder,
      startDate,
      endDate,
      isArchived: true,
      isApproved: false, // Only pending archived media
    };

    const result = await GallerySectionService.getArchivedGalleryMediaPaginated(
      searchParams,
      parseInt(page),
      parseInt(perPage)
    );

    res.status(200).json({
      message: "Pending archived gallery media retrieved successfully",
      data: result,
      status: "success",
    });
  } catch (error) {
    console.error("GET_PENDING_ARCHIVED_GALLERY_MEDIA_ERROR", error);
    res.status(500).json({
      message:
        error.message || "Error retrieving pending archived gallery media",
      status: "error",
    });
  }
};

/**********************************
  Unarchive a gallery image/video
***********************************/
exports.unarchiveGalleryMedia = async (req, res) => {
  const { id } = req.params;

  try {
    const unarchivedMedia =
      await GallerySectionService.unarchiveGallerySectionMedia(
        id,
        req.user._id
      );

    if (!unarchivedMedia) {
      return res.status(404).json({
        message: "Gallery media not found",
        status: "error",
      });
    }

    res.status(200).json({
      message: "Media unarchived successfully",
      media: unarchivedMedia,
      status: "success",
    });
  } catch (error) {
    console.error("UNARCHIVE_GALLERY_MEDIA_ERROR", error);
    res.status(500).json({
      message: error.message || "Error unarchiving gallery media",
      status: "error",
    });
  }
};

/**********************************
  Get all archived gallery media
***********************************/
exports.getAllArchivedGalleryMedia = async (req, res) => {
  try {
    const {
      page = 1,
      perPage = 12,
      searchText,
      category,
      state,
      tags,
      mediaType,
      archiveFolder,
      startDate,
      endDate,
    } = req.query;

    // Build search parameters
    const searchParams = {
      searchText,
      category,
      state,
      tags: tags
        ? Array.isArray(tags)
          ? tags
          : tags.split(",").map((tag) => tag.trim())
        : undefined,
      mediaType,
      archiveFolder,
      startDate,
      endDate,
      archived: true, // Always filter for archived media
    };

    const archivedMediaRaw =
      await GallerySectionService.findAllArchivedGallerySectionMedia(
        parseInt(page),
        parseInt(perPage),
        searchParams
      );

    // Transform response to remove redundant 'image' field, keep only 'mediaUrl'
    const archivedMedia = archivedMediaRaw.map((item) => {
      const { image, uploadedBy, archivedBy, ...itemWithoutSensitiveData } =
        item.toObject();

      return {
        ...itemWithoutSensitiveData,
        mediaUrl: itemWithoutSensitiveData.mediaUrl || image, // Fallback for old records
        uploadedBy: uploadedBy
          ? { name: uploadedBy.name, _id: uploadedBy._id }
          : null,
        archivedBy: archivedBy
          ? { name: archivedBy.name, _id: archivedBy._id }
          : null,
      };
    });

    const totalArchivedMedia =
      await GallerySectionService.countAllArchivedGallerySectionMedia(
        searchParams
      );

    const totalPages = Math.ceil(totalArchivedMedia / perPage);

    const pagination = {
      page: parseInt(page),
      perPage: parseInt(perPage),
      totalArchivedMedia,
      totalPages,
    };

    // Calculate archive statistics
    const archiveStats = await GallerySectionService.getArchiveStatistics();

    res.status(200).json({
      archivedMedia,
      paginationData: pagination,
      archiveStats,
    });
  } catch (error) {
    console.error("GET_ALL_ARCHIVED_GALLERY_MEDIA_ERROR", error);
    res.status(500).json({
      message: error.message || "Error fetching archived gallery media",
      status: "error",
    });
  }
};

/**********************************
  Get archived media by folder
***********************************/
exports.getArchivedMediaByFolder = async (req, res) => {
  try {
    const { folder } = req.params;
    const {
      page = 1,
      perPage = 12,
      searchText,
      category,
      tags,
      mediaType,
      startDate,
      endDate,
    } = req.query;

    // Validate folder parameter
    if (!["old-photos", "old-videos"].includes(folder)) {
      return res.status(400).json({
        message: "Invalid archive folder. Must be 'old-photos' or 'old-videos'",
        status: "error",
      });
    }

    // Build search parameters
    const searchParams = {
      searchText,
      category,
      tags: tags
        ? Array.isArray(tags)
          ? tags
          : tags.split(",").map((tag) => tag.trim())
        : undefined,
      mediaType,
      archiveFolder: folder,
      startDate,
      endDate,
      archived: true,
    };

    const archivedMediaRaw =
      await GallerySectionService.findAllArchivedGallerySectionMedia(
        parseInt(page),
        parseInt(perPage),
        searchParams
      );

    // Transform response to remove redundant 'image' field, keep only 'mediaUrl'
    const archivedMedia = archivedMediaRaw.map((item) => {
      const { image, uploadedBy, archivedBy, ...itemWithoutSensitiveData } =
        item.toObject();

      return {
        ...itemWithoutSensitiveData,
        mediaUrl: itemWithoutSensitiveData.mediaUrl || image, // Fallback for old records
        uploadedBy: uploadedBy
          ? { name: uploadedBy.name, _id: uploadedBy._id }
          : null,
        archivedBy: archivedBy
          ? { name: archivedBy.name, _id: archivedBy._id }
          : null,
      };
    });

    const totalArchivedMedia =
      await GallerySectionService.countAllArchivedGallerySectionMedia(
        searchParams
      );

    const totalPages = Math.ceil(totalArchivedMedia / perPage);

    const pagination = {
      page: parseInt(page),
      perPage: parseInt(perPage),
      totalArchivedMedia,
      totalPages,
      folder,
    };

    res.status(200).json({
      archivedMedia,
      paginationData: pagination,
    });
  } catch (error) {
    console.error("GET_ARCHIVED_MEDIA_BY_FOLDER_ERROR", error);
    res.status(500).json({
      message: error.message || "Error fetching archived media by folder",
      status: "error",
    });
  }
};

/**********************************
  Bulk archive gallery media
***********************************/
exports.bulkArchiveGalleryMedia = async (req, res) => {
  const { ids, archiveReason, archiveFolder } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      message: "Please provide an array of media IDs to archive",
      status: "error",
    });
  }

  try {
    const result = await GallerySectionService.bulkArchiveGallerySectionMedia(
      ids,
      {
        archivedBy: req.user._id,
        archiveReason,
        archiveFolder,
      }
    );

    res.status(200).json({
      message: `Successfully archived ${result.archivedCount} media items`,
      result,
      status: "success",
    });
  } catch (error) {
    console.error("BULK_ARCHIVE_GALLERY_MEDIA_ERROR", error);
    res.status(500).json({
      message: error.message || "Error bulk archiving gallery media",
      status: "error",
    });
  }
};

/**********************************
  Bulk unarchive gallery media
***********************************/
exports.bulkUnarchiveGalleryMedia = async (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      message: "Please provide an array of media IDs to unarchive",
      status: "error",
    });
  }

  try {
    const result = await GallerySectionService.bulkUnarchiveGallerySectionMedia(
      ids,
      req.user._id
    );

    res.status(200).json({
      message: `Successfully unarchived ${result.unarchivedCount} media items`,
      result,
      status: "success",
    });
  } catch (error) {
    console.error("BULK_UNARCHIVE_GALLERY_MEDIA_ERROR", error);
    res.status(500).json({
      message: error.message || "Error bulk unarchiving gallery media",
      status: "error",
    });
  }
};

/**********************************
  Get archive statistics
***********************************/
exports.getArchiveStatistics = async (req, res) => {
  try {
    const stats = await GallerySectionService.getArchiveStatistics();

    res.status(200).json({
      success: true,
      statistics: stats,
    });
  } catch (error) {
    console.error("GET_ARCHIVE_STATISTICS_ERROR", error);
    res.status(500).json({
      message: error.message || "Error fetching archive statistics",
      status: "error",
    });
  }
};

/**********************************
  Upload to archive directly
***********************************/
exports.uploadToArchive = async (req, res) => {
  // Essential logging for upload tracking
  console.log("--- [uploadToArchive] Archive upload started ---");
  console.log("Archive folder:", req.body.archiveFolder);
  console.log("Archive reason:", req.body.archiveReason);

  if (req.uploadedGalleryFiles) {
    console.log("Files to archive:", req.uploadedGalleryFiles.length);
    req.uploadedGalleryFiles.forEach((file, index) => {
      console.log(`File ${index + 1}:`, {
        originalName: file.originalName,
        mediaUrl: file.cloudFrontUrl || file.url,
        fileType: file.fileType,
        size: file.size,
      });
    });
  }

  const {
    category,
    state,
    title,
    altText,
    description,
    tags,
    archiveReason,
    archiveFolder,
  } = req.body;

  // Validate request - check for uploaded files
  if (!req.uploadedGalleryFiles || req.uploadedGalleryFiles.length === 0) {
    return res.status(400).json({
      message: "No files were uploaded",
      status: "error",
    });
  }

  if (!archiveReason) {
    return res.status(400).json({
      message: "Please provide archive reason",
      status: "error",
    });
  }

  if (!archiveFolder) {
    return res.status(400).json({
      message: "Please provide archive folder",
      status: "error",
    });
  }

  try {
    // Parse tags if they're provided as JSON string
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;
      } catch {
        parsedTags = Array.isArray(tags) ? tags : [tags];
      }
    }

    // Parse state if provided as JSON string
    let parsedState = null;
    if (state) {
      try {
        parsedState = typeof state === "string" ? JSON.parse(state) : state;
      } catch {
        parsedState = null;
      }
    }

    // Prepare archive objects for all uploaded files
    const archiveObjects = req.uploadedGalleryFiles.map((file, index) => ({
      image: file.cloudFrontUrl || file.url, // Ensure 'image' is set for schema validation
      mediaUrl: file.cloudFrontUrl || file.url,
      mediaType: file.fileType || "image",
      variants: file.variants || {},
      fileId: file.fileId || null,
      originalName: file.originalName || null,
      size: file.size || 0, // Include file size
      category: category || null,
      state: parsedState,
      uploadedBy: req.user._id,
      publishedDate: new Date(),
      isApproved: false,
      title: title
        ? `${title} ${index + 1}`
        : file.originalName || `Archive Upload ${index + 1}`,
      altText: altText || file.originalName || `Archived media ${index + 1}`,
      description: description || "",
      tags: parsedTags,
      // Archive-specific fields
      isArchived: true,
      archiveDate: new Date(),
      archivedBy: req.user._id,
      archiveReason: archiveReason,
      archiveFolder: archiveFolder,
    }));

    // Create all archive entries
    const results = [];
    const errors = [];

    for (let i = 0; i < archiveObjects.length; i++) {
      try {
        const archiveData = archiveObjects[i];
        const newArchivedMedia =
          await GallerySectionService.createGallerySectionImage(archiveData);
        results.push(newArchivedMedia);
      } catch (error) {
        console.error(`Error creating archive entry ${i}:`, error);
        errors.push({
          index: i,
          filename: archiveObjects[i].originalName,
          error: error.message,
        });
      }
    }

    // Prepare response
    const successCount = results.length;
    const errorCount = errors.length;
    const totalFiles = req.uploadedGalleryFiles.length;

    if (successCount === 0) {
      return res.status(500).json({
        message: "All files failed to upload to archive",
        errors: errors,
        status: "error",
      });
    }

    const response = {
      message: `Successfully uploaded ${successCount} of ${totalFiles} files to archive`,
      data: {
        uploaded: results,
        successCount: successCount,
        errorCount: errorCount,
        totalFiles: totalFiles,
      },
      status: successCount === totalFiles ? "success" : "partial_success",
    };

    if (errorCount > 0) {
      response.errors = errors;
    }

    res.status(201).json(response);
  } catch (error) {
    console.error("UPLOAD_TO_ARCHIVE_ERROR", error);
    res.status(500).json({
      message: error.message || "Error uploading media to archive",
      status: "error",
    });
  }
};
