const AnnouncementService = require("@services/announcement/announcementService");
const {
  deleteAnnouncementFileWithCacheInvalidation,
  extractS3KeyFromUrl,
} = require("@middlewares/announcementMulter");
const allowedAnnouncementPaths = require("./allowedAnnouncementPaths");
const {
  generateSecureMediaUrl,
  retrieveOriginalMediaUrl,
} = require("@services/announcement/announcementMediaEncryption");
const axios = require("axios");

/**********************************
  Create an announcement
***********************************/
exports.createAnnouncement = async (req, res) => {
  try {
    // Validate targetPath if present
    if (
      req.body.targetPath &&
      !allowedAnnouncementPaths.includes(req.body.targetPath)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid targetPath. Please select a valid page.",
      });
    }
    // Process the announcement data with enhanced fields
    const announcementData = {
      ...req.body,
      // Set approval details if user has appropriate permissions
      approvalDetails:
        req.user && req.user.role === "superadmin"
          ? {
              approvedBy: req.user._id,
              approvedAt: req.body.approved ? new Date() : undefined,
            }
          : undefined,
    };

    const newAnnouncement = await AnnouncementService.createAnnouncement(
      announcementData
    );

    res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      announcement: newAnnouncement,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("CREATE_ANNOUNCEMENT_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Error creating announcement",
      error: error.message,
      status: "error",
      timestamp: new Date().toISOString(),
    });
  }
};

/**********************************
  Get all announcements
***********************************/
exports.getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await AnnouncementService.findAllAnnouncements();

    // Filter out s3Url from mediaFiles for security (we use cloudFrontUrl instead)
    const sanitizedAnnouncements = announcements.map((announcement) => {
      const ann = announcement.toObject ? announcement.toObject() : announcement;
      
      if (ann.mediaFiles && Array.isArray(ann.mediaFiles)) {
        ann.mediaFiles = ann.mediaFiles.map((media) => {
          const { s3Url, ...sanitizedMedia } = media;
          return sanitizedMedia;
        });
      }
      
      return ann;
    });

    res.status(200).json(sanitizedAnnouncements);
  } catch (error) {
    console.log("GET_ALL_ANNOUNCEMENTS_ERROR", error);
  }
};

/**********************************
  Get a announcement by id
***********************************/
exports.getAnnouncementById = async (req, res) => {
  try {
    const announcement = await AnnouncementService.findAnnouncementById(
      req.params.id
    );

    // Filter out s3Url from mediaFiles for security (we use cloudFrontUrl instead)
    const sanitizedAnnouncement = announcement.toObject ? announcement.toObject() : announcement;
    
    if (sanitizedAnnouncement.mediaFiles && Array.isArray(sanitizedAnnouncement.mediaFiles)) {
      sanitizedAnnouncement.mediaFiles = sanitizedAnnouncement.mediaFiles.map((media) => {
        const { s3Url, ...sanitizedMedia } = media;
        return sanitizedMedia;
      });
    }

    res.status(200).json(sanitizedAnnouncement);
  } catch (error) {
    console.log("GET_ANNOUNCEMENT_BY_ID_ERROR", error);
  }
};

