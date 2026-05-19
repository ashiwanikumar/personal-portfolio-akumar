const HeroImageCategory = require("@models/heroImage/heroCategory");

class HeroCategoryService {
  // Create a hero
  static createHeroCategory = async (hero) => {
    try {
      const newHero = new HeroImageCategory(hero);
      await newHero.save();

      return newHero;
    } catch (error) {
      throw error;
    }
  };

  // Find one hero
  static findOneHero = async (query) => {
    try {
      const hero = await HeroImageCategory.findOne(query).exec();

      return hero;
    } catch (error) {
      throw error;
    }
  };

  // Find hero category by id
  static findHeroCategoryById = async (id) => {
    try {
      const hero = await HeroImageCategory.findById(id).exec();

      return hero;
    } catch (error) {
      throw error;
    }
  };

  // Find all hero categories
  static findAllHeroCategories = async () => {
    try {
      const hero = await HeroImageCategory.find().exec();

      return hero;
    } catch (error) {
      throw error;
    }
  };

  // Find hero category by id and update
  static findHeroCategoryByIdAndUpdate = async (id, update) => {
    try {
      const hero = await HeroImageCategory.findByIdAndUpdate(id, update, {
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
      const hero = await HeroImageCategory.findByIdAndDelete(id).exec();

      return hero;
    } catch (error) {
      throw error;
    }
  };
}

module.exports = HeroCategoryService;
