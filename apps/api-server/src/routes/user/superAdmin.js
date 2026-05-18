const express = require("express");
const router = express.Router();

// Middlewares
const {
  authCheck,
  superAdminCheck,
  superOrAdminCheck,
} = require("@middlewares/auth");

// New permission middleware
const {
  superAdminOnly,
  adminOrHigher,
} = require("@middlewares/permissionMiddleware");

// Controllers
const {
  currentSuperAdmin,
  getAllAdmins,
  deleteUserAccount,
  getAdminDetailsById,
  // Team
  teamInvite,
  teamAccountActivate,
  checkUserActivationStatus,
  getTeamMembers,
  toggleDisableUserAccount,
  removeTeamMember,
  changeUserRole,
  cancelTeamInvitation,
  // Analytics
  getSuperAdminAnalytics,
} = require("@controllers/user/superAdminController");

// Routes
router.post(
  "/currentSuperAdmin",
  authCheck,
  currentSuperAdmin
);
router.get("/admins", authCheck, superAdminCheck, getAllAdmins);
router.post("/user/delete", authCheck, superAdminCheck, deleteUserAccount);
router.get(
  "/super/admin/:adminId",
  authCheck,
  superAdminCheck,
  getAdminDetailsById
);

// Team Management Routes (using new permission middleware)
router.post("/super-admin/team/invite", authCheck, superAdminOnly, teamInvite);
router.post(
  "/super-admin/team/account/check-status",
  checkUserActivationStatus
);
router.post("/super-admin/team/account/activate", teamAccountActivate);
router.get(
  "/super-admin/team/members",
  authCheck,
  superAdminOnly,
  getTeamMembers
);
router.put(
  "/user/disable/:userId",
  authCheck,
  superAdminOnly,
  toggleDisableUserAccount
);
router.put(
  "/user/change-role/:userId",
  authCheck,
  superAdminOnly,
  changeUserRole
);
router.delete(
  "/super-admin/team/member/:memberId/remove",
  authCheck,
  superAdminOnly,
  removeTeamMember
);
router.delete(
  "/super-admin/team/invitation/:invitationId/cancel",
  authCheck,
  superAdminOnly,
  cancelTeamInvitation
);

// Analytics
router.get(
  "/super-admin/analytics",
  authCheck,
  superAdminCheck,
  getSuperAdminAnalytics
);

module.exports = router;
