// ** LIBS ** //
const jwt = require("jsonwebtoken");

// ** MODELS ** //
const User = require("@models/user/user");

// Authentication check middleware
exports.authCheck = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // If auth header is present
  if (authHeader) {
    try {
      // Get the JWT thats sent in headers of the request
      const token = req.headers.authorization.split(" ")[1];

      // If token exists
      if (token) {
        jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, user) => {
          // If the token provided is not valid
          if (err) {
            return res.status(401).json({
              error: true,
              type: [
                {
                  code: "GLOBAL_ERROR",
                  message: "Token is not valid or expired, please log in again",
                },
              ],
            });
          }
          req.user = user;
          next();
        });
      } else {
        return res.status(401).json({
          error: true,
          type: [
            {
              code: "GLOBAL_ERROR",
              message: "No token provided in authorization header",
            },
          ],
        });
      }
    } catch (error) {
      console.log("AUTH_CHECK_ERROR", error);
      return res.status(401).json({
        error: true,
        type: [
          {
            code: "GLOBAL_ERROR",
            message: "Authentication failed",
          },
        ],
      });
    }
  } else {
    // Auth header isn't present so, send a 401 error
    res.status(401).json({
      error: true,
      type: [
        {
          code: "GLOBAL_ERROR",
          message: "You are not authorized to access this resource",
        },
      ],
    });
  }
};

// ===== LEGACY ROLE-BASED MIDDLEWARE (Backward Compatibility) =====

// Admin check middleware (legacy - checks role field)
exports.adminCheck = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    const user = await User.findOne({ _id: userId }).populate("roleInfo").exec();

    if (!user) {
      return res.status(401).json({
        error: "User not found",
      });
    }

    // Check legacy role OR new role hierarchy (admin is hierarchyLevel <= 2)
    // Allow both admin and superadmin for admin endpoints
    const hasLegacyRole = user.role === "admin" || user.role === "superadmin";
    const hasNewRole = user.roleInfo && user.roleInfo.hierarchyLevel <= 2 && user.roleInfo.isActive;

    if (!hasLegacyRole && !hasNewRole) {
      return res.status(403).json({
        error: "Admin Resource, access denied!",
      });
    }

    next();
  } catch (error) {
    console.error("ADMIN_CHECK_ERROR", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

// Super admin check middleware (legacy - checks role field)
exports.superAdminCheck = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    const user = await User.findOne({ _id: userId }).populate("roleInfo").exec();

    if (!user) {
      return res.status(401).json({
        error: true,
        type: [
          {
            code: "GLOBAL_ERROR",
            message: "User not found",
          },
        ],
      });
    }

    // Check legacy role OR new role system
    const hasLegacyRole = user.role === "superadmin";
    const hasNewRole = user.roleInfo && user.roleInfo.hierarchyLevel === 1 && user.roleInfo.isActive;

    if (!hasLegacyRole && !hasNewRole) {
      return res.status(403).json({
        error: "Super Admin Resource, access denied!",
      });
    }

    next();
  } catch (error) {
    console.error("SUPER_ADMIN_CHECK_ERROR", error);
    return res.status(500).json({
      error: true,
      type: [
        {
          code: "GLOBAL_ERROR",
          message: "Internal server error",
        },
      ],
    });
  }
};

