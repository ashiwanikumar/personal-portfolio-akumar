const mongoose = require("mongoose");

//** Blog **//
const Blog = require("@models/blog/blog");
const BlogCategory = require("@models/blog/blogCategory");
const BlogTag = require("@models/blog/blogTag");

const buildBlogSearchQuery = ({ searchText }) => {
  let query = {};

  if (searchText) {
    query.$or = [
      { title: { $regex: searchText, $options: "i" } },
      { description: { $regex: searchText, $options: "i" } },
    ];
  }

  return query;
};

class BlogService {
  // Create a blog
  static createBlog = async (blog) => {
    try {
      const newBlog = new Blog(blog);
      await newBlog.save();

      // Find blog category and add blog id to it
      await BlogCategory.findByIdAndUpdate(
        blog.category,
        {
          $push: { blogs: newBlog._id },
        },
        { new: true }
      ).exec();

      // Find blog tags and add blog id to it
      await BlogTag.updateMany(
        { _id: { $in: blog.tags } },
        {
          $push: { blogs: newBlog._id },
        },
        { new: true }
      ).exec();

      return newBlog;
    } catch (error) {
      throw error;
    }
  };

  // Find all blogs
  static findAllBlogs = async () => {
    try {
      // Populate author and select name and _id
      const blogs = await Blog.find()
        .populate({
          path: "author",
          select: "name _id",
        })
        .populate({
          path: "category",
          select: "name _id",
        })
        .sort({ createdAt: -1 })
        .exec();

      return blogs;
    } catch (error) {
      throw error;
    }
  };

  // Find all blogs approved
  static findAllBlogsApproved = async () => {
    try {
      // Populate author and select name and _id
      const blogs = await Blog.find({ isApproved: true })
        .populate({
          path: "author",
          select: "name _id",
        })
        .populate({
          path: "category",
          select: "name _id",
        })
        .sort({ createdAt: -1 })
        .exec();

      return blogs;
    } catch (error) {
      throw error;
    }
  };

  // Find a blog by id
  static findBlogById = async (id) => {
    try {
      const blog = await Blog.findById(id).populate("author", ["name", "_id"]);

      // Check if category is a string or ObjectId (Cuz initially in the schema it was a string, but now its an ObjectId)
      if (mongoose.Types.ObjectId.isValid(blog.category)) {
        await blog.populate("category", ["name", "_id"]).execPopulate();
      }

      // Similarly for tags
      if (
        Array.isArray(blog.tags) &&
        blog.tags.every(mongoose.Types.ObjectId.isValid)
      ) {
        await blog.populate("tags", ["name", "_id"]).execPopulate();
      }

      return blog;
    } catch (error) {
      throw error;
    }
  };

  // Find a blog by id tags cats
  static findBlogByIdTagsCats = async (id) => {
    try {
      const blog = await Blog.findById(id)
        .populate({
          path: "category",
          select: "name _id",
        })
        .populate({
          path: "tags",
          select: "name _id",
        })
        .exec();

      // Find all blog categories and select name and _id
      const blogCategories = await BlogCategory.find().exec();

      // Remove blog categories that have no blogs
      const blogCategoriesWithBlogs = blogCategories.filter(
        (blogCategory) => blogCategory.blogs.length > 0
      );

      // Find the 3 most recent blogs with only the title, publishedDate and coverImage
      const recentBlogs = await Blog.find()
        .select("title coverImage publishedDate")
        .sort({ createdAt: -1 })
        .limit(3)
        .exec();

      // Find all tags and select name and _id
      const tags = await BlogTag.find().select("name _id").exec();

      return {
        blog,
        blogCategories: blogCategoriesWithBlogs,
        tags,
        recentBlogs,
      };
    } catch (error) {
      throw error;
    }
  };

