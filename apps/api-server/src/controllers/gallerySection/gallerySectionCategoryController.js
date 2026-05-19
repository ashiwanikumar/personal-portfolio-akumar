const GallerySectionCategoryService = require("@services/gallerySection/gallerySectionCategoryService");

/**********************************
  Create a gallery category
***********************************/
exports.createGalleryCategory = async (req, res) => {
  const { name } = req.body;

  // Validate request
  if (!name) {
    return res.status(400).json({
      message: "Please enter the gallery category name",
      status: "error",
    });
  }

  try {
    const newGallery =
      await GallerySectionCategoryService.createGallerySectionCategory(
        req.body
      );

    res.status(201).json(newGallery);
  } catch (error) {
    console.log("CREATE_CATEGORY_ERROR", error);
    res.status(500).json({
      message: error.message || "Error creating gallery category",
      status: "error",
    });
  }
};

/**********************************
  Get all gallery categories
***********************************/
exports.getAllGalleryCategories = async (req, res) => {
  try {
    const gallery =
      await GallerySectionCategoryService.findAllGalleryCategories();

    res.status(200).json(gallery);
  } catch (error) {
    console.log("GET_ALL_CATEGORIES_ERROR", error);
    res.status(500).json({
      message: error.message || "Error fetching gallery categories",
      status: "error",
    });
  }
};

/**********************************
  Get a gallery category by id
***********************************/
exports.getGalleryCategoryById = async (req, res) => {
  try {
    const gallery =
      await GallerySectionCategoryService.findGallerySectionCategoryById(
        req.params.id
      );

    res.status(200).json(gallery);
  } catch (error) {
    console.log("GET_CATEGORY_BY_ID_ERROR", error);
    res.status(500).json({
      message: error.message || "Error fetching gallery category",
      status: "error",
    });
  }
};

/**********************************
  Update a gallery category by id
***********************************/
exports.updateGalleryCategoryById = async (req, res) => {
  try {
    const { name } = req.body;

    // Validate request
    if (!name) {
      return res.status(400).json({
        message: "Please enter the gallery category name",
        status: "error",
      });
    }

    // Update the gallery category
    const gallery =
      await GallerySectionCategoryService.findGallerySectionCategoryByIdAndUpdate(
        req.params.id,
        req.body
      );

    if (!gallery) {
      return res.status(404).json({
        message: "Gallery category not found",
        status: "error",
      });
    }

    res.status(200).json(gallery);
  } catch (error) {
    console.log("UPDATE_CATEGORY_BY_ID_ERROR", error);
    res.status(500).json({
      message: error.message || "Error updating gallery category",
      status: "error",
    });
  }
};

/**********************************
  Delete a gallery category by id
***********************************/
exports.deleteGalleryCategoryById = async (req, res) => {
  try {
    const gallery =
      await GallerySectionCategoryService.findGallerySectionCategoryByIdAndDelete(
        req.params.id
      );

    res.status(200).json(gallery);
  } catch (error) {
    console.log("DELETE_CATEGORY_BY_ID_ERROR", error);
    res.status(500).json({
      message: error.message || "Error deleting gallery category",
      status: "error",
    });
  }
};
