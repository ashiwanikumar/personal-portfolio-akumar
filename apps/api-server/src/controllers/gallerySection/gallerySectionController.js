const GallerySectionService = require("@services/gallerySection/gallerySectionService");
const { uploadToS3, uploadMultipleToS3 } = require("@utils/s3Helper");

/**********************************
  Create a gallery image
***********************************/
exports.createGalleryImage = async (req, res) => {
  const {
    category,
    state,
    title,
    altText,
    description,
    tags,
    explicitMediaType,
  } = req.body;

  // Validate request
  if (!category) {
    return res.status(400).json({
      message: "Please provide category",
      status: "error",
    });
  }

  // Check if we have upload data from multer middleware
  const hasUploadData = req.uploadUrl && req.cloudFrontUrl && req.s3Key;
  if (!hasUploadData) {
    return res.status(400).json({
      message: "No file uploaded or upload processing failed",
      status: "error",
    });
  }

  // Determine mediaType from uploadItemType if not set
  let mediaType = explicitMediaType || "image";
  if (!explicitMediaType && req.uploadItemType) {
    mediaType = req.uploadItemType.startsWith("video/") ? "video" : "image";
  }

  // Use the uploaded file URL
  const mediaUrl = req.cloudFrontUrl;

  // Parse state if it's sent as JSON string
  let parsedState = state;
  if (state && typeof state === "string") {
    try {
      parsedState = JSON.parse(state);
    } catch (error) {
      console.warn("Failed to parse state JSON:", error);
    }
  }

  // Attach user id and mediaType to req.body
  req.body.uploadedBy = req.user._id;
  req.body.mediaType = mediaType;
  req.body.mediaUrl = mediaUrl;
  req.body.size = req.uploadItemSize; // Add file size from multer middleware
  req.body.state = parsedState; // Use parsed state

  // For videos, don't include image field to avoid validation error
  if (mediaType === "video") {
    delete req.body.image;
  } else {
    // For images, ensure both image and mediaUrl are set
    req.body.image = mediaUrl;
  }

  try {
    const newGallery = await GallerySectionService.createGallerySectionImage(
      req.body
    );
    res.status(201).json(newGallery);
  } catch (error) {
    console.error("CREATE_GALLERY_ERROR", error);
    res.status(500).json({
      message: error.message || "Error creating gallery image",
      status: "error",
    });
  }
};

/**********************************
  Create multiple gallery images
***********************************/
exports.createMultipleGalleryImages = async (req, res) => {
  const { category, state, title, altText, description, tags } = req.body;

  // Validate request
  if (!category) {
    return res.status(400).json({
      message: "Please provide category",
      status: "error",
    });
  }

  if (!req.uploadedGalleryFiles || req.uploadedGalleryFiles.length === 0) {
    return res.status(400).json({
      message: "No files were uploaded",
      status: "error",
    });
  }

  try {
    // Prepare gallery objects
    const galleryObjects = req.uploadedGalleryFiles.map((file) => ({
      mediaUrl: file.url,
      mediaType:
        file.fileType ||
        (file.mimetype && file.mimetype.startsWith("video/")
          ? "video"
          : "image"),
      variants: file.variants || {},
      fileId: file.fileId || null,
      originalName: file.originalName || null,
      category,
      state: state || null,
      uploadedBy: req.user._id,
      publishedDate: new Date(),
      isApproved: false,
      title: title || null,
      altText: altText || null,
      description: description || null,
      tags: tags ? (Array.isArray(tags) ? tags : [tags]) : [],
    }));

    // Create gallery images
    const newGalleries =
      await GallerySectionService.createMultipleGallerySectionImages(
        galleryObjects
      );
    res.status(201).json(newGalleries);
  } catch (error) {
    console.error("CREATE_MULTIPLE_GALLERY_ERROR", error);
    res.status(500).json({
      message: error.message || "Error creating gallery images",
      status: "error",
    });
  }
};

