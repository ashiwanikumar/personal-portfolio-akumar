const express = require("express");
const router = express.Router();

// Controllers
const {
  signup,
  login,
  accountActivate,
  resendAccountActivation,
  forgotPassword,
  resetPassword,
  logout,
  refreshToken,
  otpRequest,
  otpVerify,
} = require("../../controllers/auth/authController");

// Routes
router.post("/signup", signup);
router.post("/account/activate", accountActivate);
router.post("/account/reverify", resendAccountActivation); // Resend account verification email
router.post("/password/reset", forgotPassword);
router.post("/password/reset/verify", resetPassword);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh_token", refreshToken);

// OTP Routes
router.post("/otp/request", otpRequest);
router.post("/otp/verify", otpVerify);

// Health Check Route
router.get("/healthCheck", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is up and running",
  });
});

module.exports = router;
