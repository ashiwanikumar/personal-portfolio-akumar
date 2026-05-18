const mongoose = require("mongoose");
const ActivityLog = require("../models/gallerySection/gallerySectionActivityLog");

/**
 * Clear all activity logs (for testing/development purposes)
 */
const clearActivityLogs = async () => {
  try {
    console.log("🧹 Clearing all activity logs...");

    const result = await ActivityLog.deleteMany({});
    console.log(`✅ Successfully cleared ${result.deletedCount} activity logs`);

    return result;
  } catch (error) {
    console.error("❌ Error clearing activity logs:", error);
    throw error;
  }
};

module.exports = { clearActivityLogs };

// If run directly, execute clearing
if (require.main === module) {
  const connectDB = async () => {
    try {
      await mongoose.connect(
        process.env.MONGODB_URI || "mongodb://localhost:27017/ssc-website",
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }
      );
      console.log("📊 Connected to MongoDB");

      await clearActivityLogs();

      console.log("🎉 Activity logs clearing completed");
      process.exit(0);
    } catch (error) {
      console.error("❌ Database connection error:", error);
      process.exit(1);
    }
  };

  connectDB();
}