/**********************************
  Get all gallery images
***********************************/
exports.getAllGalleryImages = async (req, res) => {
  try {
    const gallery = await GallerySectionService.findAllGallerySectionImages();
    res.status(200).json(gallery);
  } catch (error) {
    console.error("GET_ALL_GALLERY_ERROR", error);
    res.status(500).json({
      message: error.message || "Error fetching gallery images",
      status: "error",
    });
  }
};

/**********************************
  Get all gallery images approved
***********************************/
exports.getAllGalleryImagesApproved = async (req, res) => {
  try {
    const gallery =
      await GallerySectionService.findAllGallerySectionImagesApproved();

    // Remove SEO and sensitive data for public API
    const publicGallery = gallery.map((item) => {
      const {
        uploadedBy, // ❌ Remove sensitive data
        seoTitle, // ❌ Remove SEO data (server-side only)
        seoDescription, // ❌ Remove SEO data (server-side only)
        socialTitle, // ❌ Remove social meta data (server-side only)
        socialDescription, // ❌ Remove social meta data (server-side only)
        socialImage, // ❌ Remove social meta data (server-side only)
        archivedBy, // ❌ Remove sensitive archive data
        archiveReason, // ❌ Remove sensitive archive data
        archiveFolder, // ❌ Remove sensitive archive data
        approvalComments, // ❌ Remove sensitive approval data
        approvedBy, // ❌ Remove sensitive approval data
        image, // ❌ Remove legacy image field - use mediaUrl instead
        ...publicData
      } = item.toObject();
      return publicData;
    });

    res.status(200).json(publicGallery);
  } catch (error) {
    console.error("GET_ALL_APPROVED_GALLERY_ERROR", error);
    res.status(500).json({
      message: error.message || "Error fetching approved gallery images",
      status: "error",
    });
  }
};

/**********************************
  Get featured gallery images
***********************************/
exports.getFeaturedGalleryImages = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const gallery =
      await GallerySectionService.findFeaturedGallerySectionImages(limit);

    // Remove SEO and sensitive data for public API
    const publicGallery = gallery.map((item) => {
      const {
        uploadedBy, // ❌ Remove sensitive data
        seoTitle, // ❌ Remove SEO data (server-side only)
        seoDescription, // ❌ Remove SEO data (server-side only)
        socialTitle, // ❌ Remove social meta data (server-side only)
        socialDescription, // ❌ Remove social meta data (server-side only)
        socialImage, // ❌ Remove social meta data (server-side only)
        archivedBy, // ❌ Remove sensitive archive data
        archiveReason, // ❌ Remove sensitive archive data
        archiveFolder, // ❌ Remove sensitive archive data
        approvalComments, // ❌ Remove sensitive approval data
        approvedBy, // ❌ Remove sensitive approval data
        image, // ❌ Remove legacy image field - use mediaUrl instead
        ...publicData
      } = item.toObject();
      return publicData;
    });

    res.status(200).json(publicGallery);
  } catch (error) {
    console.error("GET_FEATURED_GALLERY_ERROR", error);
    res.status(500).json({
      message: error.message || "Error fetching featured gallery images",
      status: "error",
    });
  }
};

/**********************************
  Get popular gallery images
***********************************/
exports.getPopularGalleryImages = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const gallery = await GallerySectionService.findPopularGallerySectionImages(
      limit
    );

    // Remove SEO and sensitive data for public API
    const publicGallery = gallery.map((item) => {
      const {
        uploadedBy, // ❌ Remove sensitive data
        seoTitle, // ❌ Remove SEO data (server-side only)
        seoDescription, // ❌ Remove SEO data (server-side only)
        socialTitle, // ❌ Remove social meta data (server-side only)
        socialDescription, // ❌ Remove social meta data (server-side only)
        socialImage, // ❌ Remove social meta data (server-side only)
        archivedBy, // ❌ Remove sensitive archive data
        archiveReason, // ❌ Remove sensitive archive data
        archiveFolder, // ❌ Remove sensitive archive data
        approvalComments, // ❌ Remove sensitive approval data
        approvedBy, // ❌ Remove sensitive approval data
        image, // ❌ Remove legacy image field - use mediaUrl instead
        ...publicData
      } = item.toObject();
      return publicData;
    });

    res.status(200).json(publicGallery);
  } catch (error) {
    console.error("GET_POPULAR_GALLERY_ERROR", error);
    res.status(500).json({
      message: error.message || "Error fetching popular gallery images",
      status: "error",
    });
  }
};

