// ** SERVICES ** //
const {
  BlogService,
  getPublicBlogBySlug,
} = require("@services/blog/blogService");
const blogNotificationService = require("@services/blog/blogNotificationService");
const BlogActivityService = require("@services/blog/blogActivityService");

// ** EMAIL SERVICES ** //
const {
  sendBlogApprovalNotification,
  sendBlogStatusUpdateNotification,
  sendBlogApprovalEmail,
} = require("@utils/blog/sendBlogApprovalEmail");
const {
  blogApprovalNotificationEmailTemplate,
  blogStatusUpdateEmailTemplate,
  blogApprovedWithScheduleEmailTemplate,
} = require("@mails/blog/blogApprovalEmailTemplate");
const {
  blogPublicationConfirmationEmailTemplate,
} = require("@mails/blog/blogScheduleEmailTemplate");

// ** UTILS ** //
const logger = require("@utils/logger");

/**********************************
  Create a blog
***********************************/
exports.createBlog = async (req, res) => {
  try {
    // Validate request
    if (!req.body.title || !req.body.content) {
      return res.status(400).send({
        message: "Please fill all the required fields",
      });
    }
    // Set the author of the blog to the logged in user
    req.body.author = req.user._id;

    // Set the version to v2
    req.body.version = "v2";

    const blog = await BlogService.createBlog(req.body);

    // Log blog creation activity
    setImmediate(async () => {
      try {
        await BlogActivityService.logBlogCreated(blog, req.user, {
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get("User-Agent"),
          endpoint: req.originalUrl,
          method: req.method,
          source: "web",
        });
      } catch (activityError) {
        logger.error("Error logging blog creation activity:", activityError);
      }
    });

    // Send email notifications for new blog submissions asynchronously
    const shouldNotify =
      req.body.status !== "draft" && req.body.status !== "published";

    if (shouldNotify || req.body.requestApproval) {
      setImmediate(async () => {
        try {
          // Get author email for deduplication
          const authorEmail = req.user?.email;

          // Get super admin emails for approval notifications
          const allSuperAdminEmails =
            await blogNotificationService.getSuperAdminUsers({
              emailsOnly: true,
              includeDisabled: false,
              includeInactive: true, // Include inactive users for super admin notifications
            });

          // Remove author email from super admin notifications if author is also a super admin
          const superAdminEmails = authorEmail
            ? allSuperAdminEmails.filter(
                (email) => email.toLowerCase() !== authorEmail.toLowerCase()
              )
            : allSuperAdminEmails;

          if (superAdminEmails.length > 0) {
            const approvalData = {
              status: "pending",
              approverName: "System",
              action: "new_submission",
              reviewUrl: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/admin/blogs/${blog._id}/review`,
            };

            // Populate author details for email
            const populatedBlog = await BlogService.findBlogById(blog._id);

            const template = blogApprovalNotificationEmailTemplate(
              populatedBlog,
              approvalData
            );
            await sendBlogApprovalNotification(
              populatedBlog,
              template,
              superAdminEmails,
              {
                ...approvalData,
                // Scheduling information
                scheduledPublishAt:
                  populatedBlog.scheduledAt || populatedBlog.publishAt,
                isScheduled: populatedBlog.isScheduled,
                scheduleType: populatedBlog.scheduleType,
              }
            );

            logger.info(
              `New blog approval notification sent to ${superAdminEmails.length} super admins for blog: ${blog.title}`
            );
          } else if (
            authorEmail &&
            allSuperAdminEmails
              .map((e) => e.toLowerCase())
              .includes(authorEmail.toLowerCase())
          ) {
            logger.info(
              `Skipped new blog super admin notification - author ${authorEmail} is a super admin (would be duplicate)`
            );
          }
        } catch (emailError) {
          // Log email errors but don't fail the blog creation
          logger.error(
            "Error sending new blog notification emails:",
            emailError
          );
        }
      });
    }

    res.status(200).json({
      ...blog.toObject(),
      message: "Blog created successfully",
      emailNotificationsSent: true,
    });
  } catch (error) {
    logger.error("CREATE_BLOG_ERROR", error);
    res.status(500).json({
      message: "Error creating blog",
      status: "error",
    });
  }
};

/**********************************
  Get all blogs
***********************************/
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await BlogService.findAllBlogs();
    res.status(200).json(blogs);
  } catch (error) {
    console.log("GET_ALL_BLOGS_ERROR", error);
    res.status(500).json({
      message: "Error",
      status: "error",
    });
  }
};

/****************************************
  Get all blogs paginated with search
*****************************************/
exports.getBlogsPaginatedWithSearch = async (req, res) => {
  try {
    const { page, perPage, searchText } = req.query;

    const searchParams = { searchText };

    const blogs = await BlogService.findAllBlogsPaginatedWithSearch(
      parseInt(page),
      parseInt(perPage),
      searchParams
    );

    // Total number of blogs
    const totalBlogs = await BlogService.countAllBlogs(searchParams);
    // Total number of pages (rounded up)
    const totalPages = Math.ceil(totalBlogs / perPage);

    const pagination = {
      page: parseInt(page),
      perPage: parseInt(perPage),
      totalBlogs,
      totalPages,
    };

    res.status(200).json({
      blogs: blogs,
      paginationData: pagination,
    });
  } catch (error) {
    console.log("GET_BLOGS_PAGINATED_ERROR", error);
    res.status(500).json({
      message: "Error fetching blogs",
      status: "error",
    });
  }
};

/**********************************
  Get all blogs paginated
***********************************/
exports.getBlogsPaginated = async (req, res) => {
  try {
    const { page } = req.query;
    const { blogs, tags, blogCategories, recentBlogs } =
      await BlogService.findAllBlogsCatsTags();

    // Number of blogs per page
    const perPage = 4;
    // Total number of blogs
    const totalBlogs = blogs.length;
    // Total number of pages (rounded up)
    const totalPages = Math.ceil(totalBlogs / perPage);
    // Start index of blogs to be displayed on the current page
    const start = (page - 1) * perPage;
    // End index of blogs to be displayed on the current page
    let end = start + perPage;

    if (end > totalBlogs) {
      end = totalBlogs;
    }

    // Slice only if number of blogs is greater than the number of blogs per page
    const paginatedBlogs =
      totalBlogs > perPage ? blogs.slice(start, end) : blogs;

    const pagination = {
      page: parseInt(page),
      perPage,
      totalBlogs,
      totalPages,
    };

    res.status(200).json({
      blogs: paginatedBlogs,
      paginationData: pagination,
      tags,
      blogCategories,
      recentBlogs,
    });
  } catch (error) {
    console.log("GET_ALL_BLOGS_ERROR", error);
    res.status(500).json({
      message: "Error",
      status: "error",
    });
  }
};

/**********************************
  Get a blog by id
***********************************/
exports.getBlogById = async (req, res) => {
  try {
    const blog = await BlogService.findBlogById(req.params.id);
    res.status(200).json(blog);
  } catch (error) {
    console.log("GET_BLOG_BY_ID_ERROR", error);
    res.status(500).json({
      message: "Error",
      status: "error",
    });
  }
};

/**********************************
  Update a blog by id
***********************************/
exports.updateBlogById = async (req, res) => {
  try {
    // Validate request
    if (!req.body.title || !req.body.content) {
      return res.status(400).send({
        message: "Please fill all the required fields",
      });
    }

    // Get original blog before update for activity logging
    const originalBlog = await BlogService.findBlogById(req.params.id);

    // Update the version to v2
    req.body.version = "v2";

    const blog = await BlogService.updateBlogById(req.params.id, req.body);

    // Log blog update activity
    setImmediate(async () => {
      try {
        await BlogActivityService.logBlogUpdated(blog, originalBlog, req.user, {
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get("User-Agent"),
          endpoint: req.originalUrl,
          method: req.method,
          source: "web",
        });
      } catch (activityError) {
        logger.error("Error logging blog update activity:", activityError);
      }
    });

    res.status(200).json(blog);
  } catch (error) {
    console.log("UPDATE_BLOG_BY_ID_ERROR", error);
    res.status(500).json({
      message: "Error",
      status: "error",
    });
  }
};

/**********************************
  Delete a blog by id
***********************************/
exports.deleteBlogById = async (req, res) => {
  try {
    await BlogService.deleteBlogById(req.params.id);

    res.status(200).json({
      message: "Blog deleted",
      status: "success",
    });
  } catch (error) {
    console.log("DELETE_BLOG_BY_ID_ERROR", error);
    res.status(500).json({
      message: "Error",
      status: "error",
    });
  }
};

/**********************************
  Upload blog cover image to S3
***********************************/
exports.uploadBlogCoverImage = async (req, res) => {
  try {
    res.status(200).json({
      message: "Cover image uploaded successfully",
      url: req.uploadUrl,
      cloudFrontUrl: req.cloudFrontUrl,
      s3Key: req.s3Key,
      originalName: req.uploadOgName,
      size: req.uploadItemSize,
      type: req.uploadItemType,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
    console.log("UPLOAD_BLOG_COVER_IMAGE_ERROR", error);
  }
};

/**********************************
  Upload blog content image to S3
***********************************/
exports.uploadBlogContentImage = async (req, res) => {
  try {
    res.status(200).json({
      message: "Content image uploaded successfully",
      url: req.uploadUrl,
      cloudFrontUrl: req.cloudFrontUrl,
      s3Key: req.s3Key,
      originalName: req.uploadOgName,
      size: req.uploadItemSize,
      type: req.uploadItemType,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
    console.log("UPLOAD_BLOG_CONTENT_IMAGE_ERROR", error);
  }
};

/**********************************
  Upload blog media (video) to S3
***********************************/
exports.uploadBlogMedia = async (req, res) => {
  try {
    res.status(200).json({
      message: "Media uploaded successfully",
      url: req.uploadUrl,
      cloudFrontUrl: req.cloudFrontUrl,
      s3Key: req.s3Key,
      originalName: req.uploadOgName,
      size: req.uploadItemSize,
      type: req.uploadItemType,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
    console.log("UPLOAD_BLOG_MEDIA_ERROR", error);
  }
};

/****************************************
  Update a blog approval by id
*****************************************/
exports.updateBlogApprovalById = async (req, res) => {
  try {
    const { approved, comments } = req.body;
    const blogId = req.params.id;
    const approverName = req.user?.name || req.user?.email || "Admin";

    // Get blog details before update
    const existingBlog = await BlogService.findBlogById(blogId);
    if (!existingBlog) {
      return res.status(404).json({
        message: "Blog not found",
        status: "error",
      });
    }

    // Update blog approval status
    const blog = await BlogService.findBlogByIdAndUpdateApprovalStatus(
      blogId,
      approved
    );

    // Log blog approval activity
    setImmediate(async () => {
      try {
        await BlogActivityService.logBlogApproval(blog, req.user, approved, comments, {
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get("User-Agent"),
          endpoint: req.originalUrl,
          method: req.method,
          source: "web",
        });
      } catch (activityError) {
        logger.error("Error logging blog approval activity:", activityError);
      }
    });

    // Determine status for notifications
    const status = approved ? "approved" : "rejected";
    const statusData = {
      status,
      approverName,
      comments: comments || "",
      blogUrl: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/blogs/${blogId}`,
    };

    // Send email notifications asynchronously (don't wait for completion)
    setImmediate(async () => {
      try {
        let authorEmail = null;

        // 1. Notify the blog author about the status update
        if (blog.author && (blog.author.email || blog.author._id)) {
          authorEmail =
            blog.author.email ||
            (await BlogService.getBlogAuthorEmail(blog.author._id));

          if (authorEmail) {
            const authorTemplate = blogStatusUpdateEmailTemplate(
              blog,
              statusData
            );
            await sendBlogStatusUpdateNotification(
              blog,
              authorTemplate,
              authorEmail,
              {
                ...statusData,
                // Additional data for email activity logging
                triggeredBy: req.user._id,
                blogAuthorId: blog.author._id || blog.author,
                blogStatus: blog.status,
                previousStatus: existingBlog.status,
                previousApproval: existingBlog.approved,
                recipientNames: {
                  [authorEmail]:
                    blog.author.name ||
                    blog.author.firstName + " " + blog.author.lastName ||
                    authorEmail.split("@")[0],
                },
                recipientRoles: { [authorEmail]: "author" },
                userAgent: req.get("User-Agent"),
                ipAddress: req.ip || req.connection.remoteAddress,
                // Scheduling information
                scheduledPublishAt: blog.scheduledAt || blog.publishAt,
                isScheduled: blog.isScheduled,
                scheduleType: blog.scheduleType,
              }
            );
            logger.info(
              `Blog status update email sent to author: ${authorEmail}`
            );
          }
        }

        // 2. Notify super admins about the approval action (excluding the author if they're also a super admin)
        const allSuperAdminEmails =
          await blogNotificationService.getSuperAdminUsers({
            emailsOnly: true,
            includeDisabled: false,
            includeInactive: true, // Include inactive users for super admin notifications
          });

        // Filter out null/undefined emails and remove author email from super admin notifications to avoid duplicates
        const validSuperAdminEmails = allSuperAdminEmails.filter(email => 
          email && typeof email === 'string' && email.includes('@')
        );
        
        const superAdminEmails = authorEmail
          ? validSuperAdminEmails.filter(
              (email) => email.toLowerCase() !== authorEmail.toLowerCase()
            )
          : validSuperAdminEmails;

        if (superAdminEmails.length > 0) {
          const approvalData = {
            status,
            approverName,
            comments: comments || "",
            action: "approval_update",
            reviewUrl: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/admin/blogs/${blogId}/review`,
          };

          const adminTemplate = blogApprovalNotificationEmailTemplate(
            blog,
            approvalData
          );

          // Prepare recipient data for logging
          const recipientNames = {};
          const recipientRoles = {};
          superAdminEmails.forEach((email) => {
            recipientNames[email] = email.split("@")[0]; // Default name from email
            recipientRoles[email] = "super_admin";
          });

          await sendBlogApprovalNotification(
            blog,
            adminTemplate,
            superAdminEmails,
            {
              ...approvalData,
              // Additional data for email activity logging
              triggeredBy: req.user._id,
              blogAuthorId: blog.author._id || blog.author,
              blogStatus: blog.status,
              previousStatus: existingBlog.status,
              previousApproval: existingBlog.approved,
              recipientNames,
              recipientRoles,
              userAgent: req.get("User-Agent"),
              ipAddress: req.ip || req.connection.remoteAddress,
              // Scheduling information
              scheduledPublishAt: blog.scheduledAt || blog.publishAt,
              isScheduled: blog.isScheduled,
              scheduleType: blog.scheduleType,
            }
          );
          logger.info(
            `Blog approval notification sent to ${superAdminEmails.length} super admins`
          );
        } else if (
          authorEmail &&
          allSuperAdminEmails.includes(authorEmail.toLowerCase())
        ) {
          logger.info(
            `Skipped duplicate super admin notification - author ${authorEmail} already notified`
          );
        }

        // 3. Check if blog was approved and decide on email type
        if (approved) {
          // Check if blog is scheduled for future publication
          if (blog.isScheduled && blog.publishAt && new Date(blog.publishAt) > new Date()) {
            // Blog is approved but scheduled - send approved with schedule email
            const approvedScheduleTemplate = blogApprovedWithScheduleEmailTemplate(
              blog,
              {
                approverName,
                comments: comments || "",
                scheduledAt: blog.publishAt
              }
            );

            // Send to author
            if (authorEmail) {
              // Format current date and time
              const now = new Date();
              const dateTime = now.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                timeZoneName: 'short'
              });

              await sendBlogApprovalEmail({
                to: authorEmail,
                subject: `✅ Blog Approved & Scheduled: "${blog.title}" - ${dateTime}`,
                html: approvedScheduleTemplate,
                emailType: "BlogApprovedWithSchedule",
                notificationType: "blog_approved_scheduled",
                blogId: blog._id,
                blogTitle: blog.title,
                blogAuthor: blog.author?.name || "Author",
                blogSlug: blog.slug,
                scheduledPublishAt: blog.publishAt,
                isScheduled: true,
                triggeredBy: req.user._id,
                userAgent: req.get("User-Agent"),
                ipAddress: req.ip || req.connection.remoteAddress,
              });
              logger.info(
                `Blog approved with schedule notification sent to author: ${authorEmail}`
              );
            }

            // Send to super admins (excluding author)
            if (superAdminEmails.length > 0) {
              for (const adminEmail of superAdminEmails) {
                // Validate email before sending
                if (adminEmail && typeof adminEmail === 'string' && adminEmail.includes('@')) {
                  await sendBlogApprovalEmail({
                    to: adminEmail,
                    subject: `✅ Blog Approved & Scheduled: "${blog.title}" - ${dateTime}`,
                    html: approvedScheduleTemplate,
                    emailType: "BlogApprovedWithSchedule",
                    notificationType: "blog_approved_scheduled_admin",
                    blogId: blog._id,
                    blogTitle: blog.title,
                    blogAuthor: blog.author?.name || "Author",
                    blogSlug: blog.slug,
                    scheduledPublishAt: blog.publishAt,
                    isScheduled: true,
                    triggeredBy: req.user._id,
                    userAgent: req.get("User-Agent"),
                    ipAddress: req.ip || req.connection.remoteAddress,
                  });
                } else {
                  logger.warn(`Invalid admin email for blog approval with schedule notification: ${adminEmail}`);
                }
              }
              logger.info(
                `Blog approved with schedule notification sent to ${superAdminEmails.length} super admins`
              );
            }
          } else if (blog.status === "published") {
            // Blog is approved and published immediately - send publication confirmation
            const publicationTemplate = blogPublicationConfirmationEmailTemplate(
              blog,
              { wasScheduled: false }
            );

            // Send to author
            if (authorEmail) {
              await sendBlogApprovalEmail({
                to: authorEmail,
                subject: publicationTemplate.subject,
                html: publicationTemplate.body,
                emailType: "BlogPublication",
                notificationType: "blog_published",
                blogId: blog._id,
                blogTitle: blog.title,
                blogAuthor: blog.author?.name || "Author",
                blogSlug: blog.slug,
                publishedAt: new Date(),
                wasScheduled: false,
                triggeredBy: req.user._id,
                userAgent: req.get("User-Agent"),
                ipAddress: req.ip || req.connection.remoteAddress,
              });
              logger.info(
                `Blog publication confirmation sent to author: ${authorEmail}`
              );
            }

            // Send to super admins (excluding author)
            if (superAdminEmails.length > 0) {
              for (const adminEmail of superAdminEmails) {
                // Validate email before sending
                if (adminEmail && typeof adminEmail === 'string' && adminEmail.includes('@')) {
                  await sendBlogApprovalEmail({
                    to: adminEmail,
                    subject: publicationTemplate.subject,
                    html: publicationTemplate.body,
                    emailType: "BlogPublication",
                    notificationType: "blog_published_admin",
                    blogId: blog._id,
                    blogTitle: blog.title,
                    blogAuthor: blog.author?.name || "Author",
                    blogSlug: blog.slug,
                    publishedAt: new Date(),
                    wasScheduled: false,
                    triggeredBy: req.user._id,
                    userAgent: req.get("User-Agent"),
                    ipAddress: req.ip || req.connection.remoteAddress,
                  });
                } else {
                  logger.warn(`Invalid admin email for blog publication notification: ${adminEmail}`);
                }
              }
              logger.info(
                `Blog publication confirmation sent to ${superAdminEmails.length} super admins`
              );
            }
          }
        }
      } catch (emailError) {
        // Log email errors but don't fail the approval process
        logger.error("Error sending blog approval emails:", emailError);
      }
    });

    res.status(200).json({
      ...blog.toObject(),
      message: `Blog ${approved ? "approved" : "rejected"} successfully`,
      emailNotificationsSent: true,
    });
  } catch (error) {
    logger.error("UPDATE_BLOG_APPROVAL_ERROR", error);
    res.status(500).json({
      message: "Error updating blog approval status",
      status: "error",
    });
  }
};

/**********************************
  Add media to blog
***********************************/
exports.addMediaToBlog = async (req, res) => {
  try {
    const { blogId } = req.params;

    // Create media object from uploaded file
    const mediaData = {
      url: req.uploadUrl,
      type: req.uploadItemType.startsWith("video/") ? "video" : "image",
      originalName: req.uploadOgName,
      size: req.uploadItemSize,
      mimeType: req.uploadItemType,
      s3Key: req.s3Key,
      cloudFrontUrl: req.cloudFrontUrl,
    };

    const updatedBlog = await BlogService.addMediaToBlog(blogId, mediaData);

    res.status(200).json({
      message: "Media added to blog successfully",
      media: mediaData,
      blog: updatedBlog,
    });
  } catch (error) {
    console.log("ADD_MEDIA_TO_BLOG_ERROR", error);
    res.status(500).json({
      message: "Error adding media to blog",
      error: error.message,
    });
  }
};

/**********************************
  Remove media from blog
***********************************/
exports.removeMediaFromBlog = async (req, res) => {
  try {
    const { blogId, mediaId } = req.params;

    const updatedBlog = await BlogService.removeMediaFromBlog(blogId, mediaId);

    res.status(200).json({
      message: "Media removed from blog successfully",
      blog: updatedBlog,
    });
  } catch (error) {
    console.log("REMOVE_MEDIA_FROM_BLOG_ERROR", error);
    res.status(500).json({
      message: "Error removing media from blog",
      error: error.message,
    });
  }
};

/**********************************
  Get blog media
***********************************/
exports.getBlogMedia = async (req, res) => {
  try {
    const { blogId } = req.params;

    const media = await BlogService.getBlogMedia(blogId);

    res.status(200).json({
      message: "Blog media retrieved successfully",
      media,
      count: media.length,
    });
  } catch (error) {
    console.log("GET_BLOG_MEDIA_ERROR", error);
    res.status(500).json({
      message: "Error retrieving blog media",
      error: error.message,
    });
  }
};

/**********************************
  Upload multiple blog images to S3
***********************************/
exports.uploadMultipleBlogImages = async (req, res) => {
  try {
    const uploadedImages = req.uploadedImages || [];

    res.status(200).json({
      message: "Images uploaded successfully",
      images: uploadedImages,
      count: req.uploadCount,
      totalSize: req.totalSize,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
    console.log("UPLOAD_MULTIPLE_BLOG_IMAGES_ERROR", error);
  }
};

// PUBLIC BLOG CONTROLLERS - No authentication required

/**********************************
  Get all public blogs
***********************************/
exports.getAllPublicBlogs = async (req, res) => {
  try {
    const blogs = await BlogService.findAllPublicBlogs();
    res.status(200).json(blogs);
  } catch (error) {
    console.log("GET_ALL_PUBLIC_BLOGS_ERROR", error);
    res.status(500).json({
      message: "Error fetching public blogs",
      status: "error",
    });
  }
};

/**********************************
  Get public blogs paginated
***********************************/
exports.getPublicBlogsPaginated = async (req, res) => {
  try {
    const { page = 1, perPage = 10 } = req.query;

    const { blogs, tags, blogCategories, recentBlogs } =
      await BlogService.findAllBlogsCatsTags();

    // Number of blogs per page
    const blogsPerPage = parseInt(perPage);
    // Total number of blogs
    const totalBlogs = blogs.length;
    // Total number of pages (rounded up)
    const totalPages = Math.ceil(totalBlogs / blogsPerPage);
    // Start index of blogs to be displayed on the current page
    const start = (parseInt(page) - 1) * blogsPerPage;
    // End index of blogs to be displayed on the current page
    let end = start + blogsPerPage;

    if (end > totalBlogs) {
      end = totalBlogs;
    }

    // Slice only if number of blogs is greater than the number of blogs per page
    const paginatedBlogs =
      totalBlogs > blogsPerPage ? blogs.slice(start, end) : blogs;

    // Remove scheduledAt, publishAt, unpublishAt from each blog
    const blogsSanitized = paginatedBlogs.map((blog) => {
      const { scheduledAt, publishAt, unpublishAt, ...rest } = blog.toObject
        ? blog.toObject()
        : blog;
      // Ensure slug is present
      return { ...rest, slug: rest.slug };
    });

    // Remove 'blogs' field from each blogCategory
    const blogCategoriesSanitized = blogCategories.map((cat) => {
      const { blogs, ...catRest } = cat;
      return catRest;
    });

    const pagination = {
      page: parseInt(page),
      perPage: blogsPerPage,
      totalBlogs,
      totalPages,
    };

    res.status(200).json({
      blogs: blogsSanitized, // content is included
      paginationData: pagination,
      tags,
      blogCategories: blogCategoriesSanitized,
      recentBlogs,
    });
  } catch (error) {
    console.log("GET_ALL_BLOGS_ERROR", error);
    res.status(500).json({
      message: "Error",
      status: "error",
    });
  }
};

/****************************************
  Get public blogs paginated with search
*****************************************/
exports.getPublicBlogsPaginatedWithSearch = async (req, res) => {
  try {
    const { page = 1, perPage = 10, searchText, category } = req.query;

    const searchParams = { searchText, category };

    // Get blogs with content included
    const blogs = await BlogService.findPublicBlogsPaginatedWithSearch(
      parseInt(page),
      parseInt(perPage),
      searchParams
    );

    // Total number of public blogs matching search and category
    const totalBlogs = await BlogService.countPublicBlogs(searchParams);
    // Total number of pages (rounded up)
    const totalPages = Math.ceil(totalBlogs / parseInt(perPage));

    // Get tags, blogCategories, recentBlogs for full response (optional, fallback to empty if not available)
    let tags = [];
    let blogCategories = [];
    let recentBlogs = [];
    try {
      const catsTags = await BlogService.findPublicBlogsCatsTags();
      tags = catsTags.tags || [];
      blogCategories = catsTags.blogCategories || [];
      recentBlogs = catsTags.recentBlogs || [];
    } catch (e) {
      // fallback to empty
    }

    const pagination = {
      page: parseInt(page),
      perPage: parseInt(perPage),
      totalBlogs,
      totalPages,
    };

    res.status(200).json({
      blogs: blogs, // content is included
      paginationData: pagination,
      tags,
      blogCategories: blogCategories || [],
      categories: blogCategories || [],
      recentBlogs,
    });
  } catch (error) {
    console.log("GET_PUBLIC_BLOGS_PAGINATED_WITH_SEARCH_ERROR", error);
    res.status(500).json({
      message: "Error fetching public blogs",
      status: "error",
      blogs: [],
      paginationData: { page: 1, perPage: 10, totalBlogs: 0, totalPages: 0 },
      tags: [],
      blogCategories: [],
      categories: [],
      recentBlogs: [],
    });
  }
};

/**********************************
  Get a public blog by id
***********************************/
exports.getPublicBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid blog ID format",
        status: "error",
      });
    }

    const blog = await BlogService.findPublicBlogById(id);

    if (!blog) {
      return res.status(404).json({
        message: "Blog not found or not published",
        status: "error",
      });
    }

    res.status(200).json(blog);
  } catch (error) {
    console.log("GET_PUBLIC_BLOG_BY_ID_ERROR", error);
    res.status(500).json({
      message: "Error fetching public blog",
      status: "error",
    });
  }
};

// Add public API endpoint for blog by slug
exports.getPublicBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const blog = await getPublicBlogBySlug(slug);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.status(200).json(blog);
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Error fetching blog by slug" });
  }
};
