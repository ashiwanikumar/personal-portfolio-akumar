const UserService = require("@services/user/userService");
const User = require("@models/user/user");
const Role = require("@models/role/role");

/**********************************
  Check if user is a logged in
***********************************/
exports.currentUser = async (req, res) => {
  const { _id } = req.user;

  const user = await UserService.findUserById(_id);

  // Populate role information if not already populated
  if (user && !user.roleInfo && user.roleId) {
    await user.populate("roleInfo");
  }

  // Check if user account is disabled
  if (user?.disabled) {
    // Push the user to login page
    return res.status(409).json({
      error: true,
      type: [
        {
          code: "GLOBAL_ERROR",
          field: "user",
          message:
            "Your account has been disabled, please contact support to learn more",
        },
      ],
    });
  }

  if (user) {
    // TEMPORARY: Handle users without roleId (migration support)
    if (!user.roleId && user.role) {
      let defaultRole;

      // Try to find or create appropriate role based on legacy role
      switch (user.role.toLowerCase()) {
        case "superadmin":
          defaultRole = await Role.findOne({ name: "Super Admin" });
          break;
        case "admin":
          defaultRole = await Role.findOne({ name: "Admin" });
          break;
        case "marketing":
          defaultRole = await Role.findOne({ name: "Content Manager" });
          break;
        default:
          defaultRole = await Role.findOne({ name: "User" });
      }

      // If no role found, create a basic Admin role
      if (!defaultRole) {
        defaultRole = new Role({
          name: "Admin",
          description: "Administrative access",
          hierarchyLevel: 1,
          accessRights: [],
          approvalRights: true,
          isActive: true,
          isSystemRole: true,
          createdBy: user._id,
        });
        await defaultRole.save();
      }

      // Update user with roleId
      user.roleId = defaultRole._id;
      user.roleAssignedAt = new Date();
      await user.save();
    }

    const clientObject = User.toClientObject(user);

    res.status(200).json({
      user: clientObject,
      message: "Oh yes!",
    });
  } else {
    console.log("No user found, returning 403");
    res.status(403).json({
      admin: false,
      error: "You are trying to access a restricted resource. Access Denied",
    });
  }
};

/**********************************
  Get a user By id
***********************************/
exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).select("name email").exec();

    // If no user found, throw 404 error
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    console.log("GET_USER_BY_ID_ERROR", error);
  }
};

/**********************************
  Get all users
***********************************/
exports.getAllUsers = async (req, res) => {
  try {
    const users = await UserService.findAllUsers();

    // If no user found, throw 404 error
    if (users.length === 1) {
      // Only admin user is present
      return res.status(404).json({
        error: "No users found",
      });
    }
    res.status(200).json(users);
  } catch (error) {
    console.log("GET_ALL_USERS_ERROR", error);
  }
};

/**********************************
  Update a user by id
***********************************/
exports.updateUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await UserService.findOneUserAndUpdate(id, req.body, {
      new: true,
    });

    // If no user found, throw 404 error
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    console.log("UPDATE_USER_BY_ID_ERROR", error);
  }
};

/**********************************
  Update user profile
***********************************/
exports.updateUserProfile = async (req, res) => {
  const { _id } = req.user;

  try {
    // Get the user
    const user = await UserService.updateUserProfile(_id, req.body);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: User.toClientObject(user)
    });
  } catch (error) {
    console.log("UPDATE_USER_PROFILE_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile"
    });
  }
};

/**********************************
  Change user password
***********************************/
exports.changePassword = async (req, res) => {
  const { _id } = req.user;
  const { oldPassword, newPassword } = req.body;

  try {
    // Validate required fields
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old password and new password are required"
      });
    }

    // Find the user
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Verify old password
    const bcrypt = require("bcryptjs");
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Validate new password (you can add more validation here)
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long"
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await User.findByIdAndUpdate(_id, { password: hashedNewPassword });

    // Send password change notification email asynchronously
    const sendEmail = require("@utils/sendEmail");
    const { passwordChangeSuccessEmailTemplate } = require("@mails/authEmails");
    const { collectClientLoginTechnicalInfo } = require("@utils/technical-info-collector/technicalInfoCollector");

    // Collect technical information for email
    const technicalInfo = collectClientLoginTechnicalInfo(req);
    const changeInfo = {
      ip: req.ip || "Not Available",
      browser: technicalInfo?.browser.name
        ? `${technicalInfo.browser.name} ${technicalInfo.browser.version || ""}`
        : req.headers["user-agent"] || "Not Available",
      device: technicalInfo?.device.deviceType
        ? `${technicalInfo.device.vendor || ""} ${technicalInfo.device.deviceType || ""}`
        : "Not Available",
      location: "Not Available", // You can integrate geolocation service here
      time: new Date().toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      }),
      technicalDetails: technicalInfo,
    };

    // Send email notification asynchronously (don't wait for it)
    setImmediate(async () => {
      try {
        await sendEmail({
          to: user.email,
          subject: "Password Successfully Changed - Security Notification",
          html: passwordChangeSuccessEmailTemplate(user, changeInfo),
          emailType: "Password Change Notification",
          user: user,
        });
        console.log("Password change notification email sent to:", user.email);
      } catch (emailError) {
        console.error("Failed to send password change notification email:", emailError);
        // Don't fail the request if email fails
      }
    });

    res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (error) {
    console.log("CHANGE_PASSWORD_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Failed to change password"
    });
  }
};

// ===== ROLE MANAGEMENT ENDPOINTS =====

