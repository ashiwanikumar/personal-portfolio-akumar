const ResourceService = require("@services/role/resourceService");

exports.createResource = async (req, res) => {
  try {
    const newResource = await ResourceService.createResource(
      req.body,
      req.user._id
    );
    res
      .status(201)
      .json({
        success: true,
        message: "Resource created successfully",
        resource: newResource,
      });
  } catch (error) {
    res
      .status(400)
      .json({
        success: false,
        message: error.message || "Failed to create resource",
      });
  }
};

exports.getAllResources = async (req, res) => {
  try {
    const { page, limit, search, category, isActive } = req.query;
    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      search: search || "",
      category: category || null,
      isActive: isActive !== undefined ? isActive === "true" : null,
    };
    const result = await ResourceService.findAllResources(options);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch resources" });
  }
};

exports.getResourceById = async (req, res) => {
  try {
    const resource = await ResourceService.findResourceById(req.params.id);
    if (!resource)
      return res
        .status(404)
        .json({ success: false, message: "Resource not found" });
    res.status(200).json({ success: true, resource });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch resource" });
  }
};

exports.updateResourceById = async (req, res) => {
  try {
    const resource = await ResourceService.findResourceByIdAndUpdate(
      req.params.id,
      req.body,
      req.user._id
    );
    if (!resource)
      return res
        .status(404)
        .json({ success: false, message: "Resource not found" });
    res
      .status(200)
      .json({
        success: true,
        message: "Resource updated successfully",
        resource,
      });
  } catch (error) {
    res
      .status(400)
      .json({
        success: false,
        message: error.message || "Failed to update resource",
      });
  }
};

exports.deleteResourceById = async (req, res) => {
  try {
    const resource = await ResourceService.findResourceByIdAndDelete(
      req.params.id
    );
    if (!resource)
      return res
        .status(404)
        .json({ success: false, message: "Resource not found" });
    res
      .status(200)
      .json({
        success: true,
        message: "Resource deleted successfully",
        resource,
      });
  } catch (error) {
    res
      .status(400)
      .json({
        success: false,
        message: error.message || "Failed to delete resource",
      });
  }
};

exports.getActiveResources = async (req, res) => {
  try {
    const resources = await ResourceService.getActiveResources();
    res.status(200).json({ success: true, resources });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch active resources" });
  }
};

exports.getResourcesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const resources = await ResourceService.getResourcesByCategory(category);
    res.status(200).json({ success: true, resources });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch resources by category",
      });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await ResourceService.getCategories();
    res.status(200).json({ success: true, categories });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch categories" });
  }
};

exports.createDefaultResources = async (req, res) => {
  try {
    await ResourceService.createDefaultResources(req.user._id);
    res
      .status(200)
      .json({
        success: true,
        message: "Default resources created successfully",
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: error.message || "Failed to create default resources",
      });
  }
};

exports.getResourceStats = async (req, res) => {
  try {
    const Resource = require("@models/role/resource");
    const stats = await Resource.aggregate([
      {
        $group: {
          _id: null,
          totalResources: { $sum: 1 },
          activeResources: {
            $sum: { $cond: { if: "$isActive", then: 1, else: 0 } },
          },
          resourcesByCategory: { $push: "$category" },
        },
      },
      {
        $project: {
          totalResources: 1,
          activeResources: 1,
          categoryCounts: {
            $arrayToObject: {
              $map: {
                input: "$resourcesByCategory",
                as: "cat",
                in: ["$$cat", { $sum: 1 }],
              },
            },
          },
        },
      },
    ]);
    res
      .status(200)
      .json({
        success: true,
        stats: stats[0] || {
          totalResources: 0,
          activeResources: 0,
          categoryCounts: {},
        },
      });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch resource statistics" });
  }
};
