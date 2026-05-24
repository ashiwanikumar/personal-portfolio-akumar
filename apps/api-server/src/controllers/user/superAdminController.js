const User = require("@models/user/user");
const SuperAdmin = require("@models/user/superAdmin");
const UserService = require("@services/user/userService");
const SuperAdminService = require("@services/user/superAdminService");
const {
  teamInviteEmailTemplate,
  teamInviteCancellationEmailTemplate,
} = require("@mails/teamEmails");
const jwt = require("jsonwebtoken");
const sendEmail = require("@utils/sendEmail");
const { passwordValidator } = require("@utils/validations");
const bcrypt = require("bcryptjs");

/**********************************
  Helper function to check if user has super admin privileges
***********************************/
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

/**********************************
  Check if user is super admin
***********************************/
exports.currentSuperAdmin = async (req, res) => {
  const { _id } = req.user;

  const user = await UserService.findUserById(_id);

  // User authentication check

  // Check if user has super admin privileges using helper function
  const isSuperAdmin = hasSuperAdminPrivileges(user);

  if (isSuperAdmin) {
    res.status(200).json({
      superadmin: true,
      message: "Welcome Super admin!",
      user: User.toClientObject(user),
    });
    return;
  }

  res.status(403).json({
    admin: false,
    error: "Super Admin Resource, access denied!",
  });
};

/**********************************
  Get all admins
***********************************/
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await SuperAdminService.findAllAdmins();

    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

/**********************************
  Delete user account
***********************************/
exports.deleteUserAccount = async (req, res) => {
  const { userId } = req.body;

  try {
    // Call the super admin service to delete the user
    await SuperAdminService.deleteUserAccount(userId);

    res.status(200).json({
      message: "User account deleted",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

/**********************************
  Get admin details by id
***********************************/
exports.getAdminDetailsById = async (req, res) => {
  const { adminId } = req.params;

  try {
    const adminDetails = await SuperAdminService.findAdminDetailsById(adminId);

    res.status(200).json(adminDetails);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

/**********************************
  Get super admin analytics
***********************************/
exports.getSuperAdminAnalytics = async (req, res) => {
  try {
    const analytics = await SuperAdminService.getSuperAdminAnalytics();

    res.status(200).json(analytics);
  } catch (error) {
    console.log("GET_SUPER_ADMIN_ANALYTICS_ERROR", error);
  }
};

/**********************************
  Email invite to admin team
***********************************/
exports.teamInvite = async (req, res) => {
  // Check if user is already present
  const { email, role } = req.body;

  try {
    // Validate role
    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required for team invitation",
      });
    }

    // Get current user info for inviter tracking
    const inviterUser = await UserService.findUserById(req.user._id);

    // Check if the inviter is a Super Admin (legacy or RBAC)
    const isSuperAdmin = await hasSuperAdminPrivileges(inviterUser);
    
    if (!isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only Super Admins can invite team members",
      });
    }

    const invitation = {
      email,
      role,
      status: "pending",
      date: new Date(),
      invitedBy: {
        userId: req.user._id,
        name: inviterUser.name,
        email: inviterUser.email,
        role: inviterUser.role,
      },
    };

    // Update invitation in superAdmins invitations array
    const superAdmin = await SuperAdminService.superAdminTeamInvitation(
      req.user._id,
      invitation
    );

    // Create payload to create JWT token
    const payload = { email: email, role: role, superAdminId: superAdmin._id };
    // Generate JWT token for email verification, expires in 30 mins
    const joiningToken = jwt.sign(payload, process.env.JWT_EMAIL_SECRET);

    // Send email using centralized email utility
    const emailResult = await sendEmail({
      to: email,
      from: `Ashiwani Kumar <${process.env.ZOHO_NODEMAILER_EMAIL_HELLO}>`,
      subject: "Administrative Team Invitation | Ashiwani Kumar",
      html: teamInviteEmailTemplate(superAdmin, joiningToken),
      emailType: "Team Invitation",
    });

    if (!emailResult.success) {
      throw new Error(emailResult.error || "Failed to send invitation email");
    }

    const successObject = {
      success: true,
      message: "Invitation sent successfully",
    };

    res.status(200).json(successObject);
  } catch (error) {
    console.log("SERVER_TEAM_INVITE_ERROR", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send invitation",
    });
  }
};

