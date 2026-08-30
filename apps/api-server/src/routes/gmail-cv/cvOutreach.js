const express = require("express");
const router = express.Router();
const gmailCvRouter = express.Router();
const rateLimit = require("express-rate-limit");
const cvOutreachController = require("@controllers/gmail-cv/cvOutreachController");
const { authCheck, superAdminCheck } = require("@middlewares/auth");

// Gmail API quota guard — manual syncs are cheap but not free.
const syncLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many sync requests, try again shortly" },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── PROTECTED (Super Admin only — this is the owner's own mailbox) ─────────
gmailCvRouter.get("/status", authCheck, superAdminCheck, cvOutreachController.getGmailStatus);
gmailCvRouter.get("/analytics", authCheck, superAdminCheck, cvOutreachController.getCvOutreachAnalytics);
gmailCvRouter.get("/messages", authCheck, superAdminCheck, cvOutreachController.getCvOutreachMessages);
gmailCvRouter.get("/messages/:id", authCheck, superAdminCheck, cvOutreachController.getCvOutreachMessage);
gmailCvRouter.get("/messages/:id/body", authCheck, superAdminCheck, cvOutreachController.getCvOutreachBody);
gmailCvRouter.get(
  "/messages/:id/attachments/:attachmentId",
  authCheck,
  superAdminCheck,
  cvOutreachController.downloadCvAttachment
);
gmailCvRouter.patch("/messages/:id", authCheck, superAdminCheck, cvOutreachController.updateCvOutreachFlags);
gmailCvRouter.post("/sync", syncLimiter, authCheck, superAdminCheck, cvOutreachController.triggerSync);

router.use("/gmail-cv", gmailCvRouter);

module.exports = router;
