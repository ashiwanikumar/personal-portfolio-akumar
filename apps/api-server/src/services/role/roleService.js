const Role = require("@models/role/role");
const Resource = require("@models/role/resource");

class RoleService {
  // Create a role
  static createRole = async (roleData, userId) => {
    try {
      // Normalize name for duplicate check
      const normalizedName = roleData.name.trim().toLowerCase();
      const force = !!roleData.force;

      // Validate that all resources exist
      const resourceNames = roleData.accessRights.map(
        (right) => right.resource
      );
      const existingResources = await Resource.find({
        name: { $in: resourceNames },
        isActive: true,
      });

      if (existingResources.length !== resourceNames.length) {
        const existingResourceNames = existingResources.map((r) => r.name);
        const missingResources = resourceNames.filter(
          (name) => !existingResourceNames.includes(name)
        );
        throw new Error(`Invalid resources: ${missingResources.join(", ")}`);
      }

      // Validate permissions against available permissions for each resource
      for (const accessRight of roleData.accessRights) {
        const resource = existingResources.find(
          (r) => r.name === accessRight.resource
        );
        if (resource) {
          for (const permission in accessRight.permissions) {
            if (
              accessRight.permissions[permission] &&
              !resource.hasPermission(permission)
            ) {
              throw new Error(
                `Permission '${permission}' not available for resource ${accessRight.resource}'`
              );
            }
          }
        }
      }

      // Check if normalized role name already exists
      const existingRole = await Role.findOne({
        $or: [
          { name: new RegExp(`^${normalizedName}$`, "i") },
          { slug: normalizedName.replace(/\s+/g, "-") },
        ],
      });

      if (existingRole && !force) {
        // Warn, but allow override with force
        const error = new Error(
          "Role with this name already exists. Set 'force' to true to override."
        );
        error.code = "ROLE_EXISTS";
        throw error;
      }

      const newRole = new Role({
        ...roleData,
        createdBy: userId,
      });

      await newRole.save();
      return newRole;
    } catch (error) {
      throw error;
    }
  };

  // Find one role
  static findOneRole = async (query) => {
    try {
      const role = await Role.findOne(query)
        .populate("createdBy", "name email")
        .exec();
      return role;
    } catch (error) {
      throw error;
    }
  };

  // Find role by id
  static findRoleById = async (id) => {
    try {
      const role = await Role.findById(id)
        .populate("createdBy", "name email")
        .exec();
      return role;
    } catch (error) {
      throw error;
    }
  };

  // Find all roles with pagination and filtering
  static findAllRoles = async (options = {}) => {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        isActive = null,
        category = null,
      } = options;

      const query = {};

      // Search filter
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      // Active status filter
      if (isActive !== null) {
        query.isActive = isActive;
      }

      const skip = (page - 1) * limit;

      const roles = await Role.find(query)
        .populate("createdBy", "name email")
        .sort({ hierarchyLevel: 1, name: 1 })
        .skip(skip)
        .limit(limit)
        .exec();

      const total = await Role.countDocuments(query);

