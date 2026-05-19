// ** LIBS ** //
const express = require("express");
const router = express.Router();

// ** MIDDLEWARES ** //
const { authCheck, adminCheck } = require("@middlewares/auth");

// ** CONTROLLERS ** //
const {
  currentMember,
  // Status,
  updateMemberStatus,
  // Notifications
  getMemberNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  // Team
  getTeamMembers,
} = require("@controllers/user/memberController");

// ** ROUTES ** //
router.post("/currentMember", authCheck, currentMember);

// ******* Status *******
router.put("/member/status", authCheck, updateMemberStatus);

// ******* Notifications *******
// Get member notifications
router.get("/member/notifications", authCheck, getMemberNotifications);
// Mark all notifications as read
router.put(
  "/member/notifications/all-read",
  authCheck,
  markAllNotificationsAsRead
);
// Mark notification as read
router.put("/member/notification/:id/read", authCheck, markNotificationAsRead);


// ******* Team *******
// Get the team members of the member
router.get("/member/team/members", authCheck, adminCheck, getTeamMembers);

module.exports = router;
