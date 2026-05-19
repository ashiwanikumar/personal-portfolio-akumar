// ** PACKAGES ** //
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const nodemailer = require("nodemailer");
const sendEmail = require("../../utils/sendEmail");

// ** MODELS ** //
const User = require("@models/user/user");
const LoginActivity = require("@models/user/loginActivity");

// ** SERVICES ** //
const UserService = require("@services/user/userService");
const SuperAdminService = require("@services/user/superAdminService");
const MarketingAdminService = require("@services/user/marketingAdminService");
// Gamification services removed for template simplicity

// ** UTILS ** //
const { logger } = require("@utils/logger");
const { emailValidator, passwordValidator } = require("@utils/validations");
const { verifyTurnstileToken } = require("@utils/turnstileVerification");
const {
  getRealClientIP,
} = require("@utils/technical-info-collector/technicalInfoCollector");
const {
  collectClientLoginTechnicalInfo,
} = require("@utils/technical-info-collector/clientLoginTechnicalInfo");
const geoLocationService = require("@utils/technical-info-collector/geoLocationService");

// ** MAILS ** //
const {
  verifyAccountEmailTemplate,
  resetPasswordEmailTemplate,
  passwordResetSuccessEmailTemplate,
} = require("@mails/authEmails");
const {
  loginNotificationEmailTemplate,
} = require("../../mails/client-dashboard-login-notification/loginNotificationEmailTemplate");

/**********************************
  Sign up & send email verification
***********************************/
exports.signup = async (req, res) => {
  const { name, email, password, rl, referralCode } = req.body;

  const role = rl || "admin";

  // Validate the input fields
  const validationErrors = [];

  // Validate the email and password with utils
  const emailValidationErrors = emailValidator(email);
  const passwordValidationErrors = passwordValidator(password);

  if (emailValidationErrors.length) {
    validationErrors.push(...emailValidationErrors);
  }

  if (passwordValidationErrors.length) {
    validationErrors.push(...passwordValidationErrors);
  }

  // Sends the validation error message
  if (validationErrors.length) {
    const errorObject = {
      error: true,
      type: validationErrors,
    };
    res.status(400).json(errorObject);
    return;
  }

  try {
    // Check if user already exists
    const existingUser = await UserService.findOneUser({ email });
    if (existingUser) {
      const errorObject = {
        error: true,
        type: [
          {
            code: "GLOBAL_ERROR",
            field: "user",
            message: "Email already exists, please login to continue",
          },
        ],
      };

      res.status(409).json(errorObject);
      return;
    }

    // Create payload to create JWT token
    const payload = { email: email };

    // Generate JWT token for email verification, expires in 30 mins
    const verificationToken = jwt.sign(payload, process.env.JWT_EMAIL_SECRET, {
      expiresIn: 1800,
    });

    // Create a new user, but keep the activation field to false
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Get or create appropriate role for new user
    const Role = require("@models/role/role");
    let userRole;
    const requestedRole = role || "admin";

    // Try to find existing role
    switch (requestedRole.toLowerCase()) {
      case "superadmin":
        userRole = await Role.findOne({ name: "Super Admin" });
        break;
      case "admin":
        userRole = await Role.findOne({ name: "Admin" });
        break;
      case "marketing":
        userRole = await Role.findOne({ name: "Content Manager" });
        break;
      default:
        userRole = await Role.findOne({ name: "Admin" }); // Default to Admin
    }

    // If no role found, create a basic Admin role
    if (!userRole) {
      userRole = new Role({
        name: "Admin",
        description: "Administrative access",
        hierarchyLevel: 1,
        accessRights: [],
        approvalRights: true,
        isActive: true,
        isSystemRole: true,
        createdBy: null, // Will be updated later
      });
      await userRole.save();
    }

    // Create the user
    let newUser = await UserService.createUser({
      name,
      email,
      role: requestedRole,
      roleId: userRole._id,
      roleAssignedAt: new Date(),
      password: hashedPassword,
      activated: false,
      activationToken: verificationToken,
      activationTokenSentAt: Date.now(),
    });

    // If admin, create an admin account
    if (newUser.role === "admin") {
      // Commented out as per instructions
      // await AdminService.createAdmin({
      //   user: newUser._id,
      //   name: newUser.name,
      //   email: newUser.email,
      // });
    } else if (newUser.role === "superadmin") {
      await SuperAdminService.createSuperAdmin({
        user: newUser._id,
        name: newUser.name,
        email: newUser.email,
      });
    } else if (newUser.role === "marketing") {
      await MarketingAdminService.createMarketingAdmin({
        user: newUser._id,
        name: newUser.name,
        email: newUser.email,
      });
    }

    // Referral processing removed for template simplicity
    if (referralCode) {
      console.log(
        "Referral code provided but processing disabled in template:",
        referralCode
      );
    }

    // Send verification email only if not superadmin or marketing
    if (newUser.role !== "superadmin" && newUser.role !== "marketing") {
      // Send verification to the user email
      const transporter = nodemailer.createTransport({
        port: 587,
        host: "smtp.zoho.com",
        tls: {
          ciphers: "SSLv3",
          rejectUnauthorized: false,
        },
        auth: {
          user: process.env.ZOHO_NODEMAILER_EMAIL_HELLO,
          pass: process.env.ZOHO_NODEMAILER_PASSWORD_HELLO,
        },
        secure: false,
        encryption: "STARTTLS",
      });

      await new Promise((resolve, reject) => {
        // verify connection configuration
        transporter.verify(function (error, success) {
          if (error) {
            console.log(error);
            reject(error);
          } else {
            console.log("Server is ready to take our messages");
            resolve(success);
          }
        });
      });

      // Configure the message
      let mailOptions = {
        from: `Hello from Netraga <${process.env.ZOHO_NODEMAILER_EMAIL_HELLO}>`,
        to: email,
        subject: "Verify your email address for Netraga",
        html: verifyAccountEmailTemplate(newUser, verificationToken),
      };

      // Send the email
      await new Promise((resolve, reject) => {
        // send mail
        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            console.log(info);
            resolve(info);
          }
        });
      });
    }

    res.status(201).json({
      message: "Check your email, and verify your account",
      user: User.toClientObject(newUser),
    });
  } catch (error) {
    res.status(500).json(error);
    console.log("SIGNUP_ERROR", error);
  }
};

