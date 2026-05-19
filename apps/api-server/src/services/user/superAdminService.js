const SuperAdmin = require("@models/user/superAdmin");
const User = require("@models/user/user");
const Admin = require("@models/user/admin");
const Marketing = require("@models/user/marketingAdmin");
const UserService = require("@services/user/userService");

/**
 * Helper function to check if user has super admin privileges
 * @param {Object} user - User object
 * @returns {Promise<boolean>} - True if user has super admin privileges
 */
const hasSuperAdminPrivileges = (user) => {
  // Check legacy super admin role
  if (user.role === "superadmin") {
    return true;
  }
  
  // Check RBAC super admin role (hierarchyLevel === 1)
  if (user.roleInfo && user.roleInfo.hierarchyLevel === 1 && user.roleInfo.isActive) {
    return true;
  }
  
  return false;
};

class SuperAdminService {
  // Create an super member
  static createSuperAdmin = async (superAdminData) => {
    try {
      const superAdmin = new SuperAdmin(superAdminData);
      await superAdmin.save();

      return superAdmin;
    } catch (error) {
      throw error;
    }
  };

  // Find all members
  static findAllAdmins = async () => {
    try {
      // Find all members. Populate the generations, Each generation has a tokens_count property, so we can just sum them up to get tokens_count total
      const members = await User.find().exec();

      return members;
    } catch (error) {
      throw error;
    }
  };

  // Disable user account
  static toggleDisableUserAccount = async (userId) => {
    try {
      // Find the user
      const user = await UserService.findUserById(userId);

      // If user is not found, throw an error
      if (!user) {
        throw new Error("User not found");
      }

      // Toggle the disabled property
      user.disabled = !user.disabled;
      // Save the user
      await user.save();

      return { message: "User account disabled" };
    } catch (error) {
      throw error;
    }
  };

  // Change user role
  static changeUserRole = async (userId, newRole) => {
    try {
      // Find the user by ID
      const user = await User.findById(userId);

      // If user is not found, throw an error
      if (!user) {
        return;
      }

      // Update the user's role
      user.role = newRole;
      // Save the updated user
      await user.save();

      return { message: "User role updated successfully" };
    } catch (error) {
      throw error;
    }
  };

  // Member team invite with proper synchronization
  static superAdminTeamInvitation = async (userId, invitation) => {
    try {
      // Find or create SuperAdmin record for the current user
      let currentSuperAdmin = await SuperAdmin.findOne({ user: userId }).exec();
      
      if (!currentSuperAdmin) {
        const User = require("@models/user/user");
        const user = await User.findById(userId).exec();
        
        currentSuperAdmin = await SuperAdmin.create({
          user: userId,
          name: user.name,
          email: user.email,
          team: [],
          invitations: []
        });
      }

      // Find the primary SuperAdmin record (the one with existing invitations)
      const primarySuperAdmin = await SuperAdmin.findOne({
        invitations: { $exists: true, $not: { $size: 0 } }
      }).exec();

      // Use the primary SuperAdmin or current one for invitations
      const activeSuperAdmin = primarySuperAdmin || currentSuperAdmin;

      // Check if the email is already present in the invitations array
      const existingInvitation = activeSuperAdmin.invitations.find(
        (invite) => invite.email === invitation.email
      );

      if (existingInvitation) {
        existingInvitation.status = invitation.status;
        existingInvitation.date = new Date();
        existingInvitation.invitedBy = invitation.invitedBy;
        await activeSuperAdmin.save();
      } else {
        activeSuperAdmin.invitations.push(invitation);
        await activeSuperAdmin.save();
      }

      // Sync invitations to all SuperAdmin records
      await this.syncInvitationsToAllSuperAdmins(activeSuperAdmin);

      // Also sync team members to ensure consistency
      await this.syncTeamMembersToAllSuperAdmins(activeSuperAdmin);

      return activeSuperAdmin;
    } catch (error) {
      throw error;
    }
  };