/**********************************
  Get a gallery image by id
***********************************/
exports.getGalleryImageById = async (req, res) => {
  try {
    const gallery = await GallerySectionService.findGallerySectionImageById(
      req.params.id
    );
    if (!gallery) {
      return res.status(404).json({
        message: "Gallery image not found",
        status: "error",
      });
    }

    // Remove SEO and sensitive data for public API
    const {
      uploadedBy, // ❌ Remove sensitive data
      seoTitle, // ❌ Remove SEO data (server-side only)
      seoDescription, // ❌ Remove SEO data (server-side only)
      socialTitle, // ❌ Remove social meta data (server-side only)
      socialDescription, // ❌ Remove social meta data (server-side only)
      socialImage, // ❌ Remove social meta data (server-side only)
      archivedBy, // ❌ Remove sensitive archive data
      archiveReason, // ❌ Remove sensitive archive data
      archiveFolder, // ❌ Remove sensitive archive data
      approvalComments, // ❌ Remove sensitive approval data
      approvedBy, // ❌ Remove sensitive approval data
      image, // ❌ Remove legacy image field - use mediaUrl instead
      ...publicData
    } = gallery.toObject();

    res.status(200).json(publicData);
  } catch (error) {
    console.error("GET_GALLERY_BY_ID_ERROR", error);
    res.status(500).json({
      message: error.message || "Error fetching gallery image",
      status: "error",
    });
  }
};

/**********************************
  Get gallery images by tags
***********************************/
exports.getGalleryImagesByTags = async (req, res) => {
  try {
    const { tags } = req.query;
    if (!tags) {
      return res.status(400).json({
        message: "Please provide tags",
        status: "error",
      });
    }

    // Parse tags from query string or array
    const parsedTags = Array.isArray(tags)
      ? tags
      : tags.split(",").map((tag) => tag.trim());
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    const gallery = await GallerySectionService.findGallerySectionImagesByTags(
      parsedTags,
      limit
    );

    // Remove SEO and sensitive data for public API
    const publicGallery = gallery.map((item) => {
      const {
        uploadedBy, // ❌ Remove sensitive data
        seoTitle, // ❌ Remove SEO data (server-side only)
        seoDescription, // ❌ Remove SEO data (server-side only)
        socialTitle, // ❌ Remove social meta data (server-side only)
        socialDescription, // ❌ Remove social meta data (server-side only)
        socialImage, // ❌ Remove social meta data (server-side only)
        archivedBy, // ❌ Remove sensitive archive data
        archiveReason, // ❌ Remove sensitive archive data
        archiveFolder, // ❌ Remove sensitive archive data
        approvalComments, // ❌ Remove sensitive approval data
        approvedBy, // ❌ Remove sensitive approval data
        image, // ❌ Remove legacy image field - use mediaUrl instead
        ...publicData
      } = item.toObject();
      return publicData;
    });

    res.status(200).json(publicGallery);
  } catch (error) {
    console.error("GET_GALLERY_BY_TAGS_ERROR", error);
    res.status(500).json({
      message: error.message || "Error fetching gallery images by tags",
      status: "error",
    });
  }
};

