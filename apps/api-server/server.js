// ** APP ** //
const app = require("./app");

// ** LIBS ** //
const mongoose = require("mongoose");
const http = require("http");
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;
const logger = require("./src/utils/logger");

// Port
const PORT = process.env.API_PORT;
const useCluster =
  process.env.NODE_ENV === "production" &&
  process.env.ENABLE_CLUSTER === "true";

if (!PORT) {
  throw new Error("API_PORT NOT SET!");
}

// Check for auth MongoDB URI
if (!process.env.ATLAS_URI) {
  throw new Error("MONGO URI NOT SET!");
}

// ---------------------------------------------------------------------------
// Database connection
// ---------------------------------------------------------------------------
const mongoURI = process.env.ATLAS_URI;

console.log(
  "Connecting to MongoDB:",
  mongoURI.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@")
);

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    const dbName = mongoose.connection.db.databaseName;
    console.log(
      `MongoDB connected successfully to database: ${dbName}`
    );
  })
  .catch((err) => {
    console.error(`DB connection error - ${err.message}`);
    console.error("Full error:", err);
    process.exit(1);
  });

// MongoDB connection event listeners
mongoose.connection.on("disconnected", () => {
  logger.warn("[DB] MongoDB disconnected");
});
mongoose.connection.on("reconnected", () => {
  logger.info("[DB] MongoDB reconnected");
});
mongoose.connection.on("error", (err) => {
  logger.error(`[DB] MongoDB error: ${err.message}`);
});

// ---------------------------------------------------------------------------
// Server startup
// ---------------------------------------------------------------------------
let server;
function startServer() {
  server = http.createServer(app);
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    // ─── Cron Jobs / Schedulers ─────────────────────────────────────────
    const runCrons =
      process.env.NODE_ENV === "production" ||
      process.env.ENABLE_CRONS === "true";

    if (!runCrons) {
      console.log(
        `\n  ⏸  Cron jobs DISABLED (NODE_ENV=${process.env.NODE_ENV || "development"})`
      );
      console.log(`     Set ENABLE_CRONS=true in .env to test locally.\n`);
    } else {
      console.log(`\n  ▶  Starting cron jobs...\n`);

      function safeStart(name, fn) {
        try {
          fn();
          console.log(`  ✓ ${name}`);
        } catch (err) {
          console.error(`  ✗ ${name} — FAILED: ${err.message}`);
          logger.error(`[CronInit] ${name} failed: ${err.message}`);
        }
      }

      // Blog scheduler disabled — no blog feature active
      // safeStart("Blog Scheduler: Running", () => {
      //   const blogCronJobs = require("./src/services/blog/blogCronJobs");
      //   blogCronJobs.initializeCronJobs();
      // });

      safeStart("Gmail CV Outreach Sync", () => {
        const { initializeCvOutreachCron } = require("./src/services/gmail/cvOutreachCron");
        initializeCvOutreachCron();
      });
    }

    logger.info("──────────────────────────────────────────────");
    logger.info(`[Server] API ready on port ${PORT}`);
    logger.info(
      `[Server] Environment: ${process.env.NODE_ENV || "development"}`
    );
    logger.info(`[Server] PID: ${process.pid}`);
    logger.info(`[Server] Node: ${process.version}`);
    logger.info("──────────────────────────────────────────────");
  });
}

// Server
if (useCluster && cluster.isMaster) {
  logger.info(`[Cluster] CPUs: ${numCPUs}, forking workers...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork({ WORKER_ID: i });
  }

  cluster.on("exit", (worker, code, signal) => {
    logger.error(
      `[Cluster] Worker ${worker.process.pid} exited: code ${code}, signal ${signal}`
    );
  });
} else {
  startServer();
}

// ---------------------------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------------------------
process.on("SIGTERM", async () => {
  logger.info("[Shutdown] SIGTERM received: closing HTTP server");
  if (server) {
    server.close(async () => {
      logger.info("[Shutdown] HTTP server closed");
      await mongoose.connection.close();
      logger.info("[Shutdown] MongoDB connection closed");
      process.exit(0);
    });
  }
});

process.on("SIGINT", async () => {
  logger.info("[Shutdown] SIGINT received: closing HTTP server");
  if (server) {
    server.close(async () => {
      logger.info("[Shutdown] HTTP server closed");
      await mongoose.connection.close();
      logger.info("[Shutdown] MongoDB connection closed");
      process.exit(0);
    });
  }
});