// Super admin or admin check middleware (legacy - checks role field)
exports.superOrAdminCheck = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    const user = await User.findOne({ _id: userId }).populate("roleInfo").exec();

    if (!user) {
      return res.status(401).json({
        error: "User not found",
      });
    }

    // Check legacy role OR new role system
    const hasLegacyRole = user.role === "superadmin" || user.role === "admin";
    const hasNewRole = user.roleInfo && user.roleInfo.hierarchyLevel <= 2 && user.roleInfo.isActive;

    if (!hasLegacyRole && !hasNewRole) {
      return res.status(403).json({
        error: "Super Admin or Admin Resource, access denied!",
      });
    }

    next();
  } catch (error) {
    console.error("SUPER_OR_ADMIN_CHECK_ERROR", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

// Admin / Super Admin / Marketing Admin check middleware (legacy - checks role field)
exports.adminSuperOrMarketingAdminCheck = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    const adminUser = await User.findOne({ _id: userId }).populate("roleInfo").exec();

    if (!adminUser) {
      return res.status(401).json({
        error: "User not found",
      });
    }

    // Check legacy roles OR new role hierarchy (admin/super/marketing are hierarchyLevel <= 3)
    const hasLegacyRole = adminUser.role === "admin" || adminUser.role === "superadmin" || adminUser.role === "marketing";
    const hasNewRole = adminUser.roleInfo && adminUser.roleInfo.hierarchyLevel <= 3 && adminUser.roleInfo.isActive;

    if (!hasLegacyRole && !hasNewRole) {
      return res.status(403).json({
        error: "Resource access denied!",
      });
    }

    next();
  } catch (error) {
    console.error("ADMIN_SUPER_OR_MARKETING_ADMIN_CHECK_ERROR", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

// Marketing admin check middleware (legacy - checks role field)
exports.marketingAdminCheck = async (req, res, next) => {
  try {
    const { _id } = req.user;

    const user = await User.findOne({ _id }).populate("roleInfo").exec();

    if (!user) {
      return res.status(401).json({
        error: "User not found",
      });
    }

    // Check legacy role OR new role hierarchy (marketing is hierarchyLevel <= 3) or content permissions
    const hasLegacyRole = user.role === "marketing";
    const hasNewRole = user.roleInfo && user.roleInfo.hierarchyLevel <= 3 && user.roleInfo.isActive;
    const hasContentPermissions = user.roleInfo && user.roleInfo.isActive && user.hasPermission && (
      user.hasPermission("Blogs", "write") ||
      user.hasPermission("Gallery", "write") ||
      user.hasPermission("Hero Image Slider", "write") ||
      user.hasPermission("Announcements", "write")
    );

    if (!hasLegacyRole && !hasNewRole && !hasContentPermissions) {
      return res.status(403).json({
        error: "Marketing Admin Resource, access denied!",
      });
    }

    next();
  } catch (error) {
    console.error("MARKETING_ADMIN_CHECK_ERROR", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

// Super admin or Marketing admin check middleware (legacy - checks role field)
exports.superOrMarketingAdminCheck = async (req, res, next) => {
  try {
    const { _id } = req.user;

    const user = await User.findOne({ _id }).populate("roleInfo").exec();

    if (!user) {
      return res.status(401).json({
        error: "User not found",
      });
    }

    // Check legacy roles OR new role hierarchy (superadmin=1, marketing<=3)
    const hasLegacyRole = user.role === "superadmin" || user.role === "marketing";
    const hasNewRole = user.roleInfo && user.roleInfo.hierarchyLevel <= 3 && user.roleInfo.isActive;

    if (!hasLegacyRole && !hasNewRole) {
      return res.status(403).json({
        error: "Restricted Resource, access denied!",
      });
    }

    next();
  } catch (error) {
    console.error("SUPER_OR_MARKETING_ADMIN_CHECK_ERROR", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

// ===== ENHANCED LEGACY ROLE MIDDLEWARE (New System Integration) =====

/**
 * Enhanced admin check middleware
 * Checks legacy role field OR new role system with hierarchy level 2 or lower
 */
exports.enhancedAdminCheck = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId).populate("roleInfo").exec();

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found",
      });
    }

    if (user.disabled) {
      return res.status(403).json({
        success: false,
        error: "Account is disabled",
      });
    }

    // Check legacy role OR new role hierarchy
    const hasLegacyRole = user.role === "admin" || user.role === "superadmin";
    const hasNewRole = user.roleInfo && user.roleInfo.hierarchyLevel <= 2;

    if (!hasLegacyRole && !hasNewRole) {
      return res.status(403).json({
        success: false,
        error: "Admin Resource, access denied!",
      });
    }

    // Add role information to request
    req.userPermissions = user.getPermissions();
    req.userRole = user.roleInfo;
    req.legacyRole = user.role;

    next();
  } catch (error) {
    console.error("ENHANCED_ADMIN_CHECK_ERROR", error);
    return res.status(500).json({
      success: false,
      error: "Failed to check admin permissions",
    });
  }
};

/**
 * Enhanced super admin check middleware
 * Checks legacy role field OR new role system with hierarchy level 1
 */
exports.enhancedSuperAdminCheck = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId).populate("roleInfo").exec();

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found",
      });
    }

    if (user.disabled) {
      return res.status(403).json({
        success: false,
        error: "Account is disabled",
      });
    }

    // Check legacy role OR new role hierarchy
    const hasLegacyRole = user.role === "superadmin";
    const hasNewRole = user.roleInfo && user.roleInfo.hierarchyLevel === 1;

    if (!hasLegacyRole && !hasNewRole) {
      return res.status(403).json({
        success: false,
        error: "Super Admin Resource, access denied!",
      });
    }

    // Add role information to request
    req.userPermissions = user.getPermissions();
    req.userRole = user.roleInfo;
    req.legacyRole = user.role;

    next();
  } catch (error) {
    console.error("ENHANCED_SUPER_ADMIN_CHECK_ERROR", error);
    return res.status(500).json({
      success: false,
      error: "Failed to check super admin permissions",
    });
  }
};

