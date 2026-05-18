// ** PACKAGES ** //
const mongoose = require("mongoose");

// ** MODELS ** //
const User = require("@models/user/user");

// ** MIDDLEWARES ** //
const { 
  deleteProfilePictureWithCacheInvalidation,
  extractS3KeyFromProfilePictureUrl 
} = require("@middlewares/profilePictureMulter");

// ** UTILS ** //
const { logSecurityEvent } = require("@middlewares/multer");

/**********************************
  Upload/Update Profile Picture
***********************************/
exports.uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    // Check if file was uploaded (middleware handles the upload)
    if (!req.profilePictureUpload) {
      return res.status(400).json({
        success: false,
        message: "No profile picture file was uploaded",
      });
    }

    // Get user from database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete old profile picture if it exists
    if (user.profilePicture && user.profilePicture.s3Key) {
      try {
        await deleteProfilePictureWithCacheInvalidation(user.profilePicture.s3Key);
        console.log("✅ Old profile picture deleted:", user.profilePicture.s3Key);
      } catch (deleteError) {
        console.warn("⚠️ Failed to delete old profile picture:", deleteError.message);
        // Don't fail the upload if old image deletion fails
      }
    }

    // Update user with new profile picture information
    const profilePictureData = {
      url: req.profilePictureUpload.signedUrl,
      cloudFrontUrl: req.profilePictureUpload.cloudFrontUrl,
      s3Url: req.profilePictureUpload.s3Url,
      s3Key: req.profilePictureUpload.s3Key,
      originalName: req.profilePictureUpload.originalName,
      originalSize: req.profilePictureUpload.originalSize,
      processedSize: req.profilePictureUpload.processedSize,
      mimetype: req.profilePictureUpload.mimetype,
      dimensions: req.profilePictureUpload.dimensions,
      uploadedAt: req.profilePictureUpload.uploadedAt,
    };

    user.profilePicture = profilePictureData;
    await user.save();

    logSecurityEvent("PROFILE_PICTURE_UPDATE_SUCCESS", {
      userId: userId,
      s3Key: req.profilePictureUpload.s3Key,
      originalSize: req.profilePictureUpload.originalSize,
      processedSize: req.profilePictureUpload.processedSize,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully",
      data: {
        profilePicture: profilePictureData,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profilePicture: profilePictureData
        }
      },
    });

  } catch (error) {
    console.error("Error uploading profile picture:", error);

    logSecurityEvent("PROFILE_PICTURE_UPDATE_ERROR", {
      error: error.message,
      userId: req.user._id || req.user.id,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
    });

    res.status(500).json({
      success: false,
      message: "Failed to upload profile picture",
      error: error.message,
    });
  }
};

/**********************************
  Get Current User Profile Picture
***********************************/
exports.getProfilePicture = async (req, res) => {
  try {
    // For debug route without authentication, return a test response
    if (!req.user) {
      return res.status(200).json({
        success: true,
        message: "Debug: Profile picture endpoint is working",
        debug: true,
        data: {
          profilePicture: null,
          user: {
            id: "debug-user",
            name: "Debug User",
            email: "debug@example.com",
          }
        },
      });
    }

    const userId = req.user._id || req.user.id;

    const user = await User.findById(userId).select('profilePicture name email');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile picture retrieved successfully",
      data: {
        profilePicture: user.profilePicture || null,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        }
      },
    });

  } catch (error) {
    console.error("Error retrieving profile picture:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve profile picture",
      error: error.message,
    });
  }
};

/**********************************
  Delete Profile Picture
***********************************/
exports.deleteProfilePicture = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    // Get user from database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user has a profile picture
    if (!user.profilePicture || !user.profilePicture.s3Key) {
      return res.status(400).json({
        success: false,
        message: "No profile picture to delete",
      });
    }

    // Delete from S3 and CloudFront
    try {
      await deleteProfilePictureWithCacheInvalidation(user.profilePicture.s3Key);
      console.log("✅ Profile picture deleted from S3:", user.profilePicture.s3Key);
    } catch (deleteError) {
      console.error("❌ Failed to delete profile picture from S3:", deleteError.message);
      // Continue with database update even if S3 deletion fails
    }

    // Remove profile picture from user document
    const oldProfilePicture = user.profilePicture;
    user.profilePicture = null;
    await user.save();

    logSecurityEvent("PROFILE_PICTURE_DELETE_SUCCESS", {
      userId: userId,
      deletedS3Key: oldProfilePicture.s3Key,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      success: true,
      message: "Profile picture deleted successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profilePicture: null
        }
      },
    });

  } catch (error) {
    console.error("Error deleting profile picture:", error);

    logSecurityEvent("PROFILE_PICTURE_DELETE_ERROR", {
      error: error.message,
      userId: req.user._id || req.user.id,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
    });

    res.status(500).json({
      success: false,
      message: "Failed to delete profile picture",
      error: error.message,
    });
  }
};