/**********************************
  Get popular tags
***********************************/
exports.getPopularTags = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const tags = await GallerySectionService.getPopularTags(limit);
    res.status(200).json(tags);
  } catch (error) {
    console.error("GET_POPULAR_TAGS_ERROR", error);
    res.status(500).json({
      message: error.message || "Error fetching popular tags",
      status: "error",
    });
  }
};

/**********************************
  Update a gallery image by id
***********************************/
exports.updateGalleryImageById = async (req, res) => {
  const { category } = req.body;

  // Validate request
  if (!category) {
    return res.status(400).json({
      message: "Please provide category",
      status: "error",
    });
  }

  try {
    const gallery =
      await GallerySectionService.findGallerySectionImageByIdAndUpdate(
        req.params.id,
        req.body
      );

    if (!gallery) {
      return res.status(404).json({
        message: "Gallery image not found",
        status: "error",
      });
    }

    res.status(200).json(gallery);
  } catch (error) {
    console.error("UPDATE_GALLERY_ERROR", error);
    res.status(500).json({
      message: error.message || "Error updating gallery image",
      status: "error",
    });
  }
};

/**********************************
  Update a gallery image metadata
***********************************/
exports.updateGalleryImageMetadata = async (req, res) => {
  const { title, altText, description, tags } = req.body;

  try {
    const gallery = await GallerySectionService.updateImageMetadata(
      req.params.id,
      { title, altText, description, tags }
    );

    if (!gallery) {
      return res.status(404).json({
        message: "Gallery image not found",
        status: "error",
      });
    }

    res.status(200).json(gallery);
  } catch (error) {
    console.error("UPDATE_GALLERY_METADATA_ERROR", error);
    res.status(500).json({
      message: error.message || "Error updating gallery image metadata",
      status: "error",
    });
  }
};

/**********************************
  Update a gallery image approval by id
***********************************/
exports.updateGalleryImageApprovalById = async (req, res) => {
  const { isApproved } = req.body;

  // Validate that isApproved is a boolean
  if (typeof isApproved !== "boolean") {
    return res.status(400).json({
      message: "isApproved must be a boolean value",
      status: "error",
    });
  }

  try {
    const gallery =
      await GallerySectionService.findGallerySectionImageByIdAndUpdateApprovalStatus(
        req.params.id,
        isApproved
      );

    if (!gallery) {
      return res.status(404).json({
        message: "Gallery image not found",
        status: "error",
      });
    }

    res.status(200).json(gallery);
  } catch (error) {
    console.error("UPDATE_GALLERY_APPROVAL_ERROR", error);
    res.status(500).json({
      message: error.message || "Error updating gallery image approval",
      status: "error",
    });
  }
};

/**********************************
  Delete a gallery image by id
***********************************/
exports.deleteGalleryImageById = async (req, res) => {
  try {
    const gallery =
      await GallerySectionService.findGallerySectionImageByIdAndDelete(
        req.params.id
      );

    if (!gallery) {
      return res.status(404).json({
        message: "Gallery image not found",
        status: "error",
      });
    }

    res.status(200).json({
      message: "Gallery image deleted successfully",
      gallery,
    });
  } catch (error) {
    console.error("DELETE_GALLERY_ERROR", error);
    res.status(500).json({
      message: error.message || "Error deleting gallery image",
      status: "error",
    });
  }
};

/**********************************
  Update a gallery image featured status by id
***********************************/
exports.updateGalleryImageFeaturedById = async (req, res) => {
  const { isFeatured } = req.body;

  try {
    const gallery =
      await GallerySectionService.findGallerySectionImageByIdAndUpdateFeaturedStatus(
        req.params.id,
        isFeatured
      );

    if (!gallery) {
      return res.status(404).json({
        message: "Gallery image not found",
        status: "error",
      });
    }

    res.status(200).json(gallery);
  } catch (error) {
    console.error("UPDATE_GALLERY_FEATURED_ERROR", error);
    res.status(500).json({
      message: error.message || "Error updating gallery image featured status",
      status: "error",
    });
  }
};

