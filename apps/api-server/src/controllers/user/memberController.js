// ** USER ** //
const User = require("@models/user/user");

// ** SERVICES ** //
const UserService = require("@services/user/userService");
const MemberService = require("@services/user/memberService");
const AdminService = require("@services/user/adminService");

/**********************************
  Check if user is a member
***********************************/
exports.currentMember = async (req, res) => {
  const { _id } = req.user;

  const user = await UserService.findUserById(_id);

  let billingAdmin = false;
  // If the user role is admin, find the admin
  if (user.role === "admin") {
    const admin = await AdminService.findOneAdmin({ user: _id });

    // If the admin is billing admin, set billingAdmin to true
    if (admin?.billingAdmin) {
      billingAdmin = true;
    }
  }

  const userObject = {
    _id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    billingAdmin: billingAdmin,
    activated: user.activated,
    currentPlan: user.currentPlan,
    tutorials_complete: user.tutorials_complete,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  if (user.role === "agent") {
    // Update user's online status
    await UserService.updateUserOnlineStatus(req.user._id, true);

    res.status(200).json({
      agent: true,
      message: "Welcome agent!",
      user: userObject,
    });
  } else {
    res.status(403).json({
      member: false,
      error: "You are trying to access a restricted resource. Access Denied",
    });
  }
};

/********************************************
  Get all member team members
*********************************************/
exports.getTeamMembers = async (req, res) => {
  const { _id } = req.user;

  try {
    const team = await MemberService.findOneMemberPopulatedTeam({ user: _id });

    // Enhance with current user information
    const currentUser = await User.findById(_id).select("email").lean();

    const enhancedTeam = team.map((member) => ({
      ...member,
      isCurrentUser: member.email === currentUser.email,
    }));

    res.status(200).json(enhancedTeam);
  } catch (error) {
    console.log("MEMBER_TEAM_MEMBERS_ERROR", error);
    res.status(500).json({
      error: true,
      message: "Failed to retrieve team members",
    });
  }
};

/********************************************
  Get member notifications
*********************************************/
exports.getMemberNotifications = async (req, res) => {
  const { _id } = req.user;
  const { page = 1, pageSize = 10 } = req.query; // Default to page 1 and pageSize 10 if not provided

  try {
    const { notifications, hasMore } =
      await MemberService.findMemberNotifications(
        _id,
        parseInt(page),
        parseInt(pageSize)
      );

    res.status(200).json({
      notifications,
      hasMore,
    });
  } catch (error) {
    console.log("GET_MEMBER_NOTIFICATIONS_ERROR", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


/********************************************
  Mark notification as read
*********************************************/
exports.markNotificationAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    await MemberService.updateMemberNotificationAsRead(id);

    res.status(200).json({
      message: "Notification marked as read",
    });
  } catch (error) {
    console.log("MARK_NOTIFICATION_AS_READ_ERROR", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/********************************************
  Mark all notifications as read
*********************************************/
exports.markAllNotificationsAsRead = async (req, res) => {
  const { _id } = req.user;

  try {
    await MemberService.updateAllMemberNotificationsAsRead(_id);

    res.status(200).json({
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.log("MARK_ALL_NOTIFICATIONS_AS_READ_ERROR", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/********************************************
  Update member status
*********************************************/
exports.updateMemberStatus = async (req, res) => {
  const { _id } = req.user;
  const { status } = req.body;

  try {
    await UserService.updateUserStatus(_id, status);

    res.status(200).json({
      message: "User status updated",
    });
  } catch (error) {
    console.log("UPDATE_MEMBER_STATUS_ERROR", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
