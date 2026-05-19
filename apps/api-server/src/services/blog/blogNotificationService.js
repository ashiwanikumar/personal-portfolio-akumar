const User = require("@models/user/user");
const logger = require("@utils/logger");

/**
 * Get super admin users for blog approval notifications
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of super admin users
 */
const getSuperAdminUsers = async (options = {}) => {
  try {
    const { 
      includeDisabled = false, 
      includeInactive = false,
      emailsOnly = true 
    } = options;

    // Build query to find super admins
    const query = {
      $or: [
        // Legacy role system - superadmin role (case insensitive)
        { role: { $regex: /^superadmin$/i } },
        { role: { $regex: /^super.admin$/i } },
        { role: "superAdmin" },
        { role: "super_admin" },
        // New role system - hierarchy level 1 (super admin)
        { "roleInfo.hierarchyLevel": 1, "roleInfo.isActive": true }
      ]
    };

    // Exclude disabled users unless specified
    if (!includeDisabled) {
      query.disabled = { $ne: true };
    }

    // Exclude inactive users unless specified
    if (!includeInactive) {
      query.activated = true;
    }

    // Find super admin users
    const superAdmins = await User.find(query)
      .populate("roleInfo", "name hierarchyLevel isActive")
      .select("name email role roleInfo activated disabled lastActive")
      .sort({ lastActive: -1 }); // Most recently active first

    logger.info(`Found ${superAdmins.length} super admin users for notifications`);

    if (emailsOnly) {
      // Return only valid email addresses
      return superAdmins
        .filter(user => user.email && user.email.trim())
        .map(user => user.email.trim());
    }

    return superAdmins;
  } catch (error) {
    logger.error("Error fetching super admin users:", error);
    throw new Error("Failed to fetch super admin users");
  }
};

/**
 * Get users by specific role for notifications
 * @param {string} roleName - Role name to search for
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of users with the specified role
 */
const getUsersByRole = async (roleName, options = {}) => {
  try {
    const { 
      includeDisabled = false, 
      includeInactive = false,
      emailsOnly = true 
    } = options;

    const allowedRoles = ['superadmin', 'admin', 'marketing', 'content-manager'];
    
    if (!allowedRoles.includes(roleName)) {
      throw new Error(`Invalid role name: ${roleName}`);
    }

    // Build query
    const query = {
      $or: [
        // Legacy role system
        { role: roleName },
        // New role system - match role name
        { "roleInfo.name": { $regex: new RegExp(roleName, 'i') }, "roleInfo.isActive": true }
      ]
    };

    // Exclude disabled users unless specified
    if (!includeDisabled) {
      query.disabled = { $ne: true };
    }

    // Exclude inactive users unless specified
    if (!includeInactive) {
      query.activated = true;
    }

    const users = await User.find(query)
      .populate("roleInfo", "name hierarchyLevel isActive")
      .select("name email role roleInfo activated disabled lastActive")
      .sort({ lastActive: -1 });

    logger.info(`Found ${users.length} users with role '${roleName}' for notifications`);

    if (emailsOnly) {
      return users
        .filter(user => user.email && user.email.trim())
        .map(user => user.email.trim());
    }

    return users;
  } catch (error) {
    logger.error(`Error fetching users by role '${roleName}':`, error);
    throw new Error(`Failed to fetch users by role '${roleName}'`);
  }
};

/**
 * Get admin users (super admin + admin) for notifications
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of admin users
 */
const getAdminUsers = async (options = {}) => {
  try {
    const { 
      includeDisabled = false, 
      includeInactive = false,
      emailsOnly = true 
    } = options;

    // Build query for admin users
    const query = {
      $or: [
        // Legacy role system - superadmin or admin (case insensitive)
        { role: { $regex: /^(superadmin|admin)$/i } },
        { role: { $in: ["superAdmin", "admin", "super_admin"] } },
        // New role system - hierarchy level 1 or 2 (super admin or admin)
        { "roleInfo.hierarchyLevel": { $lte: 2 }, "roleInfo.isActive": true }
      ]
    };

    // Exclude disabled users unless specified
    if (!includeDisabled) {
      query.disabled = { $ne: true };
    }

    // Exclude inactive users unless specified
    if (!includeInactive) {
      query.activated = true;
    }

    const adminUsers = await User.find(query)
      .populate("roleInfo", "name hierarchyLevel isActive")
      .select("name email role roleInfo activated disabled lastActive")
      .sort({ lastActive: -1 });

    logger.info(`Found ${adminUsers.length} admin users for notifications`);

    if (emailsOnly) {
      return adminUsers
        .filter(user => user.email && user.email.trim())
        .map(user => user.email.trim());
    }

    return adminUsers;
  } catch (error) {
    logger.error("Error fetching admin users:", error);
    throw new Error("Failed to fetch admin users");
  }
};

/**
 * Get content managers and above for blog notifications
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of content management users
 */