/**********************************
  Get all announcement approved
***********************************/
exports.getAllAnnouncementsApproved = async (req, res) => {
  try {
    const announcements =
      await AnnouncementService.findAllAnnouncementsApproved();

    const publicAnnouncements = (announcements || []).map((announcement) => {
      // Convert to plain object if needed
      const ann = announcement.toObject
        ? announcement.toObject()
        : announcement;
      // Destructure to remove targetAudience, analytics, displaySettings, tags, priority, version
      const {
        targetAudience,
        analytics,
        displaySettings,
        tags,
        priority,
        version,
        ...publicFields
      } = ann;

      // Encrypt media URLs before sending
      const secureMediaFiles = (ann.mediaFiles || []).map((media) => {
        try {
          // Only encrypt if cloudFrontUrl exists
          if (!media.cloudFrontUrl) {
            console.warn("Media file missing cloudFrontUrl:", media);
            return {
              secureUrl: null,
              fileType: media.fileType,
              mimeType: media.mimeType,
            };
          }

          // Generate secure access token for each media file
          const secureAccess = generateSecureMediaUrl(media.cloudFrontUrl, {
            fileType: media.fileType,
            mimeType: media.mimeType,
            announcementId: ann._id.toString(),
          });

          return {
            // Instead of exposing the actual URL, return secure access data
            secureUrl: `/announcement/media/secure/${secureAccess.token}`,
            fileType: media.fileType,
            mimeType: media.mimeType,
          };
        } catch (error) {
          console.error(
            "Failed to encrypt media URL for announcement:",
            ann._id,
            "Error:",
            error.message
          );
          // For debugging - let's see what we're working with
          console.error("Media object:", JSON.stringify(media, null, 2));

          // Fallback to empty URL if encryption fails - NEVER expose original URL
          return {
            secureUrl: null,
            fileType: media.fileType,
            mimeType: media.mimeType,
            error: "Media encryption failed",
          };
        }
      });

      return {
        ...publicFields,
        mediaFiles: secureMediaFiles,
      };
    });

    res.status(200).json(publicAnnouncements);
  } catch (error) {
    console.log("GET_ALL_ANNOUNCEMENTS_APPROVED_ERROR", error);
    res.status(500).json({
      message: "Error",
      status: "error",
    });
  }
};

/**********************************
  Update a announcement by id
***********************************/
exports.updateAnnouncementById = async (req, res) => {
  // Validate targetPath if present
  if (
    req.body.targetPath &&
    !allowedAnnouncementPaths.includes(req.body.targetPath)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid targetPath. Please select a valid page.",
    });
  }
  // If announcement name already exists, return error
  const announcement = await AnnouncementService.findAnnouncementByIdAndUpdate(
    req.params.id,
    req.body
  );

  if (!announcement) {
    return res.status(404).json({
      message: "No announcement found",
      status: "error",
    });
  }

  res.status(200).json(announcement);
};

/**********************************
  Delete a announcement by id
***********************************/
exports.deleteAnnouncementById = async (req, res) => {
  try {
    const announcement =
      await AnnouncementService.findAnnouncementByIdAndDelete(req.params.id);

    res.status(200).json(announcement);
  } catch (error) {
    console.log("DELETE_ANNOUNCEMENT_BY_ID_ERROR", error);
  }
};

/**********************************
  Upload announcement image to S3 (Legacy)
***********************************/
exports.uploadAnnouncementImage = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Announcement image uploaded successfully",
      url: req.uploadUrl,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("UPLOAD_ANNOUNCEMENT_IMAGE_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload announcement image",
      error: error.message,
      status: "error",
      timestamp: new Date().toISOString(),
    });
  }
};

/**********************************
  Upload announcement media (Enhanced)
***********************************/
exports.uploadAnnouncementMedia = async (req, res) => {
  try {
    const mediaData = {
      originalName: req.uploadOgName,
      fileName: req.uploadOgName,
      s3Key: req.s3Key,
      s3Url: req.s3Url,
      cloudFrontUrl: req.cloudFrontUrl,
      signedUrl: req.uploadUrl,
      fileType: req.fileType,
      mimeType: req.uploadItemType,
      fileSize: req.uploadItemSize,
      uploadPath: req.uploadPath,
      uploadedAt: new Date(),
      expiresAt: new Date(Date.now() + 20 * 365 * 24 * 60 * 60 * 1000), // 20 years
      processingStatus: "completed",
    };

    res.status(200).json({
      success: true,
      message: "Announcement media uploaded successfully",
      media: mediaData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("UPLOAD_ANNOUNCEMENT_MEDIA_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload announcement media",
      error: error.message,
      status: "error",
      timestamp: new Date().toISOString(),
    });
  }
};

/**********************************
  Upload multiple announcement media files
***********************************/
exports.uploadMultipleAnnouncementMedia = async (req, res) => {
  try {
    if (
      !req.uploadedAnnouncementFiles ||
      req.uploadedAnnouncementFiles.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "No files were uploaded",
        status: "error",
        timestamp: new Date().toISOString(),
      });
    }

    const mediaFiles = req.uploadedAnnouncementFiles.map((file) => ({
      originalName: file.originalName,
      fileName: file.originalName,
      s3Key: file.s3Key,
      s3Url: file.s3Url,
      cloudFrontUrl: file.cloudFrontUrl,
      signedUrl: file.url,
      fileType: file.fileType,
      mimeType: file.mimetype,
      fileSize: file.size,
      uploadPath: file.uploadPath,
      uploadedAt: new Date(file.uploadedAt),
      expiresAt: new Date(file.expiresAt),
      processingStatus: "completed",
      fileId: file.fileId,
    }));

    res.status(200).json({
      success: true,
      message: `${mediaFiles.length} announcement media files uploaded successfully`,
      mediaFiles: mediaFiles,
      uploadCount: req.uploadCount,
      totalSize: req.totalSize,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("UPLOAD_MULTIPLE_ANNOUNCEMENT_MEDIA_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload multiple announcement media files",
      error: error.message,
      status: "error",
      timestamp: new Date().toISOString(),
    });
  }
};

