const GallerySectionTagService = require("@services/gallerySection/gallerySectionTagService");
const GallerySectionTag = require("../../models/gallerySection/gallerySectionTag");
const handleError = require("../../utils/handleError");

/**********************************
  Create a gallery tag
***********************************/
exports.createGallerySectionTag = async (req, res) => {
  const { name, description } = req.body;

  // Validate request
  if (!name) {
    return res.status(400).json({
      message: "Please enter the gallery tag name",
      status: "error",
    });
  }

  try {
    // Check if tag with same name already exists
    const existingTag = await GallerySectionTagService.findOneGallerySectionTag(
      { name }
    );
    if (existingTag) {
      return res.status(409).json({
        message: `A tag with the name "${name}" already exists`,
        status: "error",
        code: "DUPLICATE_TAG_NAME",
      });
    }

    const newTag = await GallerySectionTagService.createGallerySectionTag(
      req.body
    );
    res.status(201).json(newTag);
  } catch (error) {
    console.error("CREATE_TAG_ERROR", error);

    // Handle duplicate key error specifically
    if (error.code === 11000) {
      return res.status(409).json({
        message: `A tag with the name "${name}" already exists`,
        status: "error",
        code: "DUPLICATE_TAG_NAME",
      });
    }

    res.status(500).json({
      message: error.message || "Error creating gallery tag",
      status: "error",
    });
  }
};

/**********************************
  Get all gallery tags (simple version for forms)
***********************************/
exports.getAllGallerySectionTagsSimple = async (req, res) => {
  try {
    // Get all active tags without pagination
    const tags = await GallerySectionTagService.findAllGallerySectionTags({
      isActive: true,
    });

    res.status(200).json(tags);
  } catch (error) {
    console.error("GET_GALLERY_TAGS_SIMPLE_ERROR", error);
    handleError(res, error);
  }
};

/**********************************
  Get all gallery tags paginated
***********************************/
exports.getAllGallerySectionTags = async (req, res) => {
  try {
    const {
      page = 1,
      perPage = 10,
      search,
      startDate,
      endDate,
      isActive,
      hasImages,
      minImages,
      maxImages,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build search parameters
    const searchParams = {
      search,
      startDate,
      endDate,
      isActive: isActive !== undefined ? isActive === "true" : undefined,
      hasImages: hasImages !== undefined ? hasImages === "true" : undefined,
      minImages: minImages ? parseInt(minImages) : undefined,
      maxImages: maxImages ? parseInt(maxImages) : undefined,
    };

    // Build pagination and sort parameters
    const paginationParams = {
      page: parseInt(page),
      perPage: parseInt(perPage),
      sortBy,
      sortOrder,
    };

    // Get tags with pagination
    const galleryTags =
      await GallerySectionTagService.findAllGallerySectionTagsPaginated(
        paginationParams,
        searchParams
      );

    // Count total matching tags
    const totalGallerySectionTags =
      await GallerySectionTagService.countAllGallerySectionTags(searchParams);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalGallerySectionTags / perPage);

    const pagination = {
      page: parseInt(page),
      perPage: parseInt(perPage),
      totalTags: totalGallerySectionTags,
      totalPages,
    };

    res.status(200).json({
      gallerySectionTags: galleryTags,
      paginationData: pagination,
    });
  } catch (error) {
    console.error("GET_GALLERY_TAGS_PAGINATED_ERROR", error);
    handleError(res, error);
  }
};

/**********************************
  Get popular gallery tags
***********************************/
exports.getPopularGallerySectionTags = async (req, res) => {
  try {
    const {
      limit = 20,
      minImageCount = 0,
      includeInactive = false,
    } = req.query;

    const options = {
      minImageCount: parseInt(minImageCount),
      includeInactive: includeInactive === "true",
    };

    const tags = await GallerySectionTagService.findPopularGallerySectionTags(
      parseInt(limit),
      options
    );

    res.status(200).json({
      success: true,
      data: tags,
    });
  } catch (error) {
    console.error("GET_POPULAR_TAGS_ERROR", error);
    res.status(500).json({
      message: error.message || "Error fetching popular gallery tags",
      status: "error",
    });
  }
};

