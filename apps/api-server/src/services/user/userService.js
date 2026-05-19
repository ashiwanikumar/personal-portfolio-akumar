const User = require("@models/user/user");
const UserInvitation = require("@models/user/userInvitation");
const Role = require("@models/role/role");
const mongoose = require("mongoose");

class UserService {
  // Create a new user
  static createUser = async (user) => {
    try {
      const newUser = new User(user);
      await newUser.save();

      return newUser;
    } catch (error) {
      throw error;
    }
  };

  // Find one user
  static findOneUser = async (query) => {
    try {
      const user = await User.findOne(query).populate("roleInfo").exec();

      return user;
    } catch (error) {
      throw error;
    }
  };

  // Find user by id
  static findUserById = async (id) => {
    try {
      const user = await User.findById(id).populate("roleInfo").exec();

      return user;
    } catch (error) {
      throw error;
    }
  };

  // Find all users
  static findAllUsers = async () => {
    try {
      const users = await User.find().populate("roleInfo").exec();

      return users;
    } catch (error) {
      throw error;
    }
  };

  // Find one user and update
  static findOneUserAndUpdate = async (query, update) => {
    try {
      const user = await User.findOneAndUpdate(query, update, {
        new: true,
      })
        .populate("roleInfo")
        .exec();

      return user;
    } catch (error) {
      throw error;
    }
  };

  // Delete a user by id
  static deleteUserById = async (id) => {
    try {
      const userToDelete = await User.findById(id).exec();

      // If no user found, throw 404 error
      if (!userToDelete) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      await userToDelete.remove();

      return userToDelete;
    } catch (error) {
      throw error;
    }
  };

  // Update user's last active time
  static updateUserLastActiveTime = async (id) => {
    try {
      const user = await User.findById(id).populate("roleInfo").exec();

      // If no user found, throw 404 error
      if (!user) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      user.lastActive = new Date();
      await user.save();

      return user;
    } catch (error) {
      throw error;
    }
  };