/**********************************
  Assign role to user
***********************************/
exports.assignRoleToUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { roleId } = req.body;
    const assignedBy = req.user._id;

    if (!roleId) {
      return res.status(400).json({
        success: false,
        message: "Role ID is required",
      });
    }

    const user = await UserService.assignRoleToUser(userId, roleId, assignedBy);

    res.status(200).json({
      success: true,
      message: "Role assigned successfully",
      user: User.toClientObject(user),
    });
  } catch (error) {
    console.log("ASSIGN_ROLE_TO_USER_ERROR", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to assign role to user",
    });
  }
};

/**********************************
  Get users by role
***********************************/
exports.getUsersByRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { page, limit, includeDisabled, search } = req.query;

    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      includeDisabled: includeDisabled === "true",
      search: search || "",
    };

    const result = await UserService.getUsersByRole(roleId, options);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.log("GET_USERS_BY_ROLE_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users by role",
    });
  }
};

/**********************************
  Get users with roles (enhanced listing)
***********************************/
exports.getUsersWithRoles = async (req, res) => {
  try {
    const { page, limit, search, roleId, status, includeDisabled } = req.query;

    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      search: search || "",
      roleId: roleId || null,
      status: status || null,
      includeDisabled: includeDisabled === "true",
    };

    const result = await UserService.findUsersWithRoles(options);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.log("GET_USERS_WITH_ROLES_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users with roles",
    });
  }
};

/**********************************
  Activate user
***********************************/
exports.activateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const activatedBy = req.user._id;

    const user = await UserService.activateUser(userId, activatedBy);

    res.status(200).json({
      success: true,
      message: "User activated successfully",
      user,
    });
  } catch (error) {
    console.log("ACTIVATE_USER_ERROR", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to activate user",
    });
  }
};

/**********************************
  Deactivate user
***********************************/
exports.deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const deactivatedBy = req.user._id;

    const user = await UserService.deactivateUser(userId, deactivatedBy);

    res.status(200).json({
      success: true,
      message: "User deactivated successfully",
      user,
    });
  } catch (error) {
    console.log("DEACTIVATE_USER_ERROR", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to deactivate user",
    });
  }
};

// ===== PERMISSION AND SECURITY ENDPOINTS =====

/**********************************
  Check user permission
***********************************/
exports.checkUserPermission = async (req, res) => {
  try {
    const { resource, permission } = req.params;
    const userId = req.user._id;

    const hasPermission = await UserService.checkUserPermission(
      userId,
      resource,
      permission
    );

    res.status(200).json({
      success: true,
      hasPermission,
      resource,
      permission,
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
  Get user permissions
***********************************/
exports.getUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params || req.user._id;
    const targetUserId = userId || req.user._id;

    const permissions = await UserService.getUserPermissions(targetUserId);

    res.status(200).json({
      success: true,
      ...permissions,
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
  Get current user permissions
***********************************/
exports.getCurrentUserPermissions = async (req, res) => {
  try {
    const userId = req.user._id;

    const permissions = await UserService.getUserPermissions(userId);

    res.status(200).json({
      success: true,
      ...permissions,
    });
  } catch (error) {
    console.log("GET_CURRENT_USER_PERMISSIONS_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch current user permissions",
    });
  }
};

// ===== INVITATION MANAGEMENT ENDPOINTS =====

/**********************************
  Create user from invitation
***********************************/
exports.createUserFromInvitation = async (req, res) => {
  try {
    const { token } = req.params;
    const userData = req.body;

    const user = await UserService.createUserFromInvitation(token, userData);

    res.status(201).json({
      success: true,
      message: "User created successfully from invitation",
      user: User.toClientObject(user),
    });
  } catch (error) {
    console.log("CREATE_USER_FROM_INVITATION_ERROR", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create user from invitation",
    });
  }
};

/**********************************
  Get user invitation status
***********************************/
exports.getUserInvitationStatus = async (req, res) => {
  try {
    const { email } = req.params;

    const invitationStatus = await UserService.getUserInvitationStatus(email);

    res.status(200).json({
      success: true,
      ...invitationStatus,
    });
  } catch (error) {
    console.log("GET_USER_INVITATION_STATUS_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user invitation status",
    });
  }
};

// ===== STATISTICS AND REPORTING =====

/**********************************
  Get user statistics
***********************************/
exports.getUserStats = async (req, res) => {
  try {
    const { startDate, endDate, roleId } = req.query;

    const options = {
      startDate: startDate || null,
      endDate: endDate || null,
      roleId: roleId || null,
    };

    const stats = await UserService.getUserStats(options);

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.log("GET_USER_STATS_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user statistics",
    });
  }
};

// ===== UTILITY ENDPOINTS =====

/**********************************
  Get available roles for assignment
***********************************/
exports.getAvailableRoles = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id).populate("roleInfo");

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "Current user not found",
      });
    }

    // Get roles that the current user can assign (based on hierarchy)
    const roles = await Role.find({
      isActive: true,
      hierarchyLevel: { $gt: currentUser.roleInfo.hierarchyLevel },
    }).sort({ hierarchyLevel: 1 });

    res.status(200).json({
      success: true,
      roles,
      currentUserRole: currentUser.roleInfo,
    });
  } catch (error) {
    console.log("GET_AVAILABLE_ROLES_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch available roles",
    });
  }
};

/**********************************
  Get role hierarchy
***********************************/
exports.getRoleHierarchy = async (req, res) => {
  try {
    const roles = await Role.find({ isActive: true })
      .sort({ hierarchyLevel: 1 })
      .select("name description hierarchyLevel accessRights");

    const hierarchy = roles.map((role) => ({
      _id: role._id,
      name: role.name,
      description: role.description,
      hierarchyLevel: role.hierarchyLevel,
      permissions: role.accessRights?.length || 0,
    }));

    res.status(200).json({
      success: true,
      hierarchy,
    });
  } catch (error) {
    console.log("GET_ROLE_HIERARCHY_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch role hierarchy",
    });
  }
};
