const cron = require("node-cron");
const blogSchedulerService = require("./blogSchedulerService");
const logger = require("../../utils/logger");

class BlogCronJobs {
  constructor() {
    this.logger = logger;
    this.jobs = new Map();
    this.isInitialized = false;
  }

  /**
   * Initialize and start all cron jobs
   */
  initializeCronJobs() {
    if (this.isInitialized) {
      this.logger.warn("Cron jobs already initialized");
      return;
    }

    try {
      this.startPublicationJob();
      this.startUnpublicationJob();
      this.startDailyCleanupJob();
      this.startHealthCheckJob();

      this.isInitialized = true;
      this.logger.info("Blog scheduler cron jobs initialized successfully");
    } catch (error) {
      this.logger.error("Error initializing cron jobs:", error);
      throw error;
    }
  }

  /**
   * Check for blogs to publish every minute
   */
  startPublicationJob() {
    const job = cron.schedule(
      "* * * * *", // Every minute
      async () => {
        try {
          this.logger.debug("Running scheduled blog publication check");
          const results = await blogSchedulerService.processScheduledBlogs();
          
          if (results.length > 0) {
            const successful = results.filter(r => r.success).length;
            const failed = results.filter(r => !r.success).length;
            
            this.logger.info(`Blog publication job completed`, {
              total: results.length,
              successful,
              failed,
            });
          }
        } catch (error) {
          this.logger.error("Error in scheduled blog publication job:", error);
        }
      },
      {
        scheduled: false,
        timezone: process.env.SCHEDULER_TIMEZONE || "UTC",
      }
    );

    this.jobs.set("publication", job);
    job.start();
    this.logger.info("Started blog publication cron job (every minute)");
  }

  /**
   * Check for blogs to unpublish every 5 minutes
   */
  startUnpublicationJob() {
    const job = cron.schedule(
      "*/5 * * * *", // Every 5 minutes
      async () => {
        try {
          this.logger.debug("Running scheduled blog unpublication check");
          const results = await blogSchedulerService.processScheduledUnpublications();
          
          if (results.length > 0) {
            const successful = results.filter(r => r.success).length;
            const failed = results.filter(r => !r.success).length;
            
            this.logger.info(`Blog unpublication job completed`, {
              total: results.length,
              successful,
              failed,
            });
          }
        } catch (error) {
          this.logger.error("Error in scheduled blog unpublication job:", error);
        }
      },
      {
        scheduled: false,
        timezone: process.env.SCHEDULER_TIMEZONE || "UTC",
      }
    );

    this.jobs.set("unpublication", job);
    job.start();
    this.logger.info("Started blog unpublication cron job (every 5 minutes)");
  }

  /**
   * Daily cleanup job at midnight
   */
  startDailyCleanupJob() {
    const job = cron.schedule(
      "0 0 * * *", // Daily at midnight
      async () => {
        try {
          this.logger.info("Running daily scheduler cleanup");
          const result = await blogSchedulerService.cleanupExpiredSchedules();
          
          this.logger.info("Daily cleanup completed", {
            historyItemsRemoved: result.historyItemsRemoved,
            expiredSchedulesCleared: result.expiredSchedulesCleared,
          });
        } catch (error) {
          this.logger.error("Error in daily cleanup job:", error);
        }
      },
      {
        scheduled: false,
        timezone: process.env.SCHEDULER_TIMEZONE || "UTC",
      }
    );

    this.jobs.set("cleanup", job);
    job.start();
    this.logger.info("Started daily cleanup cron job (midnight)");
  }

  /**
   * Health check job every 30 minutes
   */
  startHealthCheckJob() {
    const job = cron.schedule(
      "*/30 * * * *", // Every 30 minutes
      async () => {
        try {
          this.logger.debug("Running scheduler health check");
          const status = await blogSchedulerService.getScheduledBlogsStatus();
          
          // Log health metrics
          this.logger.info("Scheduler health check", {
            totalScheduled: status.data.totalScheduled,
            scheduledForToday: status.data.scheduledForToday,
            recentlyPublished: status.data.recentlyPublished,
            failedSchedules: status.data.failedSchedules,
          });

          // Alert if there are too many failed schedules
          if (status.data.failedSchedules > 5) {
            this.logger.warn("High number of failed schedules detected", {
              failedCount: status.data.failedSchedules,
            });
          }
        } catch (error) {
          this.logger.error("Error in health check job:", error);
        }
      },
      {
        scheduled: false,
        timezone: process.env.SCHEDULER_TIMEZONE || "UTC",
      }
    );

    this.jobs.set("healthCheck", job);
    job.start();
    this.logger.info("Started scheduler health check cron job (every 30 minutes)");
  }

