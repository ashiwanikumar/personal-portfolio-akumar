// ** SERVICES ** //
const BlogTagService = require("@services/blog/blogTagService");
const BlogActivityService = require("@services/blog/blogActivityService");
const { BlogService } = require("@services/blog/blogService");

// ** UTILS ** //
const logger = require("@utils/logger");

/**********************************
  Create a blogBlogTag
***********************************/
exports.createBlogTag = async (req, res) => {
  const { name } = req.body;

  // Validate request
  if (!name) {
    // Log failed attempt
    setImmediate(async () => {
      try {
        await BlogActivityService.logActivity({
          user: req.user?._id,
          activityType: "tag_created",
          action: "Failed to create tag - missing name",
          description: "Tag creation failed due to validation error: missing name",
          status: "failed",
          priority: "normal",
          metadata: {
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get("User-Agent"),
            endpoint: req.originalUrl,
            method: req.method,
            source: "web",
            error: "Missing tag name",
            requestData: req.body,
          },
        });
      } catch (activityError) {
        logger.error("Error logging failed tag creation activity:", activityError);
      }
    });

    return res.status(400).json({
      message: "Please enter the blogBlogTag name",
      status: "error",
    });
  }

  try {
    // Check if tag name already exists
    const existingTag = await BlogTagService.findOneBlogTag({ name });

    if (existingTag) {
      // Log failed attempt due to duplicate name
      setImmediate(async () => {
        try {
          await BlogActivityService.logActivity({
            user: req.user?._id,
            activityType: "tag_created",
            action: `Failed to create tag "${name}" - name already exists`,
            description: `Tag creation failed: A tag with the name "${name}" already exists`,
            status: "failed",
            priority: "normal",
            metadata: {
              ipAddress: req.ip || req.connection.remoteAddress,
              userAgent: req.get("User-Agent"),
              endpoint: req.originalUrl,
              method: req.method,
              source: "web",
              error: "Duplicate tag name",
              attemptedName: name,
              existingTagId: existingTag._id.toString(),
            },
          });
        } catch (activityError) {
          logger.error("Error logging failed tag creation activity:", activityError);
        }
      });

      return res.status(400).json({
        message: "BlogTag name already exists",
        status: "error",
      });
    }

    // Create the new tag
    const newBlogTag = await BlogTagService.createBlogTag(req.body);

    // Log successful tag creation
    setImmediate(async () => {
      try {
        await BlogActivityService.logTagCreated(newBlogTag, req.user, {
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get("User-Agent"),
          endpoint: req.originalUrl,
          method: req.method,
          source: "web",
          requestData: req.body,
        });
        
        logger.info(`Tag "${newBlogTag.name}" created successfully by user ${req.user?.name || req.user?.email || 'unknown'}`);
      } catch (activityError) {
        logger.error("Error logging tag creation activity:", activityError);
      }
    });

    res.status(201).json({
      message: "Tag created successfully",
      status: "success",
      data: newBlogTag,
    });

  } catch (error) {
    logger.error("CREATE_BLOG_TAG_ERROR", error);

    // Log failed attempt due to server error
    setImmediate(async () => {
      try {
        await BlogActivityService.logActivity({
          user: req.user?._id,
          activityType: "tag_created",
          action: `Failed to create tag "${name}" - server error`,
          description: `Tag creation failed due to server error: ${error.message}`,
          status: "failed",
          priority: "high",
          metadata: {
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get("User-Agent"),
            endpoint: req.originalUrl,
            method: req.method,
            source: "web",
            error: error.message,
            stack: error.stack,
            requestData: req.body,
          },
        });
      } catch (activityError) {
        logger.error("Error logging failed tag creation activity:", activityError);
      }
    });

    res.status(500).json({
      message: "Failed to create tag",
      status: "error",
      error: error.message,
    });
  }
};

/**********************************
  Get all blogBlogTags
***********************************/
exports.getAllBlogTags = async (req, res) => {
  try {
    const blogBlogTags = await BlogTagService.findAllBlogTags();

    res.status(200).json(blogBlogTags);
  } catch (error) {
    console.log("GET_ALL_BLOG_TAGS_ERROR", error);
  }
};

/**********************************
  Get all blogTags paginated with search
***********************************/
exports.getBlogTagsPaginatedWithSearch = async (req, res) => {
  try {
    const { page, perPage, searchText } = req.query;

    const searchParams = { searchText };

    const blogTags = await BlogTagService.findAllBlogTagsPaginatedWithSearch(
      parseInt(page),
      parseInt(perPage),
      searchParams
    );

    // Total number of blog tags
    const totalTags = await BlogTagService.countAllBlogTags(searchParams);
    // Total number of pages (rounded up)
    const totalPages = Math.ceil(totalTags / perPage);

    const pagination = {
      page: parseInt(page),
      perPage: parseInt(perPage),
      totalTags,
      totalPages,
    };

    res.status(200).json({
      blogTags: blogTags,
      paginationData: pagination,
    });
  } catch (error) {
    console.log("GET_BLOG_TAGS_PAGINATED_ERROR", error);
    res.status(500).json({
      message: "Error fetching blog tags",
      status: "error",
    });
  }
};

