const AnnouncementTag = require("@models/announcement/announcementTag");

class AnnouncementTagService {
  // Create a tag
  static createAnnouncementTag = async (tag) => {
    try {
      const newTag = new AnnouncementTag(tag);
      await newTag.save();
      return newTag;
    } catch (error) {
      throw error;
    }
  };

  // Find one tag
  static findOneAnnouncementTag = async (query) => {
    try {
      const tag = await AnnouncementTag.findOne(query).exec();
      return tag;
    } catch (error) {
      throw error;
    }
  };

  // Find tag by id
  static findAnnouncementTagById = async (id) => {
    try {
      const tag = await AnnouncementTag.findById(id).exec();
      return tag;
    } catch (error) {
      throw error;
    }
  };

  // Find all tags
  static findAllAnnouncementTags = async () => {
    try {
      const tags = await AnnouncementTag.find().sort({ name: 1 }).exec();
      return tags;
    } catch (error) {
      throw error;
    }
  };

  // Update tag by id
  static findAnnouncementTagByIdAndUpdate = async (id, update) => {
    try {
      if (update.name) {
        update.slug = update.name
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");
      }
      const tag = await AnnouncementTag.findByIdAndUpdate(id, update, {
        new: true,
      }).exec();
      return tag;
    } catch (error) {
      throw error;
    }
  };

  // Delete tag by id
  static findAnnouncementTagByIdAndDelete = async (id) => {
    try {
      const tag = await AnnouncementTag.findByIdAndDelete(id).exec();
      return tag;
    } catch (error) {
      throw error;
    }
  };
}

module.exports = AnnouncementTagService;
