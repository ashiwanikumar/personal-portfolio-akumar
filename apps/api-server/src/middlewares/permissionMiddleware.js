const UserService = require("../services/user/userService");

/**
 * Permission middleware for role-based access control
 * @param {Object} requiredPermissions - Object containing required permissions
 * @param {string} requiredPermissions.resource - The resource being accessed
 * @param {Array} requiredPermissions.actions - Array of required actions (create, read, update, delete)
 * @param {string} requiredPermissions.role - Minimum required role level
 */
const checkPermission = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // Get user with role information
      const user = await UserService.findUserById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Super Admin has all permissions
      // Check legacy role system
      if (user.role === "superadmin") {
        return next();
      }
      
      // Check new RBAC system - hierarchy level 1 is super admin
      if (user.roleId && user.roleInfo && user.roleInfo.hierarchyLevel === 1 && user.roleInfo.isActive) {
        return next();
      }

      // Check role level for legacy roles
      const roleHierarchy = {
        superadmin: 4,
        admin: 3,
        "content-manager": 2,
        "social-media": 1,
        user: 0,
      };

      const userRoleLevel = roleHierarchy[user.role] || 0;
      const requiredRoleLevel = roleHierarchy[requiredPermissions.role] || 0;

      // Check new RBAC system - if user has roleInfo, check hierarchy level
      if (user.roleId && user.roleInfo && user.roleInfo.isActive) {
        const hierarchyLevel = user.roleInfo.hierarchyLevel;
        
        // Map hierarchy levels to role levels
        const hierarchyToRoleLevel = {
          1: 4, // Super Admin
          2: 3, // Admin
          3: 2, // Content Manager
          4: 1, // Social Media
        };
        
        const userHierarchyLevel = hierarchyToRoleLevel[hierarchyLevel] || 0;
        
        if (userHierarchyLevel >= requiredRoleLevel) {
          return next();
        }
      }

      if (userRoleLevel < requiredRoleLevel) {
        return res.status(403).json({
          success: false,
          message: `Insufficient permissions. Required role: ${requiredPermissions.role}`,
        });
      }

      // If specific resource and actions are provided, check them
      if (requiredPermissions.resource && requiredPermissions.actions) {
        // This would check against user's specific permissions
        // For now, we'll use role-based access
        const hasPermission = checkResourcePermission(
          user,
          requiredPermissions
        );

        if (!hasPermission) {
          return res.status(403).json({
            success: false,
            message: `Access denied to ${requiredPermissions.resource}`,
          });
        }
      }

      next();
    } catch (error) {
      console.error("Permission check error:", error);
      return res.status(500).json({
        success: false,
        message: "Permission check failed",
      });
    }
  };
};

/**
 * Check if user has specific resource permissions
 * @param {Object} user - User object
 * @param {Object} requiredPermissions - Required permissions object
 * @returns {boolean} - Whether user has permission
 */
const checkResourcePermission = (user, requiredPermissions) => {
  // This would check against user's specific permissions stored in the database
  // For now, we'll use role-based logic

  const rolePermissions = {
    superadmin: {
      team: ["create", "read", "update", "delete"],
      content: ["create", "read", "update", "delete"],
      analytics: ["read"],
      settings: ["read", "update"],
      users: ["create", "read", "update", "delete"],
    },
    admin: {
      team: ["create", "read", "update"],
      content: ["create", "read", "update", "delete"],
      analytics: ["read"],
      settings: ["read"],
      users: ["read", "update"],
    },
    "content-manager": {
      content: ["create", "read", "update"],
      analytics: ["read"],
    },
    "social-media": {
      content: ["create", "read", "update"],
      analytics: ["read"],
    },
  };

  const userPermissions = rolePermissions[user.role] || {};
  const resourcePermissions =
    userPermissions[requiredPermissions.resource] || [];

  return requiredPermissions.actions.every((action) =>
    resourcePermissions.includes(action)
  );
};

/**
 * Super Admin only middleware
 */
const superAdminOnly = (req, res, next) => {
  return checkPermission({ role: "superadmin" })(req, res, next);
};

/**
 * Admin or higher middleware
 */
const adminOrHigher = (req, res, next) => {
  return checkPermission({ role: "admin" })(req, res, next);
};

/**
 * Content Manager or higher middleware
 */
const contentManagerOrHigher = (req, res, next) => {
  return checkPermission({ role: "content-manager" })(req, res, next);
};

/**
 * Check specific resource permissions
 * @param {string} resource - Resource name
 * @param {Array} actions - Required actions
 */
const checkResourceAccess = (resource, actions) => {
  return checkPermission({
    resource,
    actions,
    role: "user", // Minimum role level
  });
};

module.exports = {
  checkPermission,
  superAdminOnly,
  adminOrHigher,
  contentManagerOrHigher,
  checkResourceAccess,
};