/**********************************
  Delete announcement media
***********************************/
exports.deleteAnnouncementMedia = async (req, res) => {
  try {
    const { mediaId } = req.params;
    const { s3Key, announcementId } = req.body;

    if (!s3Key) {
      return res.status(400).json({
        success: false,
        message: "S3 key is required for media deletion",
        status: "error",
        timestamp: new Date().toISOString(),
      });
    }

    // Delete from S3 and invalidate cache
    await deleteAnnouncementFileWithCacheInvalidation(s3Key);

    // If announcementId is provided, remove the media from the announcement's mediaFiles array
    if (announcementId) {
      await AnnouncementService.removeMediaFromAnnouncement(
        announcementId,
        mediaId
      );
    }

    res.status(200).json({
      success: true,
      message: "Announcement media deleted successfully",
      deletedMediaId: mediaId,
      deletedS3Key: s3Key,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("DELETE_ANNOUNCEMENT_MEDIA_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete announcement media",
      error: error.message,
      status: "error",
      timestamp: new Date().toISOString(),
    });
  }
};

/**********************************
  Increment announcement views
***********************************/
exports.incrementAnnouncementViews = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await AnnouncementService.findAnnouncementById(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
        status: "error",
        timestamp: new Date().toISOString(),
      });
    }

    await announcement.incrementViews();

    res.status(200).json({
      success: true,
      message: "Announcement view counted",
      views: announcement.analytics.views,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("INCREMENT_ANNOUNCEMENT_VIEWS_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Failed to increment announcement views",
      error: error.message,
      status: "error",
      timestamp: new Date().toISOString(),
    });
  }
};

/**********************************
  Increment announcement clicks
***********************************/
exports.incrementAnnouncementClicks = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await AnnouncementService.findAnnouncementById(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
        status: "error",
        timestamp: new Date().toISOString(),
      });
    }

    await announcement.incrementClicks();

    res.status(200).json({
      success: true,
      message: "Announcement click counted",
      clicks: announcement.analytics.clicks,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("INCREMENT_ANNOUNCEMENT_CLICKS_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Failed to increment announcement clicks",
      error: error.message,
      status: "error",
      timestamp: new Date().toISOString(),
    });
  }
};

/**********************************
  Increment announcement dismissals
***********************************/
exports.incrementAnnouncementDismissals = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await AnnouncementService.findAnnouncementById(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
        status: "error",
        timestamp: new Date().toISOString(),
      });
    }

    await announcement.incrementDismissals();

    res.status(200).json({
      success: true,
      message: "Announcement dismissal counted",
      dismissals: announcement.analytics.dismissals,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("INCREMENT_ANNOUNCEMENT_DISMISSALS_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Failed to increment announcement dismissals",
      error: error.message,
      status: "error",
      timestamp: new Date().toISOString(),
    });
  }
};

