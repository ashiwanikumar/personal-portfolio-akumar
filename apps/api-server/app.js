// ** LIBS ** //
// Module alias for easy imports
require("module-alias/register");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", "..", ".env") });
require("dotenv").config();

// Import the libraries
const express = require("express");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const requestIp = require("request-ip");
const mongoSanitize = require("express-mongo-sanitize");

// ** UTILS ** //
const logger = require("./src/utils/logger");
const loadRoutes = require("./src/utils/helpers");

// ** APP ** //
const app = express();

// ** MIDDLEWARES ** //
app.set("trust proxy", 1);

// Logger
app.use(morgan("combined", { stream: logger.stream }));

// Passport
app.use(passport.initialize());
app.use(passport.session());
require("./src/middlewares/passport")(passport);

// Request IP
app.use(requestIp.mw());

app.use(
  express.json({
    verify: function (req, res, buf) {
      var url = req.originalUrl;
      if (url.startsWith(`/api/${process.env.API_VERSION}/webhook`)) {
        req.rawBody = buf.toString();
      }
    },
    limit: "15mb",
  })
);

// Rate Limiting
const generalRateLimiter = rateLimit({
  // Rate limit 300 requests per 3 minutes for other routes
  windowMs: 3 * 60 * 1000, // 3 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message:
    "You exceeded 100 requests in a 3 minutes limit! Wait for a minute and try again.",
  headers: true,
  statusCode: 429,
  keyGenerator: (req, res) => {
    if (req.user) {
      return req.user._id;
    } else {
      // Fallback to client IP
      return req.clientIp;
    }
  },
});

// Apply the rate limit to all other routes
app.use(generalRateLimiter);
app.use(
  helmet.hsts({
    maxAge: 60 * 60 * 24 * 365, // One year
    includeSubDomains: true, // Must be enabled to be approved by Google
    preload: true,
  })
);
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      styleSrc: ["'unsafe-inline'"],
    },
  })
);

app.use(mongoSanitize());
app.disable("x-powered-by");
app.use(compression());

app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        process.env.CORS_ORIGIN,
        process.env.NEXT_PUBLIC_FRONTEND_URL,
      ].filter(Boolean);

      // Add localhost origins only for development/staging AND if ALLOW_LOCALHOST is set
      if (process.env.ALLOW_LOCALHOST === "true") {
        allowedOrigins.push(
          "http://localhost:3302",
          "http://localhost:3301",
          "http://localhost:3000"
        );
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    name: "sessionId",
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  })
);
app.use(cookieParser(process.env.SESSION_SECRET));

// Recursive function to load routes
try {
  loadRoutes(path.join(__dirname, "src", "routes"), app);
} catch (error) {
  console.error("FATAL: Failed to load routes:", error);
  process.exit(1);
}

// Initialize blog scheduler cron jobs
if (process.env.SCHEDULER_ENABLED !== "false") {
  const blogCronJobs = require("./src/services/blog/blogCronJobs");

  // Initialize cron jobs after a short delay to ensure app is ready
  setTimeout(() => {
    try {
      blogCronJobs.initializeCronJobs();
      logger.info("Blog scheduler initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize blog scheduler:", error);
    }
  }, 5000);
}

module.exports = app;