/**
 * Enhanced marketing admin check middleware
 * Checks legacy role field OR new role system with content management permissions
 */
exports.enhancedMarketingAdminCheck = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId).populate("roleInfo").exec();

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found",
      });
    }

    if (user.disabled) {
      return res.status(403).json({
        success: false,
        error: "Account is disabled",
      });
    }

    // Check legacy role OR new role with content permissions
    const hasLegacyRole = user.role === "marketing";
    const hasNewRole =
      user.roleInfo &&
      (user.roleInfo.hierarchyLevel <= 3 ||
        user.hasPermission("Blogs", "write") ||
        user.hasPermission("Gallery", "write") ||
        user.hasPermission("Hero Image Slider", "write") ||
        user.hasPermission("Announcements", "write"));

    if (!hasLegacyRole && !hasNewRole) {
      return res.status(403).json({
        success: false,
        error: "Marketing Admin Resource, access denied!",
      });
    }

    // Add role information to request
    req.userPermissions = user.getPermissions();
    req.userRole = user.roleInfo;
    req.legacyRole = user.role;

    next();
  } catch (error) {
    console.error("ENHANCED_MARKETING_ADMIN_CHECK_ERROR", error);
    return res.status(500).json({
      success: false,
      error: "Failed to check marketing admin permissions",
    });
  }
};

/**
 * Enhanced multi-role check middleware
 * Checks legacy roles OR new role system with appropriate hierarchy
 */
exports.enhancedMultiRoleCheck = async (
  allowedLegacyRoles,
  maxHierarchyLevel
) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id || req.user._id;
      const user = await User.findById(userId).populate("roleInfo").exec();

      if (!user) {
        return res.status(401).json({
          success: false,
          error: "User not found",
        });
      }

      if (user.disabled) {
        return res.status(403).json({
          success: false,
          error: "Account is disabled",
        });
      }

      // Check legacy role OR new role hierarchy
      const hasLegacyRole = allowedLegacyRoles.includes(user.role);
      const hasNewRole =
        user.roleInfo && user.roleInfo.hierarchyLevel <= maxHierarchyLevel;

      if (!hasLegacyRole && !hasNewRole) {
        return res.status(403).json({
          success: false,
          error: "Resource access denied!",
        });
      }

      // Add role information to request
      req.userPermissions = user.getPermissions();
      req.userRole = user.roleInfo;
      req.legacyRole = user.role;

      next();
    } catch (error) {
      console.error("ENHANCED_MULTI_ROLE_CHECK_ERROR", error);
      return res.status(500).json({
        success: false,
        error: "Failed to check permissions",
      });
    }
  };
};

// ===== DYNAMIC ROLE-BASED ACCESS CONTROL MIDDLEWARE =====

/**
 * Dynamic permission check middleware
 * Checks if user has specific permission for a resource
 */
exports.requirePermission = (resource, permission) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id || req.user._id;

      const user = await User.findById(userId).populate("roleInfo").exec();

      if (!user) {
        return res.status(401).json({
          success: false,
          error: "User not found",
        });
      }

      if (user.disabled) {
        return res.status(403).json({
          success: false,
          error: "Account is disabled",
        });
      }

      if (!user.activated) {
        return res.status(403).json({
          success: false,
          error: "Account is not activated",
        });
      }

      // Check if user has the required permission
      const hasPermission = user.hasPermission(resource, permission);

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          error: `Access denied. Required permission: ${permission} on ${resource}`,
          required: { resource, permission },
        });
      }

      // Add user's permissions to request for use in controllers
      req.userPermissions = user.getPermissions();
      req.userRole = user.roleInfo;

      next();
    } catch (error) {
      console.error("REQUIRE_PERMISSION_ERROR", error);
      return res.status(500).json({
        success: false,
        error: "Failed to check permissions",
      });
    }
  };
};

