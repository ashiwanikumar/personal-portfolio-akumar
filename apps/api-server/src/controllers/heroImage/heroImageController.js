const HeroImageService = require("@services/heroImage/heroImageService");

/**********************************
  Create a hero image
***********************************/
exports.createHeroImage = async (req, res) => {
  const { image, video, titleCaption, description, category, mediaType } =
    req.body;

  // Validate request - either image or video must be provided
  if (!image && !video) {
    return res.status(400).json({
      message: "Please upload either a hero image or video",
      status: "error",
    });
  }

  if (!titleCaption || titleCaption.trim() === "") {
    return res.status(400).json({
      message: "Please provide a title caption",
      status: "error",
    });
  }

  if (!description || description.trim() === "") {
    return res.status(400).json({
      message: "Please provide a description",
      status: "error",
    });
  }

  if (!category) {
    return res.status(400).json({
      message: "Please select a category",
      status: "error",
    });
  }

  // Attach user id to req.body
  req.body.uploadedBy = req.user._id;

  try {
    const newHero = await HeroImageService.createHeroImage(req.body);

    res.status(201).json(newHero);
  } catch (error) {
    console.log("CREATE_HERO_IMAGE_ERROR", error);
    res.status(500).json({
      message: error.message || "Error creating hero image",
      status: "error",
    });
  }
};

/**********************************
  Get all hero images
***********************************/
exports.getAllHeroImages = async (req, res) => {
  try {
    const hero = await HeroImageService.findAllHeroImages();

    res.status(200).json(hero);
  } catch (error) {
    console.log("GET_ALL_CATEGORIES_ERROR", error);
  }
};

/**********************************
  Get all hero images approved
***********************************/
exports.getAllHeroImagesApproved = async (req, res) => {
  try {
    const hero = await HeroImageService.findAllHeroImagesApproved();

    res.status(200).json(hero);
  } catch (error) {
    console.log("GET_ALL_CATEGORIES_ERROR", error);
  }
};

/**********************************
  Get a hero image by id
***********************************/
exports.getHeroImageById = async (req, res) => {
  try {
    const hero = await HeroImageService.findHeroImageById(req.params.id);

    res.status(200).json(hero);
  } catch (error) {
    console.log("GET_CATEGORY_BY_ID_ERROR", error);
  }
};

/**********************************
  Update a hero image by id
***********************************/
exports.updateHeroImageById = async (req, res) => {
  const { image, video, titleCaption, description, category, mediaType } =
    req.body;

  // Validate request - either image or video must be provided
  if (!image && !video) {
    return res.status(400).json({
      message: "Please provide either a hero image or video",
      status: "error",
    });
  }

  if (!titleCaption || titleCaption.trim() === "") {
    return res.status(400).json({
      message: "Please provide a title caption",
      status: "error",
    });
  }

  if (!description || description.trim() === "") {
    return res.status(400).json({
      message: "Please provide a description",
      status: "error",
    });
  }

  if (!category) {
    return res.status(400).json({
      message: "Please select a category",
      status: "error",
    });
  }

  // Attach user id to req.body
  req.body.uploadedBy = req.user._id;

  try {
    // If hero name already exists, return error
    const hero = await HeroImageService.findHeroImageByIdAndUpdate(
      req.params.id,
      req.body
    );

    res.status(200).json(hero);
  } catch (error) {
    console.log("UPDATE_HERO_IMAGE_ERROR", error);
    res.status(500).json({
      message: error.message || "Error updating hero image",
      status: "error",
    });
  }
};

/**********************************
  Update a hero image approval by id
***********************************/
exports.updateHeroImageApprovalById = async (req, res) => {
  const { isApproved } = req.body;

  // If hero name already exists, return error
  const hero = await HeroImageService.findHeroImageByIdAndUpdateApprovalStatus(
    req.params.id,
    isApproved
  );

  res.status(200).json(hero);
};

