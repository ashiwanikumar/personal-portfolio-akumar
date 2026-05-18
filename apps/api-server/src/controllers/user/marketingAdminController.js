const UserService = require("@services/user/userService");

/**
 * Helper function to check if user has marketing admin privileges
 * @param {Object} user - User object
 * @returns {boolean} - True if user has marketing admin privileges
 */
const hasMarketingAdminPrivileges = (user) => {
  // Check legacy marketing admin role
  if (user.role === "marketing") {
    return true;
  }
  
  // Check RBAC marketing admin role (hierarchyLevel <= 3) or content permissions
  if (user.roleInfo && user.roleInfo.isActive) {
    // Check hierarchy level (marketing is typically level 3)
    if (user.roleInfo.hierarchyLevel <= 3) {
      return true;
    }
    
    // Check specific content management permissions
    if (user.hasPermission && (
      user.hasPermission("Blogs", "write") ||
      user.hasPermission("Gallery", "write") ||
      user.hasPermission("Hero Image Slider", "write") ||
      user.hasPermission("Announcements", "write")
    )) {
      return true;
    }
  }
  
  return false;
};

/**********************************
  Check if user is marketing admin
***********************************/
exports.currentMarketingAdmin = async (req, res) => {
  const { _id } = req.user;

  try {
    const user = await UserService.findUserById(_id);

    if (!user) {
      return res.status(404).json({
        marketingAdmin: false,
        error: "User not found",
      });
    }

    // Populate roleInfo if needed
    if (!user.roleInfo) {
      await user.populate("roleInfo");
    }

    // Check if user has marketing admin privileges using helper function
    const isMarketingAdmin = hasMarketingAdminPrivileges(user);

    if (isMarketingAdmin) {
      res.status(200).json({
        marketingAdmin: true,
        message: "Welcome marketing admin!",
        user: user.toClientObject ? user.toClientObject() : user,
      });
    } else {
      res.status(403).json({
        marketingAdmin: false,
        error: "Marketing Admin Resource, access denied!",
      });
    }
  } catch (error) {
    console.log("CURRENT_MARKETING_ADMIN_ERROR", error);
    res.status(500).json({
      error: error.message,
    });
  }
};