/**********************************
  Get a blogBlogTag by id
***********************************/
exports.getBlogTagById = async (req, res) => {
  try {
    const blogBlogTag = await BlogTagService.findBlogTagById(req.params.id);

    // If no blogBlogTag found return 404
    if (!blogBlogTag) {
      return res.status(404).json({
        message: "No blogBlogTag found",
        status: "error",
      });
    }

    res.status(200).json(blogBlogTag);
  } catch (error) {
    console.log("GET_BLOG_TAG_BY_ID_ERROR", error);
  }
};

/**********************************
  Update a blogBlogTag by id
***********************************/
exports.updateBlogTagById = async (req, res) => {
  const { name } = req.body;
  const tagId = req.params.id;

  // Validate request
  if (!name) {
    // Log failed attempt
    setImmediate(async () => {
      try {
        await BlogActivityService.logActivity({
          user: req.user?._id,
          activityType: "tag_updated",
          action: "Failed to update tag - missing name",
          description: "Tag update failed due to validation error: missing name",
          status: "failed",
          priority: "normal",
          metadata: {
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get("User-Agent"),
            endpoint: req.originalUrl,
            method: req.method,
            source: "web",
            error: "Missing tag name",
            tagId: tagId,
            requestData: req.body,
          },
        });
      } catch (activityError) {
        logger.error("Error logging failed tag update activity:", activityError);
      }
    });

    return res.status(400).json({
      message: "Please enter the blogBlogTag name",
      status: "error",
    });
  }

  try {
    // Get the original tag data before update
    const originalTag = await BlogTagService.findBlogTagById(tagId);

    if (!originalTag) {
      // Log failed attempt due to tag not found
      setImmediate(async () => {
        try {
          await BlogActivityService.logActivity({
            user: req.user?._id,
            activityType: "tag_updated",
            action: `Failed to update tag - tag not found`,
            description: `Tag update failed: No tag found with ID ${tagId}`,
            status: "failed",
            priority: "normal",
            metadata: {
              ipAddress: req.ip || req.connection.remoteAddress,
              userAgent: req.get("User-Agent"),
              endpoint: req.originalUrl,
              method: req.method,
              source: "web",
              error: "Tag not found",
              attemptedTagId: tagId,
              requestData: req.body,
            },
          });
        } catch (activityError) {
          logger.error("Error logging failed tag update activity:", activityError);
        }
      });

      return res.status(404).json({
        message: "No blogBlogTag found",
        status: "error",
      });
    }

    // Check if new name conflicts with existing tag (excluding current tag)
    if (name !== originalTag.name) {
      const existingTag = await BlogTagService.findOneBlogTag({ 
        name,
        _id: { $ne: tagId }
      });

      if (existingTag) {
        // Log failed attempt due to duplicate name
        setImmediate(async () => {
          try {
            await BlogActivityService.logActivity({
              blogTag: originalTag._id,
              user: req.user?._id,
              activityType: "tag_updated",
              action: `Failed to update tag "${originalTag.name}" - name conflict`,
              description: `Tag update failed: A tag with the name "${name}" already exists`,
              status: "failed",
              priority: "normal",
              metadata: {
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get("User-Agent"),
                endpoint: req.originalUrl,
                method: req.method,
                source: "web",
                error: "Duplicate tag name",
                originalName: originalTag.name,
                attemptedName: name,
                conflictingTagId: existingTag._id.toString(),
              },
            });
          } catch (activityError) {
            logger.error("Error logging failed tag update activity:", activityError);
          }
        });

        return res.status(400).json({
          message: "A tag with this name already exists",
          status: "error",
        });
      }
    }

    // Perform the update
    const updatedTag = await BlogTagService.findBlogTagByIdAndUpdate(tagId, req.body);

    // Log successful tag update
    setImmediate(async () => {
      try {
        await BlogActivityService.logTagUpdated(updatedTag, originalTag, req.user, {
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get("User-Agent"),
          endpoint: req.originalUrl,
          method: req.method,
          source: "web",
          requestData: req.body,
          changedFields: Object.keys(req.body),
        });
        
        logger.info(`Tag "${updatedTag.name}" updated successfully by user ${req.user?.name || req.user?.email || 'unknown'}`);
      } catch (activityError) {
        logger.error("Error logging tag update activity:", activityError);
      }
    });

    res.status(200).json({
      message: "Tag updated successfully",
      status: "success",
      data: updatedTag,
    });

  } catch (error) {
    logger.error("UPDATE_BLOG_TAG_ERROR", error);

    // Log failed attempt due to server error
    setImmediate(async () => {
      try {
        await BlogActivityService.logActivity({
          user: req.user?._id,
          activityType: "tag_updated",
          action: `Failed to update tag - server error`,
          description: `Tag update failed due to server error: ${error.message}`,
          status: "failed",
          priority: "high",
          metadata: {
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get("User-Agent"),
            endpoint: req.originalUrl,
            method: req.method,
            source: "web",
            error: error.message,
            stack: error.stack,
            tagId: tagId,
            requestData: req.body,
          },
        });
      } catch (activityError) {
        logger.error("Error logging failed tag update activity:", activityError);
      }
    });

    res.status(500).json({
      message: "Failed to update tag",
      status: "error",
      error: error.message,
    });
  }
};

