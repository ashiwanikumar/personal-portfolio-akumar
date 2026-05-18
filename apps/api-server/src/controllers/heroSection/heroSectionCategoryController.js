const HeroCategoryService = require("@services/heroSection/heroSectionCategoryService");

/**********************************
  Create a hero category
***********************************/
exports.createHeroCategory = async (req, res) => {
  const { name } = req.body;

  // Validate request
  if (!name) {
    return res.status(400).json({
      message: "Please enter the hero category name",
      status: "error",
    });
  }

  try {
    const newHero = await HeroCategoryService.createHeroCategory(req.body);

    res.status(201).json(newHero);
  } catch (error) {
    console.log("CREATE_HERO_CATEGORY_ERROR", error);
  }
};

/**********************************
  Get all hero categories
***********************************/
exports.getAllHeroCategories = async (req, res) => {
  try {
    const hero = await HeroCategoryService.findAllHeroCategories();

    res.status(200).json(hero);
  } catch (error) {
    console.log("GET_ALL_HERO_CATEGORIES_ERROR", error);
  }
};

/**********************************
  Get a hero category by id
***********************************/
exports.getHeroCategoryById = async (req, res) => {
  try {
    const hero = await HeroCategoryService.findHeroCategoryById(req.params.id);

    res.status(200).json(hero);
  } catch (error) {
    console.log("GET_HERO_CATEGORY_BY_ID_ERROR", error);
  }
};

/**********************************
  Update a hero category by id
***********************************/
exports.updateHeroCategoryById = async (req, res) => {
  const { name } = req.body;

  // Validate request
  if (!name) {
    return res.status(400).json({
      message: "Please enter the hero category name",
      status: "error",
    });
  }

  // If hero name already exists, return error
  const hero = await HeroCategoryService.findHeroCategoryByIdAndUpdate(
    req.params.id,
    req.body
  );

  res.status(200).json(hero);
};

/**********************************
  Delete a hero category by id
***********************************/
exports.deleteHeroCategoryById = async (req, res) => {
  try {
    const hero = await HeroCategoryService.findHeroCategoryByIdAndDelete(
      req.params.id
    );

    res.status(200).json(hero);
  } catch (error) {
    console.log("DELETE_HERO_CATEGORY_BY_ID_ERROR", error);
  }
};