  // Helper function to sync invitations to all SuperAdmin records
  static syncInvitationsToAllSuperAdmins = async (sourceSuperAdmin) => {
    try {
      // Find all SuperAdmin records
      const allSuperAdmins = await SuperAdmin.find({}).exec();

      // Update all SuperAdmin records with the same invitations
      const updatePromises = allSuperAdmins.map(async (superAdmin) => {
        if (superAdmin._id.toString() !== sourceSuperAdmin._id.toString()) {
          superAdmin.invitations = sourceSuperAdmin.invitations;
          return superAdmin.save();
        }
      });

      await Promise.all(updatePromises);
    } catch (error) {
      console.error("SYNC_INVITATIONS_ERROR", error);
    }
  };

  // Helper function to sync team members to all SuperAdmin records
  static syncTeamMembersToAllSuperAdmins = async (sourceSuperAdmin) => {
    try {
      // Find all SuperAdmin records
      const allSuperAdmins = await SuperAdmin.find({}).exec();

      // Update all SuperAdmin records with the same team members
      const updatePromises = allSuperAdmins.map(async (superAdmin) => {
        if (superAdmin._id.toString() !== sourceSuperAdmin._id.toString()) {
          superAdmin.team = sourceSuperAdmin.team;
          return superAdmin.save();
        }
      });

      await Promise.all(updatePromises);
    } catch (error) {
      console.error("SYNC_TEAM_MEMBERS_ERROR", error);
    }
  };

  // Activate team account
  static activateTeamAccount = async (
    tokenData,
    name,
    hashedPassword,
    token
  ) => {
    try {
      // Find the super admin who invited the user
      const superAdmin = await SuperAdmin.findById(
        tokenData.superAdminId
      ).exec();

      // Check if user already exists
      let existingUser = await User.findOne({ email: tokenData?.email }).exec();

      let newUser;
      if (existingUser) {
        // Update existing user with new role and password
        existingUser.name = name;
        existingUser.role = tokenData?.role;
        existingUser.password = hashedPassword;
        existingUser.activated = true;
        existingUser.activationToken = token;
        existingUser.updatedAt = new Date();

        // If the role is a role ID, also set roleId field for consistency
        if (/^[a-fA-F0-9]{24}$/.test(tokenData?.role)) {
          existingUser.roleId = tokenData?.role;
        }

        await existingUser.save();
        newUser = existingUser;

        // User role updated successfully
      } else {
        // Create a new user
        newUser = new User({
          name,
          email: tokenData?.email,
          role: tokenData?.role,
          password: hashedPassword,
          activated: true,
          activationToken: token,
        });

        // If the role is a role ID, also set roleId field for consistency
        if (/^[a-fA-F0-9]{24}$/.test(tokenData?.role)) {
          newUser.roleId = tokenData?.role;
        }

        // Save the new user
        await newUser.save();
      }

      // Ensure superAdmin.team includes superAdmin.user
      if (!superAdmin.team.includes(superAdmin.user)) {
        superAdmin.team.push(superAdmin.user);
      }

      // Add the new user to the team
      superAdmin.team.push(newUser._id);
      await superAdmin.save();

      // Sync team members to all SuperAdmin records
      await this.syncTeamMembersToAllSuperAdmins(superAdmin);

      // Also sync invitations to ensure consistency
      await this.syncInvitationsToAllSuperAdmins(superAdmin);

      let teamMember;

      // Support both role names and role IDs
      let roleValue = tokenData?.role;
      let roleName = roleValue;
      let roleDoc = null;
      if (/^[a-fA-F0-9]{24}$/.test(roleValue)) {
        // Looks like an ObjectId, fetch the role document
        const RoleModel = require("@models/role/role");
        roleDoc = await RoleModel.findById(roleValue);
        if (!roleDoc || !roleDoc.isActive)
          throw new Error("Role not found or inactive");
        roleName = roleDoc.name;
      }

      // Create the appropriate role-based document
      switch (roleName.toLowerCase()) {
        case "super admin":
          teamMember = new SuperAdmin({
            user: newUser._id,
            name: newUser.name,
            email: newUser.email,
            invitedBy: superAdmin._id,
            team: superAdmin.team,
          });
          break;
        case "content manager":
        case "marketing":
          teamMember = new Marketing({
            user: newUser._id,
            name: newUser.name,
            email: newUser.email,
            invitedBy: superAdmin._id,
            team: superAdmin.team,
          });
          break;
        case "admin":
          teamMember = new Admin({
            user: newUser._id,
            name: newUser.name,
            email: newUser.email,
            invitedBy: superAdmin._id,
            team: superAdmin.team,
          });
          break;
        default:
          // For custom roles, skip creating a role-based document, just allow activation
          teamMember = null;
      }

      if (teamMember) {
        await teamMember.save();
      }

      // Update team arrays for all existing team members
      const updateOperations = [
        SuperAdmin.updateMany(
          { team: superAdmin.user },
          { $addToSet: { team: newUser._id } }
        ),
        Marketing.updateMany(
          { team: superAdmin.user },
          { $addToSet: { team: newUser._id } }
        ),
        Admin.updateMany(
          { team: superAdmin.user },
          { $addToSet: { team: newUser._id } }
        ),
      ];

      await Promise.all(updateOperations);

      // Update invitation status to "accepted" in the primary SuperAdmin
      const updatedSuperAdmin = await SuperAdmin.findOneAndUpdate(
        {
          _id: tokenData.superAdminId,
          "invitations.email": tokenData.email,
        },
        {
          $set: { "invitations.$.status": "accepted" },
        },
        { new: true }
      );

      // Sync invitation status update to all SuperAdmin records
      if (updatedSuperAdmin) {
        await this.syncInvitationsToAllSuperAdmins(updatedSuperAdmin);
      }

      return teamMember;
    } catch (error) {
      console.error("SERVER_TEAM_ACCT_ACTIVATE_ERROR", error);
      throw error;
    }
  };

