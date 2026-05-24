const crypto = require("crypto");
const Otp = require("@models/user/otp");
const User = require("@models/user/user");
const sendEmail = require("@utils/sendEmail");
const { otpEmailTemplate } = require("@mails/otpEmailTemplate");
const logger = require("@utils/logger");

const OTP_EXPIRY_MINUTES = 5;
const MAX_VERIFY_ATTEMPTS = 3;

/**
 * Generate a random 6-digit OTP
 */
function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * SHA-256 hash of the OTP for safe DB storage
 */
function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

/**
 * Request OTP — generates code, stores hashed version, sends email.
 * Always returns success to prevent email enumeration.
 */
async function requestOtp(email, ipAddress, userAgent) {
  const normalizedEmail = email.trim().toLowerCase();
  logger.info(`[OTP] OTP request for: ${normalizedEmail}`);

  // Check if the user exists
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    logger.warn(`[OTP] User not found: ${normalizedEmail} — returning success (anti-enumeration)`);
    return { success: true, message: "If an account exists, an OTP has been sent." };
  }

  // Invalidate any existing OTPs for this email
  await Otp.deleteMany({ email: normalizedEmail, isVerified: false });
  logger.debug(`[OTP] Cleared previous OTPs for: ${normalizedEmail}`);

  // Generate and hash OTP
  const otp = generateOtp();
  const hashedOtp = hashOtp(otp);

  // Store in DB
  await Otp.create({
    email: normalizedEmail,
    otp: hashedOtp,
    expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
    ipAddress,
    userAgent,
  });

  logger.info(`[OTP] OTP generated and stored for: ${normalizedEmail}`);

  // Send email
  const emailResult = await sendEmail({
    to: normalizedEmail,
    subject: `Your Login Code: ${otp}`,
    html: otpEmailTemplate(otp, user.name || "User"),
    user,
    emailType: "OTP Login",
  });

  if (emailResult.success) {
    logger.info(`[OTP] Email sent successfully to: ${normalizedEmail}, messageId: ${emailResult.messageId}`);
  } else {
    logger.error(`[OTP] Email failed for: ${normalizedEmail}, error: ${emailResult.error}`);
  }

  return { success: true, message: "If an account exists, an OTP has been sent." };
}

/**
 * Verify OTP — checks against hashed DB record.
 * Returns user object on success.
 */
async function verifyOtp(email, otp) {
  const normalizedEmail = email.trim().toLowerCase();
  logger.info(`[OTP] Verification attempt for: ${normalizedEmail}`);

  // Find the latest un-verified OTP
  const record = await Otp.findOne({
    email: normalizedEmail,
    isVerified: false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!record) {
    logger.warn(`[OTP] No valid OTP found for: ${normalizedEmail}`);
    throw new Error("OTP expired or not found. Please request a new code.");
  }

  // Check max attempts
  if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
    logger.warn(`[OTP] Max attempts exceeded for: ${normalizedEmail}`);
    throw new Error("Too many failed attempts. Please request a new code.");
  }

  // Increment attempts
  record.attempts += 1;
  await record.save();

  // Compare hashed OTP
  const hashedInput = hashOtp(otp);
  if (hashedInput !== record.otp) {
    logger.warn(`[OTP] Invalid OTP for: ${normalizedEmail} (attempt ${record.attempts}/${MAX_VERIFY_ATTEMPTS})`);
    throw new Error(`Invalid OTP. ${MAX_VERIFY_ATTEMPTS - record.attempts} attempts remaining.`);
  }

  // Mark as verified
  record.isVerified = true;
  await record.save();

  // Fetch user
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw new Error("User not found.");
  }

  logger.info(`[OTP] Verified successfully for: ${normalizedEmail}`);
  return user;
}

module.exports = { requestOtp, verifyOtp };