/**********************************
  Get announcement analytics
***********************************/
exports.getAnnouncementAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await AnnouncementService.findAnnouncementById(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
        status: "error",
        timestamp: new Date().toISOString(),
      });
    }

    const analytics = {
      ...announcement.analytics.toObject(),
      engagementRate:
        announcement.analytics.views > 0
          ? (
              (announcement.analytics.clicks / announcement.analytics.views) *
              100
            ).toFixed(2)
          : 0,
      dismissalRate:
        announcement.analytics.views > 0
          ? (
              (announcement.analytics.dismissals /
                announcement.analytics.views) *
              100
            ).toFixed(2)
          : 0,
    };

    res.status(200).json({
      success: true,
      message: "Announcement analytics retrieved successfully",
      analytics: analytics,
      announcementId: id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("GET_ANNOUNCEMENT_ANALYTICS_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Failed to get announcement analytics",
      error: error.message,
      status: "error",
      timestamp: new Date().toISOString(),
    });
  }
};
/****************************************
  Update a Announcement approval by id
*****************************************/
exports.updateAnnouncementApprovalById = async (req, res) => {
  const { approved } = req.body;

  const announcement =
    await AnnouncementService.findAnnouncementByIdAndUpdateApprovalStatus(
      req.params.id,
      approved
    );

  res.status(200).json(announcement);
};

/**********************************
  Get all Announcements paginated
***********************************/
exports.getAnnouncementsPaginated = async (req, res) => {
  try {
    const { 
      page, 
      perPage, 
      searchText, 
      announcementType, 
      approved, 
      isActive, 
      startDate, 
      endDate, 
      priority, 
      tags 
    } = req.query;

    const searchParams = { 
      searchText,
      announcementType,
      approved: approved !== undefined ? approved === 'true' : undefined,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      startDate,
      endDate,
      priority: priority ? parseInt(priority) : undefined,
      tags: tags ? (Array.isArray(tags) ? tags : [tags]) : undefined
    };

    const announcements =
      await AnnouncementService.findAllAnnouncementsPaginated(
        parseInt(page),
        parseInt(perPage),
        searchParams
      );

    // Filter out s3Url from mediaFiles for security (we use cloudFrontUrl instead)
    const sanitizedAnnouncements = announcements.map((announcement) => {
      const ann = announcement.toObject ? announcement.toObject() : announcement;
      
      if (ann.mediaFiles && Array.isArray(ann.mediaFiles)) {
        ann.mediaFiles = ann.mediaFiles.map((media) => {
          const { s3Url, ...sanitizedMedia } = media;
          return sanitizedMedia;
        });
      }
      
      return ann;
    });

    // Total number of announcements
    const totalAnnouncements = await AnnouncementService.countAllAnnouncements(
      searchParams
    );

    // Total number of pages (rounded up)
    const totalPages = Math.ceil(totalAnnouncements / perPage);

    const pagination = {
      page: parseInt(page),
      perPage: parseInt(perPage),
      totalAnnouncements,
      totalPages,
    };

    res.status(200).json({
      announcements: sanitizedAnnouncements,
      paginationData: pagination,
    });
  } catch (error) {
    console.log("GET_ANNOUNCEMENTS_PAGINATED_ERROR", error);
    res.status(500).json({
      message: "Error",
      status: "error",
    });
  }
};