  // Get team members with proper invitation tracking
  static findAllTeamMembers = async (userId) => {
    try {
      const User = require("@models/user/user");
      const user = await User.findById(userId).populate("roleInfo").exec();

      if (!user) {
        return { teamMembers: [], pendingInvitations: [] };
      }

      // Check if user has super admin privileges (legacy or RBAC)
      const hasPrivileges = hasSuperAdminPrivileges(user);
      
      if (!hasPrivileges) {
        return { teamMembers: [], pendingInvitations: [] };
      }

      // Get or create SuperAdmin record for the current user
      let currentSuperAdmin = await SuperAdmin.findOne({ user: userId }).exec();
      
      if (!currentSuperAdmin) {
        // Create SuperAdmin record for custom role users
        currentSuperAdmin = await SuperAdmin.create({
          user: userId,
          name: user.name,
          email: user.email,
          team: [],
          invitations: []
        });
      }

      // Find the primary SuperAdmin record (the one with invitations and team data)
      const primarySuperAdmin = await SuperAdmin.findOne({
        $or: [
          { invitations: { $exists: true, $not: { $size: 0 } } },
          { team: { $exists: true, $not: { $size: 0 } } }
        ]
      }).populate({
        path: "team",
        select: "name email role createdAt disabled"
      }).exec();

      // If no primary SuperAdmin found, use the current one
      const activeSuperAdmin = primarySuperAdmin || currentSuperAdmin;

      // Sync team data if the current user doesn't have it
      if (primarySuperAdmin && currentSuperAdmin._id.toString() !== primarySuperAdmin._id.toString()) {
        if (currentSuperAdmin.team.length === 0 && primarySuperAdmin.team.length > 0) {
          currentSuperAdmin.team = [...primarySuperAdmin.team];
          await currentSuperAdmin.save();
        }
      }

      // Get team members
      const teamMembers = activeSuperAdmin.team || [];

      // Get pending invitations
      const pendingInvitations = activeSuperAdmin.invitations
        .filter(invitation => invitation.status === "pending")
        .map(invitation => ({
          ...invitation.toObject(),
          invitedBy: invitation.invitedBy || {
            userId: userId,
            name: user.name,
            email: user.email,
            role: user.role
          }
        }));

      // Get accepted invitations for mapping
      const acceptedInvitations = activeSuperAdmin.invitations.filter(
        invitation => invitation.status === "accepted"
      );

      // Create maps for invitation data
      const acceptanceDateMap = {};
      const inviterMap = {};
      
      acceptedInvitations.forEach(invitation => {
        acceptanceDateMap[invitation.email] = invitation.date;
        inviterMap[invitation.email] = invitation.invitedBy || {
          userId: userId,
          name: user.name,
          email: user.email,
          role: user.role
        };
      });

      // Enhance team members with invitation data
      const enhancedTeamMembers = teamMembers.map(member => ({
        ...(member.toObject ? member.toObject() : member),
        acceptanceDate: acceptanceDateMap[member.email] || member.createdAt,
        invitedBy: inviterMap[member.email] || {
          userId: userId,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }));

      return {
        teamMembers: enhancedTeamMembers,
        pendingInvitations,
        totalTeamMembers: enhancedTeamMembers.length,
        totalPendingInvitations: pendingInvitations.length
      };
    } catch (error) {
      console.error("FIND_ALL_TEAM_MEMBERS_ERROR", error);
      throw error;
    }
  };

  // Get super admin analytics
  static getSuperAdminAnalytics = async () => {
    try {
      // Get total users count
      const totalUsers = await User.countDocuments();

      // Get users count by role
      const roleStats = await User.aggregate([
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 },
          },
        },
      ]);