/**********************************
  Get User Profile Picture by ID (Admin only)
***********************************/
exports.getUserProfilePicture = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(userId).select('profilePicture name email role');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User profile picture retrieved successfully",
      data: {
        profilePicture: user.profilePicture || null,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    });

  } catch (error) {
    console.error("Error retrieving user profile picture:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve user profile picture",
      error: error.message,
    });
  }
};

/**********************************
  Get Profile Picture Statistics (Admin only)
***********************************/
exports.getProfilePictureStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          usersWithProfilePictures: {
            $sum: {
              $cond: [
                { $ne: ["$profilePicture", null] },
                1,
                0
              ]
            }
          },
          totalProfilePictureSize: {
            $sum: {
              $cond: [
                { $ne: ["$profilePicture", null] },
                "$profilePicture.processedSize",
                0
              ]
            }
          },
          averageFileSize: {
            $avg: {
              $cond: [
                { $ne: ["$profilePicture", null] },
                "$profilePicture.processedSize",
                null
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalUsers: 1,
          usersWithProfilePictures: 1,
          usersWithoutProfilePictures: {
            $subtract: ["$totalUsers", "$usersWithProfilePictures"]
          },
          profilePicturePercentage: {
            $multiply: [
              { $divide: ["$usersWithProfilePictures", "$totalUsers"] },
              100
            ]
          },
          totalProfilePictureSize: 1,
          averageFileSize: { $round: ["$averageFileSize", 0] },
          totalSizeInMB: {
            $round: [{ $divide: ["$totalProfilePictureSize", 1048576] }, 2]
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalUsers: 0,
      usersWithProfilePictures: 0,
      usersWithoutProfilePictures: 0,
      profilePicturePercentage: 0,
      totalProfilePictureSize: 0,
      averageFileSize: 0,
      totalSizeInMB: 0
    };

    res.status(200).json({
      success: true,
      message: "Profile picture statistics retrieved successfully",
      data: result,
    });

  } catch (error) {
    console.error("Error retrieving profile picture statistics:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve profile picture statistics",
      error: error.message,
    });
  }
};

/**********************************
  Bulk Delete Profile Pictures (Super Admin only)
***********************************/
exports.bulkDeleteProfilePictures = async (req, res) => {
  try {
    const { userIds } = req.body;

    // Validate input
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "userIds must be a non-empty array",
      });
    }

    // Validate all user IDs
    const invalidIds = userIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid user IDs found",
        invalidIds: invalidIds,
      });
    }

    // Get users with profile pictures
    const users = await User.find({
      _id: { $in: userIds },
      profilePicture: { $ne: null }
    }).select('profilePicture name email');

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No users found with profile pictures",
      });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [],
      deletedUsers: []
    };

    // Process deletions
    for (const user of users) {
      try {
        if (user.profilePicture && user.profilePicture.s3Key) {
          // Delete from S3
          await deleteProfilePictureWithCacheInvalidation(user.profilePicture.s3Key);
          
          // Update user document
          user.profilePicture = null;
          await user.save();

          results.success++;
          results.deletedUsers.push({
            userId: user._id,
            name: user.name,
            email: user.email
          });
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          userId: user._id,
          error: error.message
        });
        console.error(`Failed to delete profile picture for user ${user._id}:`, error);
      }
    }

    logSecurityEvent("PROFILE_PICTURE_BULK_DELETE", {
      requestedCount: userIds.length,
      foundUsers: users.length,
      successCount: results.success,
      failedCount: results.failed,
      adminUserId: req.user._id || req.user.id,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      success: true,
      message: `Bulk delete completed: ${results.success} successful, ${results.failed} failed`,
      data: results,
    });

  } catch (error) {
    console.error("Error in bulk delete profile pictures:", error);

    logSecurityEvent("PROFILE_PICTURE_BULK_DELETE_ERROR", {
      error: error.message,
      adminUserId: req.user._id || req.user.id,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
    });

    res.status(500).json({
      success: false,
      message: "Failed to bulk delete profile pictures",
      error: error.message,
    });
  }
};