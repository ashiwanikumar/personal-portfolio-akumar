const GallerySection = require("@models/gallerySection/gallerySection");
const GallerySectionCategory = require("@models/gallerySection/gallerySectionCategory");
const GallerySectionTag = require("@models/gallerySection/gallerySectionTag");
const { deleteFromS3, deleteMultipleFromS3 } = require("@utils/s3Helper");
const {
  deleteGalleryFileWithCacheInvalidation,
  deleteMultipleGalleryFilesFromS3,
  extractS3KeyFromUrl,
} = require("@middlewares/galleryMulter");
const redisCache = require("@utils/redisCache");
const mediaProcessor = require("@utils/mediaProcessor");
const contentSecurity = require("@utils/contentSecurity");

// Helper function to convert tag IDs to tag names
const convertTagIdsToNames = async (tagIds) => {
  if (!tagIds || !Array.isArray(tagIds) || tagIds.length === 0) {
    return [];
  }

  try {
    // Check if the tags are already names (strings) or IDs (ObjectIds)
    const isObjectId = tagIds.some(
      (tag) => typeof tag === "string" && tag.length === 24
    );

    if (!isObjectId) {
      // Tags are already names, return as is
      return tagIds;
    }

    // Tags are IDs, convert to names
    const tags = await GallerySectionTag.find({ _id: { $in: tagIds } })
      .select("name")
      .exec();

    return tags.map((tag) => tag.name);
  } catch (error) {
    console.error("Error converting tag IDs to names:", error);
    return tagIds; // Return original if conversion fails
  }
};

const buildSearchQuery = ({
  searchText,
  category,
  state,
  tags,
  featured,
  approved,
  mediaType,
  isArchived,
}) => {
  let query = {};

  if (searchText) {
    query.$or = [
      { title: { $regex: searchText, $options: "i" } },
      { description: { $regex: searchText, $options: "i" } },
      { tags: { $regex: searchText, $options: "i" } },
      { "category.name": { $regex: searchText, $options: "i" } },
      { "uploadedBy.name": { $regex: searchText, $options: "i" } },
      { "state.name": { $regex: searchText, $options: "i" } },
    ];
  }

  if (category) {
    query.category = category;
  }

  if (state) {
    // Support searching by state code or state name
    if (state.length === 2) {
      // Likely a state code
      query["state.code"] = state.toUpperCase();
    } else {
      // Search by state name
      query["state.name"] = { $regex: state, $options: "i" };
    }
  }

  if (tags && tags.length > 0) {
    query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
  }

  if (featured !== undefined) {
    query.isFeatured = featured;
  }

  if (approved !== undefined) {
    query.isApproved = approved;
  }

  if (mediaType) {
    query.mediaType = mediaType;
  }

  if (isArchived !== undefined) {
    query.isArchived = isArchived;
  }

  return query;
};

// Helper to extract dimensions from image data
const extractImageDimensions = (imageData) => {
  if (!imageData) return null;

  // If variants object has dimensions data, use it
  if (
    imageData.variants &&
    imageData.variants.metadata &&
    imageData.variants.metadata.width &&
    imageData.variants.metadata.height
  ) {
    return {
      width: parseInt(imageData.variants.metadata.width),
      height: parseInt(imageData.variants.metadata.height),
    };
  }

  return null;
};

// Helper to generate SEO metadata
const generateSEOMetadata = (image, category) => {
  const baseTitle = image.title || "Gallery Image";
  const categoryName = category?.name || "";

  // SEO Character Limits
  const SEO_LIMITS = {
    title: 60, // Google typically displays 50-60 characters
    description: 160, // Google typically displays 155-160 characters
    socialTitle: 60, // Facebook/Open Graph title limit
    socialDescription: 160, // Facebook/Open Graph description limit
  };

  // Truncate base title if needed to ensure final title is under 60 chars
  const maxBaseTitleLength = 40; // Leave room for category and separator
  const truncatedBaseTitle =
    baseTitle.length > maxBaseTitleLength
      ? baseTitle.substring(0, maxBaseTitleLength - 3) + "..."
      : baseTitle;

  const seoTitle = `${truncatedBaseTitle} | ${categoryName}`;
  const description =
    image.description || `View this ${categoryName} image in our gallery`;

  // Ensure all metadata respects SEO limits
  return {
    seoTitle: seoTitle.substring(0, SEO_LIMITS.title),
    seoDescription: description.substring(0, SEO_LIMITS.description),
    socialTitle: seoTitle.substring(0, SEO_LIMITS.socialTitle),
    socialDescription: description.substring(0, SEO_LIMITS.socialDescription),
    // socialImage removed - only set if explicitly provided with different image
    slug: baseTitle
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, ""),
  };
};

