const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

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

// ─── Rate limits ───────────────────────────────────────────────────────────
// The global limiter (1000 req / 3 min) does nothing against credential
// stuffing. These are the real protection on the auth surface, and the reason
// login can safely run without Turnstile when it is not configured.

// Only failed attempts count, so a normal user signing in is never penalised.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: true,
    type: [
      {
        code: "RATE_LIMITED",
        message: "Too many sign-in attempts. Please try again in a few minutes.",
      },
    ],
  },
});

// Sending OTPs costs email and is a spam vector, so every request counts.
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 6,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: true,
    type: [
      {
        code: "RATE_LIMITED",
        message: "Too many OTP requests. Please try again in a few minutes.",
      },
    ],
  },
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: true,
    type: [
      {
        code: "RATE_LIMITED",
        message: "Too many password reset requests. Please try again later.",
      },
    ],
  },
});

// Routes
router.post("/signup", signup);
router.post("/account/activate", accountActivate);
router.post("/account/reverify", resendAccountActivation); // Resend account verification email
router.post("/password/reset", passwordResetLimiter, forgotPassword);
router.post("/password/reset/verify", resetPassword);
router.post("/login", loginLimiter, login);
router.post("/logout", logout);
router.post("/refresh_token", refreshToken);

// OTP Routes
router.post("/otp/request", otpLimiter, otpRequest);
router.post("/otp/verify", otpLimiter, otpVerify);

// Health Check Route
router.get("/healthCheck", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is up and running",
  });
});

module.exports = router;