/**********************************
  Delete a hero image by id
***********************************/
exports.deleteHeroImageById = async (req, res) => {
  try {
    // First, get the hero image to get the S3 URL before deleting
    const heroToDelete = await HeroImageService.findHeroImageById(
      req.params.id
    );

    if (!heroToDelete) {
      return res.status(404).json({
        message: "Hero image not found",
        status: "error",
      });
    }

    // Debug: Log the hero record before deletion
    console.log("🔍 HERO_RECORD_DEBUG ::", {
      heroId: req.params.id,
      hasS3Key: !!heroToDelete.s3Key,
      s3Key: heroToDelete.s3Key,
      imageUrl: heroToDelete.image,
      video: heroToDelete.video,
      mediaType: heroToDelete.mediaType,
      allFields: Object.keys(heroToDelete.toObject ? heroToDelete.toObject() : heroToDelete),
    });

    // Delete from database
    const deletedHero = await HeroImageService.findHeroImageByIdAndDelete(
      req.params.id
    );

    // Delete from S3 and invalidate CloudFront cache
    let s3KeyToDelete = heroToDelete.s3Key;
    
    // If s3Key is missing, try to extract it from the URL
    if (!s3KeyToDelete) {
      const mediaUrl = heroToDelete.image || heroToDelete.video;
      if (mediaUrl) {
        // Extract key from CloudFront URL
        // Example: https://media.cdn.shivrajsinghchouhan.co.in/hero-images/filename.jpg -> hero-images/filename.jpg
        const urlParts = mediaUrl.split('/');
        const domainIndex = urlParts.findIndex(part => part.includes('shivrajsinghchouhan.co.in'));
        if (domainIndex !== -1 && domainIndex + 1 < urlParts.length) {
          // Get everything after the domain
          s3KeyToDelete = urlParts.slice(domainIndex + 1).join('/');
          // Remove query parameters (like ?Expires=...)
          s3KeyToDelete = s3KeyToDelete.split('?')[0];
        }
      }
    }

    if (s3KeyToDelete) {
      try {
        const { deleteFileWithCacheInvalidation } = require("../../middlewares/multer");
        
        console.log("🔍 S3_DELETE_DEBUG ::", {
          heroId: req.params.id,
          s3Key: s3KeyToDelete,
          extractedFromUrl: !heroToDelete.s3Key,
          imageUrl: heroToDelete.image,
          video: heroToDelete.video,
        });

        // Delete from S3 and invalidate CloudFront cache
        const deleteResult = await deleteFileWithCacheInvalidation(s3KeyToDelete);

        console.log("🗑️ HERO_IMAGE_DELETED_FROM_S3_AND_CLOUDFRONT ::", {
          timestamp: new Date().toISOString(),
          imageUrl: heroToDelete.image,
          video: heroToDelete.video,
          s3Key: s3KeyToDelete,
          heroId: req.params.id,
          deleteResult: deleteResult,
          userAgent: req.get("User-Agent"),
          ipAddress: req.ip || req.connection.remoteAddress,
        });
      } catch (s3Error) {
        console.error("❌ S3_DELETE_ERROR ::", {
          timestamp: new Date().toISOString(),
          error: s3Error.message,
          errorCode: s3Error.code,
          errorStatus: s3Error.statusCode,
          imageUrl: heroToDelete.image,
          video: heroToDelete.video,
          s3Key: s3KeyToDelete,
          heroId: req.params.id,
        });
        // Don't fail the request if S3 deletion fails, just log it
      }
    } else {
      console.warn("⚠️ NO_S3_KEY_FOUND ::", {
        heroId: req.params.id,
        hasS3Key: !!heroToDelete.s3Key,
        hasImage: !!heroToDelete.image,
        hasVideo: !!heroToDelete.video,
        imageUrl: heroToDelete.image,
        video: heroToDelete.video,
      });
    }

    console.log("🗑️ HERO_IMAGE_DELETED_FROM_DB ::", {
      timestamp: new Date().toISOString(),
      heroId: req.params.id,
      imageUrl: heroToDelete.image,
      userAgent: req.get("User-Agent"),
      ipAddress: req.ip || req.connection.remoteAddress,
    });

    res.status(200).json({
      message: "Hero image deleted successfully",
      deletedHero: deletedHero,
    });
  } catch (error) {
    console.error("❌ DELETE_HERO_IMAGE_ERROR ::", {
      timestamp: new Date().toISOString(),
      error: error.message,
      heroId: req.params.id,
      userAgent: req.get("User-Agent"),
      ipAddress: req.ip || req.connection.remoteAddress,
    });

    res.status(500).json({
      message: error.message || "Error deleting hero image",
      status: "error",
    });
  }
};