/**********************************
  TAGS CRUD FOR ANNOUNCEMENT MEDIA
***********************************/
exports.addTagToMedia = async (req, res) => {
  try {
    const { announcementId, mediaId } = req.params;
    const { tag } = req.body;
    if (!tag) {
      return res
        .status(400)
        .json({ success: false, message: "Tag is required" });
    }
    const announcement = await AnnouncementService.addTagToMedia(
      announcementId,
      mediaId,
      tag
    );
    res.status(200).json({ success: true, message: "Tag added", announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTagsForMedia = async (req, res) => {
  try {
    const { announcementId, mediaId } = req.params;
    const { tags } = req.body;
    if (!Array.isArray(tags)) {
      return res
        .status(400)
        .json({ success: false, message: "Tags must be an array" });
    }
    const announcement = await AnnouncementService.updateTagsForMedia(
      announcementId,
      mediaId,
      tags
    );
    res
      .status(200)
      .json({ success: true, message: "Tags updated", announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeTagFromMedia = async (req, res) => {
  try {
    const { announcementId, mediaId } = req.params;
    const { tag } = req.body;
    if (!tag) {
      return res
        .status(400)
        .json({ success: false, message: "Tag is required" });
    }
    const announcement = await AnnouncementService.removeTagFromMedia(
      announcementId,
      mediaId,
      tag
    );
    res
      .status(200)
      .json({ success: true, message: "Tag removed", announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTagsForMedia = async (req, res) => {
  try {
    const { announcementId, mediaId } = req.params;
    const tags = await AnnouncementService.getTagsForMedia(
      announcementId,
      mediaId
    );
    res.status(200).json({ success: true, tags });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**********************************
  Serve secure media via proxy
***********************************/
exports.serveSecureMedia = async (req, res) => {
  try {
    const { token } = req.params;

    // 1. Validate Referer Header (prevent direct access)
    const referer = req.get("Referer");
    const allowedDomains = [
      process.env.NEXT_PUBLIC_FRONTEND_URL,
      process.env.CORS_ORIGIN,
    ].filter(Boolean);

    if (
      !referer ||
      !allowedDomains.some((domain) => referer.startsWith(domain))
    ) {
      console.log(`Blocked media access - Invalid referer: ${referer}`);
      return res.status(403).json({
        success: false,
        message:
          "Access denied: Your request does not originate from an authorized domain. Please access media files through the official website.",
        code: "INVALID_REFERER",
      });
    }

    // 2. Validate User-Agent (prevent simple bots/curl)
    const userAgent = req.get("User-Agent");
    if (
      !userAgent ||
      userAgent.includes("curl") ||
      userAgent.includes("wget") ||
      userAgent.includes("bot")
    ) {
      console.log(`Blocked media access - Suspicious user agent: ${userAgent}`);
      return res.status(403).json({
        success: false,
        message: "Access denied",
        code: "INVALID_USER_AGENT",
      });
    }

    // 3. Rate limiting per IP for media access
    const clientIp = req.clientIp || req.ip;
    const mediaAccessKey = `media_access_${clientIp}`;
    // This is a simple in-memory rate limit - in production, use Redis
    if (!global.mediaAccessLimits) global.mediaAccessLimits = new Map();

    const now = Date.now();
    const accessInfo = global.mediaAccessLimits.get(mediaAccessKey) || {
      count: 0,
      resetTime: now + 60000,
    }; // 1 minute window

    if (now > accessInfo.resetTime) {
      // Reset the counter
      accessInfo.count = 0;
      accessInfo.resetTime = now + 60000;
    }

    if (accessInfo.count >= 50) {
      // Max 50 requests per minute per IP
      return res.status(429).json({
        success: false,
        message: "Too many media requests",
        code: "RATE_LIMITED",
      });
    }

    accessInfo.count++;
    global.mediaAccessLimits.set(mediaAccessKey, accessInfo);

    // 4. Retrieve and validate the original media URL
    const mediaInfo = retrieveOriginalMediaUrl(token);

    // 5. Validate announcement is still active
    if (mediaInfo.announcementId) {
      const announcement = await AnnouncementService.findAnnouncementById(
        mediaInfo.announcementId
      );

      if (!announcement || !announcement.isActive || !announcement.approved) {
        return res.status(403).json({
          success: false,
          message: "Media access denied - announcement not available",
          code: "ANNOUNCEMENT_UNAVAILABLE",
        });
      }
    }

    // Proxy the media content from CloudFront
    const response = await axios({
      method: "GET",
      url: mediaInfo.url,
      responseType: "stream",
      headers: {
        Range: req.headers.range || undefined,
      },
    });

    // Forward relevant headers
    const headersToForward = [
      "content-type",
      "content-length",
      "cache-control",
      "etag",
      "last-modified",
      "accept-ranges",
      "content-range",
    ];

    headersToForward.forEach((header) => {
      if (response.headers[header]) {
        res.setHeader(header, response.headers[header]);
      }
    });

    // Set additional security headers
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-Robots-Tag", "noindex, nofollow, nosnippet, noarchive");
    res.setHeader(
      "Cache-Control",
      "private, no-store, no-cache, must-revalidate"
    );
    res.setHeader("Pragma", "no-cache");

    // Status code (206 for partial content if range request)
    res.status(response.status);

    // Stream the content
    response.data.pipe(res);
  } catch (error) {
    console.error("SERVE_SECURE_MEDIA_ERROR:", error.message);

    if (error.message === "Invalid or expired media token") {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired media access token",
      });
    }

    if (error.response && error.response.status === 404) {
      return res.status(404).json({
        success: false,
        message: "Media file not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to serve media content",
    });
  }
};