  /**
   * Stop a specific cron job
   * @param {string} jobName - Name of the job to stop
   */
  stopJob(jobName) {
    const job = this.jobs.get(jobName);
    if (job) {
      job.stop();
      this.logger.info(`Stopped cron job: ${jobName}`);
    } else {
      this.logger.warn(`Cron job not found: ${jobName}`);
    }
  }

  /**
   * Start a specific cron job
   * @param {string} jobName - Name of the job to start
   */
  startJob(jobName) {
    const job = this.jobs.get(jobName);
    if (job) {
      job.start();
      this.logger.info(`Started cron job: ${jobName}`);
    } else {
      this.logger.warn(`Cron job not found: ${jobName}`);
    }
  }

  /**
   * Stop all cron jobs
   */
  stopAllJobs() {
    this.jobs.forEach((job, name) => {
      job.stop();
      this.logger.info(`Stopped cron job: ${name}`);
    });
    this.logger.info("All cron jobs stopped");
  }

  /**
   * Get status of all cron jobs
   * @returns {Object} - Status of all jobs
   */
  getJobsStatus() {
    const status = {};
    this.jobs.forEach((job, name) => {
      status[name] = {
        running: job.running,
        scheduled: job.scheduled,
      };
    });
    return status;
  }

  /**
   * Restart a specific job
   * @param {string} jobName - Name of the job to restart
   */
  restartJob(jobName) {
    this.stopJob(jobName);
    setTimeout(() => {
      this.startJob(jobName);
    }, 1000);
  }

  /**
   * Restart all jobs
   */
  restartAllJobs() {
    this.stopAllJobs();
    setTimeout(() => {
      this.jobs.forEach((job, name) => {
        job.start();
        this.logger.info(`Restarted cron job: ${name}`);
      });
    }, 2000);
  }

  /**
   * Get cron job configuration
   * @returns {Object} - Job configurations
   */
  getJobConfigurations() {
    return {
      publication: {
        schedule: "* * * * *",
        description: "Check for blogs to publish every minute",
        timezone: process.env.SCHEDULER_TIMEZONE || "UTC",
      },
      unpublication: {
        schedule: "*/5 * * * *",
        description: "Check for blogs to unpublish every 5 minutes",
        timezone: process.env.SCHEDULER_TIMEZONE || "UTC",
      },
      cleanup: {
        schedule: "0 0 * * *",
        description: "Daily cleanup of expired schedules at midnight",
        timezone: process.env.SCHEDULER_TIMEZONE || "UTC",
      },
      healthCheck: {
        schedule: "*/30 * * * *",
        description: "Health check every 30 minutes",
        timezone: process.env.SCHEDULER_TIMEZONE || "UTC",
      },
    };
  }

  /**
   * Manually trigger a job (for testing/admin purposes)
   * @param {string} jobName - Name of the job to trigger
   * @returns {Promise<any>} - Job execution result
   */
  async triggerJob(jobName) {
    try {
      let result;
      
      switch (jobName) {
        case "publication":
          result = await blogSchedulerService.processScheduledBlogs();
          break;
        case "unpublication":
          result = await blogSchedulerService.processScheduledUnpublications();
          break;
        case "cleanup":
          result = await blogSchedulerService.cleanupExpiredSchedules();
          break;
        case "healthCheck":
          result = await blogSchedulerService.getScheduledBlogsStatus();
          break;
        default:
          throw new Error(`Unknown job: ${jobName}`);
      }

      this.logger.info(`Manually triggered job: ${jobName}`, { result });
      return result;
    } catch (error) {
      this.logger.error(`Error manually triggering job ${jobName}:`, error);
      throw error;
    }
  }

  /**
   * Graceful shutdown
   */
  shutdown() {
    this.logger.info("Shutting down blog scheduler cron jobs");
    this.stopAllJobs();
    this.jobs.clear();
    this.isInitialized = false;
    this.logger.info("Blog scheduler cron jobs shutdown complete");
  }
}

// Create singleton instance
const blogCronJobs = new BlogCronJobs();

// Handle process termination gracefully
process.on("SIGINT", () => {
  blogCronJobs.shutdown();
  process.exit(0);
});

process.on("SIGTERM", () => {
  blogCronJobs.shutdown();
  process.exit(0);
});

module.exports = blogCronJobs;