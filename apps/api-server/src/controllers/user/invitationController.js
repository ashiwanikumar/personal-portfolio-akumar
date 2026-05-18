const InvitationService = require("@services/user/invitationService");
const UserInvitation = require("@models/user/userInvitation");

// ===== INVITATION CREATION AND MANAGEMENT =====

/**********************************
  Create and send invitation
***********************************/
exports.createInvitation = async (req, res) => {
  try {
    const invitationData = req.body;
    const invitedBy = req.user._id;

    // Validate required fields
    const { email, name, roleId } = invitationData;
    if (!email || !name || !roleId) {
      return res.status(400).json({
        success: false,
        message: "Email, name, and role ID are required",
      });
    }

    const invitation = await InvitationService.createInvitation(
      invitationData,
      invitedBy
    );

    res.status(201).json({
      success: true,
      message: "Invitation created and sent successfully",
      invitation,
    });
  } catch (error) {
    console.log("CREATE_INVITATION_ERROR", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create invitation",
    });
  }
};

/**********************************
  Create bulk invitations
***********************************/
exports.createBulkInvitations = async (req, res) => {
  try {
    const { invitations } = req.body;
    const invitedBy = req.user._id;

    if (!invitations || !Array.isArray(invitations) || invitations.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invitations array is required and must not be empty",
      });
    }

    // Validate each invitation
    for (const invitation of invitations) {
      const { email, name, roleId } = invitation;
      if (!email || !name || !roleId) {
        return res.status(400).json({
          success: false,
          message: "Each invitation must have email, name, and roleId",
        });
      }
    }

    const results = await InvitationService.createBulkInvitations(
      invitations,
      invitedBy
    );

    res.status(200).json({
      success: true,
      message: `Bulk invitation process completed. ${results.summary.success} successful, ${results.summary.failed} failed.`,
      results,
    });
  } catch (error) {
    console.log("CREATE_BULK_INVITATIONS_ERROR", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create bulk invitations",
    });
  }
};

// ===== INVITATION RETRIEVAL =====

/**********************************
  Get invitation by token
***********************************/
exports.getInvitationByToken = async (req, res) => {
  try {
    const { token } = req.params;

    const invitation = await InvitationService.getInvitationByToken(token);

    res.status(200).json({
      success: true,
      invitation,
    });
  } catch (error) {
    console.log("GET_INVITATION_BY_TOKEN_ERROR", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch invitation",
    });
  }
};

/**********************************
  Get all invitations
***********************************/
exports.getAllInvitations = async (req, res) => {
  try {
    const {
      page,
      limit,
      status,
      roleId,
      invitedBy,
      search,
      startDate,
      endDate,
    } = req.query;

    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      status: status || null,
      roleId: roleId || null,
      invitedBy: invitedBy || null,
      search: search || "",
      startDate: startDate || null,
      endDate: endDate || null,
    };

    const result = await InvitationService.getAllInvitations(options);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.log("GET_ALL_INVITATIONS_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch invitations",
    });
  }
};

/**********************************
  Get pending invitations
***********************************/
exports.getPendingInvitations = async (req, res) => {
  try {
    const { page, limit, roleId, invitedBy } = req.query;

    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      roleId: roleId || null,
      invitedBy: invitedBy || null,
    };

    const invitations = await InvitationService.getPendingInvitations(options);

    res.status(200).json({
      success: true,
      invitations,
    });
  } catch (error) {
    console.log("GET_PENDING_INVITATIONS_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending invitations",
    });
  }
};

/**********************************
  Get my invitations (sent by current user)
***********************************/
exports.getMyInvitations = async (req, res) => {
  try {
    const {
      page,
      limit,
      status,
      roleId,
      search,
      startDate,
      endDate,
    } = req.query;

    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      status: status || null,
      roleId: roleId || null,
      invitedBy: req.user._id, // Filter by current user
      search: search || "",
      startDate: startDate || null,
      endDate: endDate || null,
    };

    const result = await InvitationService.getAllInvitations(options);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.log("GET_MY_INVITATIONS_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch your invitations",
    });
  }
};

// ===== INVITATION LIFECYCLE MANAGEMENT =====

/**********************************
  Resend invitation
***********************************/
exports.resendInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const resendBy = req.user._id;

    const invitation = await InvitationService.resendInvitation(
      invitationId,
      resendBy
    );

    res.status(200).json({
      success: true,
      message: "Invitation resent successfully",
      invitation,
    });
  } catch (error) {
    console.log("RESEND_INVITATION_ERROR", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to resend invitation",
    });
  }
};

/**********************************
  Cancel invitation
***********************************/
exports.cancelInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const cancelledBy = req.user._id;

    const invitation = await InvitationService.cancelInvitation(
      invitationId,
      cancelledBy
    );

    res.status(200).json({
      success: true,
      message: "Invitation cancelled successfully",
      invitation,
    });
  } catch (error) {
    console.log("CANCEL_INVITATION_ERROR", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to cancel invitation",
    });
  }
};

