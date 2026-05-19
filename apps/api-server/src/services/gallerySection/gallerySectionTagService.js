const GallerySectionTag = require("@models/gallerySection/gallerySectionTag");

// Helper function to process text and extract tags
const processTagText = (text, format = "text") => {
  let tags = [];

  // Remove extra whitespace and normalize line endings
  text = text.trim().replace(/\r\n/g, "\n");

  switch (format) {
    case "csv":
      // Handle CSV format
      tags = text.split(",").map((tag) => tag.trim());
      break;

    case "hashtag":
      // Handle hashtag format (#tag1 #tag2)
      tags = text.match(/#[\w-]+/g) || [];
      tags = tags.map((tag) => tag.substring(1)); // Remove # prefix
      break;

    case "newline":
      // Handle newline-separated format
      tags = text.split("\n").map((tag) => tag.trim());
      break;

    default:
      // Default text format - handle multiple separators
      tags = text
        .split(/[,\n#\s]+/) // Split by comma, newline, hashtag, or whitespace
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
  }

  // Clean and normalize tags
  return tags
    .map((tag) => tag.toLowerCase())
    .filter((tag) => tag.length > 0)
    .filter((tag, index, self) => self.indexOf(tag) === index); // Remove duplicates
};

class GallerySectionTagService {
  // Create a gallery tag
  static createGallerySectionTag = async (tag) => {
    try {
      const newTag = new GallerySectionTag(tag);
      await newTag.save();
      return newTag;
    } catch (error) {
      throw error;
    }
  };

  // Find one gallery tag
  static findOneGallerySectionTag = async (query) => {
    try {
      const tag = await GallerySectionTag.findOne(query).exec();
      return tag;
    } catch (error) {
      throw error;
    }
  };

  // Find gallery tag by id
  static findGallerySectionTagById = async (id) => {
    try {
      const tag = await GallerySectionTag.findById(id)
        .populate({
          path: "images",
          select: "title image altText description",
        })
        .exec();
      return tag;
    } catch (error) {
      throw error;
    }
  };

  // Helper function to build query from search parameters
  static buildTagSearchQuery = (searchParams = {}) => {
    const {
      search,
      startDate,
      endDate,
      isActive,
      hasImages,
      minImages,
      maxImages,
    } = searchParams;

    const query = {};

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Search filter for name, description, or slug
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    // Active status filter
    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    // Images filter
    if (hasImages !== undefined) {
      if (hasImages) {
        query["images.0"] = { $exists: true };
      } else {
        query.images = { $size: 0 };
      }
    }

    // Image count range filter
    if (minImages !== undefined || maxImages !== undefined) {
      query.$expr = {};
      const conditions = [];

      if (minImages !== undefined) {
        conditions.push({ $gte: [{ $size: "$images" }, parseInt(minImages)] });
      }

      if (maxImages !== undefined) {
        conditions.push({ $lte: [{ $size: "$images" }, parseInt(maxImages)] });
      }

      if (conditions.length === 1) {
        query.$expr = conditions[0];
      } else if (conditions.length > 1) {
        query.$expr = { $and: conditions };
      }
    }

    return query;
  };

  // Find all gallery tags (simple version for forms)
  static findAllGallerySectionTags = async (searchParams = {}) => {
    try {
      // Build query based on search parameters
      const query = this.buildTagSearchQuery(searchParams);

      const tags = await GallerySectionTag.find(query)
        .select("_id name description isActive slug")
        .sort({ name: 1 })
        .exec();

      return tags;
    } catch (error) {
      throw error;
    }
  };

  // Find all gallery tags with pagination
  static findAllGallerySectionTagsPaginated = async (
    paginationParams = {},
    searchParams = {}
  ) => {
    try {
      const {
        page = 1,
        perPage = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = paginationParams;

      // Build query based on search parameters
      const query = this.buildTagSearchQuery(searchParams);

      // Build sort options
      const sortOptions = {};
      if (sortBy === "imageCount") {
        sortOptions["images.length"] = sortOrder === "desc" ? -1 : 1;
      } else {
        sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
      }

      // Execute query with pagination
      const skip = (parseInt(page) - 1) * parseInt(perPage);

      const tags = await GallerySectionTag.find(query)
        .populate({
          path: "images",
          select: "title image altText description",
        })
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(perPage))
        .exec();

      return tags;
    } catch (error) {
      throw error;
    }
  };

  // Count total gallery tags matching search criteria
  static countAllGallerySectionTags = async (searchParams = {}) => {
    try {
      // Build query based on search parameters
      const query = this.buildTagSearchQuery(searchParams);

      // Count documents matching query
      const count = await GallerySectionTag.countDocuments(query);

      return count;
    } catch (error) {
      throw error;
    }
  };

  // Find popular gallery tags with enhanced options
  static findPopularGallerySectionTags = async (limit = 20, options = {}) => {
    try {
      const { minImageCount = 0, includeInactive = false } = options;

      const query = {
        "images.0": { $exists: true },
      };

      if (parseInt(minImageCount) > 0) {
        query.$expr = { $gte: [{ $size: "$images" }, parseInt(minImageCount)] };
      }

      if (!includeInactive) {
        query.isActive = true;
      }

      const tags = await GallerySectionTag.find(query)
        .populate({
          path: "images",
          select: "title image altText description",
        })
        .sort({ "images.length": -1 })
        .limit(parseInt(limit))
        .exec();

      return tags;
    } catch (error) {
      throw error;
    }
  };

  // Find gallery tag by id and update
  static findGallerySectionTagByIdAndUpdate = async (id, update) => {
    try {
      // If name is being updated, also update the slug
      if (update.name) {
        update.slug = update.name
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");
      }

      const tag = await GallerySectionTag.findByIdAndUpdate(id, update, {
        new: true,
      })
        .populate({
          path: "images",
          select: "title image altText description",
        })
        .exec();
      return tag;
    } catch (error) {
      throw error;
    }
  };

  // Find gallery tag by id and delete
  static findGallerySectionTagByIdAndDelete = async (id) => {
    try {
      const tag = await GallerySectionTag.findByIdAndDelete(id).exec();
      return tag;
    } catch (error) {
      throw error;
    }
  };

  // Bulk update gallery tags
  static bulkUpdateGallerySectionTags = async (tagIds, updateData) => {
    try {
      // Only allow certain fields to be updated in bulk
      const allowedFields = ["isActive", "description", "metadata"];
      const filteredUpdateData = {};

      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          filteredUpdateData[field] = updateData[field];
        }
      }

      if (Object.keys(filteredUpdateData).length === 0) {
        throw new Error("No valid fields to update");
      }

      const result = await GallerySectionTag.updateMany(
        { _id: { $in: tagIds } },
        { $set: filteredUpdateData }
      );

      return {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      };
    } catch (error) {
      throw error;
    }
  };

  // Create multiple gallery tags from text with enhanced options
  static createBulkGallerySectionTags = async (
    text,
    format = "text",
    options = {}
  ) => {
    try {
      const { defaultIsActive = true, generateDescriptions = true } = options;

      // Process text to extract tag names
      const tagNames = processTagText(text, format);

      // Check for existing tags
      const existingTags = await GallerySectionTag.find({
        name: { $in: tagNames },
      });

      // Create sets for faster lookup
      const existingTagNames = new Set(existingTags.map((tag) => tag.name));
      const newTagNames = tagNames.filter(
        (name) => !existingTagNames.has(name)
      );

      // Create new tags with error handling for each tag
      const results = {
        totalProcessed: tagNames.length,
        totalCreated: 0,
        totalSkipped: existingTags.length,
        created: [],
        skipped: existingTags.map((tag) => tag.name),
        errors: [],
      };

      for (const name of newTagNames) {
        try {
          // Generate description if requested
          let description = "";
          if (generateDescriptions) {
            description = `Tag created from bulk import: ${name}`;
          }

          const newTag = await GallerySectionTag.create({
            name,
            description,
            isActive: defaultIsActive,
          });

          results.created.push(newTag.name);
          results.totalCreated++;
        } catch (error) {
          if (error.code === 11000) {
            // Handle duplicate key error
            results.skipped.push(name);
            results.totalSkipped++;
          } else {
            // Handle other errors
            results.errors.push({
              tag: name,
              error: error.message,
            });
          }
        }
      }

      return results;
    } catch (error) {
      throw new Error(`Error creating bulk tags: ${error.message}`);
    }
  };

  // Get tag statistics
  static getTagStatistics = async () => {
    try {
      const totalTags = await GallerySectionTag.countDocuments();
      const activeTags = await GallerySectionTag.countDocuments({
        isActive: true,
      });
      const tagsWithImages = await GallerySectionTag.countDocuments({
        "images.0": { $exists: true },
      });

      // Get top tags with most images
      const topTags = await GallerySectionTag.find()
        .sort({ "images.length": -1 })
        .limit(5)
        .select("name images")
        .exec();

      // Get recently created tags
      const recentTags = await GallerySectionTag.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name createdAt")
        .exec();

      return {
        totalTags,
        activeTags,
        inactiveTags: totalTags - activeTags,
        tagsWithImages,
        tagsWithoutImages: totalTags - tagsWithImages,
        topTags: topTags.map((tag) => ({
          id: tag._id,
          name: tag.name,
          imageCount: tag.images.length,
        })),
        recentTags: recentTags.map((tag) => ({
          id: tag._id,
          name: tag.name,
          createdAt: tag.createdAt,
        })),
      };
    } catch (error) {
      throw error;
    }
  };
}

module.exports = GallerySectionTagService;