const getContentManagementUsers = async (options = {}) => {
  try {
    const { 
      includeDisabled = false, 
      includeInactive = false,
      emailsOnly = true 
    } = options;

    // Build query for content management users
    const query = {
      $or: [
        // Legacy role system - superadmin, admin, marketing, content-manager
        { role: { $in: ["superadmin", "admin", "marketing", "content-manager"] } },
        // New role system - hierarchy level 1-3 (super admin, admin, content manager)
        { "roleInfo.hierarchyLevel": { $lte: 3 }, "roleInfo.isActive": true }
      ]
    };

    // Also include users with specific blog permissions
    query.$or.push({
      "roleInfo.isActive": true,
      "roleInfo.accessRights": {
        $elemMatch: {
          resource: "blog",
          $or: [
            { "permissions.approve": true },
            { "permissions.write": true },
            { "permissions.delete": true }
          ]
        }
      }
    });

    // Exclude disabled users unless specified
    if (!includeDisabled) {
      query.disabled = { $ne: true };
    }

    // Exclude inactive users unless specified
    if (!includeInactive) {
      query.activated = true;
    }

    const contentUsers = await User.find(query)
      .populate("roleInfo", "name hierarchyLevel isActive accessRights")
      .select("name email role roleInfo activated disabled lastActive")
      .sort({ lastActive: -1 });

    logger.info(`Found ${contentUsers.length} content management users for notifications`);

    if (emailsOnly) {
      return contentUsers
        .filter(user => user.email && user.email.trim())
        .map(user => user.email.trim());
    }

    return contentUsers;
  } catch (error) {
    logger.error("Error fetching content management users:", error);
    throw new Error("Failed to fetch content management users");
  }
};

/**
 * Get notification recipients based on blog approval level
 * @param {string} approvalLevel - Level of approval (superadmin, admin, content)
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of recipient emails
 */
const getNotificationRecipients = async (approvalLevel = "superadmin", options = {}) => {
  try {
    let recipients = [];

    switch (approvalLevel.toLowerCase()) {
      case "superadmin":
      case "super-admin":
        recipients = await getSuperAdminUsers(options);
        break;
      
      case "admin":
        recipients = await getAdminUsers(options);
        break;
      
      case "content":
      case "content-manager":
        recipients = await getContentManagementUsers(options);
        break;
      
      default:
        // Default to super admins for unknown levels
        logger.warn(`Unknown approval level '${approvalLevel}', defaulting to super admins`);
        recipients = await getSuperAdminUsers(options);
        break;
    }

    // Remove duplicates and filter out invalid emails
    const uniqueRecipients = [...new Set(recipients)]
      .filter(email => email && email.includes('@') && email.trim());

    logger.info(`Selected ${uniqueRecipients.length} recipients for approval level '${approvalLevel}'`);

    return uniqueRecipients;
  } catch (error) {
    logger.error(`Error getting notification recipients for level '${approvalLevel}':`, error);
    throw new Error(`Failed to get notification recipients for level '${approvalLevel}'`);
  }
};

/**
 * Validate user permissions for blog operations
 * @param {string} userId - User ID to check
 * @param {string} operation - Operation to check (approve, publish, etc.)
 * @returns {Promise<boolean>} Whether user has permission
 */
const validateUserPermission = async (userId, operation = "approve") => {
  try {
    const user = await User.findById(userId)
      .populate("roleInfo", "name hierarchyLevel isActive accessRights");

    if (!user || user.disabled || !user.activated) {
      return false;
    }

    // Super admins have all permissions
    if (user.role === "superadmin" || 
        (user.roleInfo && user.roleInfo.hierarchyLevel === 1)) {
      return true;
    }

    // Check legacy roles
    const legacyPermissions = {
      approve: ["superadmin", "admin"],
      publish: ["superadmin", "admin", "marketing"],
      edit: ["superadmin", "admin", "marketing", "content-manager"],
      read: ["superadmin", "admin", "marketing", "content-manager"]
    };

    if (legacyPermissions[operation] && 
        legacyPermissions[operation].includes(user.role)) {
      return true;
    }

    // Check new role system permissions
    if (user.roleInfo && user.roleInfo.isActive) {
      // Check hierarchy level permissions
      const hierarchyPermissions = {
        approve: 2, // Admin level and above
        publish: 3, // Content manager level and above
        edit: 3,
        read: 4
      };

      if (hierarchyPermissions[operation] && 
          user.roleInfo.hierarchyLevel <= hierarchyPermissions[operation]) {
        return true;
      }

      // Check specific resource permissions
      if (user.roleInfo.accessRights) {
        const blogPermissions = user.roleInfo.accessRights.find(
          right => right.resource === "blog"
        );

        if (blogPermissions && blogPermissions.permissions) {
          switch (operation) {
            case "approve":
              return blogPermissions.permissions.approve === true;
            case "publish":
              return blogPermissions.permissions.write === true;
            case "edit":
              return blogPermissions.permissions.write === true;
            case "read":
              return blogPermissions.permissions.read === true;
            default:
              return false;
          }
        }
      }
    }

    return false;
  } catch (error) {
    logger.error(`Error validating user permission for operation '${operation}':`, error);
    return false;
  }
};

module.exports = {
  getSuperAdminUsers,
  getUsersByRole,
  getAdminUsers,
  getContentManagementUsers,
  getNotificationRecipients,
  validateUserPermission,
};