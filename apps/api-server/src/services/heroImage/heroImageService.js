const HeroImage = require("@models/heroImage/heroImage");
const HeroImageCategory = require("@models/heroImage/heroCategory");
const buildSearchQuery = ({ searchText }) => {
  let query = {};

  if (searchText) {
    query.$or = [
      { "category.name": { $regex: searchText, $options: "i" } },
      { "uploadedBy.name": { $regex: searchText, $options: "i" } },
    ];
  }

  return query;
};

class HeroImageService {
  // Create a hero
  static createHeroImage = async (hero) => {
    try {
      const newHero = new HeroImage(hero);
      await newHero.save();

      // Find hero category and add hero id to it
      await HeroImageCategory.findByIdAndUpdate(
        hero.category,
        {
          $push: { images: newHero._id },
        },
        { new: true }
      ).exec();

      // Populate the new hero with the user and category
      await newHero
        .populate({ path: "uploadedBy", select: "name" })
        .populate({ path: "category", select: "name" })
        .execPopulate();

      return newHero;
    } catch (error) {
      throw error;
    }
  };

  // Find one hero
  static findOneHero = async (query) => {
    try {
      const hero = await HeroImage.findOne(query).exec();

      return hero;
    } catch (error) {
      throw error;
    }
  };

  // Find hero image by id
  static findHeroImageById = async (id) => {
    try {
      const hero = await HeroImage.findById(id).exec();
      return hero;
    } catch (error) {
      throw error;
    }
  };

  // Find all hero images
  static findAllHeroImages = async () => {
    try {
      const hero = await HeroImage.find()
        .populate({ path: "uploadedBy", select: "name" })
        .populate({ path: "category", select: "name" })
        .exec();

      return hero;
    } catch (error) {
      throw error;
    }
  };

  // Find all hero images approved
  static findAllHeroImagesApproved = async () => {
    try {
      const hero = await HeroImage.find({ isApproved: true })
        .populate({ path: "uploadedBy", select: "name" })
        .populate({ path: "category", select: "name" })
        .exec();

      return hero;
    } catch (error) {
      throw error;
    }
  };

  // Find hero image by id and update
  static findHeroImageByIdAndUpdate = async (id, update) => {
    try {
      // Get the old hero image
      const oldHero = await HeroImage.findById(id).exec();

      const hero = await HeroImage.findByIdAndUpdate(id, update, {
        new: true,
      }).exec();

      // Find hero category and remove old hero id from it
      await HeroImageCategory.findByIdAndUpdate(
        oldHero.category,
        {
          $pull: { images: oldHero._id },
        },
        { new: true }
      ).exec();

      // Find hero category and add new hero id to it
      await HeroImageCategory.findByIdAndUpdate(
        hero.category,
        {
          $push: { images: hero._id },
        },
        { new: true }
      ).exec();

      // Populate the updated hero with the user and category
      await hero
        .populate({ path: "uploadedBy", select: "name" })
        .populate({ path: "category", select: "name" })
        .execPopulate();

      return hero;
    } catch (error) {
      throw error;
    }
  };

  // Find hero image by id and update approval status
  static findHeroImageByIdAndUpdateApprovalStatus = async (id, isApproved) => {
    try {
      const hero = await HeroImage.findByIdAndUpdate(
        id,
        { isApproved },
        { new: true }
      ).exec();

      return hero;
    } catch (error) {
      throw error;
    }
  };

  // Find hero image by id and delete
  static findHeroImageByIdAndDelete = async (id) => {
    try {
      const hero = await HeroImage.findByIdAndDelete(id).exec();

      // Find hero category and remove hero id from it
      await HeroImageCategory.findByIdAndUpdate(
        hero.category,
        {
          $pull: { images: hero._id },
        },
        { new: true }
      ).exec();

      return hero;
    } catch (error) {
      throw error;
    }
  };

  // Find all hero images paginated
  static findAllHeroImagesPaginated = async (
    page,
    perPage,
    searchParams = {}
  ) => {
    try {
      const searchQuery = buildSearchQuery(searchParams);

      // Find all heroImages, send latest heroImages first
      const heroImages = await HeroImage.find(searchQuery)
        .populate({ path: "uploadedBy", select: "name" })
        .populate({ path: "category", select: "name" })
        .sort({ createdAt: -1 })
        .skip((page - 1) * perPage)
        .limit(perPage);

      return heroImages;
    } catch (error) {
      throw error;
    }
  };

  // Count all heroImages
  static countAllHeroImages = async (searchParams = {}) => {
    try {
      const searchQuery = buildSearchQuery(searchParams);

      const totalHeroImages = await HeroImage.countDocuments(searchQuery);

      return totalHeroImages;
    } catch (error) {
      throw error;
    }
  };

  // Find all approved hero images paginated
  static findAllApprovedHeroImagesPaginated = async (
    page,
    perPage,
    searchParams = {},
    sort = { createdAt: -1 }
  ) => {
    try {
      const searchQuery = {
        ...buildSearchQuery(searchParams),
        isApproved: true,
      };
      const heroImages = await HeroImage.find(searchQuery)
        .populate({ path: "uploadedBy", select: "name" })
        .populate({ path: "category", select: "name" })
        .sort(sort)
        .skip((page - 1) * perPage)
        .limit(perPage);
      return heroImages;
    } catch (error) {
      throw error;
    }
  };

  // Count all approved hero images
  static countAllApprovedHeroImages = async (searchParams = {}) => {
    try {
      const searchQuery = {
        ...buildSearchQuery(searchParams),
        isApproved: true,
      };
      const total = await HeroImage.countDocuments(searchQuery);
      return total;
    } catch (error) {
      throw error;
    }
  };
}

module.exports = HeroImageService;
