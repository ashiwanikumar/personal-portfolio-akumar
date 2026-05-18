// ** MODELS ** //
const User = require("@models/user/user");

// ** SERVICES ** //
const UserService = require("@services/user/userService");
const RoleService = require("@services/role/roleService");

/**
 * Helper function to check if user has admin privileges
 * @param {Object} user - User object
 * @returns {boolean} - True if user has admin privileges
 */
const hasAdminPrivileges = (user) => {
  // Check legacy admin role
  if (user.role === "admin") {
    return true;
  }
  
  // Check RBAC admin role (hierarchyLevel <= 2)
  if (user.roleInfo && user.roleInfo.hierarchyLevel <= 2 && user.roleInfo.isActive) {
    return true;
  }
  
  return false;
};

/**********************************
  Check if user is admin
***********************************/
exports.currentAdmin = async (req, res) => {
  const { _id } = req.user;

  try {
    const user = await UserService.findUserById(_id);

    if (!user) {
      return res.status(404).json({
        admin: false,
        error: "User not found",
      });
    }

    // Populate roleInfo if needed
    if (!user.roleInfo) {
      await user.populate("roleInfo");
    }

    // Check if user has admin privileges using helper function
    const isAdmin = hasAdminPrivileges(user);

    if (isAdmin) {
      // Create a new object to return to the client
      const userObject = User.toClientObject(user);

      // Find the role of admin by role === admin (legacy support)
      const role = await RoleService.findOneRole({ role: "admin" });

      res.status(200).json({
        admin: true,
        message: "Welcome admin!",
        user: userObject,
        role: role,
      });
    } else {
      res.status(403).json({
        admin: false,
        error: "You are trying to access admin resource. Access Denied",
      });
    }
  } catch (error) {
    console.log("CURRENT_ADMIN_ERROR", error);
    res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};
