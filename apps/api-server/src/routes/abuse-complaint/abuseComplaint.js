// ** LIBS ** //
const express = require("express");
const router = express.Router();

// ** MIDDLEWARES ** //
const { authCheck, superAdminCheck } = require("@middlewares/auth");

// ** CONTROLLERS ** //
const {
  submitComplaint,
  getComplaintsPaginated,
  deleteComplaint,
  getComplaintDetails,
  updateComplaintById,
  searchComplaints,
  getComplaintsFiltered,
  assignComplaint,
  addComplaintNote,
  markAsDuplicate,
  updateComplaintNote,
  resolveComplaint,
  exportComplaints,
  getComplaintStats,
} = require("@controllers/abuse-complaint/abuseComplaintController");

// ** ROUTES ** //

// Public Routes
router.post("/abuse-complaints/submit", submitComplaint);

// Protected Routes (Admin Only)
router.get(
  "/abuse-complaints/paginated",
  authCheck,
  superAdminCheck,
  getComplaintsPaginated
);

router.get(
  "/abuse-complaints/search",
  authCheck,
  superAdminCheck,
  searchComplaints
);

router.get(
  "/abuse-complaints/filter",
  authCheck,
  superAdminCheck,
  getComplaintsFiltered
);

router.get(
  "/abuse-complaints/export",
  authCheck,
  superAdminCheck,
  exportComplaints
);

router.get(
  "/abuse-complaints/stats",
  authCheck,
  superAdminCheck,
  getComplaintStats
);

router.delete(
  "/abuse-complaints/:id",
  authCheck,
  superAdminCheck,
  deleteComplaint
);

router.put(
  "/abuse-complaints/:id",
  authCheck,
  superAdminCheck,
  updateComplaintById
);

router.get(
  "/abuse-complaints/:id",
  authCheck,
  superAdminCheck,
  getComplaintDetails
);

router.put(
  "/abuse-complaints/:id/assign",
  authCheck,
  superAdminCheck,
  assignComplaint
);

router.post(
  "/abuse-complaints/:id/notes",
  authCheck,
  superAdminCheck,
  addComplaintNote
);

router.put(
  "/abuse-complaints/:id/notes/:noteId",
  authCheck,
  superAdminCheck,
  updateComplaintNote
);

router.put(
  "/abuse-complaints/:id/duplicate",
  authCheck,
  superAdminCheck,
  markAsDuplicate
);

router.put(
  "/abuse-complaints/:id/resolve",
  authCheck,
  superAdminCheck,
  resolveComplaint
);

module.exports = router;