  // Update a blog by id
  static updateBlogById = async (id, update) => {
    try {
      // Find the old blog by id
      const oldBlog = await Blog.findById(id).exec();

      const blog = await Blog.findByIdAndUpdate(id, update, {
        new: true,
      }).exec();

      // Find old blog category and remove blog id from it
      await BlogCategory.findByIdAndUpdate(
        oldBlog.category,
        {
          $pull: { blogs: id },
        },
        { new: true }
      ).exec();

      // Find old blog tags and remove blog id from it
      await BlogTag.updateMany(
        { _id: { $in: oldBlog.tags } },
        {
          $pull: { blogs: id },
        },
        { new: true }
      ).exec();

      // Find blog category and add if its already not added, else remove it if its already added
      if (update.category) {
        await BlogCategory.findByIdAndUpdate(
          update.category,
          {
            $addToSet: { blogs: id },
          },
          { new: true }
        ).exec();
      }

      // Find blog tags and add if its already not added, else remove it if its already added
      if (update.tags) {
        await BlogTag.updateMany(
          { _id: { $in: update.tags } },
          {
            $addToSet: { blogs: id },
          },
          { new: true }
        ).exec();
      }

      return blog;
    } catch (error) {
      throw error;
    }
  };

  // Delete a blog by id
  static deleteBlogById = async (id) => {
    try {
      const blog = await Blog.findByIdAndDelete(id);

      // Find blog category and remove blog id from it
      await BlogCategory.findByIdAndUpdate(
        blog.category,
        {
          $pull: { blogs: id },
        },
        { new: true }
      ).exec();

      // Find blog tags and remove blog id from it
      await BlogTag.updateMany(
        { _id: { $in: blog.tags } },
        {
          $pull: { blogs: id },
        },
        { new: true }
      ).exec();

      return blog;
    } catch (error) {
      throw error;
    }
  };

  // Find blog by id and update approval status
  static findBlogByIdAndUpdateApprovalStatus = async (id, approved) => {
    try {
      const updateData = { approved };

      // If approving, also set status to 'published'
      // If unapproving, set status back to 'draft'
      if (approved) {
        updateData.status = "published";
      } else {
        updateData.status = "draft";
      }

      const blog = await Blog.findByIdAndUpdate(id, updateData, {
        new: true,
      }).exec();

      return blog;
    } catch (error) {
      throw error;
    }
  };

  // Find all blogs cats tags recent
  static findAllBlogsCatsTags = async () => {
    try {
      // Find all blogs an deselect the "content" and populate author and select name and _id (send the latest publishedDate one on top)
      const blogs = await Blog.find({ isApproved: true })
        .populate("author", ["name", "_id"])
        .select("-content")
        .sort({ publishedDate: -1 })
        .exec();

      // Find all blog categories and select name and _id, and select only if it has blogs which have isApproved true
      const blogCategories = await BlogCategory.aggregate([
        {
          $lookup: {
            from: "blogs",
            localField: "_id",
            foreignField: "category",
            as: "blogs",
          },
        },
        {
          $unwind: "$blogs",
        },
        {
          $match: {
            "blogs.isApproved": true,
          },
        },
        {
          $group: {
            _id: "$_id",
            name: { $first: "$name" },
            blogs: { $push: "$blogs" },
          },
        },
      ]);

      // Remove blog categories that have no blogs
      const blogCategoriesWithBlogs = blogCategories.filter(
        (blogCategory) => blogCategory?.blogs?.length > 0
      );

      // Find the 3 most recent blogs with only the title, publishedDate and coverImage
      const recentBlogs = await Blog.find({ isApproved: true })
        .select("title coverImage publishedDate")
        .sort({ publishedDate: -1 })
        .limit(3)
        .exec();

      // Find all blog tags and select name and _id
      const tags = await BlogTag.aggregate([
        {
          $lookup: {
            from: "blogs", // Name of the collection where blogs are stored
            localField: "_id",
            foreignField: "tags", // This should be the field in 'Blog' that references a 'BlogTag'
            as: "blogs",
          },
        },
        {
          $match: {
            "blogs.isApproved": true,
          },
        },
        {
          $project: {
            name: 1,
            _id: 1,
          },
        },
      ]);

      return {
        blogs,
        tags,
        blogCategories: blogCategoriesWithBlogs,
        recentBlogs,
      };
    } catch (error) {
      throw error;
    }
  };