/**********************************
  Email Verification, acc. activation
***********************************/
exports.accountActivate = async (req, res, next) => {
  // Get the token from client body
  const { token } = req.body;

  try {
    // If token exists
    if (token) {
      jwt.verify(token, process.env.JWT_EMAIL_SECRET, async (err, user) => {
        // If the token provided is not valid
        if (err) {
          return res.json({
            error: true,
            type: [
              {
                code: "GLOBAL_ERROR",
                message:
                  "Token is not valid or expired, enter email to resend verification",
              },
            ],
          });
        }
        const { email } = user;

        // Check if already activated
        const existingUser = await UserService.findOneUser({ email });
        if (existingUser.activated) {
          return res.status(409).json({
            error: true,
            type: [
              {
                code: "GLOBAL_ERROR",
                message: "Account already activated",
              },
            ],
          });
        }

        const updatedUser = await UserService.findOneUserAndUpdate(
          { email },
          { activated: true }
        );

        return res.status(200).json({
          message: "Email verified, please login to continue",
          user: User.toClientObject(updatedUser),
        });
      });
    } else {
      res.status(400).json({
        error: true,
        type: [
          {
            code: "GLOBAL_ERROR",
            message: "Something went wrong, please try again",
          },
        ],
      });
    }
  } catch (error) {
    next(error);
  }
};

/**********************************
  Resend acc. activation email
***********************************/
exports.resendAccountActivation = async (req, res, next) => {
  const { email } = req.body;

  try {
    // Check if the user exists
    const user = await UserService.findOneUser({ email });

    // If no user found
    if (!user) {
      return res.status(404).json({
        error: true,
        type: [
          {
            code: "GLOBAL_ERROR",
            message: "User with this email does not exist",
          },
        ],
      });
    }

    // If the user already activated
    if (user.activated) {
      return res.status(409).json({
        error: true,
        type: [
          {
            code: "GLOBAL_ERROR",
            message: "Email already activated, login to continue",
          },
        ],
      });
    }

    // Create payload to create JWT token
    const payload = { email: email };

    // Generate JWT token for email verification, expires in 30 mins
    const verificationToken = jwt.sign(payload, process.env.JWT_EMAIL_SECRET, {
      expiresIn: 1800,
    });

    // Update the activation token on the user object
    await UserService.findOneUserAndUpdate(
      { email },
      {
        activationToken: verificationToken,
        activationTokenSentAt: Date.now(),
      }
    );

    // Send verification to the user email
    const transporter = nodemailer.createTransport({
      port: 587,
      host: "smtp.zoho.com",
      tls: {
        ciphers: "SSLv3",
        rejectUnauthorized: false,
      },
      auth: {
        user: process.env.ZOHO_NODEMAILER_EMAIL_HELLO,
        pass: process.env.ZOHO_NODEMAILER_PASSWORD_HELLO,
      },
      secure: false,
      encryption: "STARTTLS",
    });

    await new Promise((resolve, reject) => {
      // verify connection configuration
      transporter.verify(function (error, success) {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          console.log("Server is ready to take our messages");
          resolve(success);
        }
      });
    });

    // Configure the message
    let mailOptions = {
      from: `Hello from Netraga <${process.env.ZOHO_NODEMAILER_EMAIL_HELLO}>`,
      to: email,
      subject: "Verify your email address for Netraga",
      html: verifyAccountEmailTemplate(user, verificationToken),
    };

    // Send the email
    await new Promise((resolve, reject) => {
      // send mail
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          console.log(info);
          resolve(info);
        }
      });
    });

    res.status(200).json({ message: "Verification email resent" });
  } catch (error) {
    next(error);
  }
};

