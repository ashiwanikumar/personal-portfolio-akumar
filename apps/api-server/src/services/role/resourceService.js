const Resource = require("@models/role/resource");

class ResourceService {
  // Create a resource
  static createResource = async (resourceData, userId) => {
    try {
      // Check if resource name already exists
      const existingResource = await Resource.findOne({
        $or: [{ name: resourceData.name }, { slug: resourceData.slug }],
      });

      if (existingResource) {
        throw new Error("Resource with this name already exists");
      }

      const newResource = new Resource({
        ...resourceData,
        createdBy: userId,
      });

      await newResource.save();
      return newResource;
    } catch (error) {
      throw error;
    }
  };

  // Find one resource
  static findOneResource = async (query) => {
    try {
      const resource = await Resource.findOne(query)
        .populate("createdBy", "name email")
        .exec();
      return resource;
    } catch (error) {
      throw error;
    }
  };

  // Find resource by id
  static findResourceById = async (id) => {
    try {
      const resource = await Resource.findById(id)
        .populate("createdBy", "name email")
        .exec();
      return resource;
    } catch (error) {
      throw error;
    }
  };

  // Find all resources with pagination and filtering
  static findAllResources = async (options = {}) => {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        category = null,
        isActive = null,
      } = options;

      const query = {};

      // Search filter
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      // Category filter
      if (category) {
        query.category = category;
      }

      // Active status filter
      if (isActive !== null) {
        query.isActive = isActive;
      }

      const skip = (page - 1) * limit;

      const resources = await Resource.find(query)
        .populate("createdBy", "name email")
        .sort({ priority: 1, name: 1 })
        .skip(skip)
        .limit(limit)
        .exec();

      const total = await Resource.countDocuments(query);

      return {
        resources,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  };

  // Find resource by id and update
  static findResourceByIdAndUpdate = async (id, update, userId) => {
    try {
      const resource = await Resource.findById(id);

      if (!resource) {
        throw new Error("Resource not found");
      }

      // Check name uniqueness if updating name
      if (update.name && update.name !== resource.name) {
        const existingResource = await Resource.findOne({
          name: update.name,
          _id: { $ne: id },
        });

        if (existingResource) {
          throw new Error("Resource with this name already exists");
        }
      }

      const updatedResource = await Resource.findByIdAndUpdate(
        id,
        { ...update, updatedBy: userId },
        { new: true, runValidators: true }
      ).populate("createdBy", "name email");

      return updatedResource;
    } catch (error) {
      throw error;
    }
  };

  // Find resource by id and delete
  static findResourceByIdAndDelete = async (id) => {
    try {
      const resource = await Resource.findById(id);

      if (!resource) {
        throw new Error("Resource not found");
      }

      // Check if resource is used in any roles
      const Role = require("@models/role/role");
      const rolesUsingResource = await Role.countDocuments({
        accessRights: { resource: resource.name },
      });

      if (rolesUsingResource > 0) {
        throw new Error(
          `Cannot delete resource. It is used by ${rolesUsingResource} role(s)`
        );
      }

      const deletedResource = await Resource.findByIdAndDelete(id);
      return deletedResource;
    } catch (error) {
      throw error;
    }
  };

  // Get active resources
  static getActiveResources = async () => {
    try {
      const resources = await Resource.findActiveResources();
      return resources;
    } catch (error) {
      throw error;
    }
  };

  // Get resources by category
  static getResourcesByCategory = async (category) => {
    try {
      const resources = await Resource.findByCategory(category);
      return resources;
    } catch (error) {
      throw error;
    }
  };

  // Get all categories
  static getCategories = async () => {
    try {
      const categories = await Resource.getCategories();
      return categories;
    } catch (error) {
      throw error;
    }
  };

