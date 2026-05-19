// ** LIBS ** //
const express = require("express");
const router = express.Router();

// ** MIDDLEWARES ** //
const { authCheck, adminCheck } = require("@middlewares/auth");

// ** CONTROLLERS ** //
const { currentAdmin } = require("@controllers/user/adminController");

// ** ROUTES ** //
router.post("/currentAdmin", authCheck, adminCheck, currentAdmin);

module.exports = router;