/**********************************
  Forgot password & send email
***********************************/
exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    // Check if user exists with that email
    const user = await User.findOne({ email: email });

    // If user doesn't exist, return error
    if (!user) {
      return res.status(404).json({
        error: true,
        type: [
          {
            code: "GLOBAL_ERROR",
            message: "User not found",
          },
        ],
      });
    }

    // Create payload to create JWT token
    const payload = { _id: user._id };

    // Generate JWT token for email verification, expires in 30 mins
    const resetPasswordToken = jwt.sign(
      payload,
      process.env.JWT_RESET_PASSWORD_SECRET,
      { expiresIn: 3600 } // 1 hour
    );

    // Update user object with reset password token and sent at time
    await User.findByIdAndUpdate(user._id, {
      resetPasswordToken,
      resetPasswordTokenSentAt: Date.now(),
    });

    // Send the email
    const transporter = nodemailer.createTransport({
      port: 587,
      host: "smtp.zoho.com",
      tls: {
        ciphers: "SSLv3",
        rejectUnauthorized: false,
      },
      auth: {
        user: process.env.ZOHO_NODEMAILER_EMAIL_HELLO,
        pass: process.env.ZOHO_NODEMAILER_PASSWORD_HELLO,
      },
      secure: false,
      encryption: "STARTTLS",
    });

    await new Promise((resolve, reject) => {
      // verify connection configuration
      transporter.verify(function (error, success) {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          console.log("Server is ready to take our messages");
          resolve(success);
        }
      });
    });

    let mailOptions = {
      from: `Netraga Support <${process.env.ZOHO_NODEMAILER_EMAIL_HELLO}>`,
      to: email,
      subject: "Reset your password for Netraga",
      html: resetPasswordEmailTemplate(user, resetPasswordToken),
    };

    await new Promise((resolve, reject) => {
      // send mail
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          console.log(info);
          resolve(info);
        }
      });
    });

    return res.status(200).json({
      message: "Email sent, please check your inbox for reset instructions",
    });
  } catch (error) {
    next(error);
  }
};