  // Find all blogs paginated
  static findAllBlogsPaginatedWithSearch = async (
    page,
    perPage,
    searchParams = {}
  ) => {
    try {
      const searchQuery = buildBlogSearchQuery(searchParams);

      // Find blogs based on searchQuery
      let blogsQuery = Blog.find(searchQuery)
        .populate({
          path: "author",
          select: "name _id",
        })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .sort({ createdAt: -1 });

      // Check if category and tags are ObjectIds before populating
      const sampleBlog = await Blog.findOne(searchQuery);
      if (sampleBlog) {
        if (mongoose.isValidObjectId(sampleBlog.category)) {
          blogsQuery = blogsQuery.populate("category", ["name", "_id"]);
        }

        // Check each tag in the sampleBlog to decide whether to populate it
        if (Array.isArray(sampleBlog.tags) && sampleBlog.tags.length > 0) {
          // Check if at least one tag is a valid ObjectId
          const hasObjectIdTag = sampleBlog.tags.some((tag) =>
            mongoose.isValidObjectId(tag)
          );

          // Only populate tags if there's at least one valid ObjectId
          if (hasObjectIdTag) {
            blogsQuery = blogsQuery.populate({
              path: "tags",
              match: {
                _id: {
                  $in: sampleBlog.tags.filter((tag) =>
                    mongoose.isValidObjectId(tag)
                  ),
                },
              },
              select: "name _id",
            });
          }
        }
      }

      const blogs = await blogsQuery.exec();
      return blogs;
    } catch (error) {
      throw error;
    }
  };

  // Count all blogs
  static countAllBlogs = async (searchParams = {}) => {
    try {
      const searchQuery = buildBlogSearchQuery(searchParams);

      const totalBlogs = await Blog.countDocuments(searchQuery);

      return totalBlogs;
    } catch (error) {
      throw error;
    }
  };

  // Add media to blog
  static addMediaToBlog = async (blogId, mediaData) => {
    try {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $push: { media: mediaData },
        },
        { new: true }
      ).exec();