// Helper to generate alt text and title if not provided
const generateImageMetadata = (file, category) => {
  const originalName = file.originalName || file.originalname || "image";
  const fileNameWithoutExt = originalName
    .replace(/\.[^/.]+$/, "")
    .replace(/-|_/g, " ");
  const capitalized = fileNameWithoutExt.replace(/\b\w/g, (l) =>
    l.toUpperCase()
  );

  const metadata = {
    title: capitalized,
    altText: `${capitalized} - ${category?.name || ""} image`,
  };

  if (category && category.name) {
    metadata.title = `${category.name} - ${metadata.title}`;
  }

  // Generate basic tags from filename and category
  metadata.tags = [
    ...fileNameWithoutExt.split(" ").filter((tag) => tag.length > 2),
    category?.name?.toLowerCase(),
  ].filter(Boolean);

  return metadata;
};

// Helper to build search query for archived media
const buildArchiveSearchQuery = ({
  searchText,
  category,
  state,
  tags,
  mediaType,
  archiveFolder,
  startDate,
  endDate,
}) => {
  let query = { isArchived: true }; // Always filter for archived media

  if (searchText) {
    query.$or = [
      { title: { $regex: searchText, $options: "i" } },
      { description: { $regex: searchText, $options: "i" } },
      { tags: { $regex: searchText, $options: "i" } },
      { "category.name": { $regex: searchText, $options: "i" } },
      { "uploadedBy.name": { $regex: searchText, $options: "i" } },
      { archiveReason: { $regex: searchText, $options: "i" } },
      { "state.name": { $regex: searchText, $options: "i" } },
    ];
  }

  if (category) {
    query.category = category;
  }

  if (state) {
    // Support searching by state code or state name
    if (state.length === 2) {
      // Likely a state code
      query["state.code"] = state.toUpperCase();
    } else {
      // Search by state name
      query["state.name"] = { $regex: state, $options: "i" };
    }
  }

  if (tags && tags.length > 0) {
    query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
  }

  if (mediaType) {
    query.mediaType = mediaType;
  }

  if (archiveFolder) {
    query.archiveFolder = archiveFolder;
  }

  // Date range filter for archive date
  if (startDate || endDate) {
    query.archiveDate = {};
    if (startDate) {
      query.archiveDate.$gte = new Date(startDate);
    }
    if (endDate) {
      query.archiveDate.$lte = new Date(endDate);
    }
  }

  return query;
};