/**********************************
  Reset password logic
***********************************/
exports.resetPassword = async (req, res, next) => {
  const { newPassword, token } = req.body;

  // Validate input
  if (!newPassword || !token) {
    return res.status(400).json({
      message: "Token and new password are required",
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      message: "Password must be at least 6 characters long",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_RESET_PASSWORD_SECRET);
    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    // Collect technical information for success email
    let resetInfo = {};
    try {
      const realClientIP = getRealClientIP(req);
      const technicalInfo = collectClientLoginTechnicalInfo(req);
      const geoData = await geoLocationService.getGeoLocation(
        realClientIP || req.ip
      );

      resetInfo = {
        ip: realClientIP || req.ip,
        browser: technicalInfo?.browser.name
          ? `${technicalInfo.browser.name} ${
              technicalInfo.browser.version || ""
            }`.trim()
          : req.headers["user-agent"],
        device: technicalInfo?.device.deviceType
          ? `${technicalInfo.device.vendor || ""} ${
              technicalInfo.device.model || technicalInfo.device.deviceType
            }`.trim()
          : "Unknown Device",
        location: geoData
          ? `${geoData.city || "Unknown City"}, ${
              geoData.region || geoData.country || "Unknown Location"
            }`
          : "Unknown Location",
        time: new Date().toLocaleString(),
        technicalDetails: {
          os: technicalInfo?.device.os.name || "Unknown OS",
          browser: technicalInfo?.browser.name || "Unknown Browser",
          device: technicalInfo?.device.deviceType || "Unknown Device",
          location: geoData
            ? `${geoData.city}, ${geoData.region}`
            : "Unknown Location",
        },
      };
    } catch (error) {
      console.warn(
        "Failed to collect technical info for password reset success email:",
        error.message
      );
      // Use basic fallback info
      resetInfo = {
        ip: req.ip,
        browser: req.headers["user-agent"] || "Unknown Browser",
        device: "Unknown Device",
        location: "Unknown Location",
        time: new Date().toLocaleString(),
        technicalDetails: {},
      };
    }

    // Send password reset success email asynchronously
    sendEmail({
      email: user.email,
      subject: `Password Successfully Reset [${resetInfo.time}]`,
      html: passwordResetSuccessEmailTemplate(user, resetInfo),
      user: user,
      emailType: "Password Reset Success",
    }).catch((error) => {
      console.error("Password reset success email failed:", error);
    });

    res.status(200).json({
      message: "Password updated, please login to continue",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login a user
// @route   POST /api/v1/login
// @access  Public
exports.login = async (req, res, next) => {
  const {
    email,
    password,
    turnstileToken,
    technicalInfo: frontendTechnicalInfo,
  } = req.body;

  // Validate the input fields
  if (!email || !password) {
    return res.status(400).json({ message: "Please provide email & password" });
  }

  // Validate Turnstile token
  if (!turnstileToken) {
    return res.status(400).json({
      error: true,
      type: [
        {
          code: "TURNSTILE_ERROR",
          message: "Security verification is required",
        },
      ],
    });
  }

  try {
    // Verify Turnstile token
    const turnstileResult = await verifyTurnstileToken(turnstileToken, req.ip);

    if (!turnstileResult.success) {
      return res.status(400).json({
        error: true,
        type: [
          {
            code: "TURNSTILE_ERROR",
            message: "Security verification failed. Please try again.",
          },
        ],
      });
    }
    const user = await User.findOne({ email: req.body.email }).populate(
      "roleInfo"
    );

    // Helper function to log failed login attempts
    const logFailedLogin = async (email, failureReason, userData = null) => {
      try {
        const basicTechnicalInfo = frontendTechnicalInfo || {};

        const failedLoginData = {
          userId: userData?._id || null,
          userEmail: email,
          userName: userData?.name || "Unknown",
          userRole: userData?.role || "Unknown",
          loginStatus: "failed",
          failureReason: failureReason,

          network: {
            ipAddress: req.ip,
            realIpAddress:
              req.headers["cf-connecting-ip"] ||
              req.headers["x-real-ip"] ||
              req.ip,
            userAgent: req.headers["user-agent"],
            headers: {
              "cf-connecting-ip": req.headers["cf-connecting-ip"],
              "x-real-ip": req.headers["x-real-ip"],
              "x-forwarded-for": req.headers["x-forwarded-for"],
              "accept-language": req.headers["accept-language"],
            },
          },

          device: {
            type: basicTechnicalInfo?.device?.type,
            browser: {
              name: basicTechnicalInfo?.browser?.name,
              version: basicTechnicalInfo?.browser?.version,
              fullVersion: basicTechnicalInfo?.browser?.fullVersion,
            },
            os: {
              name: basicTechnicalInfo?.system?.os,
              platform: basicTechnicalInfo?.system?.platform,
            },
            screen: {
              width: basicTechnicalInfo?.device?.screenWidth,
              height: basicTechnicalInfo?.device?.screenHeight,
            },
            language:
              basicTechnicalInfo?.browser?.language ||
              req.headers["accept-language"]?.split(",")[0],
            timezone: basicTechnicalInfo?.system?.timezone,
          },

          security: {
            riskScore: 50, // Default higher risk for failed logins
            threatLevel: "medium",
          },

          frontendData: basicTechnicalInfo
            ? {
                browserFeatures: {
                  cookiesEnabled: basicTechnicalInfo.security?.cookiesEnabled,
                  localStorage: basicTechnicalInfo.security?.localStorage,
                },
                hardware: {
                  hardwareConcurrency:
                    basicTechnicalInfo.system?.hardwareConcurrency,
                  deviceMemory: basicTechnicalInfo.system?.memoryGB,
                },
              }
            : {},

          metadata: {
            source: "web_login",
            environment: process.env.NODE_ENV || "production",
            collectionMethod: "automatic",
          },

          loginAttemptedAt: new Date(),
        };

        const failedLoginActivity = new LoginActivity(failedLoginData);
        failedLoginActivity.save().catch((error) => {
          console.error("Failed to save failed login activity:", error);
        });

        console.log(
          "Failed login attempt logged for email:",
          email,
          "Reason:",
          failureReason
        );
      } catch (error) {
        console.error("Error logging failed login attempt:", error);
      }
    };

    if (!user) {
      await logFailedLogin(email, "User not found");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);

    if (!isMatch) {
      await logFailedLogin(email, "Invalid password", user);
      return res.status(401).json({ message: "Invalid password" });
    }

    // Check if MFA is enabled for this user
    if (user.mfa && user.mfa.enabled) {
      // Generate temporary token for MFA verification
      const tempTokenPayload = {
        userId: user._id,
        email: user.email,
        type: "mfa_verification",
        timestamp: Date.now(),
      };

      const tempToken = jwt.sign(
        tempTokenPayload,
        process.env.JWT_MFA_SECRET || process.env.JWT_ACCESS_SECRET,
        { expiresIn: "10m" } // 10 minutes to complete MFA
      );

      logger.info(`MFA required for user login: ${user.email}`, {
        userId: user._id,
        userEmail: user.email,
        action: "mfa_required",
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        timestamp: new Date().toISOString(),
      });

      return res.status(200).json({
        success: true,
        mfaRequired: true,
        tempToken,
        message: "MFA verification required to complete login",
      });
    }

    // Create a new object to return to the client
    const userObjectData = User.toClientObject(user);

    // Use only the user ID to create JWT token
    const idObject = { _id: userObjectData._id };

    // Generate the access token
    const accessToken = jwt.sign(idObject, process.env.JWT_ACCESS_SECRET, {
      expiresIn: process.env.JWT_ACCESS_TOKEN_TTL,
    });

    // Generate the refresh token
    const refreshToken = jwt.sign(idObject, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "1y",
    });

    // Set a http only cookie for refresh token
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      path: `/`,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // Collect comprehensive technical information for login notification
    console.log("Collecting technical information for login notification...");
    console.log(
      "Frontend technical info received:",
      frontendTechnicalInfo ? "Yes" : "No"
    );
    let technicalInfo = null;
    let geoData = null;
    let realClientIP = null;
    let mergedTechnicalInfo = null;
    try {
      const info = await collectClientLoginTechnicalInfo(
        req,
        frontendTechnicalInfo
      );
      technicalInfo = info.technicalInfo;
      geoData = info.geoData;
      realClientIP = info.realClientIP;
      mergedTechnicalInfo = info.mergedTechnicalInfo;
      console.log("Login notification technical data collected:", {
        ip: technicalInfo.network.ip.ipv4,
        realIP: realClientIP,
        country: geoData?.country,
        city: geoData?.city,
        device: technicalInfo.device.deviceType,
        browser: technicalInfo.browser.name,
        os: technicalInfo.device.os.name,
        frontendDataAvailable: !!frontendTechnicalInfo,
        frontendBrowser: frontendTechnicalInfo?.browser?.name,
        frontendDevice: frontendTechnicalInfo?.device?.type,
        frontendOS: frontendTechnicalInfo?.system?.os,
      });
    } catch (error) {
      console.warn(
        "Failed to collect technical info for login notification:",
        error.message
      );
      // Continue with basic info if technical collection fails
    }

    // Prepare enhanced login info with location and device details
    // Use frontend technical info when available, fallback to server data
    const loginInfo = {
      ip: technicalInfo?.network.ip.real || req.ip, // Server IP (usually proxy IP)
      realIP: realClientIP || technicalInfo?.network.ip.real || req.ip, // Real IP from WebRTC
      browser:
        frontendTechnicalInfo?.browser?.fullVersion ||
        technicalInfo?.browser.name
          ? `${technicalInfo.browser.name} ${
              technicalInfo.browser.version || ""
            }`.trim()
          : req.headers["user-agent"],
      device:
        frontendTechnicalInfo?.device?.type || technicalInfo?.device.deviceType
          ? `${technicalInfo.device.vendor || ""} ${
              technicalInfo.device.model || technicalInfo.device.deviceType
            }`.trim()
          : "Unknown Device",
      location: geoData
        ? `${geoData.city || "Unknown City"}, ${
            geoData.region || geoData.country || "Unknown Location"
          }`
        : "Unknown Location",
      time: new Date().toLocaleString(),
      // Additional technical details for enhanced security
      technicalDetails: {
        os:
          frontendTechnicalInfo?.system?.os ||
          technicalInfo?.device.os.name ||
          "Unknown OS",
        screenResolution:
          frontendTechnicalInfo?.device?.screenWidth &&
          frontendTechnicalInfo?.device?.screenHeight
            ? `${frontendTechnicalInfo.device.screenWidth}x${frontendTechnicalInfo.device.screenHeight}`
            : technicalInfo?.device.screen
            ? `${technicalInfo.device.screen.width}x${technicalInfo.device.screen.height}`
            : "Unknown",
        timezone:
          frontendTechnicalInfo?.system?.timezone ||
          geoData?.timezone ||
          technicalInfo?.network.location.timezone ||
          "Unknown",
        isp: geoData?.isp || technicalInfo?.network.isp.name || "Unknown ISP",
        // Network details
        network: {
          isp: geoData?.isp || technicalInfo?.network.isp.name || "Unknown ISP",
          organization:
            geoData?.organization ||
            technicalInfo?.network.isp.organization ||
            "Unknown Organization",
          connectionType:
            frontendTechnicalInfo?.network?.connectionType || "Unknown",
          asn: geoData?.as || technicalInfo?.network.isp.asn || "Unknown ASN",
        },
        // Enhanced location details
        location: {
          country: geoData?.country || "Unknown Country",
          region: geoData?.region || "Unknown Region",
          city: geoData?.city || "Unknown City",
          postalCode: geoData?.postal || "Unknown Postal Code",
          latitude: geoData?.latitude || "Unknown",
          longitude: geoData?.longitude || "Unknown",
          timezone:
            geoData?.timezone ||
            frontendTechnicalInfo?.system?.timezone ||
            "Unknown",
        },
        isMobile:
          frontendTechnicalInfo?.device?.isMobile ||
          technicalInfo?.device.deviceType === "mobile" ||
          geoData?.mobile ||
          false,
        isProxy: technicalInfo?.security.isProxy || geoData?.proxy || false,
        isVPN: technicalInfo?.security.isVPN || false,
        riskScore: technicalInfo?.security.riskScore || 0,
        // Frontend specific data
        frontendData: frontendTechnicalInfo
          ? {
              browserName: frontendTechnicalInfo.browser?.name,
              browserVersion: frontendTechnicalInfo.browser?.version,
              deviceType: frontendTechnicalInfo.device?.type,
              platform: frontendTechnicalInfo.system?.platform,
              connectionType: frontendTechnicalInfo.network?.connectionType,
              cookiesEnabled: frontendTechnicalInfo.security?.cookiesEnabled,
              touchSupport: frontendTechnicalInfo.device?.touchSupport,
              hardwareConcurrency:
                frontendTechnicalInfo.system?.hardwareConcurrency,
              memoryGB: frontendTechnicalInfo.system?.memoryGB,
            }
          : null,
      },
    };

    // Send enhanced login notification email asynchronously
    sendEmail({
      email: user.email,
      subject: `Security Alert: New Login Detected [${loginInfo.time}]`,
      html: loginNotificationEmailTemplate(user, loginInfo),
      user: user,
      emailType: "Login Notification",
    }).catch((error) => {
      console.error("Login notification email failed:", error);
    });

    // Save login activity for audit purposes
    try {
      const loginActivityData = {
        userId: user._id,
        userEmail: user.email,
        userName: user.name,
        userRole: user.role,
        loginStatus: "success",

        // Network information
        network: {
          ipAddress: technicalInfo?.network.ip.ipv4 || req.ip,
          realIpAddress:
            technicalInfo?.network.ip.real ||
            req.headers["cf-connecting-ip"] ||
            req.headers["x-real-ip"] ||
            req.ip,
          userAgent: req.headers["user-agent"],
          headers: {
            "cf-connecting-ip": req.headers["cf-connecting-ip"],
            "x-real-ip": req.headers["x-real-ip"],
            "x-forwarded-for": req.headers["x-forwarded-for"],
            "accept-language": req.headers["accept-language"],
            accept: req.headers["accept"],
          },
        },

        // Geographic location
        location: {
          country: geoData?.country,
          region: geoData?.region,
          city: geoData?.city,
          postalCode: geoData?.postal,
          latitude: geoData?.latitude,
          longitude: geoData?.longitude,
          timezone:
            geoData?.timezone || frontendTechnicalInfo?.system?.timezone,
          isp: geoData?.isp,
          organization: geoData?.organization,
        },

        // Device and browser information
        device: {
          type:
            frontendTechnicalInfo?.device?.type ||
            technicalInfo?.device.deviceType,
          vendor: technicalInfo?.device.vendor,
          model: technicalInfo?.device.model,
          os: {
            name:
              frontendTechnicalInfo?.system?.os ||
              technicalInfo?.device.os.name,
            version: technicalInfo?.device.os.version,
            platform:
              frontendTechnicalInfo?.system?.platform ||
              technicalInfo?.device.os.platform,
          },
          browser: {
            name:
              frontendTechnicalInfo?.browser?.name ||
              technicalInfo?.browser.name,
            version:
              frontendTechnicalInfo?.browser?.version ||
              technicalInfo?.browser.version,
            fullVersion: frontendTechnicalInfo?.browser?.fullVersion,
            engine: technicalInfo?.browser.engine,
          },
          screen: {
            width:
              frontendTechnicalInfo?.device?.screenWidth ||
              technicalInfo?.device.screen?.width,
            height:
              frontendTechnicalInfo?.device?.screenHeight ||
              technicalInfo?.device.screen?.height,
            pixelRatio: frontendTechnicalInfo?.device?.devicePixelRatio,
          },
          touchSupport: frontendTechnicalInfo?.device?.touchSupport,
          language:
            frontendTechnicalInfo?.browser?.language ||
            req.headers["accept-language"]?.split(",")[0],
          timezone: frontendTechnicalInfo?.system?.timezone,
        },

        // Security analysis
        security: {
          riskScore: technicalInfo?.security.riskScore || 0,
          isProxy: technicalInfo?.security.isProxy || geoData?.proxy || false,
          isVPN: technicalInfo?.security.isVPN || false,
          isMobile:
            frontendTechnicalInfo?.device?.isMobile ||
            technicalInfo?.device.deviceType === "mobile" ||
            false,
          isTor: technicalInfo?.security.isTor || false,
          isBot: technicalInfo?.security.isBot || false,
          threatLevel:
            technicalInfo?.security.riskScore > 70
              ? "high"
              : technicalInfo?.security.riskScore > 40
              ? "medium"
              : "low",
        },

        // Session information
        session: {
          sessionId: req.sessionID,
          accessToken: accessToken.substring(0, 10) + "...", // Store only first 10 chars for audit
          refreshToken: refreshToken.substring(0, 10) + "...", // Store only first 10 chars for audit
        },

        // Frontend technical data
        frontendData: frontendTechnicalInfo
          ? {
              browserFeatures: {
                cookiesEnabled: frontendTechnicalInfo.security?.cookiesEnabled,
                localStorage: frontendTechnicalInfo.security?.localStorage,
                sessionStorage: frontendTechnicalInfo.security?.sessionStorage,
                indexedDB: frontendTechnicalInfo.security?.indexedDB,
              },
              hardware: {
                hardwareConcurrency:
                  frontendTechnicalInfo.system?.hardwareConcurrency,
                deviceMemory: frontendTechnicalInfo.system?.memoryGB,
                connectionType: frontendTechnicalInfo.network?.connectionType,
                connectionDownlink: frontendTechnicalInfo.network?.downlink,
                connectionRtt: frontendTechnicalInfo.network?.rtt,
              },
              fingerprint: technicalInfo?.security.fingerprint,
            }
          : {},

        // Metadata
        metadata: {
          source: "web_login",
          version: frontendTechnicalInfo?.metadata?.version || "1.0.0",
          environment: process.env.NODE_ENV || "production",
          collectionMethod: "automatic",
        },

        loginAttemptedAt: new Date(),
        loginCompletedAt: new Date(),
        lastAccessedAt: new Date(),
      };

      // Save login activity asynchronously
      const loginActivity = new LoginActivity(loginActivityData);
      loginActivity.save().catch((error) => {
        console.error("Failed to save login activity:", error);
      });

      console.log("Login activity logged for user:", user.email);
    } catch (error) {
      console.error("Error preparing login activity data:", error);
    }

    // Return response immediately without waiting for email or login activity logging
    res.status(200).json({
      user: userObjectData,
      accessToken,
      message: "Login Success",
    });
  } catch (error) {
    next(error);
  }
};

/**********************************
    Logout
***********************************/
exports.logout = async (req, res) => {
  // Clear the set-cookie refresh token
  res.clearCookie("refreshToken", {
    path: `/`,
  });

  res.status(200).json({ message: "Logged out" });
};

/**********************************
  Current Super Admin
***********************************/
exports.currentSuperAdmin = async (req, res) => {
  try {
    let user = await SuperAdminService.findOneSuperAdmin({
      email: req.user.email,
    });
    if (!user) {
      return res.status(401).json({
        error: true,
        type: [
          {
            code: "GLOBAL_ERROR",
            message: "User not found",
          },
        ],
      });
    }
    return res.json(user);
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: "Something went wrong",
    });
  }
};

/**********************************
  Current Marketing Admin
***********************************/
exports.currentMarketingAdmin = async (req, res) => {
  try {
    let user = await MarketingAdminService.findOneMarketingAdmin({
      email: req.user.email,
    });
    if (!user) {
      return res.status(401).json({
        error: true,
        type: [
          {
            code: "GLOBAL_ERROR",
            message: "User not found",
          },
        ],
      });
    }
    return res.json(user);
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: "Something went wrong",
    });
  }
};