      return blog;
    } catch (error) {
      throw error;
    }
  };

  // Remove media from blog
  static removeMediaFromBlog = async (blogId, mediaId) => {
    try {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $pull: { media: { _id: mediaId } },
        },
        { new: true }
      ).exec();

      return blog;
    } catch (error) {
      throw error;
    }
  };

  // Get blog media
  static getBlogMedia = async (blogId) => {
    try {
      const blog = await Blog.findById(blogId).select("media").exec();
      return blog ? blog.media : [];
    } catch (error) {
      throw error;
    }
  };

  // Get blog author email
  static getBlogAuthorEmail = async (authorId) => {
    try {
      const User = require("@models/user/user");
      const user = await User.findById(authorId).select("email").exec();
      return user ? user.email : null;
    } catch (error) {
      throw error;
    }
  };

  // PUBLIC BLOG METHODS - Only return approved and published blogs

  // Find all public blogs (approved and published)
  static findAllPublicBlogs = async () => {
    try {
      const blogs = await Blog.find({
        approved: true,
        status: "published",
      })
        .populate({
          path: "author",
          select: "name _id",
        })
        .populate({
          path: "category",
          select: "name _id",
        })
        .populate({
          path: "tags",
          select: "name _id",
        })
        .select("-content") // Exclude content for list view
        .sort({ publishedDate: -1 })
        .exec();

      return blogs;
    } catch (error) {
      throw error;
    }
  };

  // Find public blogs paginated
  static findPublicBlogsPaginated = async (page = 1, perPage = 10) => {
    try {
      const blogs = await Blog.find({
        approved: true,
        status: "published",
      })
        .populate({
          path: "author",
          select: "name _id",
        })
        .populate({
          path: "category",
          select: "name _id",
        })
        .populate({
          path: "tags",
          select: "name _id",
        })
        .select("-content") // Exclude content for list view
        .skip((page - 1) * perPage)
        .limit(perPage)
        .sort({ publishedDate: -1 })
        .exec();

      return blogs;
    } catch (error) {
      throw error;
    }
  };

  // Find public blogs paginated with search
  static findPublicBlogsPaginatedWithSearch = async (
    page = 1,
    perPage = 10,
    searchParams = {}
  ) => {
    try {
      const searchQuery = buildBlogSearchQuery(searchParams);

      // Add public blog filters
      const publicQuery = {
        ...searchQuery,
        approved: true,
        status: "published",
      };

      // Do NOT exclude content field here
      const blogs = await Blog.find(publicQuery)
        .populate({
          path: "author",
          select: "name _id",
        })
        .populate({
          path: "category",
          select: "name _id",
        })
        .populate({
          path: "tags",
          select: "name _id",
        })
        // .select("-content") // REMOVE this line to include content
        .skip((page - 1) * perPage)
        .limit(perPage)
        .sort({ publishedDate: -1 })
        .exec();

      return blogs;
    } catch (error) {
      throw error;
    }
  };

  // Count public blogs
  static countPublicBlogs = async (searchParams = {}) => {
    try {
      const searchQuery = buildBlogSearchQuery(searchParams);

      // Add public blog filters
      const publicQuery = {
        ...searchQuery,
        approved: true,
        status: "published",
      };

      const totalBlogs = await Blog.countDocuments(publicQuery);
      return totalBlogs;
    } catch (error) {
      throw error;
    }
  };

  // Find public blog by ID (approved and published only)
  static findPublicBlogById = async (id) => {
    try {
      const blog = await Blog.findOne({
        _id: id,
        approved: true,
        status: "published",
      })
        .populate({
          path: "author",
          select: "name _id",
        })
        .populate({
          path: "category",
          select: "name _id",
        })
        .populate({
          path: "tags",
          select: "name _id",
        })
        .exec();

      return blog;
    } catch (error) {
      throw error;
    }
  };

  // Find public blogs with categories and tags
  static findPublicBlogsCatsTags = async () => {
    try {
      // Find all public blogs and deselect the "content" field
      const blogs = await Blog.find({
        approved: true,
        status: "published",
      })
        .populate("author", ["name", "_id"])
        .select("-content")
        .sort({ publishedDate: -1 })
        .exec();

      // Find all blog categories that have approved and published blogs
      const blogCategories = await BlogCategory.aggregate([
        {
          $lookup: {
            from: "blogs",
            localField: "_id",
            foreignField: "category",
            as: "blogs",
          },
        },
        {
          $unwind: "$blogs",
        },
        {
          $match: {
            "blogs.approved": true,
            "blogs.status": "published",
          },
        },
        {
          $group: {
            _id: "$_id",
            name: { $first: "$name" },
            color: { $first: "$color" },
            // Do NOT include blogs: { $push: "$blogs" }
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            color: 1,
            blogs: 0, // explicitly exclude blogs if present
          },
        },
      ]);

      // Find the 3 most recent public blogs
      const recentBlogs = await Blog.find({
        approved: true,
        status: "published",
      })
        .select("title coverImage publishedDate")
        .sort({ publishedDate: -1 })
        .limit(3)
        .exec();

      // Find all blog tags that have approved and published blogs
      const tags = await BlogTag.aggregate([
        {
          $lookup: {
            from: "blogs",
            localField: "_id",
            foreignField: "tags",
            as: "blogs",
          },
        },
        {
          $match: {
            "blogs.approved": true,
            "blogs.status": "published",
          },
        },
        {
          $project: {
            name: 1,
            _id: 1,
          },
        },
      ]);

      return {
        blogs,
        tags,
        blogCategories,
        recentBlogs,
      };
    } catch (error) {
      throw error;
    }
  };

  // Count blogs by category for safe deletion
  static countBlogsByCategory = async (categoryId) => {
    try {
      const count = await Blog.countDocuments({ category: categoryId });
      return count;
    } catch (error) {
      throw error;
    }
  };

  // Count blogs by tag for safe deletion
  static countBlogsByTag = async (tagId) => {
    try {
      const count = await Blog.countDocuments({ tags: tagId });
      return count;
    } catch (error) {
      throw error;
    }
  };
}

// Add a function to get a blog by slug for the public API
async function getPublicBlogBySlug(slug) {
  const blog = await Blog.findOne({ slug, status: "published", approved: true })
    .populate("category")
    .populate("tags")
    .populate("author");
  if (!blog) return null;
  // Sanitize and format as in the public API
  const { scheduledAt, publishAt, unpublishAt, ...rest } = blog.toObject();
  return rest;
}

module.exports = {
  BlogService,
  getPublicBlogBySlug,
};
