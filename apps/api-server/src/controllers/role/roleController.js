const RoleService = require("@services/role/roleService");
const ResourceService = require("@services/role/resourceService");

/**********************************
  Create a role
***********************************/
exports.createRole = async (req, res) => {
  try {
    const newRole = await RoleService.createRole(req.body, req.user._id);

    res.status(201).json({
      success: true,
      message: "Role created successfully",
      role: newRole,
    });
  } catch (error) {
    console.log("CREATE_ROLE_ERROR", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create role",
    });
  }
};

/**********************************
  Get all roles with pagination and filtering
***********************************/
exports.getAllRoles = async (req, res) => {
  try {
    const { page, limit, search, isActive } = req.query;

    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      search: search || "",
      isActive: isActive !== undefined ? isActive === true : null,
    };

    const result = await RoleService.findAllRoles(options);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.log("GET_ALL_ROLES_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch roles",
    });
  }
};

/**********************************
  Get a role by id
***********************************/
exports.getRoleById = async (req, res) => {
  try {
    const role = await RoleService.findRoleById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    res.status(200).json({
      success: true,
      role,
    });
  } catch (error) {
    console.log("GET_ROLE_BY_ID_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch role",
    });
  }
};

/**********************************
  Update a role by id
***********************************/
exports.updateRoleById = async (req, res) => {
  try {
    const role = await RoleService.findRoleByIdAndUpdate(
      req.params.id,
      req.body,
      req.user._id
    );

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Role updated successfully",
      role,
    });
  } catch (error) {
    console.log("UPDATE_ROLE_BY_ID_ERROR", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update role",
    });
  }
};

/**********************************
  Delete a role by id
***********************************/
exports.deleteRoleById = async (req, res) => {
  try {
    const role = await RoleService.findRoleByIdAndDelete(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Role deleted successfully",
      role,
    });
  } catch (error) {
    console.log("DELETE_ROLE_BY_ID_ERROR", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to delete role",
    });
  }
};

/**********************************
  Get available resources for role creation
***********************************/
exports.getAvailableResources = async (req, res) => {
  try {
    const { category } = req.query;
    const resources = await RoleService.getAvailableResources(category);

    res.status(200).json({
      success: true,
      resources,
    });
  } catch (error) {
    console.log("GET_AVAILABLE_RESOURCES_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch available resources",
    });
  }
};

/**********************************
  Get resource categories
***********************************/
exports.getResourceCategories = async (req, res) => {
  try {
    const categories = await RoleService.getResourceCategories();

    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.log("GET_RESOURCE_CATEGORIES_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch resource categories",
    });
  }
};

/**********************************
  Check user permission for a specific resource
***********************************/
exports.checkUserPermission = async (req, res) => {
  try {
    const { resource, permission } = req.params;
    const hasPermission = await RoleService.checkUserPermission(
      req.user._id,
      resource,
      permission
    );

    res.status(200).json({
      success: true,
      hasPermission,
    });
  } catch (error) {
    console.log("CHECK_USER_PERMISSION_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Failed to check user permission",
    });
  }
};

/**********************************
  Get user's complete permissions
***********************************/
exports.getUserPermissions = async (req, res) => {
  try {
    const permissions = await RoleService.getUserPermissions(req.user._id);

    res.status(200).json({
      success: true,
      permissions,
    });
  } catch (error) {
    console.log("GET_USER_PERMISSIONS_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user permissions",
    });
  }
};

/**********************************
  Create default system roles
***********************************/
exports.createDefaultRoles = async (req, res) => {
  try {
    await RoleService.createDefaultRoles(req.user._id);

    res.status(200).json({
      success: true,
      message: "Default roles created successfully",
    });
  } catch (error) {
    console.log("CREATE_DEFAULT_ROLES_ERROR", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create default roles",
    });
  }
};

/**********************************
  Get role statistics
***********************************/
exports.getRoleStats = async (req, res) => {
  try {
    const Role = require("@models/role/role");
    const User = require("@models/user/user");

    // Get basic role statistics
    const stats = await Role.aggregate([
      {
        $group: {
          _id: null,
          totalRoles: { $sum: 1 },
          activeRoles: {
            $sum: { $cond: { if: "$isActive", then: 1, else: 0 } },
          },
          systemRoles: {
            $sum: { $cond: { if: "$isSystemRole", then: 1, else: 0 } },
          },
          customRoles: {
            $sum: { $cond: { if: "$isSystemRole", then: 0, else: 1 } },
          },
        },
      },
    ]);

    // Get user count for each role
    const roleUserCounts = await User.aggregate([
      {
        $match: { roleId: { $exists: true, $ne: null } },
      },
      {
        $group: {
          _id: "$roleId",
          userCount: { $sum: 1 },
        },
      },
    ]);

    // Create a map of roleId to userCount
    const userCountMap = {};
    roleUserCounts.forEach((item) => {
      userCountMap[item._id.toString()] = item.userCount;
    });

    // Get all roles with user counts
    const rolesWithUserCounts = await Role.find({})
      .select("_id name isSystemRole isActive")
      .lean();

    const rolesWithCounts = rolesWithUserCounts.map((role) => ({
      _id: role._id,
      name: role.name,
      isSystemRole: role.isSystemRole,
      isActive: role.isActive,
      userCount: userCountMap[role._id.toString()] || 0,
    }));

    res.status(200).json({
      success: true,
      stats: {
        ...stats[0],
        rolesWithUserCounts: rolesWithCounts,
      } || {
        totalRoles: 0,
        activeRoles: 0,
        systemRoles: 0,
        customRoles: 0,
        rolesWithUserCounts: [],
      },
    });
  } catch (error) {
    console.log("GET_ROLE_STATS_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch role statistics",
    });
  }
};