// Simple middleware to check if the reset password token is expired
exports.isResetTokenExpired = (req, res, next) => {
  const { token } = req.body;

  const isTokenExpired = (token) => {
    try {
      const decoded = jwt.decode(token);
      if (decoded.exp < Date.now() / 1000) {
        return true;
      }
      return false;
    } catch (e) {
      return true;
    }
  };

  if (isTokenExpired(token)) {
    return res.status(400).json({ message: "Token has expired" });
  }

  next();
};

/**********************************
  Refresh access token
***********************************/
exports.refreshToken = async (req, res) => {
  try {
    const refToken = req.cookies.refreshToken;

    // If refresh token is not provided, return error
    if (!refToken) {
      return res.status(403).json({
        error: true,
        type: [
          {
            code: "REFRESH_TOKEN_NOT_AVAILABLE",
            field: "refreshToken",
            message: "Please login again",
          },
        ],
      });
    }

    // Get the user from the refresh token
    const decodedToken = jwt.verify(refToken, process.env.JWT_REFRESH_SECRET);

    // Get the user from the refresh token
    const user = await UserService.findUserById(decodedToken._id);

    // If user doesn't exist, return error
    if (!user) {
      return res.status(403).json({
        error: true,
        type: [
          {
            code: "GLOBAL_ERROR",
            field: "refreshToken",
            message: "Refresh token is not valid, please log in again",
          },
        ],
      });
    }

    // TEMPORARY: Handle users without roleId (migration support)
    if (!user.roleId && user.role) {
      const Role = require("@models/role/role");
      let defaultRole;

      // Try to find or create appropriate role based on legacy role
      switch (user.role.toLowerCase()) {
        case "superadmin":
          defaultRole = await Role.findOne({ name: "Super Admin" });
          break;
        case "admin":
          defaultRole = await Role.findOne({ name: "Admin" });
          break;
        case "marketing":
          defaultRole = await Role.findOne({ name: "Content Manager" });
          break;
        default:
          defaultRole = await Role.findOne({ name: "User" });
      }

      // If no role found, create a basic Admin role
      if (!defaultRole) {
        defaultRole = new Role({
          name: "Admin",
          description: "Administrative access",
          hierarchyLevel: 1,
          accessRights: [],
          approvalRights: true,
          isActive: true,
          isSystemRole: true,
          createdBy: user._id,
        });
        await defaultRole.save();
      }

      // Update user with roleId
      user.roleId = defaultRole._id;
      user.roleAssignedAt = new Date();
      await user.save();
    }

    // Check if user account is disabled
    if (user.disabled) {
      return res.status(409).json({
        error: true,
        type: [
          {
            code: "GLOBAL_ERROR",
            field: "user",
            message:
              "Your account has been disabled, please contact support to learn more",
          },
        ],
      });
    }

    // Update user's last active time
    await UserService.updateUserLastActiveTime(user._id);

    // If the current access token is not expired, return the current access token
    const currentAccessToken =
      req.headers.authorization && req.headers.authorization.split(" ")[1];

    if (currentAccessToken) {
      // Function to check if the current access token is expired
      const isTokenExpired = (token) => {
        // Split the JWT by "." and get the payload (middle part)
        const payloadBase64 = token.split(".")[1];
        const decodedJson = Buffer.from(payloadBase64, "base64").toString();
        const decoded = JSON.parse(decodedJson);
        const exp = decoded.exp;
        const expired = Date.now() >= exp * 1000;
        return expired;
      };

      // If the current access token is not expired, return the current access token
      if (!isTokenExpired(currentAccessToken)) {
        return res.status(200).json({
          accessToken: currentAccessToken,
          user: User.toClientObject(user),
        });
      }
    }

    // Get the ID to generate new access token
    const idObject = { _id: user._id };
    // Generate new access token with the user ID
    const accessToken = jwt.sign(idObject, process.env.JWT_ACCESS_SECRET, {
      expiresIn: process.env.JWT_ACCESS_TOKEN_TTL,
    });

    return res.status(200).json({
      accessToken: accessToken,
      user: User.toClientObject(user),
    });
  } catch (error) {
    console.error("REFRESH_TOKEN_ERROR", error);
    res.status(500).json({
      error: true,
      type: [
        {
          code: "GLOBAL_ERROR",
          message: "Internal server error",
        },
      ],
    });
  }
};
