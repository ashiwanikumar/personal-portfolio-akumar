//** Blog **//
const BlogTag = require("@models/blog/blogTag");

const buildBlogTagSearchQuery = ({ searchText }) => {
  let query = {};

  if (searchText) {
    query.$or = [{ name: { $regex: searchText, $options: "i" } }];
  }

  return query;
};

class BlogTagService {
  // Create a blogTag
  static createBlogTag = async (blogTag) => {
    try {
      const newBlogTag = new BlogTag(blogTag);
      await newBlogTag.save();

      return newBlogTag;
    } catch (error) {
      throw error;
    }
  };

  // Find one blogTag
  static findOneBlogTag = async (query) => {
    try {
      const blogTag = await BlogTag.findOne(query).exec();

      return blogTag;
    } catch (error) {
      throw error;
    }
  };

  // Find blogTag by id
  static findBlogTagById = async (id) => {
    try {
      const blogTag = await BlogTag.findById(id).exec();

      return blogTag;
    } catch (error) {
      throw error;
    }
  };

  // Find all blogTags
  static findAllBlogTags = async () => {
    try {
      const blogTags = await BlogTag.find().exec();

      return blogTags;
    } catch (error) {
      throw error;
    }
  };

  // Find all blogTags paginated with search
  static findAllBlogTagsPaginatedWithSearch = async (
    page,
    perPage,
    searchParams = {}
  ) => {
    try {
      const searchQuery = buildBlogTagSearchQuery(searchParams);

      // Find blog tags based on searchQuery
      const blogTags = await BlogTag.find(searchQuery)
        .skip((page - 1) * perPage)
        .limit(perPage)
        .sort({ createdAt: -1 })
        .exec();

      return blogTags;
    } catch (error) {
      throw error;
    }
  };

  // Count all blog tags
  static countAllBlogTags = async (searchParams = {}) => {
    try {
      const searchQuery = buildBlogTagSearchQuery(searchParams);
      const totalTags = await BlogTag.countDocuments(searchQuery);
      return totalTags;
    } catch (error) {
      throw error;
    }
  };

  // Find blogTag by id and update
  static findBlogTagByIdAndUpdate = async (id, update) => {
    try {
      const blogTag = await BlogTag.findByIdAndUpdate(id, update, {
        new: true,
      }).exec();

      return blogTag;
    } catch (error) {
      throw error;
    }
  };

  // Find blogTag by id and delete
  static findBlogTagByIdAndDelete = async (id) => {
    try {
      const blogTag = await BlogTag.findByIdAndDelete(id).exec();

      return blogTag;
    } catch (error) {
      throw error;
    }
  };
}

module.exports = BlogTagService;
