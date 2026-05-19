const express = require("express");
const router = express.Router();

// Middlewares
const { authCheck, superAdminCheck } = require("@middlewares/auth");

// Controllers
const {
  currentUser,
  getUserById,
  getAllUsers,
  updateUserById,
  updateUserProfile,
  changePassword,
  // Role Management
  assignRoleToUser,
  getUsersByRole,
  getUsersWithRoles,
  activateUser,
  deactivateUser,
  // Permission and Security
  checkUserPermission,
  getUserPermissions,
  getCurrentUserPermissions,
  // Invitation Management
  createUserFromInvitation,
  getUserInvitationStatus,
  // Statistics and Reporting
  getUserStats,
  // Utility
  getAvailableRoles,
  getRoleHierarchy,
} = require("@controllers/user/userController");

const {
  // Invitation Creation and Management
  createInvitation,
  createBulkInvitations,
  // Invitation Retrieval
  getInvitationByToken,
  getAllInvitations,
  getPendingInvitations,
  getMyInvitations,
  // Invitation Lifecycle Management
  resendInvitation,
  cancelInvitation,
  extendInvitation,
  // Cleanup and Maintenance
  cleanupExpiredInvitations,
  getExpiredInvitations,
  // Statistics and Reporting
  getInvitationStats,
  getMyInvitationStats,
  getInvitationAnalytics,
  // Email and Notification
  sendInvitationReminder,
  // Utility
  getInvitationById,
  validateInvitationToken,
} = require("@controllers/user/invitationController");

// ===== BASIC USER ROUTES =====
router.post("/currentUser", authCheck, currentUser);
router.get("/user/id/:id", authCheck, getUserById);
router.get("/users", authCheck, getAllUsers);
router.put("/user/:id", authCheck, updateUserById);
router.put("/user/profile/update", authCheck, updateUserProfile);
router.put("/user/password/change", authCheck, changePassword);

// ===== ROLE MANAGEMENT ROUTES =====
router.put("/user/:userId/assign-role", authCheck, assignRoleToUser);
router.get("/users/role/:roleId", authCheck, getUsersByRole);
router.get("/users/with-roles", authCheck, getUsersWithRoles);
router.put("/user/:userId/activate", authCheck, activateUser);
router.put("/user/:userId/deactivate", authCheck, deactivateUser);

// ===== PERMISSION AND SECURITY ROUTES =====
router.get("/user/permission/:resource/:permission", authCheck, checkUserPermission);
router.get("/user/:userId/permissions", authCheck, getUserPermissions);
router.get("/user/current/permissions", authCheck, getCurrentUserPermissions);

// ===== INVITATION MANAGEMENT ROUTES (UserController) =====
router.post("/user/invitation/:token", createUserFromInvitation);
router.get("/user/invitation-status/:email", getUserInvitationStatus);

// ===== USER STATISTICS ROUTES =====
router.get("/users/stats", authCheck, getUserStats);

// ===== UTILITY ROUTES =====
router.get("/users/available-roles", authCheck, getAvailableRoles);
router.get("/users/role-hierarchy", authCheck, getRoleHierarchy);

// ===== INVITATION CREATION AND MANAGEMENT ROUTES =====
router.post("/invitation", authCheck, createInvitation);
router.post("/invitations/bulk", authCheck, createBulkInvitations);

// ===== INVITATION RETRIEVAL ROUTES =====
router.get("/invitation/token/:token", getInvitationByToken);
router.get("/invitations", authCheck, getAllInvitations);
router.get("/invitations/pending", authCheck, getPendingInvitations);
router.get("/invitations/my", authCheck, getMyInvitations);
router.get("/invitation/:invitationId", authCheck, getInvitationById);

// ===== INVITATION LIFECYCLE MANAGEMENT ROUTES =====
router.post("/invitation/:invitationId/resend", authCheck, resendInvitation);
router.put("/invitation/:invitationId/cancel", authCheck, cancelInvitation);
router.put("/invitation/:invitationId/extend", authCheck, extendInvitation);

// ===== INVITATION CLEANUP AND MAINTENANCE ROUTES =====
router.post("/invitations/cleanup-expired", authCheck, superAdminCheck, cleanupExpiredInvitations);
router.get("/invitations/expired", authCheck, getExpiredInvitations);

// ===== INVITATION STATISTICS AND REPORTING ROUTES =====
router.get("/invitations/stats", authCheck, getInvitationStats);
router.get("/invitations/my/stats", authCheck, getMyInvitationStats);
router.get("/invitations/analytics", authCheck, getInvitationAnalytics);

// ===== INVITATION EMAIL AND NOTIFICATION ROUTES =====
router.post("/invitation/:invitationId/reminder", authCheck, sendInvitationReminder);

// ===== INVITATION UTILITY ROUTES =====
router.get("/invitation/validate/:token", validateInvitationToken);

module.exports = router;
