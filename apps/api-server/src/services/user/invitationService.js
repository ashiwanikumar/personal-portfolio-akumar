const UserInvitation = require("@models/user/userInvitation");
const User = require("@models/user/user");
const Role = require("@models/role/role");
const mongoose = require("mongoose");

class InvitationService {
  // ===== INVITATION CREATION AND MANAGEMENT =====

  // Create and send invitation
  static createInvitation = async (invitationData, invitedBy) => {
    try {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const {
          email,
          name,
          roleId,
          department,
          jobTitle,
          phone,
          personalMessage,
        } = invitationData;

        // Validate inviter exists and has permission
        const inviter = await User.findById(invitedBy).populate("roleInfo").session(session);
        if (!inviter) {
          throw new Error("Inviter not found");
        }

        // Validate role exists
        const role = await Role.findById(roleId).session(session);
        if (!role) {
          throw new Error("Role not found");
        }

        // Check if inviter can assign this role
        if (!inviter.canAssignRole(role.hierarchyLevel)) {
          throw new Error("Insufficient privileges to invite users with this role");
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email }).session(session);
        if (existingUser) {
          throw new Error("User with this email already exists");
        }

        // Check for existing pending invitation
        const existingInvitation = await UserInvitation.findOne({
          email,
          status: "pending",
          expiresAt: { $gt: new Date() },
        }).session(session);

        if (existingInvitation) {
          throw new Error("Pending invitation already exists for this email");
        }

        // Create invitation
        const invitation = new UserInvitation({
          email,
          name,
          roleId,
          invitedBy,
          department,
          jobTitle,
          phone,
          personalMessage,
        });

        await invitation.save({ session });
        await session.commitTransaction();

        // Populate invitation with role and inviter info
        const populatedInvitation = await UserInvitation.findById(invitation._id)
          .populate("roleInfo", "name description hierarchyLevel")
          .populate("inviterInfo", "name email");

        // TODO: Send invitation email
        // await this.sendInvitationEmail(populatedInvitation);

        return populatedInvitation;
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

  // Bulk create invitations
  static createBulkInvitations = async (invitationsData, invitedBy) => {
    try {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Validate inviter
        const inviter = await User.findById(invitedBy).populate("roleInfo").session(session);
        if (!inviter) {
          throw new Error("Inviter not found");
        }

        const results = {
          successful: [],
          failed: [],
          summary: {
            total: invitationsData.length,
            success: 0,
            failed: 0,
          },
        };

        for (const invitationData of invitationsData) {
          try {
            // Validate each invitation individually
            const { email, roleId } = invitationData;

            // Check role permissions
            const role = await Role.findById(roleId).session(session);
            if (!role || !inviter.canAssignRole(role.hierarchyLevel)) {
              throw new Error(`Insufficient privileges for role: ${role?.name || roleId}`);
            }

            // Check for existing user or invitation
            const [existingUser, existingInvitation] = await Promise.all([
              User.findOne({ email }).session(session),
              UserInvitation.findOne({
                email,
                status: "pending",
                expiresAt: { $gt: new Date() },
              }).session(session),
            ]);

            if (existingUser) {
              throw new Error("User already exists");
            }

            if (existingInvitation) {
              throw new Error("Pending invitation already exists");
            }

            // Create invitation
            const invitation = new UserInvitation({
              ...invitationData,
              invitedBy,
            });

            await invitation.save({ session });

            const populatedInvitation = await UserInvitation.findById(invitation._id)
              .populate("roleInfo", "name description")
              .populate("inviterInfo", "name email")
              .session(session);

            results.successful.push({
              email,
              invitation: populatedInvitation,
            });
            results.summary.success++;
          } catch (error) {
            results.failed.push({
              email: invitationData.email,
              error: error.message,
            });
            results.summary.failed++;
          }
        }

        await session.commitTransaction();

        // TODO: Send bulk invitation emails
        // await this.sendBulkInvitationEmails(results.successful);

        return results;
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

  // ===== INVITATION RETRIEVAL =====

  // Get invitation by token
  static getInvitationByToken = async (token) => {
    try {
      const invitation = await UserInvitation.findByToken(token);
      if (!invitation) {
        throw new Error("Invalid or expired invitation");
      }

      return invitation;
    } catch (error) {
      throw error;
    }
  };

  // Get all invitations with filtering and pagination
  static getAllInvitations = async (options = {}) => {
    try {
      const {
        page = 1,
        limit = 10,
        status = null,
        roleId = null,
        invitedBy = null,
        search = "",
        startDate = null,
        endDate = null,
      } = options;

      const query = {};

      // Filter by status
      if (status) {
        query.status = status;
      }

      // Filter by role
      if (roleId) {
        query.roleId = roleId;
      }

      // Filter by inviter
      if (invitedBy) {
        query.invitedBy = invitedBy;
      }

      // Search functionality
      if (search) {
        query.$or = [
          { email: { $regex: search, $options: "i" } },
          { name: { $regex: search, $options: "i" } },
          { department: { $regex: search, $options: "i" } },
          { jobTitle: { $regex: search, $options: "i" } },
        ];
      }

      // Date range filter
      if (startDate) {
        query.sentAt = { $gte: new Date(startDate) };
      }
      if (endDate) {
        query.sentAt = { ...query.sentAt, $lte: new Date(endDate) };
      }

      const skip = (page - 1) * limit;

      const [invitations, totalCount] = await Promise.all([
        UserInvitation.find(query)
          .populate("roleInfo", "name description hierarchyLevel")
          .populate("inviterInfo", "name email")
          .sort({ sentAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        UserInvitation.countDocuments(query),
      ]);

      return {
        invitations,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalInvitations: totalCount,
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      throw error;
    }
  };

  // Get pending invitations
  static getPendingInvitations = async (options = {}) => {
    try {
      return await UserInvitation.findPending(options);
    } catch (error) {
      throw error;
    }
  };

  // ===== INVITATION LIFECYCLE MANAGEMENT =====

  // Resend invitation
  static resendInvitation = async (invitationId, resendBy) => {
    try {
      const invitation = await UserInvitation.findById(invitationId)
        .populate("roleInfo")
        .populate("inviterInfo");

      if (!invitation) {
        throw new Error("Invitation not found");
      }

      if (invitation.status !== "pending") {
        throw new Error("Only pending invitations can be resent");
      }

      // Check if resender has permission
      const resender = await User.findById(resendBy).populate("roleInfo");
      if (!resender) {
        throw new Error("Resender not found");
      }

      if (!resender.canAssignRole(invitation.roleInfo.hierarchyLevel)) {
        throw new Error("Insufficient privileges to resend this invitation");
      }

      // Resend invitation
      await invitation.resend();

      // TODO: Send invitation email
      // await this.sendInvitationEmail(invitation);

      return invitation;
    } catch (error) {
      throw error;
    }
  };

  // Cancel invitation
  static cancelInvitation = async (invitationId, cancelledBy) => {
    try {
      const invitation = await UserInvitation.findById(invitationId)
        .populate("roleInfo");

      if (!invitation) {
        throw new Error("Invitation not found");
      }

      if (invitation.status !== "pending") {
        throw new Error("Only pending invitations can be cancelled");
      }

      // Check if canceller has permission
      const canceller = await User.findById(cancelledBy).populate("roleInfo");
      if (!canceller) {
        throw new Error("Canceller not found");
      }

      // Allow cancellation if user is the original inviter or has higher privileges
      const canCancel = invitation.invitedBy.toString() === cancelledBy ||
                       canceller.canAssignRole(invitation.roleInfo.hierarchyLevel);

      if (!canCancel) {
        throw new Error("Insufficient privileges to cancel this invitation");
      }

      await invitation.cancel();
      return invitation;
    } catch (error) {
      throw error;
    }
  };

  // Extend invitation expiration
  static extendInvitation = async (invitationId, days = 7, extendedBy) => {
    try {
      const invitation = await UserInvitation.findById(invitationId)
        .populate("roleInfo");

      if (!invitation) {
        throw new Error("Invitation not found");
      }

      if (invitation.status !== "pending") {
        throw new Error("Only pending invitations can be extended");
      }

      // Check if extender has permission
      const extender = await User.findById(extendedBy).populate("roleInfo");
      if (!extender) {
        throw new Error("Extender not found");
      }

      if (!extender.canAssignRole(invitation.roleInfo.hierarchyLevel)) {
        throw new Error("Insufficient privileges to extend this invitation");
      }

      await invitation.extend(days);
      return invitation;
    } catch (error) {
      throw error;
    }
  };

  // ===== CLEANUP AND MAINTENANCE =====

  // Cleanup expired invitations
  static cleanupExpiredInvitations = async () => {
    try {
      const result = await UserInvitation.cleanupExpired();
      return {
        modifiedCount: result.modifiedCount,
        message: `${result.modifiedCount} expired invitations cleaned up`,
      };
    } catch (error) {
      throw error;
    }
  };

  // Get expired invitations
  static getExpiredInvitations = async () => {
    try {
      return await UserInvitation.findExpired();
    } catch (error) {
      throw error;
    }
  };

  // ===== STATISTICS AND REPORTING =====

  // Get invitation statistics
  static getInvitationStats = async (options = {}) => {
    try {
      const stats = await UserInvitation.getStats(options);
      return stats[0] || {
        totalInvitations: 0,
        pendingInvitations: 0,
        acceptedInvitations: 0,
        expiredInvitations: 0,
        cancelledInvitations: 0,
        averageAcceptanceTime: 0,
      };
    } catch (error) {
      throw error;
    }
  };

  // Get detailed invitation analytics
  static getInvitationAnalytics = async (options = {}) => {
    try {
      const { startDate, endDate, roleId, invitedBy } = options;

      const matchStage = {};
      if (startDate) matchStage.sentAt = { $gte: new Date(startDate) };
      if (endDate) {
        matchStage.sentAt = { ...matchStage.sentAt, $lte: new Date(endDate) };
      }
      if (roleId) matchStage.roleId = new mongoose.Types.ObjectId(roleId);
      if (invitedBy) matchStage.invitedBy = new mongoose.Types.ObjectId(invitedBy);

      // Get role distribution
      const roleDistribution = await UserInvitation.aggregate([
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
            total: { $sum: 1 },
            pending: {
              $sum: { $cond: { if: { $eq: ["$status", "pending"] }, then: 1, else: 0 } },
            },
            accepted: {
              $sum: { $cond: { if: { $eq: ["$status", "accepted"] }, then: 1, else: 0 } },
            },
            expired: {
              $sum: { $cond: { if: { $eq: ["$status", "expired"] }, then: 1, else: 0 } },
            },
            cancelled: {
              $sum: { $cond: { if: { $eq: ["$status", "cancelled"] }, then: 1, else: 0 } },
            },
            hierarchyLevel: { $first: "$roleInfo.hierarchyLevel" },
          },
        },
        { $sort: { hierarchyLevel: 1 } },
      ]);

      // Get monthly trends
      const monthlyTrends = await UserInvitation.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              year: { $year: "$sentAt" },
              month: { $month: "$sentAt" },
            },
            totalSent: { $sum: 1 },
            accepted: {
              $sum: { $cond: { if: { $eq: ["$status", "accepted"] }, then: 1, else: 0 } },
            },
            pending: {
              $sum: { $cond: { if: { $eq: ["$status", "pending"] }, then: 1, else: 0 } },
            },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);

      // Get top inviters
      const topInviters = await UserInvitation.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: "$invitedBy",
            totalInvitations: { $sum: 1 },
            acceptedInvitations: {
              $sum: { $cond: { if: { $eq: ["$status", "accepted"] }, then: 1, else: 0 } },
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "inviterInfo",
          },
        },
        { $unwind: "$inviterInfo" },
        {
          $project: {
            inviterName: "$inviterInfo.name",
            inviterEmail: "$inviterInfo.email",
            totalInvitations: 1,
            acceptedInvitations: 1,
            acceptanceRate: {
              $cond: {
                if: { $gt: ["$totalInvitations", 0] },
                then: { $multiply: [{ $divide: ["$acceptedInvitations", "$totalInvitations"] }, 100] },
                else: 0,
              },
            },
          },
        },
        { $sort: { totalInvitations: -1 } },
        { $limit: 10 },
      ]);

      return {
        roleDistribution,
        monthlyTrends,
        topInviters,
      };
    } catch (error) {
      throw error;
    }
  };

  // ===== EMAIL HANDLING (TO BE IMPLEMENTED) =====

  // Send invitation email
  static sendInvitationEmail = async (invitation) => {
    // TODO: Implement email sending logic
    // This would integrate with email service (SendGrid, Nodemailer, etc.)
    console.log(`TODO: Send invitation email to ${invitation.email}`);
    return true;
  };

  // Send bulk invitation emails
  static sendBulkInvitationEmails = async (invitations) => {
    // TODO: Implement bulk email sending logic
    console.log(`TODO: Send ${invitations.length} invitation emails`);
    return true;
  };

  // Send invitation reminder email
  static sendInvitationReminder = async (invitationId) => {
    try {
      const invitation = await UserInvitation.findById(invitationId)
        .populate("roleInfo")
        .populate("inviterInfo");

      if (!invitation || invitation.status !== "pending" || invitation.isExpired) {
        throw new Error("Invalid invitation for reminder");
      }

      // TODO: Send reminder email
      console.log(`TODO: Send reminder email to ${invitation.email}`);
      
      return invitation;
    } catch (error) {
      throw error;
    }
  };
}

module.exports = InvitationService;