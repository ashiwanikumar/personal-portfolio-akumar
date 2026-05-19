const HeroSectionCategory = require("@models/heroSection/heroSectionCategory");

class HeroCategoryService {
  // Create a hero category
  static createHeroCategory = async (hero) => {
    try {
      const newHero = new HeroSectionCategory(hero);
      await newHero.save();

      return newHero;
    } catch (error) {
      throw error;
    }
  };

  // Find one hero category
  static findOneHeroCategory = async (query) => {
    try {
      const hero = await HeroSectionCategory.findOne(query).exec();

      return hero;
    } catch (error) {
      throw error;
    }
  };

  // Find hero category by id
  static findHeroCategoryById = async (id) => {
    try {
      const hero = await HeroSectionCategory.findById(id).exec();

      return hero;
    } catch (error) {
      throw error;
    }
  };

  // Find all hero categories
  static findAllHeroCategories = async () => {
    try {
      const hero = await HeroSectionCategory.find().exec();

      return hero;
    } catch (error) {
      throw error;
    }
  };

  // Find hero category by id and update
  static findHeroCategoryByIdAndUpdate = async (id, update) => {
    try {
      const hero = await HeroSectionCategory.findByIdAndUpdate(id, update, {
        new: true,
      }).exec();

      return hero;
    } catch (error) {
      throw error;
    }
  };

  // Find hero category by id and delete
  static findHeroCategoryByIdAndDelete = async (id) => {
    try {
      const hero = await HeroSectionCategory.findByIdAndDelete(id).exec();

      return hero;
    } catch (error) {
      throw error;
    }
  };
}

module.exports = HeroCategoryService;
