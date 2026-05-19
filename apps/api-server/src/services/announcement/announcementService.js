const Announcement = require("@models/announcement/announcement");

const buildSearchQuery = ({ 
  searchText, 
  announcementType, 
  approved, 
  isActive, 
  startDate, 
  endDate, 
  priority, 
  tags 
}) => {
  let query = {};

  // Text search
  if (searchText) {
    query.$or = [
      { message: { $regex: searchText, $options: "i" } },
      { title: { $regex: searchText, $options: "i" } },
      { description: { $regex: searchText, $options: "i" } },
    ];
  }

  // Direct field filters
  if (announcementType) {
    query.announcementType = announcementType;
  }

  if (approved !== undefined) {
    query.approved = approved;
  }

  if (isActive !== undefined) {
    query.isActive = isActive;
  }

  if (priority !== undefined) {
    query.priority = priority;
  }

  if (tags && tags.length > 0) {
    query.tags = { $in: tags };
  }

  // Date range filtering
  if (startDate || endDate) {
    query.startDate = {};
    if (startDate) {
      query.startDate.$gte = new Date(startDate);
    }
    if (endDate) {
      query.startDate.$lte = new Date(endDate);
    }
  }

  return query;
};
class AnnouncementService {
  // Create a announcement
  static createAnnouncement = async (announcement) => {
    try {
      const newAnnouncement = new Announcement(announcement);
      await newAnnouncement.save();

      return newAnnouncement;
    } catch (error) {
      throw error;
    }
  };

  // Find one announcement
  static findOneAnnouncement = async (query) => {
    try {
      const announcement = await Announcement.findOne(query).exec();

      return announcement;
    } catch (error) {
      throw error;
    }
  };

  // Find announcement by id
  static findAnnouncementById = async (id) => {
    try {
      const announcement = await Announcement.findById(id).exec();

      return announcement;
    } catch (error) {
      throw error;
    }
  };

  // Find all announcements
  static findAllAnnouncements = async () => {
    try {
      const announcements = await Announcement.find().exec();

      return announcements;
    } catch (error) {
      throw error;
    }
  };

  // Find announcement by id and update
  static findAnnouncementByIdAndUpdate = async (id, update) => {
    try {
      const announcement = await Announcement.findByIdAndUpdate(id, update, {
        new: true,
      }).exec();

      return announcement;
    } catch (error) {
      throw error;
    }
  };

  // Find announcement by id and delete
  static findAnnouncementByIdAndDelete = async (id) => {
    try {
      const announcement = await Announcement.findByIdAndDelete(id).exec();

      return announcement;
    } catch (error) {
      throw error;
    }
  };

  // Find all announcements approved
  static findAllAnnouncementsApproved = async () => {
    try {
      // Define the current date and time
      const now = new Date();

      // Find announcements that are approved and active during the current date and time
      const announcements = await Announcement.find({
        approved: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
      })
        .sort({ createdAt: -1 })
        .exec();

      return announcements;
    } catch (error) {
      throw error;
    }
  };

  // Find announcement by id and update approval status
  static findAnnouncementByIdAndUpdateApprovalStatus = async (id, approved) => {
    try {
      // First, find the announcement that needs to be updated
      const currentAnnouncement = await Announcement.findById(id).exec();
      if (!currentAnnouncement) {
        throw new Error("Announcement not found");
      }

      // If the announcement is to be approved, check for existing approved announcements of the same type within the period
      if (approved) {
        const overlappingAnnouncement = await Announcement.findOne({
          _id: { $ne: id },
          announcementType: currentAnnouncement.announcementType,
          approved: true,
          $or: [
            {
              startDate: { $lte: currentAnnouncement.endDate },
              endDate: { $gte: currentAnnouncement.startDate },
            },
            {
              startDate: { $lte: currentAnnouncement.startDate },
              endDate: { $gte: currentAnnouncement.endDate },
            },
          ],
        }).exec();

        // If an overlapping announcement exists, do not approve and return a message
        if (overlappingAnnouncement) {
          return {
            message: `An approved ${currentAnnouncement.announcementType} announcement already exists for this period.`,
          };
        }
      }

      // If no overlapping announcement, update the approval status
      const updatedAnnouncement = await Announcement.findByIdAndUpdate(
        id,
        { approved },
        { new: true }
      ).exec();

      return {
        message: `Announcement status updated successfully`,
        updatedAnnouncement,
      };
    } catch (error) {
      throw error;
    }
  };
  // Find all Announcement registrations paginated
  static findAllAnnouncementsPaginated = async (
    page,
    perPage,
    searchParams = {}
  ) => {
    try {
      const searchQuery = buildSearchQuery(searchParams);

      // Find all announcements, send latest announcements first
      const announcements = await Announcement.find(searchQuery)
        .sort({ createdAt: -1 })
        .skip((page - 1) * perPage)
        .limit(perPage);

      return announcements;
    } catch (error) {
      throw error;
    }
  };

  // Count all announcements
  static countAllAnnouncements = async (searchParams = {}) => {
    try {
      const searchQuery = buildSearchQuery(searchParams);

      const totalAnnouncements = await Announcement.countDocuments(searchQuery);

      return totalAnnouncements;
    } catch (error) {
      throw error;
    }
  };

  // Add media to announcement
  static addMediaToAnnouncement = async (announcementId, mediaData) => {
    try {
      const announcement = await Announcement.findByIdAndUpdate(
        announcementId,
        {
          $push: { mediaFiles: mediaData },
        },
        { new: true }
      ).exec();

      return announcement;
    } catch (error) {
      throw error;
    }
  };