/**********************************
  Delete multiple gallery images
***********************************/
exports.deleteMultipleGalleryImages = async (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      message: "Please provide an array of gallery image IDs",
      status: "error",
    });
  }

  try {
    const deletedGalleries =
      await GallerySectionService.deleteMultipleGallerySectionImages(ids);
    res.status(200).json({
      message: "Gallery images deleted successfully",
      count: deletedGalleries.length,
      galleries: deletedGalleries,
    });
  } catch (error) {
    console.error("DELETE_MULTIPLE_GALLERY_ERROR", error);
    res.status(500).json({
      message: error.message || "Error deleting gallery images",
      status: "error",
    });
  }
};

/**********************************
  Upload gallery image to S3
***********************************/
exports.uploadGalleryImage = async (req, res) => {
  try {
    // The uploadGalleryFileToS3 middleware has already processed the upload
    // Check for the middleware's output instead of req.files
    const hasUploadData = req.uploadUrl && req.cloudFrontUrl && req.s3Key;

    if (!hasUploadData) {
      return res.status(400).json({
        message: "No file uploaded or upload processing failed",
        status: "error",
      });
    }

    // Determine fileType from uploadItemType if not set
    let fileType = req.fileType;
    if (!fileType && req.uploadItemType) {
      fileType = req.uploadItemType.startsWith("video/") ? "video" : "image";
    }

    // Determine message based on fileType
    const isVideo = fileType === "video";
    const message = isVideo
      ? "Gallery video uploaded successfully"
      : "Gallery image uploaded successfully";

    // Return the processed data from middleware
    const response = {
      message,
      url: req.uploadUrl,
      cloudFrontUrl: req.cloudFrontUrl,
      s3Url: req.s3Url,
      s3Key: req.s3Key,
      originalName: req.uploadOgName,
      size: req.uploadItemSize,
      type: req.uploadItemType,
      fileType: fileType,
      uploadPath: req.uploadPath,
      status: "success",
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("UPLOAD_GALLERY_IMAGE_ERROR", error);
    res.status(500).json({
      message: error.message || "Error uploading gallery image",
      status: "error",
    });
  }
};

/**********************************
  Get all gallery images paginated
***********************************/
exports.getGalleryImagesPaginated = async (req, res) => {
  try {
    const {
      page = 1,
      perPage = 10,
      searchText,
      category,
      state,
      tags,
      featured,
      approved,
      mediaType,
      isArchived,
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
      featured: featured !== undefined ? featured === "true" : undefined,
      approved: approved !== undefined ? approved === "true" : undefined,
      mediaType: mediaType !== undefined ? mediaType : undefined,
      isArchived: isArchived !== undefined ? isArchived === "true" : undefined,
    };

    const galleryImages =
      await GallerySectionService.findAllGallerySectionImagesPaginated(
        parseInt(page),
        parseInt(perPage),
        searchParams
      );

    const totalGalleryImages =
      await GallerySectionService.countAllGallerySectionImages(searchParams);

    const totalPages = Math.ceil(totalGalleryImages / perPage);

    const pagination = {
      page: parseInt(page),
      perPage: parseInt(perPage),
      totalGalleryImages,
      totalPages,
    };

    // Patch: Always set correct mediaType based on file extension
    function getMediaTypeFromUrl(url) {
      if (!url) return "image";
      // Remove query parameters before extracting extension
      const cleanUrl = url.split("?")[0];
      const ext = cleanUrl.split(".").pop().toLowerCase();
      const videoExts = ["mp4", "webm", "ogg", "avi", "mov", "quicktime"];
      return videoExts.includes(ext) ? "video" : "image";
    }
    const patchedGalleryImages = galleryImages.map((item) => {
      const obj = item.toObject ? item.toObject() : item;
      const url = obj.mediaUrl || obj.image;
      return {
        ...obj,
        mediaType: getMediaTypeFromUrl(url),
        mediaUrl: url,
      };
    });

    res.status(200).json({
      gallerySectionImages: patchedGalleryImages,
      paginationData: pagination,
    });
  } catch (error) {
    console.error("GET_GALLERY_IMAGES_PAGINATED_ERROR", error);
    res.status(500).json({
      message: error.message || "Error fetching paginated gallery images",
      status: "error",
    });
  }
};

/**********************************
  Get gallery categories by state (Public)
***********************************/
exports.getGalleryCategoriesByState = async (req, res) => {
  try {
    const { stateName } = req.params;
    
    if (!stateName) {
      return res.status(400).json({
        message: "State name is required",
        status: "error",
      });
    }

    // Get all approved gallery items for the state
    const galleryItems = await GallerySectionService.findGalleryItemsByState(stateName);
    
    // Group by category and count
    const categoriesMap = new Map();
    
    for (const item of galleryItems) {
      if (item.category && item.category._id) {
        const categoryId = item.category._id.toString();
        if (!categoriesMap.has(categoryId)) {
          categoriesMap.set(categoryId, {
            _id: item.category._id,
            name: item.category.name,
            description: item.category.description || "",
            count: 0,
            previewImage: null,
          });
        }
        
        const categoryData = categoriesMap.get(categoryId);
        categoryData.count++;
        
        // Set first image as preview
        if (!categoryData.previewImage && item.mediaUrl) {
          categoryData.previewImage = item.mediaUrl;
        }
      }
    }
    
    // Convert map to array
    const categories = Array.from(categoriesMap.values());
    
    res.status(200).json({
      state: stateName,
      totalCategories: categories.length,
      totalImages: galleryItems.length,
      categories: categories.sort((a, b) => b.count - a.count), // Sort by count
    });
  } catch (error) {
    console.error("GET_GALLERY_CATEGORIES_BY_STATE_ERROR", error);
    res.status(500).json({
      message: error.message || "Error fetching gallery categories for state",
      status: "error",
    });
  }
};

/**********************************
  Get gallery images by state and category (Public)
***********************************/
exports.getGalleryImagesByStateAndCategory = async (req, res) => {
  try {
    const { stateName, categoryId } = req.params;
    const { page = 1, perPage = 20 } = req.query;
    
    if (!stateName || !categoryId) {
      return res.status(400).json({
        message: "State name and category ID are required",
        status: "error",
      });
    }

    const searchParams = {
      state: stateName,
      category: categoryId,
      approved: true,
    };

    const galleryImages = await GallerySectionService.findAllGallerySectionImagesPaginated(
      parseInt(page),
      parseInt(perPage),
      searchParams
    );

    const totalGalleryImages = await GallerySectionService.countAllGallerySectionImages(searchParams);
    const totalPages = Math.ceil(totalGalleryImages / perPage);

    const pagination = {
      page: parseInt(page),
      perPage: parseInt(perPage),
      totalGalleryImages,
      totalPages,
    };

    // Transform response
    const mediaItems = galleryImages.map((item) => {
      const obj = item.toObject ? item.toObject() : item;
      const url = obj.mediaUrl || obj.image;
      
      return {
        _id: obj._id,
        title: obj.title,
        altText: obj.altText,
        description: obj.description,
        mediaUrl: url,
        mediaType: obj.mediaType || "image",
        variants: obj.variants || {},
        publishedDate: obj.publishedDate,
        views: obj.views || 0,
      };
    });

    res.status(200).json({
      state: stateName,
      categoryId: categoryId,
      mediaItems,
      pagination,
    });
  } catch (error) {
    console.error("GET_GALLERY_IMAGES_BY_STATE_AND_CATEGORY_ERROR", error);
    res.status(500).json({
      message: error.message || "Error fetching gallery images",
      status: "error",
    });
  }
};

/**********************************
  Get approved gallery media paginated (Public)
  Supports images and videos for future expansion
***********************************/
exports.getApprovedGalleryMediaPaginated = async (req, res) => {
  try {
    const {
      page = 1,
      perPage = 12,
      searchText,
      category,
      state,
      tags,
      featured,
      mediaType = "all", // New parameter for future video support: "image", "video", "all"
    } = req.query;

    // Build search parameters - always filter for approved media
    const searchParams = {
      searchText,
      category,
      state,
      tags: tags
        ? Array.isArray(tags)
          ? tags
          : tags.split(",").map((tag) => tag.trim())
        : undefined,
      featured: featured !== undefined ? featured === "true" : undefined,
      approved: true, // Always filter for approved media only
      // mediaType filtering will be implemented when video support is added
    };

    const galleryImages =
      await GallerySectionService.findAllGallerySectionImagesPaginated(
        parseInt(page),
        parseInt(perPage),
        searchParams
      );

    const totalGalleryImages =
      await GallerySectionService.countAllGallerySectionImages(searchParams);

    const totalPages = Math.ceil(totalGalleryImages / perPage);

    const pagination = {
      page: parseInt(page),
      perPage: parseInt(perPage),
      totalGalleryImages,
      totalPages,
    };

    // Transform response to include media type information for future video support
    const mediaItems = galleryImages.map((item) => {
      const {
        image,
        uploadedBy, // ❌ Remove sensitive data
        seoTitle, // ❌ Remove SEO data (server-side only)
        seoDescription, // ❌ Remove SEO data (server-side only)
        socialTitle, // ❌ Remove social meta data (server-side only)
        socialDescription, // ❌ Remove social meta data (server-side only)
        socialImage, // ❌ Remove social meta data (server-side only)
        archivedBy, // ❌ Remove sensitive archive data
        archiveReason, // ❌ Remove sensitive archive data
        archiveFolder, // ❌ Remove sensitive archive data
        approvalComments, // ❌ Remove sensitive approval data
        approvedBy, // ❌ Remove sensitive approval data
        tags,
        views,
        _id,
        altText,
        slug,
        createdAt,
        updatedAt,
        __v,
        ...itemWithoutSensitiveData
      } = item.toObject();

      // Use the actual mediaType from database, fallback to determining from URL
      let mediaType = itemWithoutSensitiveData.mediaType;
      if (!mediaType) {
        const url = itemWithoutSensitiveData.mediaUrl || image;
        if (url) {
          // Remove query parameters before extracting extension
          const cleanUrl = url.split("?")[0];
          const extension = cleanUrl.split(".").pop()?.toLowerCase();
          const videoExtensions = [
            "mp4",
            "webm",
            "ogg",
            "avi",
            "mov",
            "quicktime",
          ];
          mediaType = videoExtensions.includes(extension) ? "video" : "image";
        } else {
          mediaType = "image"; // Default fallback
        }
      }

      return {
        ...itemWithoutSensitiveData,
        mediaType: mediaType,
        mediaUrl: itemWithoutSensitiveData.mediaUrl || image, // Generic field for media URL (image or video)
      };
    });

    // Calculate media type statistics
    const mediaTypeStats = mediaItems.reduce(
      (stats, item) => {
        stats.total++;
        if (item.mediaType === "video") {
          stats.videos++;
        } else {
          stats.images++;
        }
        return stats;
      },
      { total: 0, images: 0, videos: 0 }
    );

    res.status(200).json({
      galleryMedia: mediaItems, // More generic name for images + future videos
      paginationData: {
        ...pagination,
        mediaTypes: mediaTypeStats,
      },
    });
  } catch (error) {
    console.error("GET_APPROVED_GALLERY_MEDIA_PAGINATED_ERROR", error);
    res.status(500).json({
      message: error.message || "Error fetching approved gallery images",
      status: "error",
    });
  }
};
