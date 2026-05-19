const express = require("express");
const router = express.Router();

// Middlewares
const { authCheck, superAdminCheck } = require("@middlewares/auth");

// Controllers
const {
  createRole,
  getAllRoles,
  getRoleById,
  updateRoleById,
  deleteRoleById,
  getAvailableResources,
  getResourceCategories,
  checkUserPermission,
  getUserPermissions,
  createDefaultRoles,
  getRoleStats,
} = require("@controllers/role/roleController");
const resourceController = require("@controllers/role/resourceController");
const migrationController = require("@controllers/role/roleMigrationController");

// Role routes
router.post("/role", authCheck, superAdminCheck, createRole);
router.get("/roles", authCheck, getAllRoles);
router.get("/role/:id", authCheck, getRoleById);
// Public route for invitation pages (no auth required)
router.get("/role/public/:id", getRoleById);
router.put("/role/:id", authCheck, superAdminCheck, updateRoleById);
router.delete("/role/:id", authCheck, superAdminCheck, deleteRoleById);

// Resource routes
router.get("/roles/resources", authCheck, getAvailableResources);
router.get("/roles/resource-categories", authCheck, getResourceCategories);

// Permission routes
router.get("/roles/user-permissions", authCheck, getUserPermissions);
router.get(
  "/roles/check-permission/:resource/:permission",
  authCheck,
  checkUserPermission
);

// Statistics routes
router.get("/roles/stats", authCheck, getRoleStats);

// Default roles creation
router.post(
  "/roles/create-default",
  authCheck,
  superAdminCheck,
  createDefaultRoles
);

// ===== ROLE MIGRATION ROUTES =====

// Get migration status for all users
router.get(
  "/roles/migration/status",
  authCheck,
  superAdminCheck,
  migrationController.getMigrationStatus
);

// Migrate a specific user
router.post(
  "/roles/migration/user/:userId",
  authCheck,
  superAdminCheck,
  migrationController.migrateUser
);

// Bulk migrate all users
router.post(
  "/roles/migration/bulk",
  authCheck,
  superAdminCheck,
  migrationController.bulkMigrateUsers
);

// Get role compatibility analysis
router.get(
  "/roles/migration/compatibility/:userId",
  authCheck,
  superAdminCheck,
  migrationController.getRoleCompatibility
);

// Validate role assignment
router.get(
  "/roles/migration/validate/:assignerId/:targetRoleId",
  authCheck,
  superAdminCheck,
  migrationController.validateRoleAssignment
);

// Get role mapping configuration
router.get(
  "/roles/migration/mapping",
  authCheck,
  superAdminCheck,
  migrationController.getRoleMapping
);

// Test resource access
router.get(
  "/roles/migration/test-access/:userId",
  authCheck,
  superAdminCheck,
  migrationController.testResourceAccess
);

// Resource routes
router.post(
  "/resource",
  authCheck,
  superAdminCheck,
  resourceController.createResource
);
router.get("/resources", authCheck, resourceController.getAllResources);
router.get("/resource/:id", authCheck, resourceController.getResourceById);
router.put(
  "/resource/:id",
  authCheck,
  superAdminCheck,
  resourceController.updateResourceById
);
router.delete(
  "/resource/:id",
  authCheck,
  superAdminCheck,
  resourceController.deleteResourceById
);

// Resource statistics and utilities
router.get(
  "/resources/active",
  authCheck,
  resourceController.getActiveResources
);
router.get(
  "/resources/category/:category",
  authCheck,
  resourceController.getResourcesByCategory
);
router.get(
  "/resources/categories",
  authCheck,
  resourceController.getCategories
);
router.get("/resources/stats", authCheck, resourceController.getResourceStats);

// Default resources creation
router.post(
  "/resources/create-default",
  authCheck,
  superAdminCheck,
  resourceController.createDefaultResources
);

module.exports = router;
