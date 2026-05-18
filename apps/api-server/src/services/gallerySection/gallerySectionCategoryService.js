const GallerySectionCategory = require("@models/gallerySection/gallerySectionCategory");

class GallerySectionCategoryService {
  // Create a gallery
  static createGallerySectionCategory = async (gallery) => {
    try {
      const newGallery = new GallerySectionCategory(gallery);
      await newGallery.save();

      return newGallery;
    } catch (error) {
      throw error;
    }
  };

  // Find one gallery
  static findOneGallery = async (query) => {
    try {
      const gallery = await GallerySectionCategory.findOne(query).exec();

      return gallery;
    } catch (error) {
      throw error;
    }
  };

  // Find gallery category by id
  static findGallerySectionCategoryById = async (id) => {
    try {
      const gallery = await GallerySectionCategory.findById(id).exec();

      return gallery;
    } catch (error) {
      throw error;
    }
  };

  // Find all gallery categories
  static findAllGalleryCategories = async () => {
    try {
      const gallery = await GallerySectionCategory.find().exec();

      return gallery;
    } catch (error) {
      throw error;
    }
  };

  // Find gallery category by id and update
  static findGallerySectionCategoryByIdAndUpdate = async (id, update) => {
    try {
      const gallery = await GallerySectionCategory.findByIdAndUpdate(id, update, {
        new: true,
      }).exec();

      return gallery;
    } catch (error) {
      throw error;
    }
  };

  // Find gallery category by id and delete
  static findGallerySectionCategoryByIdAndDelete = async (id) => {
    try {
      const gallery = await GallerySectionCategory.findByIdAndDelete(id).exec();

      return gallery;
    } catch (error) {
      throw error;
    }
  };
}

module.exports = GallerySectionCategoryService;
