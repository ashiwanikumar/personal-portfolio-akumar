//** User **//
const Admin = require("@models/user/admin");
const User = require("@models/user/user");
const Member = require("@models/user/member");

class AdminService {
  // Create an admin
  static createAdmin = async (adminData) => {
    try {
      const admin = new Admin(adminData);
      await admin.save();

      return admin;
    } catch (error) {
      throw error;
    }
  };

  // Find one admin
  static findOneAdmin = async (query) => {
    try {
      const admin = await Admin.findOne(query)
        .populate({
          path: "subscription",
        })
        .exec();

      return admin;
    } catch (error) {
      throw error;
    }
  };

  // Find admin by id
  static findAdminById = async (id) => {
    try {
      const admin = await Admin.findById(id).exec();

      return admin;
    } catch (error) {
      throw error;
    }
  };

  // Admin team invite
  static adminTeamInvitation = async (userId, invitation) => {
    try {
      const admin = await Admin.findOne({ user: userId }).exec();

      // Filter out all existing invitations with the same email
      admin.invitations = admin.invitations.filter(
        (inv) => inv.email !== invitation.email
      );

      // Push the new invitation
      admin.invitations.push(invitation);

      await admin.save();

      return admin;
    } catch (error) {
      throw error;
    }
  };

  // Team Account activation
  static activateTeamAccount = async (jwtData, name, hashedPassword, token) => {
    try {
      // Find the admin who invited the user
      const invitingAdmin = await Admin.findById(jwtData.adminId)
        .populate({
          path: "subscription",
        })
        .exec();

      // Find the user to get the workspaceId
      const invitingUser = await User.findById(invitingAdmin.user).exec();

      // Attempt to find an existing user by email
      let newUser = await User.findOne({ email: jwtData.email }).exec();

      // If the user exists and has a Free subscription and the role to assign is "agent"
      if (newUser) {
        // If the user has an Admin model, remove it
        await Admin.findOneAndRemove({ user: newUser._id });

        // Update the existing user to the new role and activated status
        newUser.role = jwtData.role;
        newUser.activated = true;
        newUser.activationToken = token;
        newUser.password = hashedPassword;

        await newUser.save();
      } else if (newUser && jwtData.role === "admin") {
        // It means the they are a existing free user and are being invited as an admin
        // Update the existing user to the new role and activated status
        newUser.role = jwtData.role;
        newUser.activated = true;
        newUser.activationToken = token;
        newUser.password = hashedPassword;

        await newUser.save();
      } else if (!newUser) {
        // Find the user to get the workspaceId
        const invitingUser = await User.findById(invitingAdmin.user).exec();

        // Create a new user if one doesn't exist
        newUser = new User({
          name,
          email: jwtData.email,
          role: jwtData.role,
          password: hashedPassword,
          activated: true,
          activationToken: token,
        });

        // Save the new user
        await newUser.save();
      }

      // Update teams array
      const teams = [
        ...invitingAdmin.team,
        ...(invitingAdmin.team.includes(invitingAdmin.user)
          ? []
          : [invitingAdmin.user]),
        newUser._id,
      ];
      const uniqueTeam = [...new Set(teams)];

      if (jwtData.role === "admin") {
        // Create or update the admin
        const existingAdmin = await Admin.findOne({ user: newUser._id });

        if (existingAdmin) {
          existingAdmin.name = newUser.name;
          existingAdmin.email = newUser.email;
          existingAdmin.team = uniqueTeam;

          await existingAdmin.save();
        } else {
          const newAdmin = new Admin({
            user: newUser._id,
            name: newUser.name,
            email: newUser.email,
            team: uniqueTeam,
          });
          await newAdmin.save();
        }
      }

      // Create or update the member for both admin and agent
      const existingMember = await Member.findOne({ user: newUser._id });

      if (existingMember) {
        existingMember.team = uniqueTeam;
        existingMember.name = newUser.name;
        existingMember.email = newUser.email;
        existingMember.role = jwtData.role;
        existingMember.invitedBy = jwtData.adminId;

        await existingMember.save();
      } else {
        const newMember = new Member({
          name: newUser.name,
          email: newUser.email,
          user: newUser._id,
          invitedBy: jwtData.adminId,
          role: jwtData.role,
          team: uniqueTeam,
        });
        await newMember.save();
      }

      // Update the Admin document for the inviting admin and team members
      await Admin.findByIdAndUpdate(invitingAdmin._id, {
        $set: { team: uniqueTeam },
      }).exec();
      await Admin.updateMany(
        { user: { $in: uniqueTeam } },
        { $set: { team: uniqueTeam } }
      ).exec();
      await Member.updateMany(
        { user: { $in: uniqueTeam } },
        { $set: { team: uniqueTeam } }
      ).exec();

      // Update invitation status to "accepted"
      await Admin.findOneAndUpdate(
        { _id: jwtData.adminId, "invitations.email": jwtData.email },
        { "invitations.$.status": "accepted" },
        { new: true }
      ).exec();

      return invitingAdmin;
    } catch (error) {
      throw error;
    }
  };