/**********************************
  Get a gallery tag by id
***********************************/
exports.getGallerySectionTagById = async (req, res) => {
  try {
    const tag = await GallerySectionTagService.findGallerySectionTagById(
      req.params.id
    );
    if (!tag) {
      return res.status(404).json({
        message: "Gallery tag not found",
        status: "error",
      });
    }
    res.status(200).json(tag);
  } catch (error) {
    console.error("GET_TAG_BY_ID_ERROR", error);
    res.status(500).json({
      message: error.message || "Error fetching gallery tag",
      status: "error",
    });
  }
};

/**********************************
  Get a gallery tag by slug
***********************************/
exports.getGallerySectionTagBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        message: "Slug parameter is required",
        status: "error",
      });
    }

    const tag = await GallerySectionTagService.findOneGallerySectionTag({
      slug,
    });

    if (!tag) {
      return res.status(404).json({
        message: "Gallery tag not found",
        status: "error",
      });
    }

    res.status(200).json(tag);
  } catch (error) {
    console.error("GET_TAG_BY_SLUG_ERROR", error);
    res.status(500).json({
      message: error.message || "Error fetching gallery tag by slug",
      status: "error",
    });
  }
};

/**********************************
  Update a gallery tag by id
***********************************/
exports.updateGallerySectionTagById = async (req, res) => {
  const { name } = req.body;

  // Validate request
  if (!name) {
    return res.status(400).json({
      message: "Please enter the gallery tag name",
      status: "error",
    });
  }

  try {
    // Check if new name already exists (but not for this tag)
    if (name) {
      const existingTag =
        await GallerySectionTagService.findOneGallerySectionTag({
          name,
          _id: { $ne: req.params.id },
        });

      if (existingTag) {
        return res.status(409).json({
          message: `A tag with the name "${name}" already exists`,
          status: "error",
          code: "DUPLICATE_TAG_NAME",
        });
      }
    }

    const tag =
      await GallerySectionTagService.findGallerySectionTagByIdAndUpdate(
        req.params.id,
        req.body
      );

    if (!tag) {
      return res.status(404).json({
        message: "Gallery tag not found",
        status: "error",
      });
    }

    res.status(200).json(tag);
  } catch (error) {
    console.error("UPDATE_TAG_ERROR", error);

    // Handle duplicate key error specifically
    if (error.code === 11000) {
      return res.status(409).json({
        message: `A tag with the name "${name}" already exists`,
        status: "error",
        code: "DUPLICATE_TAG_NAME",
      });
    }

    res.status(500).json({
      message: error.message || "Error updating gallery tag",
      status: "error",
    });
  }
};

/**********************************
  Delete a gallery tag by id
***********************************/
exports.deleteGallerySectionTagById = async (req, res) => {
  try {
    const tag =
      await GallerySectionTagService.findGallerySectionTagByIdAndDelete(
        req.params.id
      );

    if (!tag) {
      return res.status(404).json({
        message: "Gallery tag not found",
        status: "error",
      });
    }

    res.status(200).json({
      message: "Gallery tag deleted successfully",
      tag,
    });
  } catch (error) {
    console.error("DELETE_TAG_ERROR", error);
    res.status(500).json({
      message: error.message || "Error deleting gallery tag",
      status: "error",
    });
  }
};