  // Update use profile
  static updateUserProfile = async (userId, reqBody) => {
    try {
      // Find the user
      const user = await User.findById(userId).populate("roleInfo").exec();

      // Check if the user exists
      if (!user) {
        return { message: "User not found" };
      }

      // Update the user
      const updatedUser = await User.findByIdAndUpdate(userId, reqBody, {
        new: true,
      })
        .populate("roleInfo")
        .exec();

      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  // ===== ROLE ASSIGNMENT METHODS =====

  // Assign role to user
  static assignRoleToUser = async (userId, roleId, assignedBy) => {
    try {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Validate role exists
        const role = await Role.findById(roleId).session(session);
        if (!role) {
          throw new Error("Role not found");
        }

        // Find user
        const user = await User.findById(userId).session(session);
        if (!user) {
          throw new Error("User not found");
        }

        // Check if assigner has permission to assign this role
        const assigner = await User.findById(assignedBy)
          .populate("roleInfo")
          .session(session);
        if (!assigner) {
          throw new Error("Assigner not found");
        }

        // Check hierarchy - assigner must have higher privileges
        if (!assigner.canAssignRole(role.hierarchyLevel)) {
          throw new Error("Insufficient privileges to assign this role");
        }

        // Update user role
        user.roleId = roleId;
        user.roleAssignedBy = assignedBy;
        user.roleAssignedAt = new Date();
        user.updatedBy = assignedBy;

        await user.save({ session });
        await session.commitTransaction();

        return await User.findById(userId)
          .populate("roleInfo")
          .populate("roleAssignedBy", "name email");
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    } catch (error) {
      throw error;
    }
  };

  // Get users by role with pagination
  static getUsersByRole = async (roleId, options = {}) => {
    try {
      const {
        page = 1,
        limit = 10,
        includeDisabled = false,
        search = "",
      } = options;

      const query = { roleId };

      if (!includeDisabled) {
        query.disabled = false;
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { department: { $regex: search, $options: "i" } },
          { jobTitle: { $regex: search, $options: "i" } },
        ];
      }

      const skip = (page - 1) * limit;

      const [users, totalCount] = await Promise.all([
        User.find(query)
          .populate("roleInfo", "name description hierarchyLevel")
          .populate("invitedBy", "name email")
          .populate("roleAssignedBy", "name email")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        User.countDocuments(query),
      ]);

      return {
        users: users.map((user) => User.toClientObject(user)),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalUsers: totalCount,
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      throw error;
    }
  };

  // ===== USER INVITATION METHODS =====

  // Create user from invitation
  static createUserFromInvitation = async (invitationToken, userData) => {
    try {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Find and validate invitation
        const invitation = await UserInvitation.findByToken(
          invitationToken
        ).session(session);
        if (!invitation) {
          throw new Error("Invalid or expired invitation");
        }

        if (!invitation.isValid()) {
          throw new Error("Invitation is no longer valid");
        }

        // Check if user already exists
        const existingUser = await User.findOne({
          email: invitation.email,
        }).session(session);
        if (existingUser) {
          throw new Error("User with this email already exists");
        }

        // Create new user with invitation data
        const newUser = new User({
          name: userData.name || invitation.name,
          email: invitation.email,
          password: userData.password,
          roleId: invitation.roleId,
          accountType: "invitation",
          invitedBy: invitation.invitedBy,
          invitedAt: invitation.sentAt,
          invitationAcceptedAt: new Date(),
          activated: true,
          activatedAt: new Date(),
          department: userData.department || invitation.department,
          jobTitle: userData.jobTitle || invitation.jobTitle,
          phone: userData.phone || invitation.phone,
          createdBy: invitation.invitedBy,
        });

        await newUser.save({ session });

        // Mark invitation as accepted
        await invitation.markAsAccepted(newUser._id);

        await session.commitTransaction();

        return await User.findById(newUser._id)
          .populate("roleInfo", "name description hierarchyLevel accessRights")
          .populate("invitedBy", "name email")
          .session(session);
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    } catch (error) {
      throw error;
    }
  };

  // Get user invitation status
  static getUserInvitationStatus = async (email) => {
    try {
      const invitation = await UserInvitation.findOne({ email })
        .populate("roleInfo", "name description")
        .populate("inviterInfo", "name email")
        .sort({ sentAt: -1 });

      if (!invitation) {
        return { status: "no_invitation" };
      }

      return {
        status: invitation.status,
        invitation: {
          _id: invitation._id,
          email: invitation.email,
          name: invitation.name,
          roleInfo: invitation.roleInfo,
          inviterInfo: invitation.inviterInfo,
          sentAt: invitation.sentAt,
          expiresAt: invitation.expiresAt,
          isExpired: invitation.isExpired,
          timeRemaining: invitation.timeRemaining,
          personalMessage: invitation.personalMessage,
        },
      };
    } catch (error) {
      throw error;
    }
  };

  // ===== PERMISSION AND SECURITY METHODS =====

  // Check if user has specific permission
  static checkUserPermission = async (userId, resource, permission) => {
    try {
      const user = await User.findById(userId).populate("roleInfo");
      if (!user) {
        throw new Error("User not found");
      }

      return user.hasPermission(resource, permission);
    } catch (error) {
      throw error;
    }
  };

  // Get user's complete permissions
  static getUserPermissions = async (userId) => {
    try {
      const user = await User.findById(userId).populate("roleInfo");
      if (!user) {
        throw new Error("User not found");
      }

      return {
        userId: user._id,
        roleInfo: user.roleInfo,
        permissions: user.getPermissions(),
        hierarchyLevel: user.roleInfo?.hierarchyLevel,
      };
    } catch (error) {
      throw error;
    }
  };

  // ===== ENHANCED USER MANAGEMENT =====

  // Find users with role information
  static findUsersWithRoles = async (options = {}) => {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        roleId = null,
        status = null,
        includeDisabled = false,
      } = options;

      const query = {};

      // Filter by search
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { department: { $regex: search, $options: "i" } },
          { jobTitle: { $regex: search, $options: "i" } },
        ];
      }

