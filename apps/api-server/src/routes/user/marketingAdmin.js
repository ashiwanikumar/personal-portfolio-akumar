// ** LIBS ** //
const express = require("express");
const router = express.Router();

// ** MIDDLEWARES ** //
const {
  authCheck,
  adminSuperOrMarketingAdminCheck,
} = require("@middlewares/auth");

// ** CONTROLLERS ** //
const {
  currentMarketingAdmin,
} = require("@controllers/user/marketingAdminController");

// ** ROUTES ** //
router.post(
  "/currentMarketingAdmin",
  authCheck,
  adminSuperOrMarketingAdminCheck,
  currentMarketingAdmin
);

module.exports = router;