/**********************************
  Delete a blogBlogTag by id
***********************************/
exports.deleteBlogTagById = async (req, res) => {
  const tagId = req.params.id;

  try {
    // Get the tag data before deletion for logging
    const tagToDelete = await BlogTagService.findBlogTagById(tagId);

    if (!tagToDelete) {
      // Log failed attempt due to tag not found
      setImmediate(async () => {
        try {
          await BlogActivityService.logActivity({
            user: req.user?._id,
            activityType: "tag_deleted",
            action: `Failed to delete tag - tag not found`,
            description: `Tag deletion failed: No tag found with ID ${tagId}`,
            status: "failed",
            priority: "normal",
            metadata: {
              ipAddress: req.ip || req.connection.remoteAddress,
              userAgent: req.get("User-Agent"),
              endpoint: req.originalUrl,
              method: req.method,
              source: "web",
              error: "Tag not found",
              attemptedTagId: tagId,
            },
          });
        } catch (activityError) {
          logger.error("Error logging failed tag deletion activity:", activityError);
        }
      });

      return res.status(404).json({
        message: "No blogBlogTag found",
        status: "error",
      });
    }

    // Check if tag has associated blogs before deletion
    const associatedBlogs = await BlogService.countBlogsByTag(tagId);

    if (associatedBlogs > 0) {
      // Log failed attempt due to associated blogs
      setImmediate(async () => {
        try {
          await BlogActivityService.logActivity({
            blogTag: tagToDelete._id,
            user: req.user?._id,
            activityType: "tag_deleted",
            action: `Failed to delete tag "${tagToDelete.name}" - has associated blogs`,
            description: `Tag deletion failed: Tag "${tagToDelete.name}" has ${associatedBlogs} associated blog(s)`,
            status: "failed",
            priority: "normal",
            metadata: {
              ipAddress: req.ip || req.connection.remoteAddress,
              userAgent: req.get("User-Agent"),
              endpoint: req.originalUrl,
              method: req.method,
              source: "web",
              error: "Tag has associated blogs",
              tagName: tagToDelete.name,
              associatedBlogsCount: associatedBlogs,
            },
          });
        } catch (activityError) {
          logger.error("Error logging failed tag deletion activity:", activityError);
        }
      });

      return res.status(400).json({
        message: `Cannot delete tag "${tagToDelete.name}". It has ${associatedBlogs} associated blog(s). Please remove the tag from blogs first.`,
        status: "error",
        associatedBlogsCount: associatedBlogs,
      });
    }

    // Perform the deletion
    const deletedTag = await BlogTagService.findBlogTagByIdAndDelete(tagId);

    // Log successful tag deletion
    setImmediate(async () => {
      try {
        await BlogActivityService.logTagDeleted(tagToDelete, req.user, {
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get("User-Agent"),
          endpoint: req.originalUrl,
          method: req.method,
          source: "web",
          deletionConfirmed: true,
          associatedBlogsChecked: true,
        });
        
        logger.info(`Tag "${tagToDelete.name}" deleted successfully by user ${req.user?.name || req.user?.email || 'unknown'}`);
      } catch (activityError) {
        logger.error("Error logging tag deletion activity:", activityError);
      }
    });

    res.status(200).json({
      message: "Tag deleted successfully",
      status: "success",
      data: deletedTag,
    });

  } catch (error) {
    logger.error("DELETE_BLOG_TAG_BY_ID_ERROR", error);

    // Log failed attempt due to server error
    setImmediate(async () => {
      try {
        await BlogActivityService.logActivity({
          user: req.user?._id,
          activityType: "tag_deleted",
          action: `Failed to delete tag - server error`,
          description: `Tag deletion failed due to server error: ${error.message}`,
          status: "failed",
          priority: "high",
          metadata: {
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get("User-Agent"),
            endpoint: req.originalUrl,
            method: req.method,
            source: "web",
            error: error.message,
            stack: error.stack,
            tagId: tagId,
          },
        });
      } catch (activityError) {
        logger.error("Error logging failed tag deletion activity:", activityError);
      }
    });

    res.status(500).json({
      message: "Failed to delete tag",
      status: "error",
      error: error.message,
    });
  }
};