/**********************************
  Create multiple gallery tags from text
***********************************/
exports.createBulkGallerySectionTags = async (req, res) => {
  try {
    const {
      text,
      format,
      defaultIsActive = true,
      generateDescriptions = true,
    } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Please provide text containing tags to create",
      });
    }

    // Pass additional options to the service
    const options = {
      defaultIsActive: defaultIsActive === true || defaultIsActive === "true",
      generateDescriptions:
        generateDescriptions === true || generateDescriptions === "true",
    };

    const result = await GallerySectionTagService.createBulkGallerySectionTags(
      text,
      format,
      options
    );

    // If there were any errors during creation
    if (result.errors.length > 0) {
      return res.status(207).json({
        success: true,
        message: "Some tags were processed with errors",
        data: result,
      });
    }

    // If all tags were skipped (already existed)
    if (result.totalCreated === 0) {
      return res.status(200).json({
        success: true,
        message: "All tags already exist",
        data: result,
      });
    }

    // Success case
    res.status(201).json({
      success: true,
      message: "Tags created successfully",
      data: result,
    });
  } catch (error) {
    console.error("CREATE_BULK_TAGS_ERROR", error);
    handleError(res, error);
  }
};

/**********************************
  Bulk delete gallery tags
***********************************/
exports.deleteBulkGallerySectionTags = async (req, res) => {
  try {
    const { tagIds } = req.body;

    if (!Array.isArray(tagIds) || tagIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of tag IDs to delete",
      });
    }

    // Validate all IDs first
    if (!tagIds.every((id) => id && id.match(/^[0-9a-fA-F]{24}$/))) {
      return res.status(400).json({
        success: false,
        message: "One or more invalid tag IDs provided",
      });
    }

    // Find tags before deletion to return their data
    const tagsToDelete = await GallerySectionTag.find(
      {
        _id: { $in: tagIds },
      },
      "name"
    );

    if (tagsToDelete.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No tags found with the provided IDs",
      });
    }

    const result = await GallerySectionTag.deleteMany({
      _id: { $in: tagIds },
    });

    res.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} tags`,
      deletedCount: result.deletedCount,
      deletedTags: tagsToDelete.map((tag) => ({ id: tag._id, name: tag.name })),
    });
  } catch (error) {
    console.error("DELETE_BULK_TAGS_ERROR", error);
    handleError(res, error);
  }
};

/**********************************
  Bulk update gallery tags
***********************************/
exports.updateBulkGallerySectionTags = async (req, res) => {
  try {
    const { tagIds, updateData } = req.body;

    if (!Array.isArray(tagIds) || tagIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of tag IDs to update",
      });
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide update data",
      });
    }

    // Only allow certain fields to be updated in bulk
    const allowedFields = ["isActive", "description", "metadata"];
    const filteredUpdateData = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredUpdateData[field] = updateData[field];
      }
    }

    if (Object.keys(filteredUpdateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update",
      });
    }

    const result = await GallerySectionTagService.bulkUpdateGallerySectionTags(
      tagIds,
      filteredUpdateData
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No tags found with the provided IDs",
      });
    }

    res.json({
      success: true,
      message: `Successfully updated ${result.modifiedCount} tags`,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("UPDATE_BULK_TAGS_ERROR", error);
    handleError(res, error);
  }
};

/**********************************
  Toggle tag active status
***********************************/
exports.toggleTagActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const tag = await GallerySectionTagService.findGallerySectionTagById(id);

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: "Gallery tag not found",
      });
    }

    // Toggle the active status
    const updatedTag =
      await GallerySectionTagService.findGallerySectionTagByIdAndUpdate(id, {
        isActive: !tag.isActive,
      });

    res.json({
      success: true,
      message: `Tag '${updatedTag.name}' is now ${
        updatedTag.isActive ? "active" : "inactive"
      }`,
      tag: updatedTag,
    });
  } catch (error) {
    console.error("TOGGLE_TAG_STATUS_ERROR", error);
    handleError(res, error);
  }
};

/**********************************
  Get tag statistics
***********************************/
exports.getTagStatistics = async (req, res) => {
  try {
    const stats = await GallerySectionTagService.getTagStatistics();

    res.json({
      success: true,
      statistics: stats,
    });
  } catch (error) {
    console.error("GET_TAG_STATISTICS_ERROR", error);
    handleError(res, error);
  }
};
