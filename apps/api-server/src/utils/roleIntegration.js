/**
 * Role Integration Utilities
 *
 * This module provides utilities for integrating the legacy role system
 * (admin, superadmin, marketing) with the new dynamic role system.
 */

const User = require("@models/user/user");
const Role = require("@models/role/role");

/**
 * Role mapping configuration
 * Maps legacy role names to new role system names and hierarchy levels
 */
const ROLE_MAPPING = {
  superadmin: {
    newRoleName: "Super Admin",
    hierarchyLevel: 1,
    description: "Full system access with all permissions",
    permissions: {
      read: true,
      write: true,
      delete: true,
      approve: true,
    },
  },
  admin: {
    newRoleName: "Admin",
    hierarchyLevel: 2,
    description: "Administrative access with most permissions",
    permissions: {
      read: true,
      write: true,
      delete: false, // Limited delete permissions
      approve: true,
    },
  },
  marketing: {
    newRoleName: "Content Manager",
    hierarchyLevel: 3,
    description: "Manages content and blog posts",
    permissions: {
      read: true,
      write: true,
      delete: false,
      approve: false,
    },
  },
};

/**
 * Content management resources that marketing roles should have access to
 */
const CONTENT_RESOURCES = [
  "Blogs",
  "Gallery",
  "Hero Image Slider",
  "Announcements",
  "Newsletter",
  "Media",
];

/**
 * Check if a user has legacy role access
 * @param {Object} user - User object with role field
 * @param {string|Array} allowedRoles - Single role or array of allowed roles
 * @returns {boolean}
 */
const hasLegacyRole = (user, allowedRoles) => {
  if (!user || !user.role) return false;

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return roles.includes(user.role);
};

/**
 * Check if a user has new role system access based on hierarchy
 * @param {Object} user - User object with roleInfo populated
 * @param {number} maxHierarchyLevel - Maximum allowed hierarchy level (lower = higher privilege)
 * @returns {boolean}
 */
const hasNewRoleAccess = (user, maxHierarchyLevel) => {
  if (!user || !user.roleInfo) return false;
  return user.roleInfo.hierarchyLevel <= maxHierarchyLevel;
};

/**
 * Check if a user has content management permissions
 * @param {Object} user - User object with roleInfo populated
 * @returns {boolean}
 */
const hasContentPermissions = (user) => {
  if (!user || !user.roleInfo) return false;

  // Check hierarchy level (Content Manager is level 3)
  if (user.roleInfo.hierarchyLevel <= 3) return true;

  // Check specific content permissions
  return CONTENT_RESOURCES.some((resource) =>
    user.hasPermission(resource, "write")
  );
};

/**
 * Get user's effective role information (legacy + new system)
 * @param {Object} user - User object
 * @returns {Object} Combined role information
 */
const getEffectiveRoleInfo = (user) => {
  const info = {
    legacyRole: user.role,
    newRole: user.roleInfo,
    hasLegacyAccess: false,
    hasNewAccess: false,
    effectiveHierarchyLevel: null,
    permissions: {},
  };

  // Legacy role mapping
  if (user.role && ROLE_MAPPING[user.role]) {
    info.hasLegacyAccess = true;
    info.effectiveHierarchyLevel = ROLE_MAPPING[user.role].hierarchyLevel;
  }

  // New role system
  if (user.roleInfo) {
    info.hasNewAccess = true;
    info.effectiveHierarchyLevel = Math.min(
      info.effectiveHierarchyLevel || Infinity,
      user.roleInfo.hierarchyLevel
    );
    info.permissions = user.getPermissions();
  }

  return info;
};

/**
 * Migrate user from legacy role to new role system
 * @param {string} userId - User ID
 * @param {string} legacyRole - Legacy role name
 * @returns {Object} Migration result
 */
