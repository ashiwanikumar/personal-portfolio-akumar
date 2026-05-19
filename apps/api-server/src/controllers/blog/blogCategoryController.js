// ** SERVICES ** //
const BlogCategoryService = require("@services/blog/blogCategoryService");
const BlogActivityService = require("@services/blog/blogActivityService");
const { BlogService } = require("@services/blog/blogService");

// ** UTILS ** //
const logger = require("@utils/logger");

/**********************************
  Create a blogCategory
***********************************/
exports.createBlogCategory = async (req, res) => {
  const { name } = req.body;

  // Validate request
  if (!name) {
    // Log failed attempt
    setImmediate(async () => {
      try {
        await BlogActivityService.logActivity({
          user: req.user?._id,
          activityType: "category_created",
          action: "Failed to create category - missing name",
          description: "Category creation failed due to validation error: missing name",
          status: "failed",
          priority: "normal",
          metadata: {
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get("User-Agent"),
            endpoint: req.originalUrl,
            method: req.method,
            source: "web",
            error: "Missing category name",
            requestData: req.body,
          },
        });
      } catch (activityError) {
        logger.error("Error logging failed category creation activity:", activityError);
      }
    });

    return res.status(400).json({
      message: "Please enter the blogCategory name",
      status: "error",
    });
  }

  try {
    // Check if blogCategory name already exists
    const existingCategory = await BlogCategoryService.findOneBlogCategory({ name });

    if (existingCategory) {
      // Log failed attempt due to duplicate name
      setImmediate(async () => {
        try {
          await BlogActivityService.logActivity({
            user: req.user?._id,
            activityType: "category_created",
            action: `Failed to create category "${name}" - name already exists`,
            description: `Category creation failed: A category with the name "${name}" already exists`,
            status: "failed",
            priority: "normal",
            metadata: {
              ipAddress: req.ip || req.connection.remoteAddress,
              userAgent: req.get("User-Agent"),
              endpoint: req.originalUrl,
              method: req.method,
              source: "web",
              error: "Duplicate category name",
              attemptedName: name,
              existingCategoryId: existingCategory._id.toString(),
            },
          });
        } catch (activityError) {
          logger.error("Error logging failed category creation activity:", activityError);
        }
      });

      return res.status(400).json({
        message: "BlogCategory name already exists",
        status: "error",
      });
    }

    // Create the new category
    const newBlogCategory = await BlogCategoryService.createBlogCategory(req.body);

    // Log successful category creation
    setImmediate(async () => {
      try {
        await BlogActivityService.logCategoryCreated(newBlogCategory, req.user, {
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get("User-Agent"),
          endpoint: req.originalUrl,
          method: req.method,
          source: "web",
          requestData: {
            name: req.body.name,
            description: req.body.description,
            color: req.body.color,
            parentCategory: req.body.parentCategory,
            isActive: req.body.isActive,
          },
        });
        
        logger.info(`Category "${newBlogCategory.name}" created successfully by user ${req.user?.name || req.user?.email || 'unknown'}`);
      } catch (activityError) {
        logger.error("Error logging category creation activity:", activityError);
      }
    });

    res.status(201).json({
      message: "Category created successfully",
      status: "success",
      data: newBlogCategory,
    });

  } catch (error) {
    logger.error("CREATE_BLOG_CATEGORY_ERROR", error);

    // Log failed attempt due to server error
    setImmediate(async () => {
      try {
        await BlogActivityService.logActivity({
          user: req.user?._id,
          activityType: "category_created",
          action: `Failed to create category "${name}" - server error`,
          description: `Category creation failed due to server error: ${error.message}`,
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
        logger.error("Error logging failed category creation activity:", activityError);
      }
    });

    res.status(500).json({
      message: "Failed to create category",
      status: "error",
      error: error.message,
    });
  }
};

/**********************************
  Get all blogBlogCategories
***********************************/
exports.getAllBlogCategories = async (req, res) => {
  try {
    const blogBlogCategories =
      await BlogCategoryService.findAllBlogCategories();

    res.status(200).json(blogBlogCategories);
  } catch (error) {
    console.log("GET_ALL_CATEGORIES_ERROR", error);
  }
};

/**********************************
  Get all blog categories paginated with search
***********************************/
exports.getBlogCategoriesPaginatedWithSearch = async (req, res) => {
  try {
    const { page, perPage, searchText } = req.query;

    const searchParams = { searchText };

    const blogCategories =
      await BlogCategoryService.findAllBlogCategoriesPaginatedWithSearch(
        parseInt(page),
        parseInt(perPage),
        searchParams
      );

    // Total number of blog categories
    const totalCategories = await BlogCategoryService.countAllBlogCategories(
      searchParams
    );
    // Total number of pages (rounded up)
    const totalPages = Math.ceil(totalCategories / perPage);

    const pagination = {
      page: parseInt(page),
      perPage: parseInt(perPage),
      totalCategories,
      totalPages,
    };

    res.status(200).json({
      blogCategories: blogCategories,
      paginationData: pagination,
    });
  } catch (error) {
    console.log("GET_BLOG_CATEGORIES_PAGINATED_ERROR", error);
    res.status(500).json({
      message: "Error fetching blog categories",
      status: "error",
    });
  }
};

/**********************************
  Get a blogCategory by id
***********************************/
exports.getBlogCategoryById = async (req, res) => {
  try {
    const blogCategory = await BlogCategoryService.findBlogCategoryById(
      req.params.id
    );

    // If no blogCategory found return 404
    if (!blogCategory) {
      return res.status(404).json({
        message: "No blogCategory found",
        status: "error",
      });
    }

    res.status(200).json(blogCategory);
  } catch (error) {
    console.log("GET_BLOG_CATEGORY_BY_ID_ERROR", error);
  }
};

/**********************************
  Update a blogCategory by id
***********************************/
exports.updateBlogCategoryById = async (req, res) => {
  const { name } = req.body;
  const categoryId = req.params.id;

  // Validate request
  if (!name) {
    // Log failed attempt
    setImmediate(async () => {
      try {
        await BlogActivityService.logActivity({
          user: req.user?._id,
          activityType: "category_updated",
          action: "Failed to update category - missing name",
          description: "Category update failed due to validation error: missing name",
          status: "failed",
          priority: "normal",
          metadata: {
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get("User-Agent"),
            endpoint: req.originalUrl,
            method: req.method,
            source: "web",
            error: "Missing category name",
            categoryId: categoryId,
            requestData: req.body,
          },
        });
      } catch (activityError) {
        logger.error("Error logging failed category update activity:", activityError);
      }
    });

    return res.status(400).json({
      message: "Please enter the blogCategory name",
      status: "error",
    });
  }

  try {
    // Get the original category data before update
    const originalCategory = await BlogCategoryService.findBlogCategoryById(categoryId);

    if (!originalCategory) {
      // Log failed attempt due to category not found
      setImmediate(async () => {
        try {
          await BlogActivityService.logActivity({
            user: req.user?._id,
            activityType: "category_updated",
            action: `Failed to update category - category not found`,
            description: `Category update failed: No category found with ID ${categoryId}`,
            status: "failed",
            priority: "normal",
            metadata: {
              ipAddress: req.ip || req.connection.remoteAddress,
              userAgent: req.get("User-Agent"),
              endpoint: req.originalUrl,
              method: req.method,
              source: "web",
              error: "Category not found",
              attemptedCategoryId: categoryId,
              requestData: req.body,
            },
          });
        } catch (activityError) {
          logger.error("Error logging failed category update activity:", activityError);
        }
      });

      return res.status(404).json({
        message: "No blogCategory found",
        status: "error",
      });
    }

    // Check if new name conflicts with existing category (excluding current category)
    if (name !== originalCategory.name) {
      const existingCategory = await BlogCategoryService.findOneBlogCategory({ 
        name,
        _id: { $ne: categoryId }
      });

      if (existingCategory) {
        // Log failed attempt due to duplicate name
        setImmediate(async () => {
          try {
            await BlogActivityService.logActivity({
              blogCategory: originalCategory._id,
              user: req.user?._id,
              activityType: "category_updated",
              action: `Failed to update category "${originalCategory.name}" - name conflict`,
              description: `Category update failed: A category with the name "${name}" already exists`,
              status: "failed",
              priority: "normal",
              metadata: {
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get("User-Agent"),
                endpoint: req.originalUrl,
                method: req.method,
                source: "web",
                error: "Duplicate category name",
                originalName: originalCategory.name,
                attemptedName: name,
                conflictingCategoryId: existingCategory._id.toString(),
              },
            });
          } catch (activityError) {
            logger.error("Error logging failed category update activity:", activityError);
          }
        });

        return res.status(400).json({
          message: "A category with this name already exists",
          status: "error",
        });
      }
    }

    // Perform the update
    const updatedCategory = await BlogCategoryService.findBlogCategoryByIdAndUpdate(
      categoryId,
      req.body
    );

    // Log successful category update
    setImmediate(async () => {
      try {
        await BlogActivityService.logCategoryUpdated(updatedCategory, originalCategory, req.user, {
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get("User-Agent"),
          endpoint: req.originalUrl,
          method: req.method,
          source: "web",
          requestData: req.body,
          changedFields: Object.keys(req.body),
        });
        
        logger.info(`Category "${updatedCategory.name}" updated successfully by user ${req.user?.name || req.user?.email || 'unknown'}`);
      } catch (activityError) {
        logger.error("Error logging category update activity:", activityError);
      }
    });

    res.status(200).json({
      message: "Category updated successfully",
      status: "success",
      data: updatedCategory,
    });

  } catch (error) {
    logger.error("UPDATE_BLOG_CATEGORY_ERROR", error);

    // Log failed attempt due to server error
    setImmediate(async () => {
      try {
        await BlogActivityService.logActivity({
          user: req.user?._id,
          activityType: "category_updated",
          action: `Failed to update category - server error`,
          description: `Category update failed due to server error: ${error.message}`,
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
            categoryId: categoryId,
            requestData: req.body,
          },
        });
      } catch (activityError) {
        logger.error("Error logging failed category update activity:", activityError);
      }
    });

    res.status(500).json({
      message: "Failed to update category",
      status: "error",
      error: error.message,
    });
  }
};

/**********************************
  Delete a blogCategory by id
***********************************/
exports.deleteBlogCategoryById = async (req, res) => {
  const categoryId = req.params.id;

  try {
    // Get the category data before deletion for logging
    const categoryToDelete = await BlogCategoryService.findBlogCategoryById(categoryId);

    if (!categoryToDelete) {
      // Log failed attempt due to category not found
      setImmediate(async () => {
        try {
          await BlogActivityService.logActivity({
            user: req.user?._id,
            activityType: "category_deleted",
            action: `Failed to delete category - category not found`,
            description: `Category deletion failed: No category found with ID ${categoryId}`,
            status: "failed",
            priority: "normal",
            metadata: {
              ipAddress: req.ip || req.connection.remoteAddress,
              userAgent: req.get("User-Agent"),
              endpoint: req.originalUrl,
              method: req.method,
              source: "web",
              error: "Category not found",
              attemptedCategoryId: categoryId,
            },
          });
        } catch (activityError) {
          logger.error("Error logging failed category deletion activity:", activityError);
        }
      });

      return res.status(404).json({
        message: "No blogCategory found",
        status: "error",
      });
    }

    // Check if category has associated blogs before deletion
    const associatedBlogs = await BlogService.countBlogsByCategory(categoryId);

    if (associatedBlogs > 0) {
      // Log failed attempt due to associated blogs
      setImmediate(async () => {
        try {
          await BlogActivityService.logActivity({
            blogCategory: categoryToDelete._id,
            user: req.user?._id,
            activityType: "category_deleted",
            action: `Failed to delete category "${categoryToDelete.name}" - has associated blogs`,
            description: `Category deletion failed: Category "${categoryToDelete.name}" has ${associatedBlogs} associated blog(s)`,
            status: "failed",
            priority: "normal",
            metadata: {
              ipAddress: req.ip || req.connection.remoteAddress,
              userAgent: req.get("User-Agent"),
              endpoint: req.originalUrl,
              method: req.method,
              source: "web",
              error: "Category has associated blogs",
              categoryName: categoryToDelete.name,
              associatedBlogsCount: associatedBlogs,
            },
          });
        } catch (activityError) {
          logger.error("Error logging failed category deletion activity:", activityError);
        }
      });

      return res.status(400).json({
        message: `Cannot delete category "${categoryToDelete.name}". It has ${associatedBlogs} associated blog(s). Please reassign or delete the blogs first.`,
        status: "error",
        associatedBlogsCount: associatedBlogs,
      });
    }

    // Perform the deletion
    const deletedCategory = await BlogCategoryService.findBlogCategoryByIdAndDelete(categoryId);

    // Log successful category deletion
    setImmediate(async () => {
      try {
        await BlogActivityService.logCategoryDeleted(categoryToDelete, req.user, {
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get("User-Agent"),
          endpoint: req.originalUrl,
          method: req.method,
          source: "web",
          deletionConfirmed: true,
          associatedBlogsChecked: true,
        });
        
        logger.info(`Category "${categoryToDelete.name}" deleted successfully by user ${req.user?.name || req.user?.email || 'unknown'}`);
      } catch (activityError) {
        logger.error("Error logging category deletion activity:", activityError);
      }
    });

    res.status(200).json({
      message: "Category deleted successfully",
      status: "success",
      data: deletedCategory,
    });

  } catch (error) {
    logger.error("DELETE_BLOG_CATEGORY_BY_ID_ERROR", error);

    // Log failed attempt due to server error
    setImmediate(async () => {
      try {
        await BlogActivityService.logActivity({
          user: req.user?._id,
          activityType: "category_deleted",
          action: `Failed to delete category - server error`,
          description: `Category deletion failed due to server error: ${error.message}`,
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
            categoryId: categoryId,
          },
        });
      } catch (activityError) {
        logger.error("Error logging failed category deletion activity:", activityError);
      }
    });

    res.status(500).json({
      message: "Failed to delete category",
      status: "error",
      error: error.message,
    });
  }
};