/**
 * Multiple permissions check middleware (user must have ALL permissions)
 */
exports.requireAllPermissions = (permissions) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id || req.user._id;

      const user = await User.findById(userId).populate("roleInfo").exec();

      if (!user) {
        return res.status(401).json({
          success: false,
          error: "User not found",
        });
      }

      if (user.disabled) {
        return res.status(403).json({
          success: false,
          error: "Account is disabled",
        });
      }

      // Check all required permissions
      const missingPermissions = [];
      for (const { resource, permission } of permissions) {
        if (!user.hasPermission(resource, permission)) {
          missingPermissions.push({ resource, permission });
        }
      }

      if (missingPermissions.length > 0) {
        return res.status(403).json({
          success: false,
          error: "Access denied. Missing required permissions",
          missingPermissions,
        });
      }

      req.userPermissions = user.getPermissions();
      req.userRole = user.roleInfo;

      next();
    } catch (error) {
      console.error("REQUIRE_ALL_PERMISSIONS_ERROR", error);
      return res.status(500).json({
        success: false,
        error: "Failed to check permissions",
      });
    }
  };
};

/**
 * Multiple permissions check middleware (user must have ANY of the permissions)
 */
exports.requireAnyPermission = (permissions) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id || req.user._id;

      const user = await User.findById(userId).populate("roleInfo").exec();

      if (!user) {
        return res.status(401).json({
          success: false,
          error: "User not found",
        });
      }

      if (user.disabled) {
        return res.status(403).json({
          success: false,
          error: "Account is disabled",
        });
      }

      // Check if user has any of the required permissions
      let hasAnyPermission = false;
      for (const { resource, permission } of permissions) {
        if (user.hasPermission(resource, permission)) {
          hasAnyPermission = true;
          break;
        }
      }

      if (!hasAnyPermission) {
        return res.status(403).json({
          success: false,
          error: "Access denied. Insufficient permissions",
          requiredPermissions: permissions,
        });
      }

      req.userPermissions = user.getPermissions();
      req.userRole = user.roleInfo;

      next();
    } catch (error) {
      console.error("REQUIRE_ANY_PERMISSION_ERROR", error);
      return res.status(500).json({
        success: false,
        error: "Failed to check permissions",
      });
    }
  };
};

/**
 * Hierarchy level check middleware
 * Checks if user has a specific hierarchy level or higher (lower number = higher privilege)
 */
exports.requireHierarchyLevel = (maxLevel) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id || req.user._id;

      const user = await User.findById(userId).populate("roleInfo").exec();

      if (!user) {
        return res.status(401).json({
          success: false,
          error: "User not found",
        });
      }

      if (user.disabled) {
        return res.status(403).json({
          success: false,
          error: "Account is disabled",
        });
      }

      if (!user.roleInfo) {
        return res.status(403).json({
          success: false,
          error: "User role not found",
        });
      }

      // Check hierarchy level (lower number = higher privilege)
      if (user.roleInfo.hierarchyLevel > maxLevel) {
        return res.status(403).json({
          success: false,
          error: `Access denied. Required hierarchy level: ${maxLevel} or higher`,
          userLevel: user.roleInfo.hierarchyLevel,
          requiredLevel: maxLevel,
        });
      }

      req.userPermissions = user.getPermissions();
      req.userRole = user.roleInfo;

      next();
    } catch (error) {
      console.error("REQUIRE_HIERARCHY_LEVEL_ERROR", error);
      return res.status(500).json({
        success: false,
        error: "Failed to check hierarchy level",
      });
    }
  };
};

/**
 * Role name check middleware
 * Checks if user has a specific role name
 */
exports.requireRole = (roleName) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id || req.user._id;

      const user = await User.findById(userId).populate("roleInfo").exec();

      if (!user) {
        return res.status(401).json({
          success: false,
          error: "User not found",
        });
      }

      if (user.disabled) {
        return res.status(403).json({
          success: false,
          error: "Account is disabled",
        });
      }

      if (!user.roleInfo) {
        return res.status(403).json({
          success: false,
          error: "User role not found",
        });
      }

      if (user.roleInfo.name !== roleName) {
        return res.status(403).json({
          success: false,
          error: `Access denied. Required role: ${roleName}`,
          userRole: user.roleInfo.name,
          requiredRole: roleName,
        });
      }

      req.userPermissions = user.getPermissions();
      req.userRole = user.roleInfo;

      next();
    } catch (error) {
      console.error("REQUIRE_ROLE_ERROR", error);
      return res.status(500).json({
        success: false,
        error: "Failed to check role",
      });
    }
  };
};