  // Remove media from announcement
  static removeMediaFromAnnouncement = async (announcementId, mediaId) => {
    try {
      const announcement = await Announcement.findByIdAndUpdate(
        announcementId,
        {
          $pull: { mediaFiles: { fileId: mediaId } },
        },
        { new: true }
      ).exec();

      return announcement;
    } catch (error) {
      throw error;
    }
  };

  // Update announcement media
  static updateAnnouncementMedia = async (
    announcementId,
    mediaId,
    updateData
  ) => {
    try {
      const announcement = await Announcement.findOneAndUpdate(
        {
          _id: announcementId,
          "mediaFiles.fileId": mediaId,
        },
        {
          $set: {
            "mediaFiles.$.alt": updateData.alt,
            "mediaFiles.$.caption": updateData.caption,
            "mediaFiles.$.tags": updateData.tags,
          },
        },
        { new: true }
      ).exec();

      return announcement;
    } catch (error) {
      throw error;
    }
  };

  // Find active announcements (using model static method)
  static findActiveAnnouncements = async (announcementType = null) => {
    try {
      return await Announcement.findActiveAnnouncements(announcementType);
    } catch (error) {
      throw error;
    }
  };

  // Find announcements by type and date range (using model static method)
  static findAnnouncementsByTypeAndDateRange = async (
    type,
    startDate,
    endDate
  ) => {
    try {
      return await Announcement.findByTypeAndDateRange(
        type,
        startDate,
        endDate
      );
    } catch (error) {
      throw error;
    }
  };

  // Get announcement analytics
  static getAnnouncementAnalytics = async (announcementId) => {
    try {
      const announcement = await Announcement.findById(announcementId).exec();

      if (!announcement) {
        throw new Error("Announcement not found");
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

      return analytics;
    } catch (error) {
      throw error;
    }
  };

  // Bulk analytics update
  static bulkUpdateAnalytics = async (updates) => {
    try {
      const bulkOps = updates.map((update) => ({
        updateOne: {
          filter: { _id: update.announcementId },
          update: {
            $inc: {
              [`analytics.${update.type}`]: update.increment || 1,
            },
            $set: {
              "analytics.lastViewed": new Date(),
            },
          },
        },
      }));

      const result = await Announcement.bulkWrite(bulkOps);
      return result;
    } catch (error) {
      throw error;
    }
  };

  // Enhanced search with filters
  static searchAnnouncements = async (searchParams) => {
    try {
      const {
        searchText,
        announcementType,
        approved,
        isActive,
        startDate,
        endDate,
        tags,
        priority,
        sortBy = "createdAt",
        sortOrder = -1,
        page = 1,
        perPage = 10,
      } = searchParams;

      let query = {};

      // Text search
      if (searchText) {
        query.$or = [
          { message: { $regex: searchText, $options: "i" } },
          { title: { $regex: searchText, $options: "i" } },
          { description: { $regex: searchText, $options: "i" } },
          { tags: { $in: [new RegExp(searchText, "i")] } },
        ];
      }

      // Filters
      if (announcementType) query.announcementType = announcementType;
      if (approved !== undefined) query.approved = approved;
      if (isActive !== undefined) query.isActive = isActive;
      if (priority !== undefined) query.priority = priority;
      if (tags && tags.length > 0) query.tags = { $in: tags };

      // Date range
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      // Execute query with pagination and sorting
      const announcements = await Announcement.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .populate("approvalDetails.approvedBy", "name email")
        .exec();

      const totalCount = await Announcement.countDocuments(query);

      return {
        announcements,
        pagination: {
          page,
          perPage,
          totalCount,
          totalPages: Math.ceil(totalCount / perPage),
        },
      };
    } catch (error) {
      throw error;
    }
  };

  // Add a tag to a media file in an announcement
  static addTagToMedia = async (announcementId, mediaId, tag) => {
    try {
      const announcement = await Announcement.findOneAndUpdate(
        {
          _id: announcementId,
          "mediaFiles.fileId": mediaId,
        },
        {
          $addToSet: { "mediaFiles.$.tags": tag },
        },
        { new: true }
      ).exec();
      return announcement;
    } catch (error) {
      throw error;
    }
  };

  // Update all tags for a media file in an announcement
  static updateTagsForMedia = async (announcementId, mediaId, tags) => {
    try {
      const announcement = await Announcement.findOneAndUpdate(
        {
          _id: announcementId,
          "mediaFiles.fileId": mediaId,
        },
        {
          $set: { "mediaFiles.$.tags": tags },
        },
        { new: true }
      ).exec();
      return announcement;
    } catch (error) {
      throw error;
    }
  };

  // Remove a tag from a media file in an announcement
  static removeTagFromMedia = async (announcementId, mediaId, tag) => {
    try {
      const announcement = await Announcement.findOneAndUpdate(
        {
          _id: announcementId,
          "mediaFiles.fileId": mediaId,
        },
        {
          $pull: { "mediaFiles.$.tags": tag },
        },
        { new: true }
      ).exec();
      return announcement;
    } catch (error) {
      throw error;
    }
  };

  // Get tags for a media file in an announcement
  static getTagsForMedia = async (announcementId, mediaId) => {
    try {
      const announcement = await Announcement.findOne(
        {
          _id: announcementId,
          "mediaFiles.fileId": mediaId,
        },
        { "mediaFiles.$": 1 }
      ).exec();
      if (
        !announcement ||
        !announcement.mediaFiles ||
        announcement.mediaFiles.length === 0
      ) {
        return [];
      }
      return announcement.mediaFiles[0].tags || [];
    } catch (error) {
      throw error;
    }
  };
}

module.exports = AnnouncementService;