const migrateUserRole = async (userId, legacyRole) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const roleMapping = ROLE_MAPPING[legacyRole];
    if (!roleMapping) {
      throw new Error(`Unknown legacy role: ${legacyRole}`);
    }

    // Find or create the corresponding new role
    let newRole = await Role.findOne({ name: roleMapping.newRoleName });

    if (!newRole) {
      // Create the role if it doesn't exist
      newRole = new Role({
        name: roleMapping.newRoleName,
        description: roleMapping.description,
        hierarchyLevel: roleMapping.hierarchyLevel,
        isSystemRole: true,
        isActive: true,
        approvalRights: roleMapping.permissions.approve,
        accessRights: [], // Will be populated with default resources
        createdBy: user._id,
      });
      await newRole.save();
    }

    // Update user with new role
    user.roleId = newRole._id;
    user.roleAssignedAt = new Date();
    await user.save();

    return {
      success: true,
      user: await User.findById(userId).populate("roleInfo"),
      migratedRole: newRole,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Check if user can access a resource based on both legacy and new role systems
 * @param {Object} user - User object
 * @param {string} resource - Resource name
 * @param {string} permission - Permission type (read, write, delete, approve)
 * @returns {boolean}
 */
const canAccessResource = (user, resource, permission) => {
  // Check new role system first
  if (user.roleInfo && user.hasPermission(resource, permission)) {
    return true;
  }

  // Check legacy role permissions
  if (user.role && ROLE_MAPPING[user.role]) {
    const roleConfig = ROLE_MAPPING[user.role];

    // Super admin has all permissions
    if (user.role === "superadmin") {
      return true;
    }

    // Admin has most permissions except delete for sensitive resources
    if (user.role === "admin") {
      if (permission === "delete") {
        // Admin can delete content but not system resources
        return ["Blogs", "Gallery", "Announcements", "Newsletter"].includes(
          resource
        );
      }
      return ["read", "write", "approve"].includes(permission);
    }

    // Marketing has content permissions
    if (user.role === "marketing") {
      if (CONTENT_RESOURCES.includes(resource)) {
        return ["read", "write"].includes(permission);
      }
      return permission === "read";
    }
  }

  return false;
};

/**
 * Get recommended role for a user based on their current permissions
 * @param {Object} user - User object
 * @returns {Object} Recommended role information
 */
const getRecommendedRole = (user) => {
  const recommendations = [];

  // Check current permissions and suggest appropriate role
  if (user.roleInfo) {
    const permissions = user.getPermissions();
    const hasFullAccess = Object.values(permissions).some(
      (perms) => perms.read && perms.write && perms.delete && perms.approve
    );

    if (hasFullAccess) {
      recommendations.push({
        roleName: "Super Admin",
        hierarchyLevel: 1,
        reason: "User has full system permissions",
      });
    } else if (user.roleInfo.hierarchyLevel <= 2) {
      recommendations.push({
        roleName: "Admin",
        hierarchyLevel: 2,
        reason: "User has administrative permissions",
      });
    } else if (hasContentPermissions(user)) {
      recommendations.push({
        roleName: "Content Manager",
        hierarchyLevel: 3,
        reason: "User has content management permissions",
      });
    }
  }

  // Check legacy role
  if (user.role && ROLE_MAPPING[user.role]) {
    const mapping = ROLE_MAPPING[user.role];
    recommendations.push({
      roleName: mapping.newRoleName,
      hierarchyLevel: mapping.hierarchyLevel,
      reason: `Migrated from legacy ${user.role} role`,
      isLegacy: true,
    });
  }

  return recommendations;
};

/**
 * Validate role assignment permissions
 * @param {Object} assigner - User assigning the role
 * @param {Object} targetRole - Role being assigned
 * @returns {Object} Validation result
 */
const validateRoleAssignment = (assigner, targetRole) => {
  const result = {
    canAssign: false,
    reason: "",
    requiredAction: null,
  };

  // Check if assigner has new role system
  if (assigner.roleInfo) {
    if (assigner.roleInfo.hierarchyLevel < targetRole.hierarchyLevel) {
      result.canAssign = true;
    } else {
      result.canAssign = false;
      result.reason = "Insufficient hierarchy level";
      result.requiredAction = "Upgrade assigner's role";
    }
  }
  // Check legacy role permissions
  else if (assigner.role) {
    const assignerLevel = ROLE_MAPPING[assigner.role]?.hierarchyLevel || 10;
    if (assignerLevel < targetRole.hierarchyLevel) {
      result.canAssign = true;
    } else {
      result.canAssign = false;
      result.reason = "Insufficient legacy role privileges";
      result.requiredAction = "Upgrade assigner's legacy role";
    }
  } else {
    result.canAssign = false;
    result.reason = "No role assigned to assigner";
    result.requiredAction = "Assign role to user";
  }

  return result;
};

module.exports = {
  ROLE_MAPPING,
  CONTENT_RESOURCES,
  hasLegacyRole,
  hasNewRoleAccess,
  hasContentPermissions,
  getEffectiveRoleInfo,
  migrateUserRole,
  canAccessResource,
  getRecommendedRole,
  validateRoleAssignment,
};