/**
 * Multiple roles check middleware (user must have ANY of the roles)
 */
exports.requireAnyRole = (roleNames) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id || req.user._id;

      const user = await User.findById(userId).populate("roleInfo").exec();

      if (!user) {
        return res.status(401).json({
          success: false,
          error: "User not found",
        });
      }

      if (user.disabled) {
        return res.status(403).json({
          success: false,
          error: "Account is disabled",
        });
      }

      if (!user.roleInfo) {
        return res.status(403).json({
          success: false,
          error: "User role not found",
        });
      }

      if (!roleNames.includes(user.roleInfo.name)) {
        return res.status(403).json({
          success: false,
          error: `Access denied. Required roles: ${roleNames.join(", ")}`,
          userRole: user.roleInfo.name,
          requiredRoles: roleNames,
        });
      }

      req.userPermissions = user.getPermissions();
      req.userRole = user.roleInfo;

      next();
    } catch (error) {
      console.error("REQUIRE_ANY_ROLE_ERROR", error);
      return res.status(500).json({
        success: false,
        error: "Failed to check roles",
      });
    }
  };
};

/**
 * Enhanced auth check middleware with role population
 * This replaces the basic authCheck for routes that need role information
 */
exports.authCheckWithRole = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    try {
      const token = req.headers.authorization.split(" ")[1];

      if (token) {
        jwt.verify(
          token,
          process.env.JWT_ACCESS_SECRET,
          async (err, userTokenData) => {
            if (err) {
              return res.status(401).json({
                success: false,
                error: "Token is not valid or expired, please log in again",
              });
            }

            try {
              // Get full user data with role information
              const user = await User.findById(userTokenData._id)
                .populate("roleInfo")
                .exec();

              if (!user) {
                return res.status(401).json({
                  success: false,
                  error: "User not found",
                });
              }

              if (user.disabled) {
                return res.status(403).json({
                  success: false,
                  error: "Account is disabled",
                });
              }

              req.user = userTokenData; // Keep original token data
              req.fullUser = user; // Add full user with role
              req.userPermissions = user.getPermissions();
              req.userRole = user.roleInfo;

              next();
            } catch (dbError) {
              console.error("AUTH_CHECK_WITH_ROLE_DB_ERROR", dbError);
              return res.status(500).json({
                success: false,
                error: "Failed to authenticate user",
              });
            }
          }
        );
      }
    } catch (error) {
      console.error("AUTH_CHECK_WITH_ROLE_ERROR", error);
      return res.status(500).json({
        success: false,
        error: "Authentication failed",
      });
    }
  } else {
    res.status(401).json({
      success: false,
      error: "You are not authorized to access this resource",
    });
  }
};

/**
 * Resource ownership check middleware
 * Checks if user can access a resource based on ownership or admin permissions
 */
exports.requireOwnershipOrPermission = (resourceParam, permission) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id || req.user._id;
      const resourceOwnerId = req.params[resourceParam];

      const user = await User.findById(userId).populate("roleInfo").exec();

      if (!user) {
        return res.status(401).json({
          success: false,
          error: "User not found",
        });
      }

      // Check if user owns the resource
      const isOwner = userId.toString() === resourceOwnerId.toString();

      // Check if user has admin permission
      const hasPermission = permission
        ? user.hasPermission("users", permission)
        : false;

      if (!isOwner && !hasPermission) {
        return res.status(403).json({
          success: false,
          error:
            "Access denied. You can only access your own resources or need admin permissions",
        });
      }

      req.userPermissions = user.getPermissions();
      req.userRole = user.roleInfo;
      req.isOwner = isOwner;
      req.hasAdminPermission = hasPermission;

      next();
    } catch (error) {
      console.error("REQUIRE_OWNERSHIP_OR_PERMISSION_ERROR", error);
      return res.status(500).json({
        success: false,
        error: "Failed to check ownership or permissions",
      });
    }
  };
};