/********************************************
  Check user activation status (for invitation validation)
*********************************************/
exports.checkUserActivationStatus = async (req, res) => {
  const { token } = req.body;

  try {
    if (!token) {
      return res.status(400).json({
        error: true,
        message: "Token is required",
      });
    }

    jwt.verify(token, process.env.JWT_EMAIL_SECRET, async (err, tokenData) => {
      if (err) {
        return res.status(400).json({
          error: true,
          message: "Invalid or expired token",
        });
      }

      const { email } = tokenData;
      const existingUser = await UserService.findOneUser({ email });

      if (existingUser && existingUser.activated && existingUser.role) {
        return res.status(200).json({
          alreadyActivated: true,
          message: "User is already activated and part of the team",
        });
      }

      return res.status(200).json({
        alreadyActivated: false,
        message: "User can proceed with activation",
      });
    });
  } catch (error) {
    console.log("CHECK_USER_ACTIVATION_STATUS_ERROR", error);
    res.status(500).json({
      error: true,
      message: "Failed to check user activation status",
    });
  }
};

/********************************************
  Team Account Email Verification, acc. activation
*********************************************/
exports.teamAccountActivate = async (req, res) => {
  // Get the token from client body
  const { name, password, token } = req.body;

  // Validate the input fields
  const validationErrors = passwordValidator(password);

  // Sends the validation error message
  if (validationErrors.length) {
    const errorObject = {
      error: true,
      type: validationErrors,
    };
    return res.status(400).json(errorObject);
  }

  try {
    // If token exists
    if (token) {
      jwt.verify(
        token,
        process.env.JWT_EMAIL_SECRET,
        async (err, tokenData) => {
          // If the token provided is not valid
          if (err) {
            return res.status(409).json({
              error: true,
              type: [
                {
                  code: "GLOBAL_ERROR",
                  message:
                    "Token is not valid or expired, enter email to resend verification",
                },
              ],
            });
          }

          const { email, role } = tokenData;

          const existingUser = await UserService.findOneUser({ email });

          // Check if user exists and is already part of the team
          if (existingUser) {
            // Check if user is already activated and part of a team
            if (existingUser.activated && existingUser.role) {
              // Update invitation status to "accepted" for existing activated users
              try {
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
                  await SuperAdminService.syncInvitationsToAllSuperAdmins(updatedSuperAdmin);
                }
              } catch (updateError) {
                console.error(
                  "Failed to update invitation status:",
                  updateError
                );
              }

              const errorObject = {
                error: true,
                type: [
                  {
                    code: "ALREADY_ACTIVATED",
                    message:
                      "You have already joined the team. Please log in to continue.",
                  },
                ],
              };
              return res.status(409).json(errorObject);
            }

            // If user exists but not activated or not part of team, allow activation
            // This handles cases where user was invited before but never completed activation
            // Also allow updating existing users with new roles
          }

          // Hash the password
          const hashedPassword = await bcrypt.hash(password, 12);

          // Activate the team account with role assignment
          const newUser = await SuperAdminService.activateTeamAccount(
            tokenData,
            name,
            hashedPassword,
            token
          );

          // Update invitation status to "accepted"
          try {
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
              await SuperAdminService.syncInvitationsToAllSuperAdmins(updatedSuperAdmin);
            }
          } catch (updateError) {
            console.error("Failed to update invitation status:", updateError);
          }

          // Return success response
          return res.status(200).json({
            message: "Team account activated successfully",
            user: User.toClientObject(newUser),
          });
        }
      );
    } else {
      res.status(400).json({
        error: true,
        type: [
          {
            code: "GLOBAL_ERROR",
            message: "Something went wrong, please try again",
          },
        ],
      });
    }
  } catch (error) {
    console.error("TEAM_ACCOUNT_ACTIVATE_ERROR", error);
    res.status(500).json({
      error: true,
      type: [
        {
          code: "GLOBAL_ERROR",
          message: "Failed to activate team account",
        },
      ],
    });
  }
};

/********************************************
  Get all admin team members
*********************************************/
exports.getTeamMembers = async (req, res) => {
  const { _id } = req.user;

  try {
    const result = await SuperAdminService.findAllTeamMembers(_id);

    res.status(200).json({
      success: true,
      teamMembers: result.teamMembers || [],
      pendingInvitations: result.pendingInvitations || [],
      totalTeamMembers: result.totalTeamMembers || 0,
      totalPendingInvitations: result.totalPendingInvitations || 0
    });
  } catch (error) {
    console.log("ADMIN_TEAM_MEMBERS_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch team members",
      error: error.message,
    });
  }
};

