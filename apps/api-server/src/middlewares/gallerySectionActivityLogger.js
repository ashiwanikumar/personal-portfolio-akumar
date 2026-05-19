const ActivityLog = require("../models/gallerySection/gallerySectionActivityLog");
const User = require("../models/user/user");

/**
 * Middleware to automatically log user activities
 */
const logActivity = (activityType, options = {}) => {
  return async (req, res, next) => {
    // Store original res.json to intercept response
    const originalJson = res.json;

    res.json = function (data) {
      // Only log if the request was successful (status < 400)
      if (res.statusCode < 400) {
        // Run activity logging in background (don't block response)
        setImmediate(async () => {
          try {
            // Get user info from request (added by auth middleware)
            const tokenUser = req.user;
            if (!tokenUser) {
              console.warn("ActivityLogger: No user found in request");
              return;
            }

            // Get user ID - handle both _id and id fields
            const userId = tokenUser._id || tokenUser.id;
            if (!userId) {
              console.warn("ActivityLogger: No user ID found", {
                user: tokenUser,
              });
              return;
            }

            let userName, userRole;

            // If user data is minimal (only ID), fetch full user data from database
            if (!tokenUser.name && !tokenUser.email && !tokenUser.role) {
              try {
                const fullUser = await User.findById(userId)
                  .populate("roleInfo")
                  .lean();
                if (fullUser) {
                  userName =
                    fullUser.name ||
                    fullUser.email ||
                    fullUser.username ||
                    `User_${userId}`;
                  // Check both legacy role field and new role system
                  let roleFromDb =
                    fullUser.role ||
                    (fullUser.roleInfo && fullUser.roleInfo.name) ||
                    "user";

                  // Map role names to standardized values for activity logs
                  const roleMap = {
                    "Super Admin": "superadmin",
                    Admin: "admin",
                    "Content Manager": "admin",
                    "Marketing Admin": "marketingadmin",
                    Moderator: "moderator",
                    User: "user",
                    Member: "member",
                  };

                  userRole =
                    roleMap[roleFromDb] || roleFromDb.toLowerCase() || "user";

                  console.log(
                    `ActivityLogger: Fetched user data for ${userName} (${userRole})`
                  );
                } else {
                  userName = `User_${userId}`;
                  userRole = "user";
                  console.warn("ActivityLogger: User not found in database", {
                    userId,
                  });
                }
              } catch (dbError) {
                console.error(
                  "ActivityLogger: Error fetching user data",
                  dbError
                );
                userName = `User_${userId}`;
                userRole = "user";
              }
            } else {
              // Use data from token
              userName =
                tokenUser.name ||
                tokenUser.email ||
                tokenUser.username ||
                `User_${userId}`;
              userRole = tokenUser.role || "user";

              console.log(
                `ActivityLogger: Using token data for ${userName} (${userRole})`
              );
            }

            // Validate userRole against enum values
            const validRoles = [
              "superadmin",
              "admin",
              "moderator",
              "user",
              "member",
              "marketingadmin",
            ];
            const normalizedRole = validRoles.includes(userRole)
              ? userRole
              : "user";

            // Log user identification (minimal logging)
            console.log(
              `ActivityLogger: ${userName} (${normalizedRole}) - ${req.method} ${req.originalUrl}`
            );

            // Get client info
            const ipAddress =
              req.ip ||
              req.connection.remoteAddress ||
              req.headers["x-forwarded-for"];
            const userAgent = req.headers["user-agent"];

            // Extract target information from request
            let targetId = req.params.id || req.body.id || req.body._id;
            let targetName =
              req.body.title || req.body.name || req.body.originalName;
            let mediaType = req.body.mediaType || req.body.type;

            // Extract from response data if not in request
            if (data && data.data) {
              if (!targetId) targetId = data.data._id || data.data.id;
              if (!targetName)
                targetName =
                  data.data.title || data.data.name || data.data.originalName;
              if (!mediaType) mediaType = data.data.mediaType || data.data.type;
            }

            // Determine target type based on URL
            let targetType = "system";
            if (req.originalUrl.includes("/gallery/")) {
              if (
                req.originalUrl.includes("/category") ||
                req.originalUrl.includes("/categories")
              ) {
                targetType = "category";
              } else if (req.originalUrl.includes("/tag")) {
                targetType = "tag";
              } else if (req.originalUrl.includes("/archive")) {
                targetType = "archive";
              } else if (
                req.originalUrl.includes("/analytics") ||
                req.originalUrl.includes("/activity-logs")
              ) {
                targetType = "analytics";
              } else {
                targetType = "media";
              }
            }

            // Determine the final activity type - prefer specific over generic
            const specificActivityType = getActionFromMethod(
              req.method,
              req.originalUrl
            );

            // Skip logging if the specific activity type is null (e.g., regular GET requests)
            if (specificActivityType === null) {
              return;
            }

            const finalActivityType = (() => {
              const genericActivityType = options.activityType || activityType;

              // Use specific activity type if it's different from the method default
              if (
                specificActivityType &&
                specificActivityType !== req.method.toLowerCase()
              ) {
                return specificActivityType;
              }
              // Fall back to generic activity type
              return genericActivityType;
            })();

            // Create activity log with enhanced debugging
            const logData = {
              userId: userId,
              userName: userName,
              userRole: normalizedRole,
              activityType: finalActivityType,
              action:
                options.action ||
                getActionFromMethod(req.method, req.originalUrl),
              targetType: options.targetType || targetType,
              targetId: targetId || undefined,
              targetName: targetName || undefined,
              mediaType: mediaType || undefined,
              details: {
                method: req.method,
                url: req.originalUrl,
                params: req.params,
                query: req.query,
                ...options.details,
              },
              ipAddress,
              userAgent,
              method: req.method,
              url: req.originalUrl,
              status: "success",
            };

            await ActivityLog.createLog(logData);
          } catch (error) {
            console.error("Activity logging error:", error.message);
            // Don't throw error - logging should not break the main request
          }
        });
      }

      // Call original res.json
      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Helper function to determine action from HTTP method and URL
 */
const getActionFromMethod = (method, url) => {
  const urlLower = url.toLowerCase();

  switch (method) {
    case "GET":
      // Only log meaningful GET operations, not regular views
      if (urlLower.includes("/download")) return "download_logs";
      // Skip tracking regular view operations
      return null;

    case "POST":
      if (urlLower.includes("/upload")) return "upload_media";
      if (urlLower.includes("/track")) return "track_activity";
      if (urlLower.includes("/bulk") && urlLower.includes("/tag"))
        return "bulk_create_tags";
      if (urlLower.includes("/category")) return "create_category";
      if (urlLower.includes("/tag")) return "create_tag";
      if (urlLower.includes("/media") || urlLower.includes("/image"))
        return "create_media";
      return "create";

    case "PUT":
    case "PATCH":
      if (urlLower.includes("/approval")) return "approve_media";
      if (urlLower.includes("/featured")) return "feature_media";
      if (urlLower.includes("/archive")) return "archive_media";
      if (urlLower.includes("/restore") || urlLower.includes("/unarchive"))
        return "restore_media";
      if (urlLower.includes("/toggle-status")) return "toggle_tag_status";
      if (urlLower.includes("/bulk") && urlLower.includes("/tag"))
        return "bulk_edit_tags";
      if (urlLower.includes("/category")) return "edit_category";
      if (urlLower.includes("/tag")) return "edit_tag";
      if (urlLower.includes("/media") || urlLower.includes("/image"))
        return "edit_media";
      return "edit";

    case "DELETE":
      if (urlLower.includes("/bulk") && urlLower.includes("/tag"))
        return "bulk_delete_tags";
      if (
        urlLower.includes("/bulk") &&
        (urlLower.includes("/media") || urlLower.includes("/image"))
      )
        return "bulk_delete_media";
      if (urlLower.includes("/media") || urlLower.includes("/image"))
        return "delete_media";
      if (urlLower.includes("/category")) return "delete_category";
      if (urlLower.includes("/tag")) return "delete_tag";
      return "delete";

    default:
      return method.toLowerCase();
  }
};

/**
 * Specific activity loggers for common actions
 */
const logMediaUpload = logActivity("upload_media", { targetType: "media" });
const logMediaApproval = logActivity("approve_media", { targetType: "media" });
const logMediaEdit = logActivity("edit_media", { targetType: "media" });
const logMediaDelete = logActivity("delete_media", { targetType: "media" });
const logCategoryAction = logActivity("category_action", {
  targetType: "category",
});
const logTagAction = logActivity("tag_action", { targetType: "tag" });

module.exports = {
  logActivity,
  logMediaUpload,
  logMediaApproval,
  logMediaEdit,
  logMediaDelete,
  logCategoryAction,
  logTagAction,
};
