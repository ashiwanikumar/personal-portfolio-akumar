const HeroSection = require("@models/heroSection/heroSection");
const HeroSectionCategory = require("@models/heroSection/heroSectionCategory");
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

class HeroSectionService {
  // Create a hero
  static createHero = async (hero) => {
    try {
      const newHero = new HeroSection(hero);
      await newHero.save();

      // Find hero category and add hero id to it
      await HeroSectionCategory.findByIdAndUpdate(
        hero.category,
        {
          $push: { heroes: newHero._id },
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
      const hero = await HeroSection.findOne(query).exec();

      return hero;
    } catch (error) {
      throw error;
    }
  };

  // Find hero by id
  static findHeroById = async (id) => {
    try {
      const hero = await HeroSection.findById(id).exec();
      return hero;
    } catch (error) {
      throw error;
    }
  };

  // Find all heroes
  static findAllHeroes = async () => {
    try {
      const hero = await HeroSection.find()
        .populate({ path: "uploadedBy", select: "name" })
        .populate({ path: "category", select: "name" })
        .exec();

      return hero;
    } catch (error) {
      throw error;
    }
  };

  // Find all heroes approved
  static findAllHeroesApproved = async () => {
    try {
      const hero = await HeroSection.find({ isApproved: true })
        .populate({ path: "uploadedBy", select: "name" })
        .populate({ path: "category", select: "name" })
        .exec();

      return hero;
    } catch (error) {
      throw error;
    }
  };

  // Find hero by id and update
  static findHeroByIdAndUpdate = async (id, update) => {
    try {
      // Get the old hero
      const oldHero = await HeroSection.findById(id).exec();

      const hero = await HeroSection.findByIdAndUpdate(id, update, {
        new: true,
      }).exec();

      // Find hero category and remove old hero id from it
      await HeroSectionCategory.findByIdAndUpdate(
        oldHero.category,
        {
          $pull: { heroes: oldHero._id },
        },
        { new: true }
      ).exec();

      // Find hero category and add new hero id to it
      await HeroSectionCategory.findByIdAndUpdate(
        hero.category,
        {
          $push: { heroes: hero._id },
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

  // Find hero by id and update approval status
  static findHeroByIdAndUpdateApprovalStatus = async (id, isApproved) => {
    try {
      const hero = await HeroSection.findByIdAndUpdate(
        id,
        { isApproved },
        { new: true }
      ).exec();

      return hero;
    } catch (error) {
      throw error;
    }
  };

  // Find hero by id and delete
  static findHeroByIdAndDelete = async (id) => {
    try {
      const hero = await HeroSection.findByIdAndDelete(id).exec();

      // Find hero category and remove hero id from it
      await HeroSectionCategory.findByIdAndUpdate(
        hero.category,
        {
          $pull: { heroes: hero._id },
        },
        { new: true }
      ).exec();

      return hero;
    } catch (error) {
      throw error;
    }
  };

  // Find all heroes paginated
  static findAllHeroesPaginated = async (page, perPage, searchParams = {}) => {
    try {
      const searchQuery = buildSearchQuery(searchParams);

      // Find all heroes, send latest heroes first
      const heroes = await HeroSection.find(searchQuery)
        .populate({ path: "uploadedBy", select: "name" })
        .populate({ path: "category", select: "name" })
        .sort({ createdAt: -1 })
        .skip((page - 1) * perPage)
        .limit(perPage);

      return heroes;
    } catch (error) {
      throw error;
    }
  };

  // Count all heroes
  static countAllHeroes = async (searchParams = {}) => {
    try {
      const searchQuery = buildSearchQuery(searchParams);

      const totalHeroes = await HeroSection.countDocuments(searchQuery);

      return totalHeroes;
    } catch (error) {
      throw error;
    }
  };

  // Find all approved heroes paginated
  static findAllApprovedHeroesPaginated = async (
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
      const heroes = await HeroSection.find(searchQuery)
        .populate({ path: "uploadedBy", select: "name" })
        .populate({ path: "category", select: "name" })
        .sort(sort)
        .skip((page - 1) * perPage)
        .limit(perPage);
      return heroes;
    } catch (error) {
      throw error;
    }
  };

  // Count all approved heroes
  static countAllApprovedHeroes = async (searchParams = {}) => {
    try {
      const searchQuery = {
        ...buildSearchQuery(searchParams),
        isApproved: true,
      };
      const total = await HeroSection.countDocuments(searchQuery);
      return total;
    } catch (error) {
      throw error;
    }
  };
}

module.exports = HeroSectionService;