class GallerySectionService {
  // Create a gallery image
  static createGallerySectionImage = async (gallery) => {
    try {
      // Get category for metadata generation
      const category = await GallerySectionCategory.findById(
        gallery.category
      ).exec();

      // Convert tag IDs to tag names if needed
      if (gallery.tags && gallery.tags.length > 0) {
        gallery.tags = await convertTagIdsToNames(gallery.tags);
      }

      // Generate missing metadata if needed
      if (!gallery.title || !gallery.altText) {
        const generatedMetadata = generateImageMetadata(
          { originalName: gallery.originalName || "image" },
          category
        );

        gallery.title = gallery.title || generatedMetadata.title;
        gallery.altText = gallery.altText || generatedMetadata.altText;

        if (!gallery.tags || gallery.tags.length === 0) {
          gallery.tags = generatedMetadata.tags;
        }
      }

      // Ensure mediaUrl is set for backward compatibility
      if (!gallery.mediaUrl) {
        gallery.mediaUrl = gallery.image;
      }

      // Always determine mediaType based on file extension (override any incorrect client data)
      const url = gallery.mediaUrl || gallery.image;
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
        gallery.mediaType = videoExtensions.includes(extension)
          ? "video"
          : "image";
      } else {
        gallery.mediaType = gallery.mediaType || "image";
      }

      // Set file size if provided
      if (gallery.size) {
        gallery.fileSize = gallery.size;
      }

      // Generate SEO metadata
      const seoMetadata = generateSEOMetadata(gallery, category);
      gallery = { ...gallery, ...seoMetadata };

      // Create and save the new gallery image
      const newGallery = new GallerySection({
        ...gallery,
      });

      await newGallery.save();

      // Find gallery category and add gallery id to it
      await GallerySectionCategory.findByIdAndUpdate(
        gallery.category,
        {
          $push: { images: newGallery._id },
        },
        { new: true }
      ).exec();

      // Populate the new gallery with the user and category
      await newGallery
        .populate({ path: "uploadedBy", select: "name" })
        .populate({ path: "category", select: "name" })
        .execPopulate();

      // Invalidate relevant caches
      try {
        await redisCache.invalidateMediaCache(newGallery._id, gallery.category);
      } catch (error) {
        // Cache not available, continue without invalidation
      }

      // Remove variants from the response
      const response = newGallery.toObject();
      delete response.variants;

      return response;
    } catch (error) {
      throw error;
    }
  };

  // Create multiple gallery images
  static createMultipleGallerySectionImages = async (galleries) => {
    try {
      // Process each gallery to include variants and metadata
      const processedGalleries = await Promise.all(
        galleries.map(async (gallery) => {
          // Extract any variants if they exist
          const variants = gallery.variants || {};

          // Convert tag IDs to tag names if needed
          if (gallery.tags && gallery.tags.length > 0) {
            gallery.tags = await convertTagIdsToNames(gallery.tags);
          }

          // Generate missing metadata if needed
          if (!gallery.title || !gallery.altText) {
            const category = await GallerySectionCategory.findById(
              gallery.category
            ).exec();
            const generatedMetadata = generateImageMetadata(
              { originalName: gallery.originalName || "image" },
              category
            );

            gallery.title = gallery.title || generatedMetadata.title;
            gallery.altText = gallery.altText || generatedMetadata.altText;

            if (!gallery.tags || gallery.tags.length === 0) {
              gallery.tags = generatedMetadata.tags;
            }
          }

          // Ensure mediaUrl is set for backward compatibility
          if (!gallery.mediaUrl) {
            gallery.mediaUrl = gallery.image;
          }

          // Always determine mediaType based on file extension (override any incorrect client data)
          const url = gallery.mediaUrl || gallery.image;
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
            gallery.mediaType = videoExtensions.includes(extension)
              ? "video"
              : "image";
          } else {
            gallery.mediaType = gallery.mediaType || "image";
          }

          // Set file size if provided
          if (gallery.size) {
            gallery.fileSize = gallery.size;
          }

          // Return processed gallery object
          return {
            ...gallery,
            variants: {
              thumbnail: variants.thumbnail?.url || null,
              medium: variants.medium?.url || null,
              large: variants.large?.url || null,
            },
          };
        })
      );

      // Insert all galleries
      const newGalleries = await GallerySection.insertMany(processedGalleries);

      // Update categories with new image IDs
      const categoryUpdates = galleries.map((gallery) =>
        GallerySectionCategory.findByIdAndUpdate(
          gallery.category,
          {
            $push: { images: gallery._id },
          },
          { new: true }
        ).exec()
      );

      await Promise.all(categoryUpdates);

      // Populate all new galleries
      const populatedGalleries = await GallerySection.find({
        _id: { $in: newGalleries.map((g) => g._id) },
      })
        .populate({ path: "uploadedBy", select: "name" })
        .populate({ path: "category", select: "name" })
        .exec();

      return populatedGalleries;
    } catch (error) {
      throw error;
    }
  };

  // Find one gallery
  static findOneGallery = async (query) => {
    try {
      const gallery = await GallerySection.findOne(query).exec();
      return gallery;
    } catch (error) {
      throw error;
    }
  };

  // Find gallery image by id
  static findGallerySectionImageById = async (id) => {
    try {
      // Try to get from cache first
      try {
        const cachedMedia = await redisCache.getCachedSingleMedia(id);
        if (cachedMedia) {
          // Still increment view count even for cached results
          await GallerySection.findByIdAndUpdate(id, {
            $inc: { views: 1 },
          }).exec();
          await redisCache.trackMediaView(id);

          // Convert tag IDs to names for cached results
          if (cachedMedia.tags && cachedMedia.tags.length > 0) {
            cachedMedia.tags = await convertTagIdsToNames(cachedMedia.tags);
          }

          return cachedMedia;
        }
      } catch (error) {
        // Cache not available, continue without caching
      }

      const gallery = await GallerySection.findById(id)
        .populate({ path: "uploadedBy", select: "name" })
        .populate({ path: "category", select: "name" })
        .exec();

      // Increment view count and cache the result
      if (gallery) {
        await GallerySection.findByIdAndUpdate(id, {
          $inc: { views: 1 },
        }).exec();

        // Convert tag IDs to names
        if (gallery.tags && gallery.tags.length > 0) {
          gallery.tags = await convertTagIdsToNames(gallery.tags);
        }

        try {
          await redisCache.trackMediaView(id);
          await redisCache.cacheSingleMedia(id, gallery);
        } catch (error) {
          // Cache not available, continue without caching
        }
      }

      return gallery;
    } catch (error) {
      throw error;
    }
  };

  // Find all gallery images
  static findAllGallerySectionImages = async () => {
    try {
      const gallery = await GallerySection.find()
        .populate({ path: "uploadedBy", select: "name" })
        .populate({ path: "category", select: "name" })
        .sort({ createdAt: -1 })
        .exec();

      // Convert tag IDs to names for each gallery
      for (const item of gallery) {
        if (item.tags && item.tags.length > 0) {
          item.tags = await convertTagIdsToNames(item.tags);
        }
      }

      return gallery;
    } catch (error) {
      throw error;
    }
  };

  // Find all gallery images approved
  static findAllGallerySectionImagesApproved = async () => {
    try {
      const gallery = await GallerySection.find({ isApproved: true })
        .populate({ path: "uploadedBy", select: "name" })
        .populate({ path: "category", select: "name" })
        .sort({ createdAt: -1 })
        .exec();

      // Convert tag IDs to names for each gallery
      for (const item of gallery) {
        if (item.tags && item.tags.length > 0) {
          item.tags = await convertTagIdsToNames(item.tags);
        }
      }

      return gallery;
    } catch (error) {
      throw error;
    }
  };

  // Find featured gallery images
  static findFeaturedGallerySectionImages = async (limit = 10) => {
    try {
      const gallery = await GallerySection.find({
        isApproved: true,
        isFeatured: true,
      })
        .populate({ path: "uploadedBy", select: "name" })
        .populate({ path: "category", select: "name" })
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec();

      // Convert tag IDs to names for each gallery
      for (const item of gallery) {
        if (item.tags && item.tags.length > 0) {
          item.tags = await convertTagIdsToNames(item.tags);
        }
      }

      return gallery;
    } catch (error) {
      throw error;
    }
  };

  // Find popular gallery images (by view count)
  static findPopularGallerySectionImages = async (limit = 10) => {
    try {
      const gallery = await GallerySection.find({ isApproved: true })
        .populate({ path: "uploadedBy", select: "name" })
        .populate({ path: "category", select: "name" })
        .sort({ views: -1 })
        .limit(limit)
        .exec();

      // Convert tag IDs to names for each gallery
      for (const item of gallery) {
        if (item.tags && item.tags.length > 0) {
          item.tags = await convertTagIdsToNames(item.tags);
        }
      }

      return gallery;
    } catch (error) {
      throw error;
    }
  };

  // Find gallery image by id and update
  static findGallerySectionImageByIdAndUpdate = async (id, update) => {
    try {
      // Get the old gallery image
      const oldGallery = await GallerySection.findById(id).exec();

      const gallery = await GallerySection.findByIdAndUpdate(id, update, {
        new: true,
      }).exec();

      // If category changed, update both old and new categories
      if (oldGallery.category.toString() !== update.category) {
        // Remove from old category
        await GallerySectionCategory.findByIdAndUpdate(
          oldGallery.category,
          {
            $pull: { images: oldGallery._id },
          },
          { new: true }
        ).exec();

        // Add to new category
        await GallerySectionCategory.findByIdAndUpdate(
          update.category,
          {
            $push: { images: gallery._id },
          },
          { new: true }
        ).exec();
      }

      // Populate the updated gallery
      await gallery
        .populate({ path: "uploadedBy", select: "name" })
        .populate({ path: "category", select: "name" })
        .execPopulate();

      // Convert tag IDs to names
      if (gallery.tags && gallery.tags.length > 0) {
        gallery.tags = await convertTagIdsToNames(gallery.tags);
      }

      return gallery;
    } catch (error) {
      throw error;
    }
  };

  // Find gallery image by id and update approval status
  static findGallerySectionImageByIdAndUpdateApprovalStatus = async (
    id,
    isApproved
  ) => {
    try {
      // Ensure isApproved is a boolean
      const approvalStatus = Boolean(isApproved);

      const gallery = await GallerySection.findByIdAndUpdate(
        id,
        { $set: { isApproved: approvalStatus } },
        { new: true }
      )
        .populate({ path: "uploadedBy", select: "name" })
        .populate({ path: "category", select: "name" })
        .exec();
      return gallery;
    } catch (error) {
      throw error;
    }
  };

  // Find gallery image by id and update featured status
  static findGallerySectionImageByIdAndUpdateFeaturedStatus = async (
    id,
    isFeatured
  ) => {
    try {
      const gallery = await GallerySection.findByIdAndUpdate(
        id,
        { isFeatured },
        { new: true }
      )
        .populate({ path: "uploadedBy", select: "name" })
        .populate({ path: "category", select: "name" })
        .exec();
      return gallery;
    } catch (error) {
      throw error;
    }
  };

  // Find gallery image by id and delete
  static findGallerySectionImageByIdAndDelete = async (id) => {
    try {
      const gallery = await GallerySection.findById(id).exec();

      // Delete from S3 with cache invalidation
      if (gallery.image) {
        const s3Key = extractS3KeyFromUrl(gallery.image);
        await deleteGalleryFileWithCacheInvalidation(s3Key);
      }

      // Delete from database
      await GallerySection.findByIdAndDelete(id).exec();

      // Remove from category
      await GallerySectionCategory.findByIdAndUpdate(
        gallery.category,
        {
          $pull: { images: gallery._id },
        },
        { new: true }
      ).exec();

      // Invalidate relevant caches
      try {
        await redisCache.invalidateMediaCache(id, gallery.category);
      } catch (error) {
        // Cache not available, continue without invalidation
      }

      return gallery;
    } catch (error) {
      throw error;
    }
  };

  // Delete multiple gallery images
  static deleteMultipleGallerySectionImages = async (ids) => {
    try {
      const galleries = await GallerySection.find({
        _id: { $in: ids },
      }).exec();

      // Delete from S3 with cache invalidation
      const imageUrls = galleries
        .map((gallery) => gallery.image)
        .filter(Boolean);
      if (imageUrls.length > 0) {
        const s3Keys = imageUrls.map((url) => extractS3KeyFromUrl(url));
        await deleteMultipleGalleryFilesFromS3(s3Keys);
      }

      // Delete from database
      await GallerySection.deleteMany({ _id: { $in: ids } });

      // Remove from categories
      const categoryUpdates = galleries.map((gallery) =>
        GallerySectionCategory.findByIdAndUpdate(
          gallery.category,
          {
            $pull: { images: gallery._id },
          },
          { new: true }
        ).exec()
      );

      await Promise.all(categoryUpdates);

      return galleries;
    } catch (error) {
      throw error;
    }
  };

  // Find all gallery images paginated with advanced filtering
  static findAllGallerySectionImagesPaginated = async (
    page,
    perPage,
    searchParams = {}
  ) => {
    try {
      // For approved media (public endpoint), use caching
      if (searchParams.approved === true) {
        try {
          const cacheKey = { page, perPage, ...searchParams };
          const cachedResult = await redisCache.getCachedApprovedMedia(
            cacheKey
          );
          if (cachedResult) {
            // Convert tag IDs to names for cached results
            if (cachedResult.data && Array.isArray(cachedResult.data)) {
              for (const gallery of cachedResult.data) {
                if (gallery.tags && gallery.tags.length > 0) {
                  gallery.tags = await convertTagIdsToNames(gallery.tags);
                }
              }
            }
            return cachedResult;
          }
        } catch (error) {
          // Cache not available, continue without caching
        }
      }

      const searchQuery = buildSearchQuery(searchParams);

      const galleryImages = await GallerySection.find(searchQuery)
        .populate({ path: "uploadedBy", select: "name" })
        .populate({ path: "category", select: "name" })
        .sort({ createdAt: -1 })
        .skip((page - 1) * perPage)
        .limit(perPage);

      // Convert tag IDs to names for each gallery
      for (const gallery of galleryImages) {
        if (gallery.tags && gallery.tags.length > 0) {
          gallery.tags = await convertTagIdsToNames(gallery.tags);
        }
      }

      // Cache approved media results for public consumption
      if (searchParams.approved === true) {
        try {
          const cacheKey = { page, perPage, ...searchParams };
          await redisCache.cacheApprovedMedia(cacheKey, galleryImages);
        } catch (error) {
          // Cache not available, continue without caching
        }
      }

      return galleryImages;
    } catch (error) {
      console.error("Gallery pagination error:", error);
      throw error;
    }
  };

  // Count all gallery images with advanced filtering
  static countAllGallerySectionImages = async (searchParams = {}) => {
    try {
      const searchQuery = buildSearchQuery(searchParams);

      const totalGallerySectionImages = await GallerySection.countDocuments(
        searchQuery
      );

      return totalGallerySectionImages;
    } catch (error) {
      console.error("Gallery count error:", error);
      throw error;
    }
  };

  // Find gallery images by tags
  static findGallerySectionImagesByTags = async (tags, limit = 20) => {
    try {
      // Ensure tags is an array
      const tagArray = Array.isArray(tags) ? tags : [tags];

      const galleryImages = await GallerySection.find({
        tags: { $in: tagArray },
        isApproved: true,
      })
        .populate({ path: "uploadedBy", select: "name" })
        .populate({ path: "category", select: "name" })
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec();

      // Convert tag IDs to names for each gallery
      for (const item of galleryImages) {
        if (item.tags && item.tags.length > 0) {
          item.tags = await convertTagIdsToNames(item.tags);
        }
      }

      return galleryImages;
    } catch (error) {
      throw error;
    }
  };

  // Update image metadata
  static updateImageMetadata = async (id, metadata) => {
    try {
      const gallery = await GallerySection.findByIdAndUpdate(
        id,
        {
          title: metadata.title,
          altText: metadata.altText,
          description: metadata.description,
          tags: metadata.tags,
        },
        { new: true }
      )
        .populate({ path: "uploadedBy", select: "name" })
        .populate({ path: "category", select: "name" })
        .exec();

      return gallery;
    } catch (error) {
      throw error;
    }
  };

  // Get popular tags from the gallery
  static getPopularTags = async (limit = 20) => {
    try {
      // Try to get from cache first
      try {
        const cachedTags = await redisCache.getCachedPopularTags(limit);
        if (cachedTags) {
          return cachedTags;
        }
      } catch (error) {
        // Cache not available, continue without caching
      }

      const tags = await GallerySection.aggregate([
        { $match: { isApproved: true } },
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit },
      ]).exec();

      const formattedTags = tags.map((tag) => ({
        tag: tag._id,
        count: tag.count,
      }));

      // Cache the results
      try {
        await redisCache.cachePopularTags(limit, formattedTags);
      } catch (error) {
        // Cache not available, continue without caching
      }

      return formattedTags;
    } catch (error) {
      throw error;
    }
  };

  // Find gallery items by state
  static findGalleryItemsByState = async (stateName) => {
    try {
      const query = {
        isApproved: true,
        isArchived: false,
        "state.name": { $regex: new RegExp(`^${stateName}$`, "i") }
      };

      const galleryItems = await GallerySection.find(query)
        .populate({ path: "category", select: "name description" })
        .select("mediaUrl mediaType title altText category state")
        .exec();

      return galleryItems;
    } catch (error) {
      throw error;
    }
  };

  // Archive a gallery section media
  static archiveGallerySectionMedia = async (id, archiveData) => {
    try {
      const { archivedBy, archiveReason, archiveFolder } = archiveData;

      const media = await GallerySection.findById(id).exec();
      if (!media) {
        return null;
      }

      // Determine archive folder based on media type if not provided
      const finalArchiveFolder =
        archiveFolder ||
        (media.mediaType === "video" ? "old-videos" : "old-photos");

      const archivedMedia = await GallerySection.findByIdAndUpdate(
        id,
        {
          isArchived: true,
          archiveDate: new Date(),
          archivedBy,
          archiveReason,
          archiveFolder: finalArchiveFolder,
        },
        { new: true }
      )
        .populate({ path: "uploadedBy", select: "name" })
        .populate({ path: "category", select: "name" })
        .populate({ path: "archivedBy", select: "name" })
        .exec();

      // Invalidate relevant caches
      try {
        await redisCache.invalidateMediaCache(id, media.category);
      } catch (error) {
        // Cache not available, continue without invalidation
      }

      return archivedMedia;
    } catch (error) {
      throw error;
    }
  };

  // Unarchive a gallery section media
  static unarchiveGallerySectionMedia = async (id, unarchivedBy) => {
    try {
      const media = await GallerySection.findById(id).exec();
      if (!media) {
        return null;
      }

      const unarchivedMedia = await GallerySection.findByIdAndUpdate(
        id,
        {
          isArchived: false,
          archiveDate: null,
          archivedBy: null,
          archiveReason: null,
          archiveFolder: null,
        },
        { new: true }
      )
        .populate({ path: "uploadedBy", select: "name" })
        .populate({ path: "category", select: "name" })
        .exec();

      // Invalidate relevant caches
      try {
        await redisCache.invalidateMediaCache(id, media.category);
      } catch (error) {
        // Cache not available, continue without invalidation
      }

      return unarchivedMedia;
    } catch (error) {
      throw error;
    }
  };

  // Find all archived gallery section media with pagination
  static findAllArchivedGallerySectionMedia = async (
    page,
    perPage,
    searchParams = {}
  ) => {
    try {
      const searchQuery = buildArchiveSearchQuery(searchParams);

      const archivedMedia = await GallerySection.find(searchQuery)
        .populate({ path: "uploadedBy", select: "name" })
        .populate({ path: "category", select: "name" })
        .populate({ path: "archivedBy", select: "name" })
        .sort({ archiveDate: -1 })
        .skip((page - 1) * perPage)
        .limit(perPage);

      return archivedMedia;
    } catch (error) {
      throw error;
    }
  };

  // Count all archived gallery section media
  static countAllArchivedGallerySectionMedia = async (searchParams = {}) => {
    try {
      const searchQuery = buildArchiveSearchQuery(searchParams);
      const totalArchivedMedia = await GallerySection.countDocuments(
        searchQuery
      );
      return totalArchivedMedia;
    } catch (error) {
      throw error;
    }
  };

  // Bulk archive gallery section media
  static bulkArchiveGallerySectionMedia = async (ids, archiveData) => {
    try {
      const { archivedBy, archiveReason, archiveFolder } = archiveData;

      const mediaItems = await GallerySection.find({
        _id: { $in: ids },
        isArchived: false, // Only archive non-archived items
      }).exec();

      if (mediaItems.length === 0) {
        return {
          archivedCount: 0,
          skippedCount: ids.length,
          errors: ["No media items found to archive"],
        };
      }

      const results = {
        archivedCount: 0,
        skippedCount: 0,
        errors: [],
      };

      // Process each media item
      for (const media of mediaItems) {
        try {
          const finalArchiveFolder =
            archiveFolder ||
            (media.mediaType === "video" ? "old-videos" : "old-photos");

          await GallerySection.findByIdAndUpdate(media._id, {
            isArchived: true,
            archiveDate: new Date(),
            archivedBy,
            archiveReason,
            archiveFolder: finalArchiveFolder,
          });

          results.archivedCount++;
        } catch (error) {
          results.errors.push(
            `Failed to archive ${media._id}: ${error.message}`
          );
        }
      }

      results.skippedCount = ids.length - mediaItems.length;

      return results;
    } catch (error) {
      throw error;
    }
  };

  // Bulk unarchive gallery section media
  static bulkUnarchiveGallerySectionMedia = async (ids, unarchivedBy) => {
    try {
      const mediaItems = await GallerySection.find({
        _id: { $in: ids },
        isArchived: true, // Only unarchive archived items
      }).exec();

      if (mediaItems.length === 0) {
        return {
          unarchivedCount: 0,
          skippedCount: ids.length,
          errors: ["No archived media items found to unarchive"],
        };
      }

      const results = {
        unarchivedCount: 0,
        skippedCount: 0,
        errors: [],
      };

      // Process each media item
      for (const media of mediaItems) {
        try {
          await GallerySection.findByIdAndUpdate(media._id, {
            isArchived: false,
            archiveDate: null,
            archivedBy: null,
            archiveReason: null,
            archiveFolder: null,
          });

          results.unarchivedCount++;
        } catch (error) {
          results.errors.push(
            `Failed to unarchive ${media._id}: ${error.message}`
          );
        }
      }

      results.skippedCount = ids.length - mediaItems.length;

      return results;
    } catch (error) {
      throw error;
    }
  };

  // Get archive statistics
  static getArchiveStatistics = async () => {
    try {
      const totalArchived = await GallerySection.countDocuments({
        isArchived: true,
      });
      const archivedPhotos = await GallerySection.countDocuments({
        isArchived: true,
        archiveFolder: "old-photos",
      });
      const archivedVideos = await GallerySection.countDocuments({
        isArchived: true,
        archiveFolder: "old-videos",
      });

      // Get recent archive activity
      const recentArchived = await GallerySection.find({
        isArchived: true,
      })
        .sort({ archiveDate: -1 })
        .limit(5)
        .populate({ path: "archivedBy", select: "name" })
        .populate({ path: "category", select: "name" })
        .exec();

      // Get archive activity by month
      const archiveActivity = await GallerySection.aggregate([
        { $match: { isArchived: true } },
        {
          $group: {
            _id: {
              year: { $year: "$archiveDate" },
              month: { $month: "$archiveDate" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": -1, "_id.month": -1 } },
        { $limit: 12 },
      ]);

      return {
        totalArchived,
        archivedPhotos,
        archivedVideos,
        recentArchived: recentArchived.map((item) => ({
          id: item._id,
          title: item.title,
          mediaType: item.mediaType,
          archiveFolder: item.archiveFolder,
          archiveDate: item.archiveDate,
          archivedBy: item.archivedBy?.name || "Unknown",
          category: item.category?.name || "Unknown",
        })),
        archiveActivity,
      };
    } catch (error) {
      throw error;
    }
  };

  // Get comprehensive gallery analytics
  static getGalleryAnalytics = async () => {
    try {
      // Get total counts
      const totalMedia = await GallerySection.countDocuments({});
      const activeMedia = await GallerySection.countDocuments({
        isArchived: false,
      });
      const archivedMedia = await GallerySection.countDocuments({
        isArchived: true,
      });

      // Get active media breakdown
      const activeApproved = await GallerySection.countDocuments({
        isArchived: false,
        isApproved: true,
      });
      const activePending = await GallerySection.countDocuments({
        isArchived: false,
        isApproved: false,
      });
      const activeFeatured = await GallerySection.countDocuments({
        isArchived: false,
        isFeatured: true,
      });

      // Get media type breakdown (active only)
      const activePhotos = await GallerySection.countDocuments({
        isArchived: false,
        mediaType: "image",
      });
      const activeVideos = await GallerySection.countDocuments({
        isArchived: false,
        mediaType: "video",
      });

      // Get archived media breakdown
      const archivedPhotos = await GallerySection.countDocuments({
        isArchived: true,
        archiveFolder: "old-photos",
      });
      const archivedVideos = await GallerySection.countDocuments({
        isArchived: true,
        archiveFolder: "old-videos",
      });

      // Get total counts (active + archived)
      const totalPhotos = activePhotos + archivedPhotos;
      const totalVideos = activeVideos + archivedVideos;
      const totalPending =
        activePending +
        (await GallerySection.countDocuments({
          isArchived: true,
          isApproved: false,
        }));

      return {
        totalMedia,
        mediaLibrary: {
          total: activeMedia,
          approved: activeApproved,
          pending: activePending,
          featured: activeFeatured,
          photos: activePhotos,
          videos: activeVideos,
        },
        archive: {
          total: archivedMedia,
          photos: archivedPhotos,
          videos: archivedVideos,
        },
        totals: {
          photos: totalPhotos,
          videos: totalVideos,
          pending: totalPending,
        },
      };
    } catch (error) {
      throw error;
    }
  };

  // Get media type analytics
  static getMediaTypeAnalytics = async (options = {}) => {
    try {
      const { includeArchived = false } = options;

      const matchQuery = includeArchived ? {} : { isArchived: false };

      const analytics = await GallerySection.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: "$mediaType",
            count: { $sum: 1 },
          },
        },
      ]);

      const result = {
        photos: 0,
        videos: 0,
      };

      analytics.forEach((item) => {
        if (item._id === "image") {
          result.photos = item.count;
        } else if (item._id === "video") {
          result.videos = item.count;
        }
      });

      return result;
    } catch (error) {
      throw error;
    }
  };

  // Get approval status analytics
  static getApprovalAnalytics = async (options = {}) => {
    try {
      const { includeArchived = false } = options;

      const matchQuery = includeArchived ? {} : { isArchived: false };

      const analytics = await GallerySection.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: {
              isApproved: "$isApproved",
              isFeatured: "$isFeatured",
            },
            count: { $sum: 1 },
          },
        },
      ]);

      const result = {
        approved: 0,
        pending: 0,
        featured: 0,
      };

      analytics.forEach((item) => {
        if (item._id.isApproved) {
          result.approved = item.count;
        } else {
          result.pending = item.count;
        }

        if (item._id.isFeatured) {
          result.featured = item.count;
        }
      });

      return result;
    } catch (error) {
      throw error;
    }
  };

  // Approve archived gallery media
  static approveArchivedGalleryMedia = async (
    id,
    approvedBy,
    comments = null
  ) => {
    try {
      const media = await GallerySection.findById(id);

      if (!media) {
        throw new Error("Archived gallery media not found");
      }

      if (!media.isArchived) {
        throw new Error("Media is not archived");
      }

      // Update approval status
      media.isApproved = true;
      media.approvedBy = approvedBy;
      media.approvedAt = new Date();
      media.approvalComments = comments;

      await media.save();

      // Populate related data
      await media.populate([
        { path: "category", select: "name" },
        { path: "uploadedBy", select: "name email" },
        { path: "archivedBy", select: "name email" },
        { path: "approvedBy", select: "name email" },
      ]);

      return media;
    } catch (error) {
      throw error;
    }
  };

  // Disapprove archived gallery media
  static disapproveArchivedGalleryMedia = async (
    id,
    disapprovedBy,
    reason = null
  ) => {
    try {
      const media = await GallerySection.findById(id);

      if (!media) {
        throw new Error("Archived gallery media not found");
      }

      if (!media.isArchived) {
        throw new Error("Media is not archived");
      }

      // Update approval status
      media.isApproved = false;
      media.disapprovedBy = disapprovedBy;
      media.disapprovedAt = new Date();
      media.disapprovalReason = reason;

      await media.save();

      // Populate related data
      await media.populate([
        { path: "category", select: "name" },
        { path: "uploadedBy", select: "name email" },
        { path: "archivedBy", select: "name email" },
        { path: "disapprovedBy", select: "name email" },
      ]);

      return media;
    } catch (error) {
      throw error;
    }
  };

  // Get archived gallery media with pagination (for pending view)
  static getArchivedGalleryMediaPaginated = async (
    searchParams = {},
    page = 1,
    perPage = 12
  ) => {
    try {
      const query = buildArchiveSearchQuery(searchParams);

      // Add approval filter if specified
      if (searchParams.isApproved !== undefined) {
        query.isApproved = searchParams.isApproved;
      }

      const skip = (page - 1) * perPage;

      const [media, total] = await Promise.all([
        GallerySection.find(query)
          .populate("category", "name")
          .populate("uploadedBy", "name email")
          .populate("archivedBy", "name email")
          .populate("approvedBy", "name email")
          .populate("disapprovedBy", "name email")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(perPage),
        GallerySection.countDocuments(query),
      ]);

      const totalPages = Math.ceil(total / perPage);

      return {
        archivedMedia: media,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: perPage,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      throw error;
    }
  };
}

module.exports = GallerySectionService;