  // Remove a team member
  static removeTeamMember = async (teamAdminUserId, userIdToRemove) => {
    try {
      // Find the user to be removed
      const user = await User.findById(userIdToRemove).exec();
      if (!user) {
        throw new Error("User not found.");
      }

      // Find the admin requesting the removal
      const admin = await Admin.findOne({ user: teamAdminUserId }).exec();
      if (!admin) {
        // Operation should only proceed if an admin is requesting the removal
        throw new Error("Only admins can remove team members.");
      }

      // Remove the member from the admin's team
      admin.team = admin.team.filter(
        (userId) => userId.toString() !== userIdToRemove.toString()
      );
      await admin.save();

      // Remove the member from all team members' teams in both Admin and Member collections
      await Admin.updateMany(
        { team: userIdToRemove },
        { $pull: { team: userIdToRemove } }
      ).exec();
      await Member.updateMany(
        { team: userIdToRemove },
        { $pull: { team: userIdToRemove } }
      ).exec();

      // If the user being removed is an agent, delete their Member model
      if (user.role === "agent") {
        await Member.findOneAndDelete({ user: userIdToRemove }).exec();
        // Create an Admin model for them with a 'Free' plan
        const newAdmin = new Admin({
          user: userIdToRemove,
          name: user.name,
          email: user.email,
          role: "admin", // Assuming the role field exists in the Admin schema
          currentPlan: "Free",
          subscription: null,
          billingAdmin: true,
          team: [userIdToRemove],
        });
        await newAdmin.save();
      } else if (user.role === "admin") {
        // Update their admin model
        await Admin.findOneAndUpdate(
          { user: userIdToRemove },
          {
            currentPlan: "Free",
            subscription: null,
            billingAdmin: true,
            team: [userIdToRemove],
          }
        ).exec();
      }

      // Update their member model
      await Member.findOneAndUpdate(
        { user: userIdToRemove },
        {
          currentPlan: "Free",
          subscription: null,
          invitedBy: null,
          role: "admin",
          handledTickets: [],
          unHandledTickets: [],
          team: [userIdToRemove],
          notifications: [],
        }
      ).exec();

      // Update the user's role to 'admin' and assign them to a 'Free' plan, clearing workspaceId
      user.role = "admin";
      user.currentPlan = "Free";
      user.workspaceId = null;
      await user.save();

      // If the user being removed is the billing admin, assign the billing admin role to the next admin in the team

      return {
        success: true,
        message:
          "Team member removed successfully, and their role has been updated.",
      };
    } catch (error) {
      throw error;
    }
  };

  // Find one admin populated team
  static findOneAdminPopulatedTeam = async (query) => {
    try {
      const admin = await Admin.findOne(query)
        .populate({
          path: "team",
          select: "name email role createdAt isOnline isEngaged lastActive",
        })
        .sort({ createdAt: -1 })
        .exec();

      // If admin.team is empty, we need to add the admin to their own team, add it to the Admin, Member and Workspace models
      if (admin.team.length === 0) {
        // Add the admin to their own team
        admin.team.push(admin.user);
        await admin.save();

        // Add the admin to their own team in the Member model
        const member = await Member.findOne({ user: admin.user }).exec();
        member.team.push(admin.user);
        await member.save();

        // Add the admin to their own team in the Workspace model
        // Find the user
        const user = await User.findById(admin.user).exec();
        const workspace = await Workspace.findOne({
          workspaceId: user.workspaceId,
        }).exec();
        workspace.team.push(admin.user);
        await workspace.save();
      }

      return admin.team;
    } catch (error) {
      throw error;
    }
  };
}

module.exports = AdminService;