/**********************************
  Toggle disable user account
***********************************/
exports.toggleDisableUserAccount = async (req, res) => {
  const { userId } = req.params;

  try {
    // Get the user to be disabled
    const userToDisable = await UserService.findUserById(userId);

    if (!userToDisable) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if the user is a Super Admin
    if (userToDisable.role === "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Super Admin accounts cannot be disabled",
      });
    }

    // Get the current user (who is trying to disable the account)
    const currentUser = await UserService.findUserById(req.user._id);

    // Only Super Admins can disable accounts (legacy or RBAC)
    const isSuperAdmin = await hasSuperAdminPrivileges(currentUser);
    
    if (!isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only Super Admins can disable user accounts",
      });
    }

    // Call the super admin service to disable the user
    await SuperAdminService.toggleDisableUserAccount(userId);

    res.status(200).json({
      success: true,
      message: "User account status updated successfully",
    });
  } catch (error) {
    console.error("TOGGLE_DISABLE_USER_ERROR", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update user account status",
    });
  }
};

/**********************************
  Change user role
***********************************/
exports.changeUserRole = async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  try {
    // Get the user whose role is being changed
    const userToChange = await UserService.findUserById(userId);

    if (!userToChange) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if the user is a Super Admin
    if (userToChange.role === "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Super Admin roles cannot be modified",
      });
    }

    // Get the current user (who is trying to change the role)
    const currentUser = await UserService.findUserById(req.user._id);

    // Only Super Admins can change roles (legacy or RBAC)
    const isSuperAdmin = await hasSuperAdminPrivileges(currentUser);
    
    if (!isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only Super Admins can change user roles",
      });
    }

    // Validate the new role
    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required",
      });
    }

    // Call the super admin service to change the user role
    await SuperAdminService.changeUserRole(userId, role);

    res.status(200).json({
      success: true,
      message: "User role changed successfully",
    });
  } catch (error) {
    console.error("CHANGE_USER_ROLE_ERROR", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to change user role",
    });
  }
};

/********************************************
  Remove admin team member
*********************************************/
exports.removeTeamMember = async (req, res) => {
  const { _id } = req.user;
  const { memberId } = req.params;

  // // Check if the user is the owner of the team (by checking if admin..billingAdmin is true)
  // const isOwner = await AdminService.validateIfAdminTeamOwner(_id);

  // if (!isOwner) {
  //   const errorObject = {
  //     error: true,
  //     type: [
  //       {
  //         code: "GLOBAL_ERROR",
  //         message: "Only the owner of the team can remove team members",
  //       },
  //     ],
  //   };
  //   return res.status(409).json(errorObject);
  // }

  // try {
  //   const team = await AdminService.removeAdminTeamMember(_id, memberId);

  //   res.status(200).json(team);
  // } catch (error) {
  //   console.log("ADMIN_TEAM_MEMBERS_ERROR", error);
  // }
};

/********************************************
  Cancel team invitation
*********************************************/
exports.cancelTeamInvitation = async (req, res) => {
  const { _id } = req.user;
  const { invitationId } = req.params;

  try {
    // Get current user info for cancellation tracking
    const cancelledByUser = await UserService.findUserById(_id);

    // Cancel the invitation in the service
    const result = await SuperAdminService.cancelTeamInvitation(
      _id,
      invitationId,
      cancelledByUser
    );

    // Send cancellation email
    const emailResult = await sendEmail({
      to: result.invitationEmail,
      from: `Ashiwani Kumar <${process.env.ZOHO_NODEMAILER_EMAIL_HELLO}>`,
      subject: "Team Invitation Cancelled | Ashiwani Kumar",
      html: teamInviteCancellationEmailTemplate(
        result.invitationEmail,
        cancelledByUser
      ),
      emailType: "Team Invitation Cancellation",
    });

    if (!emailResult.success) {
      console.warn("Failed to send cancellation email:", emailResult.error);
      // Don't fail the request if email fails, just log it
    }

    res.status(200).json({
      success: true,
      message: "Invitation cancelled successfully",
    });
  } catch (error) {
    console.log("CANCEL_TEAM_INVITATION_ERROR", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to cancel invitation",
    });
  }
};
