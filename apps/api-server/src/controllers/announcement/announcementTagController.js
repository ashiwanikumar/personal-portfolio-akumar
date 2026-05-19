const AnnouncementTagService = require("@services/announcement/announcementTagService");

exports.createAnnouncementTag = async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res
      .status(400)
      .json({ message: "Please enter the tag name", status: "error" });
  }
  try {
    const existingTag = await AnnouncementTagService.findOneAnnouncementTag({
      name,
    });
    if (existingTag) {
      return res.status(409).json({
        message: `A tag with the name \"${name}\" already exists`,
        status: "error",
      });
    }
    const newTag = await AnnouncementTagService.createAnnouncementTag({
      name,
      description,
    });
    res.status(201).json(newTag);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Error creating tag",
      status: "error",
    });
  }
};

exports.getAllAnnouncementTags = async (req, res) => {
  try {
    const tags = await AnnouncementTagService.findAllAnnouncementTags();
    res.status(200).json(tags);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Error fetching tags",
      status: "error",
    });
  }
};

exports.getAnnouncementTagById = async (req, res) => {
  try {
    const tag = await AnnouncementTagService.findAnnouncementTagById(
      req.params.id,
    );
    if (!tag) {
      return res
        .status(404)
        .json({ message: "Tag not found", status: "error" });
    }
    res.status(200).json(tag);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Error fetching tag",
      status: "error",
    });
  }
};

exports.updateAnnouncementTagById = async (req, res) => {
  try {
    const tag = await AnnouncementTagService.findAnnouncementTagByIdAndUpdate(
      req.params.id,
      req.body,
    );
    if (!tag) {
      return res
        .status(404)
        .json({ message: "Tag not found", status: "error" });
    }
    res.status(200).json(tag);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Error updating tag",
      status: "error",
    });
  }
};

exports.deleteAnnouncementTagById = async (req, res) => {
  try {
    const tag = await AnnouncementTagService.findAnnouncementTagByIdAndDelete(
      req.params.id,
    );
    if (!tag) {
      return res
        .status(404)
        .json({ message: "Tag not found", status: "error" });
    }
    res.status(200).json({ message: "Tag deleted", tag });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Error deleting tag",
      status: "error",
    });
  }
};
