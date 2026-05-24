const express = require("express");
const router = express.Router();
const cvRouter = express.Router();
const cvDownloadController = require("@controllers/cv-download/cvDownloadController");
const { authCheck, superAdminCheck } = require("@middlewares/auth");
const rateLimit = require("express-rate-limit");

// Rate limiter for tracking endpoint
const trackLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // max 30 per minute per IP
  message: "Too many requests, try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── PUBLIC ────────────────────────────────────────────────────
// POST /api/v1/cv/track - Track CV view/download (public, rate limited)
cvRouter.post("/track", trackLimiter, cvDownloadController.trackCvEvent);

// ─── PROTECTED (Admin) ─────────────────────────────────────────
// GET /api/v1/cv/analytics - Get CV analytics summary
cvRouter.get("/analytics", authCheck, superAdminCheck, cvDownloadController.getCvAnalytics);

// GET /api/v1/cv/analytics/paginated - Get paginated event log
cvRouter.get("/analytics/paginated", authCheck, superAdminCheck, cvDownloadController.getCvEventsPaginated);

// Mount sub-router
router.use("/cv", cvRouter);

module.exports = router;
