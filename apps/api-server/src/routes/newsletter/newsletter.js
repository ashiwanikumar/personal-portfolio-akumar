// ** LIBS ** //
const express = require("express");
const router = express.Router();

// ** MIDDLEWARES ** //
const { authCheck, superAdminCheck } = require("@middlewares/auth");

// ** CONTROLLERS ** //
const {
  subscribeToNewsletter,
  getSubscribersPaginated,
  updateSubscriberPreferences,
  getSubscriberStats,
  deleteSubscriber,
  searchSubscribers,
  getSubscribersFiltered,
  sendTestNewsletterEmail,
} = require("@controllers/newsletter/newsletterController");

// ** ROUTES ** //

// Public Routes
router.post("/newsletter/subscribe", subscribeToNewsletter);

// Test Routes (Admin Only)
router.post(
  "/newsletter/test-email",
  authCheck,
  superAdminCheck,
  sendTestNewsletterEmail
);

// Protected Routes (Admin Only)
router.get(
  "/newsletter/subscribers/paginated",
  authCheck,
  superAdminCheck,
  getSubscribersPaginated
);

router.get(
  "/newsletter/subscribers/search",
  authCheck,
  superAdminCheck,
  searchSubscribers
);

router.get(
  "/newsletter/subscribers/filter",
  authCheck,
  superAdminCheck,
  getSubscribersFiltered
);

router.get("/newsletter/stats", authCheck, superAdminCheck, getSubscriberStats);

router.put(
  "/newsletter/subscriber/:id/preferences",
  authCheck,
  superAdminCheck,
  updateSubscriberPreferences
);

router.delete(
  "/newsletter/subscriber/:id",
  authCheck,
  superAdminCheck,
  deleteSubscriber
);

module.exports = router;