/**********************************
  Upload hero image to S3
***********************************/
exports.uploadHeroImage = async (req, res) => {
  try {
    // Log successful hero image upload with details
    console.log("🚀 HERO_IMAGE_UPLOAD_SUCCESS ::", {
      timestamp: new Date().toISOString(),
      userId: req.userId || "anonymous",
      originalName: req.uploadOgName,
      fileSize: req.uploadItemSize,
      fileType: req.uploadItemType,
      uploadUrl: req.uploadUrl,
      userAgent: req.get("User-Agent"),
      ipAddress: req.ip || req.connection.remoteAddress,
    });

    res.status(200).json({
      message: "Hero image uploaded successfully",
      url: req.uploadUrl,
      cloudFrontUrl: req.cloudFrontUrl,
      s3Key: req.s3Key,
      fileSize: req.uploadItemSize,
      fileName: req.uploadOgName,
      mimeType: req.uploadItemType,
      mediaType: "image",
    });
  } catch (error) {
    // Log error with details
    console.error("❌ HERO_IMAGE_UPLOAD_ERROR ::", {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      userId: req.userId || "anonymous",
      userAgent: req.get("User-Agent"),
      ipAddress: req.ip || req.connection.remoteAddress,
    });

    res.status(500).json({
      message: error.message,
    });
  }
};

/**********************************
  Upload hero video to S3
***********************************/
exports.uploadHeroVideo = async (req, res) => {
  try {
    // Validate that the uploaded file is actually a video
    if (!req.uploadItemType || !req.uploadItemType.startsWith("video/")) {
      return res.status(400).json({
        message: "Invalid file type. Only video files are allowed.",
        status: "error",
      });
    }

    // Log successful hero video upload with details
    console.log("🚀 HERO_VIDEO_UPLOAD_SUCCESS ::", {
      timestamp: new Date().toISOString(),
      userId: req.userId || "anonymous",
      originalName: req.uploadOgName,
      fileSize: req.uploadItemSize,
      fileType: req.uploadItemType,
      uploadUrl: req.uploadUrl,
      userAgent: req.get("User-Agent"),
      ipAddress: req.ip || req.connection.remoteAddress,
    });

    res.status(200).json({
      message: "Hero video uploaded successfully",
      url: req.uploadUrl,
      cloudFrontUrl: req.cloudFrontUrl,
      s3Key: req.s3Key,
      fileSize: req.uploadItemSize,
      fileName: req.uploadOgName,
      mimeType: req.uploadItemType,
      mediaType: "video",
    });
  } catch (error) {
    // Log error with details
    console.error("❌ HERO_VIDEO_UPLOAD_ERROR ::", {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      userId: req.userId || "anonymous",
      userAgent: req.get("User-Agent"),
      ipAddress: req.ip || req.connection.remoteAddress,
    });

    res.status(500).json({
      message: error.message,
    });
  }
};

/**********************************
  Get all heroImages paginated
***********************************/
exports.getHeroImagesPaginated = async (req, res) => {
  try {
    const { page, perPage, searchText } = req.query;

    const searchParams = { searchText };

    const heroImages = await HeroImageService.findAllHeroImagesPaginated(
      parseInt(page),
      parseInt(perPage),
      searchParams
    );

    // Total number of heroImages
    const totalHeroImages = await HeroImageService.countAllHeroImages(
      searchParams
    );

    // Total number of pages (rounded up)
    const totalPages = Math.ceil(totalHeroImages / perPage);

    const pagination = {
      page: parseInt(page),
      perPage: parseInt(perPage),
      totalHeroImages,
      totalPages,
    };

    res.status(200).json({
      heroImages: heroImages,
      paginationData: pagination,
    });
  } catch (error) {
    console.log("GET_HERO_IMAGE_PAGINATED_ERROR", error);
    res.status(500).json({
      message: "Error",
      status: "error",
    });
  }
};

/**********************************
  Get all approved hero images paginated
***********************************/
exports.getApprovedHeroImagesPaginated = async (req, res) => {
  try {
    let { page, perPage, searchText, sortBy, sortOrder } = req.query;
    page = parseInt(page) || 1;
    perPage = Math.min(parseInt(perPage) || 10, 100); // max 100 per page

    if (page < 1 || perPage < 1) {
      return res.status(400).json({
        success: false,
        message: "Page and perPage must be positive integers.",
      });
    }

    const searchParams = { searchText };
    const sort = {};
    if (sortBy) sort[sortBy] = sortOrder === "asc" ? 1 : -1;
    else sort["createdAt"] = -1;

    const heroImages =
      await HeroImageService.findAllApprovedHeroImagesPaginated(
        page,
        perPage,
        searchParams,
        sort
      );
    const totalHeroImages = await HeroImageService.countAllApprovedHeroImages(
      searchParams
    );
    const totalPages = Math.ceil(totalHeroImages / perPage);

    res.status(200).json({
      success: true,
      heroImages,
      paginationData: {
        page,
        perPage,
        totalHeroImages,
        totalPages,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};
