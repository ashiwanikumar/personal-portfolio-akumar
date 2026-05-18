// ** LIBS ** //
const express = require("express");
const router = express.Router();

// ** MIDDLEWARES ** //
const { authCheck, superAdminCheck } = require("@middlewares/auth");

// ** CONTROLLERS ** //
const {
  createContact,
  getContactsPaginated,
  deleteContact,
  getContactDetails,
  updateContactById,
  searchContacts,
  getContactsFiltered,
  exportContacts,
  addContactNote,
  updateContactNote,
  getContactStatistics,
  bulkDeleteContacts,
  flagContactAsSpam,
  getContactAuditTrail,
} = require("@controllers/contact-us/contactController");

// ** ROUTES ** //

// Public Routes
router.post("/contact-us/contacts", createContact);

// Protected Routes (Admin Only)
router.get(
  "/contact-us/contacts/paginated",
  authCheck,
  superAdminCheck,
  getContactsPaginated
);

router.get("/contact-us/contacts/search", authCheck, superAdminCheck, searchContacts);

router.get("/contact-us/contacts/filter", authCheck, superAdminCheck, getContactsFiltered);

router.get(
  "/contact-us/contacts/statistics",
  authCheck,
  superAdminCheck,
  getContactStatistics
);

router.get("/contact-us/contacts/export", authCheck, superAdminCheck, exportContacts);

router.post(
  "/contact-us/contacts/bulk-delete",
  authCheck,
  superAdminCheck,
  bulkDeleteContacts
);

// Routes with ID parameters
router.get("/contact-us/contacts/:id", authCheck, superAdminCheck, getContactDetails);

router.delete("/contact-us/contacts/:id", authCheck, superAdminCheck, deleteContact);

router.put("/contact-us/contacts/:id", authCheck, superAdminCheck, updateContactById);

router.post("/contact-us/contacts/:id/notes", authCheck, superAdminCheck, addContactNote);

router.put(
  "/contact-us/contacts/:id/notes/:noteId",
  authCheck,
  superAdminCheck,
  updateContactNote
);

router.put(
  "/contact-us/contacts/:id/flag-spam",
  authCheck,
  superAdminCheck,
  flagContactAsSpam
);

router.get(
  "/contact-us/contacts/:id/audit-trail",
  authCheck,
  superAdminCheck,
  getContactAuditTrail
);

module.exports = router;