      // Get active vs disabled users
      const activeUsers = await User.countDocuments({
        disabled: { $ne: true },
      });
      const disabledUsers = await User.countDocuments({ disabled: true });

      // Get users created this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const usersThisMonth = await User.countDocuments({
        createdAt: { $gte: startOfMonth },
      });

      // Get recent users (last 10)
      const recentUsers = await User.find()
        .select("name email role createdAt disabled")
        .sort({ createdAt: -1 })
        .limit(10);

      return {
        totalUsers,
        roleStats,
        activeUsers,
        disabledUsers,
        usersThisMonth,
        recentUsers,
      };
    } catch (error) {
      throw error;
    }
  };

  // Cancel team invitation
  static cancelTeamInvitation = async (
    userId,
    invitationId,
    cancelledByUser
  ) => {
    try {
      // Find the super admin
      const superAdmin = await SuperAdmin.findOne({ user: userId }).exec();

      if (!superAdmin) {
        throw new Error("Super admin not found");
      }

      // Find the invitation by ID
      const invitation = superAdmin.invitations.id(invitationId);

      if (!invitation) {
        throw new Error("Invitation not found");
      }

      // Check if invitation is still pending
      if (invitation.status !== "pending") {
        throw new Error("Only pending invitations can be cancelled");
      }

      // Store invitation email for email notification
      const invitationEmail = invitation.email;

      // Remove the invitation from the array
      superAdmin.invitations.pull(invitationId);

      // Save the updated super admin document
      await superAdmin.save();

      // Sync invitation changes to all SuperAdmin records
      await this.syncInvitationsToAllSuperAdmins(superAdmin);

      return {
        success: true,
        message: "Invitation cancelled successfully",
        invitationEmail: invitationEmail,
        cancelledBy: cancelledByUser,
      };
    } catch (error) {
      console.error("CANCEL_TEAM_INVITATION_SERVICE_ERROR", error);
      throw error;
    }
  };
}

module.exports = SuperAdminService;