      return {
        roles,
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

  // Find role by id and update
  static findRoleByIdAndUpdate = async (id, update, userId) => {
    try {
      const role = await Role.findById(id);

      if (!role) {
        throw new Error("Role not found");
      }

      // Prevent updating system roles
      if (role.isSystemRole) {
        throw new Error("Cannot modify system roles");
      }

      // If updating access rights, validate them
      if (update.accessRights) {
        const resourceNames = update.accessRights.map(
          (right) => right.resource
        );
        const existingResources = await Resource.find({
          name: { $in: resourceNames },
          isActive: true,
        });

        if (existingResources.length !== resourceNames.length) {
          const existingResourceNames = existingResources.map((r) => r.name);
          const missingResources = resourceNames.filter(
            (name) => !existingResourceNames.includes(name)
          );
          throw new Error(`Invalid resources: ${missingResources.join(", ")}`);
        }

        // Validate permissions
        for (const accessRight of update.accessRights) {
          const resource = existingResources.find(
            (r) => r.name === accessRight.resource
          );
          if (resource) {
            for (const permission in accessRight.permissions) {
              if (
                accessRight.permissions[permission] &&
                !resource.hasPermission(permission)
              ) {
                throw new Error(
                  `Permission '${permission}' not available for resource ${accessRight.resource}`
                );
              }
            }
          }
        }
      }

      // Check name uniqueness if updating name
      if (update.name && update.name !== role.name) {
        const existingRole = await Role.findOne({
          name: update.name,
          _id: { $ne: id },
        });

        if (existingRole) {
          throw new Error("Role with this name already exists");
        }
      }

      const updatedRole = await Role.findByIdAndUpdate(
        id,
        { ...update, updatedBy: userId },
        { new: true, runValidators: true }
      ).populate("createdBy", "name email");

      return updatedRole;
    } catch (error) {
      throw error;
    }
  };

  // Find role by id and delete
  static findRoleByIdAndDelete = async (id) => {
    try {
      const role = await Role.findById(id);

      if (!role) {
        throw new Error("Role not found");
      }

      // Prevent deleting system roles
      if (role.isSystemRole) {
        throw new Error("Cannot delete system roles");
      }

      // Check if role is assigned to any users
      const User = require("@models/user/user");
      const usersWithRole = await User.countDocuments({ roleId: id });

      if (usersWithRole > 0) {
        throw new Error(
          `Cannot delete role. It is assigned to ${usersWithRole} user(s)`
        );
      }

      const deletedRole = await Role.findByIdAndDelete(id);
      return deletedRole;
    } catch (error) {
      throw error;
    }
  };

  // Find role by role name and get the access rights
  static findRoleAccessRightsByName = async (roleName) => {
    try {
      const userRole = await Role.findOne({
        name: roleName,
        isActive: true,
      }).exec();
      return userRole;
    } catch (error) {
      throw error;
    }
  };

  // Get available resources for role creation
  static getAvailableResources = async (category = null) => {
    try {
      let query = { isActive: true };
      if (category) {
        query.category = category;
      }

      const resources = await Resource.find(query)
        .sort({ priority: 1, name: 1 })
        .exec();

      return resources;
    } catch (error) {
      throw error;
    }
  };

  // Get resource categories
  static getResourceCategories = async () => {
    try {
      const categories = await Resource.getCategories();
      return categories;
    } catch (error) {
      throw error;
    }
  };

  // Check if user has permission for a specific resource
  static checkUserPermission = async (userId, resource, permission) => {
    try {
      const User = require("@models/user/user");
      const user = await User.findById(userId).populate("roleId").exec();

      if (!user || !user.roleId || !user.roleId.isActive) {
        return false;
      }

      return user.roleId.hasPermission(resource, permission);
    } catch (error) {
      throw error;
    }
  };

  // Get user's complete permissions
  static getUserPermissions = async (userId) => {
    try {
      const User = require("@models/user/user");
      const user = await User.findById(userId).populate("roleId").exec();

      if (!user || !user.roleId || !user.roleId.isActive) {
        return {};
      }

      const permissions = {};
      user.roleId.accessRights.forEach((right) => {
        permissions[right.resource] = right.permissions;
      });

      return permissions;
    } catch (error) {
      throw error;
    }
  };

  // Create default system roles
  static createDefaultRoles = async (userId) => {
    try {
      const defaultRoles = [
        {
          name: "Super Admin",
          description: "Full system access with all permissions",
          isSystemRole: true,
          hierarchyLevel: 1,
          approvalRights: true,
          accessRights: [], // Will be populated with all available resources
        },
        {
          name: "Admin",
          description: "Administrative access with most permissions",
          isSystemRole: true,
          hierarchyLevel: 2,
          approvalRights: true,
          accessRights: [],
        },
        {
          name: "Content Manager",
          description: "Manages content and blog posts",
          isSystemRole: true,
          hierarchyLevel: 3,
          approvalRights: false,
          accessRights: [],
        },
        {
          name: "Viewer",
          description: "Read-only access to most resources",
          isSystemRole: true,
          hierarchyLevel: 4,
          approvalRights: false,
          accessRights: [],
        },
      ];

      const resources = await this.getAvailableResources();

      for (const roleData of defaultRoles) {
        const existingRole = await Role.findOne({ name: roleData.name });
        if (!existingRole) {
          // Set permissions based on role level
          roleData.accessRights = resources.map((resource) => ({
            resource: resource.name,
            permissions: this.getDefaultPermissionsForRole(
              roleData.name,
              resource
            ),
          }));

          await this.createRole(roleData, userId);
        }
      }
    } catch (error) {
      throw error;
    }
  };

  // Get default permissions for a role
  static getDefaultPermissionsForRole = (roleName, resource) => {
    const permissions = {
      read: false,
      write: false,
      delete: false,
      approve: false,
    };

    switch (roleName) {
      case "Super Admin":
        permissions.read = true;
        permissions.write = true;
        permissions.delete = true;
        permissions.approve = true;
        break;
      case "Admin":
        permissions.read = true;
        permissions.write = true;
        permissions.delete = resource.availablePermissions.delete;
        permissions.approve = true;
        break;
      case "Content Manager":
        if (
          ["Blogs", "Gallery", "Hero Image Slider", "Announcements"].includes(
            resource.name
          )
        ) {
          permissions.read = true;
          permissions.write = true;
          permissions.approve = resource.availablePermissions.approve;
        } else {
          permissions.read = true;
        }
        break;
      case "Viewer":
        permissions.read = true;
        break;
    }

    return permissions;
  };
}

module.exports = RoleService;
