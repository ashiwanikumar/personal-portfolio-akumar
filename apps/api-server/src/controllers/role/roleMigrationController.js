const RoleService = require("@services/role/roleService");
const UserService = require("@services/user/userService");
const roleIntegration = require("@utils/roleIntegration");
const User = require("@models/user/user");
const Role = require("@models/role/role");

/**
 * Get migration status for all users
 */
exports.getMigrationStatus = async (req, res) => {
  try {
    const users = await User.find({}).populate("roleInfo").exec();

    const migrationStatus = users.map((user) => {
      const effectiveRole = roleIntegration.getEffectiveRoleInfo(user);

      return {
        userId: user._id,
        email: user.email,
        name: user.name,
        legacyRole: user.role,
        newRole: user.roleInfo
          ? {
              name: user.roleInfo.name,
              hierarchyLevel: user.roleInfo.hierarchyLevel,
            }
          : null,
        migrationStatus: !user.roleId ? "pending" : "completed",
        effectiveRole,
        recommendations: roleIntegration.getRecommendedRole(user),
      };
    });

    const stats = {
      totalUsers: users.length,
      migratedUsers: users.filter((u) => u.roleId).length,
      pendingUsers: users.filter((u) => !u.roleId).length,
      legacyRoles: {
        superadmin: users.filter((u) => u.role === "superadmin").length,
        admin: users.filter((u) => u.role === "admin").length,
        marketing: users.filter((u) => u.role === "marketing").length,
        other: users.filter(
          (u) => !["superadmin", "admin", "marketing"].includes(u.role)
        ).length,
      },
    };

    res.status(200).json({
      success: true,
      migrationStatus,
      stats,
    });
  } catch (error) {
    console.error("GET_MIGRATION_STATUS_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Failed to get migration status",
    });
  }
};

/**
 * Migrate a specific user to the new role system
 */
exports.migrateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { targetRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // If targetRole is specified, use it; otherwise use legacy role
    const roleToMigrate = targetRole || user.role;

    if (!roleToMigrate) {
      return res.status(400).json({
        success: false,
        message: "No role specified for migration",
      });
    }

    const result = await roleIntegration.migrateUserRole(userId, roleToMigrate);

    res.status(200).json({
      success: true,
      message: "User migrated successfully",
      result,
    });
  } catch (error) {
    console.error("MIGRATE_USER_ERROR", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to migrate user",
    });
  }
};

/**
 * Bulk migrate all users with legacy roles
 */
exports.bulkMigrateUsers = async (req, res) => {
  try {
    const { dryRun = false } = req.query;

    const users = await User.find({ roleId: { $exists: false } }).exec();

    const results = [];
    const errors = [];

    for (const user of users) {
      try {
        if (!user.role) {
          errors.push({
            userId: user._id,
            email: user.email,
            error: "No legacy role found",
          });
          continue;
        }

        if (dryRun === "true") {
          // Just simulate the migration
          const roleMapping = roleIntegration.ROLE_MAPPING[user.role];
          results.push({
            userId: user._id,
            email: user.email,
            legacyRole: user.role,
            targetRole: roleMapping?.newRoleName || "Unknown",
            status: "would_migrate",
          });
        } else {
          // Actually perform the migration
          const result = await roleIntegration.migrateUserRole(
            user._id,
            user.role
          );
          results.push({
            userId: user._id,
            email: user.email,
            legacyRole: user.role,
            targetRole: result.migratedRole.name,
            status: "migrated",
            result,
          });
        }
      } catch (error) {
        errors.push({
          userId: user._id,
          email: user.email,
          error: error.message,
        });
      }
    }

    res.status(200).json({
      success: true,
      message:
        dryRun === "true"
          ? "Migration simulation completed"
          : "Bulk migration completed",
      results,
      errors,
      summary: {
        total: users.length,
        successful: results.length,
        failed: errors.length,
        dryRun: dryRun === "true",
      },
    });
  } catch (error) {
    console.error("BULK_MIGRATE_USERS_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Failed to perform bulk migration",
    });
  }
};

/**
 * Get role compatibility analysis
 */
exports.getRoleCompatibility = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate("roleInfo").exec();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const effectiveRole = roleIntegration.getEffectiveRoleInfo(user);
    const recommendations = roleIntegration.getRecommendedRole(user);

    // Get all available roles for comparison
    const availableRoles = await Role.find({ isActive: true }).exec();

    const compatibility = availableRoles.map((role) => {
      const validation = roleIntegration.validateRoleAssignment(user, role);

      return {
        roleId: role._id,
        roleName: role.name,
        hierarchyLevel: role.hierarchyLevel,
        canAssign: validation.canAssign,
        reason: validation.reason,
        requiredAction: validation.requiredAction,
        isRecommended: recommendations.some(
          (rec) => rec.roleName === role.name
        ),
      };
    });

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        effectiveRole,
        recommendations,
      },
      compatibility,
    });
  } catch (error) {
    console.error("GET_ROLE_COMPATIBILITY_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Failed to get role compatibility",
    });
  }
};

/**
 * Validate role assignment with both legacy and new systems
 */
exports.validateRoleAssignment = async (req, res) => {
  try {
    const { assignerId, targetRoleId } = req.params;

    const [assigner, targetRole] = await Promise.all([
      User.findById(assignerId).populate("roleInfo").exec(),
      Role.findById(targetRoleId).exec(),
    ]);

    if (!assigner) {
      return res.status(404).json({
        success: false,
        message: "Assigner not found",
      });
    }

    if (!targetRole) {
      return res.status(404).json({
        success: false,
        message: "Target role not found",
      });
    }

    const validation = roleIntegration.validateRoleAssignment(
      assigner,
      targetRole
    );
    const effectiveRole = roleIntegration.getEffectiveRoleInfo(assigner);

    res.status(200).json({
      success: true,
      validation,
      assigner: {
        _id: assigner._id,
        email: assigner.email,
        name: assigner.name,
        effectiveRole,
      },
      targetRole: {
        _id: targetRole._id,
        name: targetRole.name,
        hierarchyLevel: targetRole.hierarchyLevel,
      },
    });
  } catch (error) {
    console.error("VALIDATE_ROLE_ASSIGNMENT_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Failed to validate role assignment",
    });
  }
};

/**
 * Get role mapping configuration
 */
exports.getRoleMapping = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      roleMapping: roleIntegration.ROLE_MAPPING,
      contentResources: roleIntegration.CONTENT_RESOURCES,
    });
  } catch (error) {
    console.error("GET_ROLE_MAPPING_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Failed to get role mapping",
    });
  }
};

/**
 * Test resource access for a user
 */
exports.testResourceAccess = async (req, res) => {
  try {
    const { userId } = req.params;
    const { resource, permission } = req.query;

    const user = await User.findById(userId).populate("roleInfo").exec();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const canAccess = roleIntegration.canAccessResource(
      user,
      resource,
      permission
    );
    const effectiveRole = roleIntegration.getEffectiveRoleInfo(user);

    res.status(200).json({
      success: true,
      canAccess,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        effectiveRole,
      },
      test: {
        resource,
        permission,
      },
    });
  } catch (error) {
    console.error("TEST_RESOURCE_ACCESS_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Failed to test resource access",
    });
  }
};