/**********************************
  Extend invitation expiration
***********************************/
exports.extendInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const { days = 7 } = req.body;
    const extendedBy = req.user._id;

    if (days <= 0 || days > 30) {
      return res.status(400).json({
        success: false,
        message: "Extension days must be between 1 and 30",
      });
    }

    const invitation = await InvitationService.extendInvitation(
      invitationId,
      days,
      extendedBy
    );

    res.status(200).json({
      success: true,
      message: `Invitation extended by ${days} days`,
      invitation,
    });
  } catch (error) {
    console.log("EXTEND_INVITATION_ERROR", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to extend invitation",
    });
  }
};

// ===== CLEANUP AND MAINTENANCE =====

/**********************************
  Cleanup expired invitations
***********************************/
exports.cleanupExpiredInvitations = async (req, res) => {
  try {
    const result = await InvitationService.cleanupExpiredInvitations();

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.log("CLEANUP_EXPIRED_INVITATIONS_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Failed to cleanup expired invitations",
    });
  }
};

/**********************************
  Get expired invitations
***********************************/
exports.getExpiredInvitations = async (req, res) => {
  try {
    const expiredInvitations = await InvitationService.getExpiredInvitations();

    res.status(200).json({
      success: true,
      expiredInvitations,
      count: expiredInvitations.length,
    });
  } catch (error) {
    console.log("GET_EXPIRED_INVITATIONS_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch expired invitations",
    });
  }
};

// ===== STATISTICS AND REPORTING =====

/**********************************
  Get invitation statistics
***********************************/
exports.getInvitationStats = async (req, res) => {
  try {
    const { startDate, endDate, invitedBy, roleId } = req.query;

    const options = {
      startDate: startDate || null,
      endDate: endDate || null,
      invitedBy: invitedBy || null,
      roleId: roleId || null,
    };

    const stats = await InvitationService.getInvitationStats(options);

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.log("GET_INVITATION_STATS_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch invitation statistics",
    });
  }
};

/**********************************
  Get my invitation statistics
***********************************/
exports.getMyInvitationStats = async (req, res) => {
  try {
    const { startDate, endDate, roleId } = req.query;

    const options = {
      startDate: startDate || null,
      endDate: endDate || null,
      invitedBy: req.user._id, // Filter by current user
      roleId: roleId || null,
    };

    const stats = await InvitationService.getInvitationStats(options);

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.log("GET_MY_INVITATION_STATS_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch your invitation statistics",
    });
  }
};

/**********************************
  Get detailed invitation analytics
***********************************/
exports.getInvitationAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, roleId, invitedBy } = req.query;

    const options = {
      startDate: startDate || null,
      endDate: endDate || null,
      roleId: roleId || null,
      invitedBy: invitedBy || null,
    };

    const analytics = await InvitationService.getInvitationAnalytics(options);

    res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.log("GET_INVITATION_ANALYTICS_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch invitation analytics",
    });
  }
};

// ===== EMAIL AND NOTIFICATION ENDPOINTS =====

/**********************************
  Send invitation reminder
***********************************/
exports.sendInvitationReminder = async (req, res) => {
  try {
    const { invitationId } = req.params;

    const invitation = await InvitationService.sendInvitationReminder(
      invitationId
    );

    res.status(200).json({
      success: true,
      message: "Invitation reminder sent successfully",
      invitation,
    });
  } catch (error) {
    console.log("SEND_INVITATION_REMINDER_ERROR", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to send invitation reminder",
    });
  }
};

// ===== UTILITY ENDPOINTS =====

/**********************************
  Get invitation details by ID
***********************************/
exports.getInvitationById = async (req, res) => {
  try {
    const { invitationId } = req.params;

    const invitation = await UserInvitation.findById(invitationId)
      .populate("roleInfo", "name description hierarchyLevel")
      .populate("inviterInfo", "name email");

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found",
      });
    }

    res.status(200).json({
      success: true,
      invitation,
    });
  } catch (error) {
    console.log("GET_INVITATION_BY_ID_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch invitation details",
    });
  }
};

/**********************************
  Validate invitation token
***********************************/
exports.validateInvitationToken = async (req, res) => {
  try {
    const { token } = req.params;

    const invitation = await UserInvitation.findByToken(token);

    if (!invitation) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: "Invalid or expired invitation token",
      });
    }

    if (!invitation.isValid()) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: "Invitation is no longer valid",
      });
    }

    res.status(200).json({
      success: true,
      valid: true,
      invitation: {
        email: invitation.email,
        name: invitation.name,
        roleInfo: invitation.roleInfo,
        inviterInfo: invitation.inviterInfo,
        expiresAt: invitation.expiresAt,
        timeRemaining: invitation.timeRemaining,
        personalMessage: invitation.personalMessage,
      },
    });
  } catch (error) {
    console.log("VALIDATE_INVITATION_TOKEN_ERROR", error);
    res.status(500).json({
      success: false,
      valid: false,
      message: "Failed to validate invitation token",
    });
  }
};