      // Filter by role
      if (roleId) {
        query.roleId = roleId;
      }

      // Filter by status
      if (status === "active") {
        query.disabled = false;
        query.activated = true;
      } else if (status === "inactive") {
        query.$or = [{ disabled: true }, { activated: false }];
      }

      // Include disabled users
      if (!includeDisabled) {
        query.disabled = { $ne: true };
      }

      const skip = (page - 1) * limit;

      const [users, totalCount] = await Promise.all([
        User.find(query)
          .populate("roleInfo", "name description hierarchyLevel")
          .populate("invitedBy", "name email")
          .populate("roleAssignedBy", "name email")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        User.countDocuments(query),
      ]);

      return {
        users: users.map((user) => User.toClientObject(user)),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalUsers: totalCount,
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      throw error;
    }
  };

  // Activate user account
  static activateUser = async (userId, activatedBy) => {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        {
          activated: true,
          activatedAt: new Date(),
          updatedBy: activatedBy,
        },
        { new: true }
      ).populate("roleInfo");

      if (!user) {
        throw new Error("User not found");
      }

      return User.toClientObject(user);
    } catch (error) {
      throw error;
    }
  };

  // Deactivate user account
  static deactivateUser = async (userId, deactivatedBy) => {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        {
          disabled: true,
          updatedBy: deactivatedBy,
        },
        { new: true }
      ).populate("roleInfo");

      if (!user) {
        throw new Error("User not found");
      }

      return User.toClientObject(user);
    } catch (error) {
      throw error;
    }
  };

  // ===== USER STATISTICS =====

  // Get user statistics
  static getUserStats = async (options = {}) => {
    try {
      const { startDate, endDate, roleId } = options;

      const matchStage = {};
      if (startDate) matchStage.createdAt = { $gte: new Date(startDate) };
      if (endDate) {
        matchStage.createdAt = {
          ...matchStage.createdAt,
          $lte: new Date(endDate),
        };
      }
      if (roleId) matchStage.roleId = new mongoose.Types.ObjectId(roleId);

      const stats = await User.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            activeUsers: {
              $sum: {
                $cond: {
                  if: {
                    $and: [
                      { $eq: ["$activated", true] },
                      { $ne: ["$disabled", true] },
                    ],
                  },
                  then: 1,
                  else: 0,
                },
              },
            },
            invitedUsers: {
              $sum: {
                $cond: {
                  if: { $eq: ["$accountType", "invitation"] },
                  then: 1,
                  else: 0,
                },
              },
            },
            pendingActivation: {
              $sum: {
                $cond: { if: { $eq: ["$activated", false] }, then: 1, else: 0 },
              },
            },
            disabledUsers: {
              $sum: {
                $cond: { if: { $eq: ["$disabled", true] }, then: 1, else: 0 },
              },
            },
          },
        },
      ]);

      const roleStats = await User.aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: "roles",
            localField: "roleId",
            foreignField: "_id",
            as: "roleInfo",
          },
        },
        { $unwind: "$roleInfo" },
        {
          $group: {
            _id: "$roleInfo.name",
            count: { $sum: 1 },
            hierarchyLevel: { $first: "$roleInfo.hierarchyLevel" },
          },
        },
        { $sort: { hierarchyLevel: 1 } },
      ]);

      return {
        summary: stats[0] || {
          totalUsers: 0,
          activeUsers: 0,
          invitedUsers: 0,
          pendingActivation: 0,
          disabledUsers: 0,
        },
        roleDistribution: roleStats,
      };
    } catch (error) {
      throw error;
    }
  };
}

module.exports = UserService;
