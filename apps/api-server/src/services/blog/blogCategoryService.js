//** Blog **//
const BlogCategory = require("@models/blog/blogCategory");

const buildBlogCategorySearchQuery = ({ searchText }) => {
  let query = {};

  if (searchText) {
    query.$or = [{ name: { $regex: searchText, $options: "i" } }];
  }

  return query;
};

class BlogCategoryService {
  // Create a blogCategory
  static createBlogCategory = async (blogCategory) => {
    try {
      const newBlogCategory = new BlogCategory(blogCategory);
      await newBlogCategory.save();

      return newBlogCategory;
    } catch (error) {
      throw error;
    }
  };

  // Find one blogCategory
  static findOneBlogCategory = async (query) => {
    try {
      const blogCategory = await BlogCategory.findOne(query).exec();

      return blogCategory;
    } catch (error) {
      throw error;
    }
  };

  // Find blogCategory by id
  static findBlogCategoryById = async (id) => {
    try {
      const blogCategory = await BlogCategory.findById(id).exec();

      return blogCategory;
    } catch (error) {
      throw error;
    }
  };

  // Find all blogCategories
  static findAllBlogCategories = async () => {
    try {
      const blogCategories = await BlogCategory.find().exec();

      return blogCategories;
    } catch (error) {
      throw error;
    }
  };

  // Find all blogCategories paginated with search
  static findAllBlogCategoriesPaginatedWithSearch = async (
    page,
    perPage,
    searchParams = {}
  ) => {
    try {
      const searchQuery = buildBlogCategorySearchQuery(searchParams);

      // Find blog categories based on searchQuery
      const blogCategories = await BlogCategory.find(searchQuery)
        .skip((page - 1) * perPage)
        .limit(perPage)
        .sort({ createdAt: -1 })
        .exec();

      return blogCategories;
    } catch (error) {
      throw error;
    }
  };

  // Count all blog categories
  static countAllBlogCategories = async (searchParams = {}) => {
    try {
      const searchQuery = buildBlogCategorySearchQuery(searchParams);
      const totalCategories = await BlogCategory.countDocuments(searchQuery);
      return totalCategories;
    } catch (error) {
      throw error;
    }
  };

  // Find blogCategory by id and update
  static findBlogCategoryByIdAndUpdate = async (id, update) => {
    try {
      const blogCategory = await BlogCategory.findByIdAndUpdate(id, update, {
        new: true,
      }).exec();

      return blogCategory;
    } catch (error) {
      throw error;
    }
  };

  // Find blogCategory by id and delete
  static findBlogCategoryByIdAndDelete = async (id) => {
    try {
      const blogCategory = await BlogCategory.findByIdAndDelete(id).exec();

      return blogCategory;
    } catch (error) {
      throw error;
    }
  };
}

module.exports = BlogCategoryService;