  // Create default resources
  static createDefaultResources = async (userId) => {
    try {
      const defaultResources = [
        {
          name: "Visitors",
          description: "Website visitor analytics and data management",
          category: "analytics",
          priority: 1,
          icon: "users",
          availablePermissions: {
            read: true,
            write: true,
            delete: false,
            approve: false,
          },
          endpoints: [
            {
              method: "GET",
              path: "/api/v1/visitors/paginated",
              description: "Get paginated visitor data",
            },
            {
              method: "GET",
              path: "/api/v1/visitors/analytics/overview",
              description: "Get visitor analytics overview",
            },
            {
              method: "GET",
              path: "/api/v1/visitors/analytics/urls",
              description: "Get URL analytics",
            },
            {
              method: "GET",
              path: "/api/v1/visitors/analytics/geographic",
              description: "Get geographic analytics",
            },
            {
              method: "GET",
              path: "/api/v1/visitors/analytics/sources",
              description: "Get traffic source analytics",
            },
            {
              method: "GET",
              path: "/api/v1/visitors/analytics/realtime",
              description: "Get real-time activity",
            },
          ],
        },
        {
          name: "Contact Us",
          description: "Contact form submissions and inquiries management",
          category: "communications",
          priority: 2,
          icon: "contact",
          availablePermissions: {
            read: true,
            write: true,
            delete: true,
            approve: false,
          },
          endpoints: [
            {
              method: "POST",
              path: "/api/v1/contact-us/contacts",
              description: "Submit contact form",
            },
            {
              method: "GET",
              path: "/api/v1/contact-us/contacts/paginated",
              description: "Get paginated contacts",
            },
            {
              method: "GET",
              path: "/api/v1/contact-us/contacts/search",
              description: "Search contacts",
            },
            {
              method: "GET",
              path: "/api/v1/contact-us/contacts/filter",
              description: "Filter contacts",
            },
            {
              method: "GET",
              path: "/api/v1/contact-us/contacts/statistics",
              description: "Get contact statistics",
            },
            {
              method: "GET",
              path: "/api/v1/contact-us/contacts/export",
              description: "Export contacts",
            },
            {
              method: "GET",
              path: "/api/v1/contact-us/contacts/:id",
              description: "Get contact details",
            },
            {
              method: "PUT",
              path: "/api/v1/contact-us/contacts/:id",
              description: "Update contact",
            },
            {
              method: "DELETE",
              path: "/api/v1/contact-us/contacts/:id",
              description: "Delete contact",
            },
            {
              method: "POST",
              path: "/api/v1/contact-us/contacts/bulk-delete",
              description: "Bulk delete contacts",
            },
          ],
        },
        {
          name: "Blogs",
          description: "Blog post management and content creation",
          category: "content",
          priority: 3,
          icon: "blog",
          availablePermissions: {
            read: true,
            write: true,
            delete: true,
            approve: true,
          },
          endpoints: [
            {
              method: "GET",
              path: "/api/v1/blogs",
              description: "Get all blogs",
            },
            {
              method: "GET",
              path: "/api/v1/blogs/paginated",
              description: "Get paginated blogs",
            },
            {
              method: "GET",
              path: "/api/v1/blogs/paginated/search",
              description: "Search blogs",
            },
            {
              method: "GET",
              path: "/api/v1/blog/:id",
              description: "Get blog by ID",
            },
            {
              method: "POST",
              path: "/api/v1/blog",
              description: "Create blog",
            },
            {
              method: "PUT",
              path: "/api/v1/blog/:id",
              description: "Update blog",
            },
            {
              method: "DELETE",
              path: "/api/v1/blog/:id",
              description: "Delete blog",
            },
            {
              method: "PUT",
              path: "/api/v1/blog/approve/:id",
              description: "Approve blog",
            },
            {
              method: "POST",
              path: "/api/v1/blog/cover-image",
              description: "Upload blog cover image",
            },
            {
              method: "POST",
              path: "/api/v1/blog/content-image",
              description: "Upload blog content image",
            },
          ],
        },
        {
          name: "Announcements",
          description: "Public announcements and notifications management",
          category: "content",
          priority: 4,
          icon: "announcement",
          availablePermissions: {
            read: true,
            write: true,
            delete: true,
            approve: true,
          },
          endpoints: [
            {
              method: "GET",
              path: "/api/v1/announcements",
              description: "Get all announcements",
            },
            {
              method: "GET",
              path: "/api/v1/announcements-approved",
              description: "Get approved announcements",
            },
            {
              method: "GET",
              path: "/api/v1/announcements/paginated",
              description: "Get paginated announcements",
            },
            {
              method: "GET",
              path: "/api/v1/announcement/:id",
              description: "Get announcement by ID",
            },
            {
              method: "POST",
              path: "/api/v1/announcement",
              description: "Create announcement",
            },
            {
              method: "PUT",
              path: "/api/v1/announcement/:id",
              description: "Update announcement",
            },
            {
              method: "DELETE",
              path: "/api/v1/announcement/:id",
              description: "Delete announcement",
            },
            {
              method: "PUT",
              path: "/api/v1/announcement/:id/approval",
              description: "Update announcement approval",
            },
            {
              method: "POST",
              path: "/api/v1/announcement/image",
              description: "Upload announcement image",
            },
          ],
        },
        {
          name: "Gallery Section",
          description: "Image gallery and media management",
          category: "content",
          priority: 5,
          icon: "gallery",
          availablePermissions: {
            read: true,
            write: true,
            delete: true,
            approve: true,
          },
          endpoints: [
            {
              method: "GET",
              path: "/api/v1/gallery/approved-gallery-section",
              description: "Get approved gallery media",
            },
            {
              method: "GET",
              path: "/api/v1/gallery/media/:id",
              description: "Get media by ID",
            },
            {
              method: "GET",
              path: "/api/v1/gallery/media/all",
              description: "Get all gallery media",
            },
            {
              method: "GET",
              path: "/api/v1/gallery/tags/popular",
              description: "Get popular tags",
            },
            {
              method: "GET",
              path: "/api/v1/gallery-media/paginated",
              description: "Get paginated gallery media",
            },
            {
              method: "POST",
              path: "/api/v1/gallery/media",
              description: "Create gallery media",
            },
            {
              method: "POST",
              path: "/api/v1/gallery/media/bulk",
              description: "Create multiple gallery media",
            },
            {
              method: "PUT",
              path: "/api/v1/gallery/media/:id",
              description: "Update gallery media",
            },
            {
              method: "PUT",
              path: "/api/v1/gallery/media/:id/metadata",
              description: "Update media metadata",
            },
            {
              method: "PUT",
              path: "/api/v1/gallery/media/:id/approval",
              description: "Update media approval",
            },
            {
              method: "PUT",
              path: "/api/v1/gallery/media/:id/featured",
              description: "Update media featured status",
            },
            {
              method: "DELETE",
              path: "/api/v1/gallery/media/:id",
              description: "Delete gallery media",
            },
            {
              method: "DELETE",
              path: "/api/v1/gallery/media/bulk",
              description: "Delete multiple gallery media",
            },
            {
              method: "POST",
              path: "/api/v1/gallery/upload-media",
              description: "Upload gallery media",
            },
          ],
        },
        {
          name: "Hero Images",
          description: "Homepage hero image and video slider management",
          category: "content",
          priority: 6,
          icon: "hero",
          availablePermissions: {
            read: true,
            write: true,
            delete: true,
            approve: true,
          },
          endpoints: [
            {
              method: "GET",
              path: "/api/v1/hero/images",
              description: "Get all hero images",
            },
            {
              method: "GET",
              path: "/api/v1/hero/images/approved",
              description: "Get approved hero images",
            },
            {
              method: "GET",
              path: "/api/v1/hero-images/paginated",
              description: "Get paginated hero images",
            },
            {
              method: "GET",
              path: "/api/v1/hero-images/approved/paginated",
              description: "Get paginated approved hero images",
            },
            {
              method: "GET",
              path: "/api/v1/hero/image/:id",
              description: "Get hero image by ID",
            },
            {
              method: "POST",
              path: "/api/v1/hero/image",
              description: "Create hero image",
            },
            {
              method: "POST",
              path: "/api/v1/hero/video",
              description: "Create hero video",
            },
            {
              method: "PUT",
              path: "/api/v1/hero/image/:id",
              description: "Update hero image",
            },
            {
              method: "PUT",
              path: "/api/v1/hero/image/:id/approval",
              description: "Update hero image approval",
            },
            {
              method: "DELETE",
              path: "/api/v1/hero/image/:id",
              description: "Delete hero image",
            },
            {
              method: "POST",
              path: "/api/v1/hero/upload-image",
              description: "Upload hero image",
            },
            {
              method: "POST",
              path: "/api/v1/hero/upload-video",
              description: "Upload hero video",
            },
          ],
        },
        {
          name: "Newsletters",
          description: "Newsletter subscription and campaign management",
          category: "communications",
          priority: 7,
          icon: "newsletter",
          availablePermissions: {
            read: true,
            write: true,
            delete: true,
            approve: false,
          },
          endpoints: [
            {
              method: "POST",
              path: "/api/v1/newsletter/subscribe",
              description: "Subscribe to newsletter",
            },
            {
              method: "GET",
              path: "/api/v1/newsletter/subscribers/paginated",
              description: "Get paginated subscribers",
            },
            {
              method: "GET",
              path: "/api/v1/newsletter/subscribers/search",
              description: "Search subscribers",
            },
            {
              method: "GET",
              path: "/api/v1/newsletter/subscribers/filter",
              description: "Filter subscribers",
            },
            {
              method: "GET",
              path: "/api/v1/newsletter/stats",
              description: "Get newsletter statistics",
            },
            {
              method: "PUT",
              path: "/api/v1/newsletter/subscriber/:id/preferences",
              description: "Update subscriber preferences",
            },
            {
              method: "DELETE",
              path: "/api/v1/newsletter/subscriber/:id",
              description: "Delete subscriber",
            },
            {
              method: "POST",
              path: "/api/v1/newsletter/test-email",
              description: "Send test newsletter email",
            },
          ],
        },
        {
          name: "Abuse Complaints",
          description: "Abuse complaint submission and management",
          category: "system",
          priority: 8,
          icon: "complaint",
          availablePermissions: {
            read: true,
            write: true,
            delete: true,
            approve: true,
          },
          endpoints: [
            {
              method: "POST",
              path: "/api/v1/abuse-complaints/submit",
              description: "Submit abuse complaint",
            },
            {
              method: "GET",
              path: "/api/v1/abuse-complaints/paginated",
              description: "Get paginated complaints",
            },
            {
              method: "GET",
              path: "/api/v1/abuse-complaints/search",
              description: "Search complaints",
            },
            {
              method: "GET",
              path: "/api/v1/abuse-complaints/filter",
              description: "Filter complaints",
            },
            {
              method: "GET",
              path: "/api/v1/abuse-complaints/:id",
              description: "Get complaint details",
            },
            {
              method: "PUT",
              path: "/api/v1/abuse-complaints/:id",
              description: "Update complaint",
            },
            {
              method: "DELETE",
              path: "/api/v1/abuse-complaints/:id",
              description: "Delete complaint",
            },
            {
              method: "PUT",
              path: "/api/v1/abuse-complaints/:id/assign",
              description: "Assign complaint",
            },
            {
              method: "PUT",
              path: "/api/v1/abuse-complaints/:id/resolve",
              description: "Resolve complaint",
            },
            {
              method: "PUT",
              path: "/api/v1/abuse-complaints/:id/duplicate",
              description: "Mark as duplicate",
            },
            {
              method: "POST",
              path: "/api/v1/abuse-complaints/:id/notes",
              description: "Add complaint note",
            },
            {
              method: "PUT",
              path: "/api/v1/abuse-complaints/:id/notes/:noteId",
              description: "Update complaint note",
            },
            {
              method: "GET",
              path: "/api/v1/abuse-complaints/export",
              description: "Export complaints",
            },
          ],
        },
        {
          name: "Ask SS Chouhan",
          description: "Citizen queries and questions management",
          category: "citizen-services",
          priority: 9,
          icon: "question",
          availablePermissions: {
            read: true,
            write: true,
            delete: true,
            approve: true,
          },
          endpoints: [
            {
              method: "POST",
              path: "/api/v1/citizen-services/ask-sschouhan/submit",
              description: "Submit query",
            },
            {
              method: "GET",
              path: "/api/v1/citizen-services/ask-sschouhan/queries/paginated",
              description: "Get paginated queries",
            },
            {
              method: "GET",
              path: "/api/v1/citizen-services/ask-sschouhan/queries/search",
              description: "Search queries",
            },
            {
              method: "GET",
              path: "/api/v1/citizen-services/ask-sschouhan/queries/filter",
              description: "Filter queries",
            },
            {
              method: "GET",
              path: "/api/v1/citizen-services/ask-sschouhan/stats",
              description: "Get query statistics",
            },
            {
              method: "GET",
              path: "/api/v1/citizen-services/ask-sschouhan/category-stats",
              description: "Get category statistics",
            },
            {
              method: "GET",
              path: "/api/v1/citizen-services/ask-sschouhan/state-stats",
              description: "Get state statistics",
            },
            {
              method: "GET",
              path: "/api/v1/citizen-services/ask-sschouhan/query/:id",
              description: "Get query by ID",
            },
            {
              method: "GET",
              path: "/api/v1/citizen-services/ask-sschouhan/query/:id/history",
              description: "Get query history",
            },
            {
              method: "PUT",
              path: "/api/v1/citizen-services/ask-sschouhan/query/:id/status",
              description: "Update query status",
            },
            {
              method: "PUT",
              path: "/api/v1/citizen-services/ask-sschouhan/query/:id/processing",
              description: "Update query processing",
            },
            {
              method: "PUT",
              path: "/api/v1/citizen-services/ask-sschouhan/query/:id/assign",
              description: "Assign query to admin",
            },
            {
              method: "PUT",
              path: "/api/v1/citizen-services/ask-sschouhan/query/:id/escalate",
              description: "Escalate query",
            },
            {
              method: "POST",
              path: "/api/v1/citizen-services/ask-sschouhan/query/:id/note",
              description: "Add query note",
            },
            {
              method: "DELETE",
              path: "/api/v1/citizen-services/ask-sschouhan/query/:id",
              description: "Delete query",
            },
            {
              method: "GET",
              path: "/api/v1/citizen-services/ask-sschouhan/analytics/duplicates",
              description: "Get duplicate analytics",
            },
            {
              method: "GET",
              path: "/api/v1/citizen-services/ask-sschouhan/analytics/submission-times",
              description: "Get submission time analytics",
            },
            {
              method: "GET",
              path: "/api/v1/citizen-services/ask-sschouhan/analytics/districts",
              description: "Get district analytics",
            },
            {
              method: "GET",
              path: "/api/v1/citizen-services/ask-sschouhan/analytics/devices",
              description: "Get device analytics",
            },
            {
              method: "GET",
              path: "/api/v1/citizen-services/ask-sschouhan/analytics/query-information",
              description: "Get query information analytics",
            },
            {
              method: "GET",
              path: "/api/v1/citizen-services/ask-sschouhan/analytics/citizen-profiles",
              description: "Get citizen profile analytics",
            },
            {
              method: "GET",
              path: "/api/v1/citizen-services/ask-sschouhan/analytics/dashboard",
              description: "Get analytics dashboard",
            },
            {
              method: "GET",
              path: "/api/v1/citizen-services/ask-sschouhan/analytics/trends",
              description: "Get trend analytics",
            },
          ],
        },
        {
          name: "User Management",
          description: "User account and role management",
          category: "user-management",
          priority: 10,
          icon: "users",
          availablePermissions: {
            read: true,
            write: true,
            delete: true,
            approve: true,
          },
          endpoints: [
            {
              method: "GET",
              path: "/api/v1/users",
              description: "Get all users",
            },
            {
              method: "GET",
              path: "/api/v1/users/paginated",
              description: "Get paginated users",
            },
            {
              method: "GET",
              path: "/api/v1/users/search",
              description: "Search users",
            },
            {
              method: "GET",
              path: "/api/v1/users/:id",
              description: "Get user by ID",
            },
            {
              method: "PUT",
              path: "/api/v1/users/:id",
              description: "Update user",
            },
            {
              method: "DELETE",
              path: "/api/v1/users/:id",
              description: "Delete user",
            },
            {
              method: "PUT",
              path: "/api/v1/users/:id/role",
              description: "Assign role to user",
            },
            {
              method: "GET",
              path: "/api/v1/users/:roleId/users",
              description: "Get users by role",
            },
            {
              method: "GET",
              path: "/api/v1/users/available-roles",
              description: "Get available roles for assignment",
            },
            {
              method: "GET",
              path: "/api/v1/users/role-hierarchy",
              description: "Get role hierarchy",
            },
          ],
        },
        {
          name: "Role Management",
          description: "Role and permission management",
          category: "system",
          priority: 11,
          icon: "shield",
          availablePermissions: {
            read: true,
            write: true,
            delete: true,
            approve: false,
          },
          endpoints: [
            {
              method: "GET",
              path: "/api/v1/roles",
              description: "Get all roles",
            },
            {
              method: "GET",
              path: "/api/v1/role/:id",
              description: "Get role by ID",
            },
            {
              method: "POST",
              path: "/api/v1/role",
              description: "Create role",
            },
            {
              method: "PUT",
              path: "/api/v1/role/:id",
              description: "Update role",
            },
            {
              method: "DELETE",
              path: "/api/v1/role/:id",
              description: "Delete role",
            },
            {
              method: "GET",
              path: "/api/v1/roles/resources",
              description: "Get available resources",
            },
            {
              method: "GET",
              path: "/api/v1/roles/resource-categories",
              description: "Get resource categories",
            },
            {
              method: "GET",
              path: "/api/v1/roles/stats",
              description: "Get role statistics",
            },
            {
              method: "GET",
              path: "/api/v1/roles/user-permissions",
              description: "Get user permissions",
            },
            {
              method: "GET",
              path: "/api/v1/roles/check-permission/:resource/:permission",
              description: "Check user permission",
            },
            {
              method: "POST",
              path: "/api/v1/roles/create-default",
              description: "Create default roles",
            },
          ],
        },
      ];

      for (const resourceData of defaultResources) {
        const existingResource = await Resource.findOne({
          name: resourceData.name,
        });
        if (!existingResource) {
          await this.createResource(resourceData, userId);
        }
      }
    } catch (error) {
      throw error;
    }
  };
}

module.exports = ResourceService;
