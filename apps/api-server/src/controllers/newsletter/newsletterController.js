// ** SERVICES ** //
const NewsletterService = require("@services/newsletter/newsletterService");
const NewsletterEmailService = require("@services/newsletter/newsletterEmailService");
const GeoLocationService = require("@utils/technical-info-collector/geoLocationService");
const { v4: uuidv4 } = require("uuid");

/**********************************
  Public Newsletter Subscription
***********************************/
exports.subscribeToNewsletter = async (req, res) => {
  try {
    const {
      email,
      name,
      interests,
      phone,
      location,
      farmerProfile,
      screenWidth,
      screenHeight,
    } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
        status: "error",
      });
    }

    // Check if email already exists
    const existingSubscriber = await NewsletterService.findSubscriberByEmail(
      email
    );
    if (existingSubscriber) {
      return res.status(409).json({
        message: "Email already subscribed",
        status: "error",
      });
    }

    // Collect device and geolocation information in background
    let deviceAndLocationInfo = null;
    try {
      deviceAndLocationInfo = await GeoLocationService.getDeviceAndLocationInfo(
        req
      );

      // Update screen info if provided from frontend
      if (screenWidth && screenHeight) {
        deviceAndLocationInfo.deviceInfo = GeoLocationService.updateScreenInfo(
          deviceAndLocationInfo.deviceInfo,
          screenWidth,
          screenHeight
        );
      }
    } catch (geoError) {
      console.warn("Failed to collect geolocation data:", geoError.message);
      // Continue with subscription even if geolocation fails
    }

    // Map interests to preferences
    const preferences = {
      policyUpdates: interests?.includes("agricultural-policies") || false,
      schemeNotifications: interests?.includes("farmer-welfare") || false,
      subsidyAlerts: interests?.includes("government-initiatives") || false,
      cropAdvisory: interests?.includes("agricultural-policies") || false,
      weatherAlerts: interests?.includes("agricultural-policies") || false,
      marketPrices: interests?.includes("market-updates") || false,
      seasonalGuidance: interests?.includes("agricultural-policies") || false,
      modernTechniques: interests?.includes("technology-innovation") || false,
      trainingPrograms: interests?.includes("events-announcements") || false,
      digitalizationUpdates:
        interests?.includes("technology-innovation") || false,
      emergencyAlerts: true,
      disasterManagement: true,
      pestDiseaseAlerts: interests?.includes("agricultural-policies") || false,
    };

    // Prepare subscription data
    const subscriptionData = {
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || null,
      name: {
        firstName: name?.trim() || "",
        lastName: "",
      },
      location: location || {
        state: "Unknown",
        district: "Unknown",
      },
      farmerProfile: farmerProfile || {},
      preferences,
      communicationPrefs: {
        emailFrequency: "weekly",
        smsEnabled: false,
        language: "english",
        contentFormat: "text",
      },
      verification: {
        emailConfirmed: false,
        phoneConfirmed: false,
        dataProcessingConsent: true,
      },
      status: "active",
      subscribedAt: new Date(),
      lastEmailSent: null,
      emailOpenCount: 0,
      emailClickCount: 0,
      // Add device and geolocation information if collected
      ...(deviceAndLocationInfo && {
        deviceInfo: deviceAndLocationInfo.deviceInfo,
        geoLocation: deviceAndLocationInfo.geoLocation,
      }),
    };

    // Create subscriber using the enhanced farmer subscription method
    const newSubscriber = await NewsletterService.createFarmerSubscription(
      subscriptionData
    );

    // Send confirmation email
    try {
      const emailSent = await NewsletterEmailService.sendConfirmationEmail(
        newSubscriber
      );
      if (emailSent) {
        console.log(
          `Confirmation email sent successfully to ${newSubscriber.email}`
        );
      } else {
        console.warn(
          `Failed to send confirmation email to ${newSubscriber.email}, but subscription was successful`
        );
      }
    } catch (emailError) {
      console.error(
        `Error sending confirmation email to ${newSubscriber.email}:`,
        emailError
      );
      // Don't fail the subscription if email fails - log and continue
    }

    res.status(201).json({
      message: "Successfully subscribed to newsletter",
      status: "success",
      subscriber: {
        id: newSubscriber._id,
        email: newSubscriber.email,
        name: newSubscriber.name,
        preferences: newSubscriber.preferences,
      },
    });
  } catch (error) {
    console.log("NEWSLETTER_SUBSCRIPTION_ERROR", error);
    res.status(500).json({
      message: "Error subscribing to newsletter",
      status: "error",
    });
  }
};

/**********************************
  Get all subscribers paginated
***********************************/
exports.getAllSubscribers = async (req, res) => {
  try {
    const { page = 1, perPage = 10 } = req.query;

    const subscribers = await NewsletterService.findAllSubscribersPaginated(
      parseInt(page),
      parseInt(perPage)
    );

    const totalSubscribers = await NewsletterService.countAllSubscribers();
    const totalPages = Math.ceil(totalSubscribers / perPage);

    const pagination = {
      page: parseInt(page),
      perPage: parseInt(perPage),
      totalSubscribers,
      totalPages,
    };

    res.status(200).json({
      subscribers,
      paginationData: pagination,
    });
  } catch (error) {
    console.log("GET_ALL_SUBSCRIBERS_ERROR", error);
    res.status(500).json({
      message: "Error fetching subscribers",
      status: "error",
    });
  }
};

/**********************************
  Search subscribers with pagination
***********************************/
exports.searchSubscribers = async (req, res) => {
  try {
    const {
      page = 1,
      perPage = 10,
      searchText,
      status,
      frequency,
      dateRange,
      preferences,
      sortField = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const searchParams = {
      searchText,
      status,
      frequency,
      dateRange: dateRange ? JSON.parse(dateRange) : undefined,
      preferences: preferences ? JSON.parse(preferences) : undefined,
    };

    const sortOptions = {
      field: sortField,
      order: sortOrder === "desc" ? -1 : 1,
    };

    const result = await NewsletterService.findAllSubscribersPaginated(
      parseInt(page),
      parseInt(perPage),
      searchParams,
      sortOptions
    );

    res.status(200).json({
      subscribers: result.subscribers,
      paginationData: result.pagination,
      searchParams,
    });
  } catch (error) {
    console.log("SEARCH_SUBSCRIBERS_ERROR", error);
    res.status(500).json({
      message: "Error searching subscribers",
      status: "error",
    });
  }
};

/**********************************
  Get subscriber by ID
***********************************/
exports.getSubscriberById = async (req, res) => {
  try {
    const { id } = req.params;
    const subscriber = await NewsletterService.findSubscriberById(id);

    if (!subscriber) {
      return res.status(404).json({
        message: "Subscriber not found",
        status: "error",
      });
    }

    res.status(200).json({
      subscriber,
      status: "success",
    });
  } catch (error) {
    console.log("GET_SUBSCRIBER_ERROR", error);
    res.status(500).json({
      message: "Error fetching subscriber",
      status: "error",
    });
  }
};

/**********************************
  Update subscriber preferences
***********************************/
exports.updateSubscriberPreferences = async (req, res) => {
  try {
    const { id } = req.params;
    const { preferences, frequency } = req.body;

    const updatedSubscriber = await NewsletterService.updateSubscriber(id, {
      preferences,
      frequency,
    });

    if (!updatedSubscriber) {
      return res.status(404).json({
        message: "Subscriber not found",
        status: "error",
      });
    }

    res.status(200).json({
      subscriber: updatedSubscriber,
      message: "Preferences updated successfully",
      status: "success",
    });
  } catch (error) {
    console.log("UPDATE_SUBSCRIBER_PREFERENCES_ERROR", error);
    res.status(500).json({
      message: "Error updating subscriber preferences",
      status: "error",
    });
  }
};

/**********************************
  Get subscribers paginated (Admin)
***********************************/
exports.getSubscribersPaginated = async (req, res) => {
  try {
    const { page = 1, perPage = 10, searchText, status } = req.query;

    const searchParams = { searchText, status };

    const subscribers = await NewsletterService.findAllSubscribersPaginated(
      parseInt(page),
      parseInt(perPage),
      searchParams
    );

    const totalSubscribers = await NewsletterService.countAllSubscribers(
      searchParams
    );
    const totalPages = Math.ceil(totalSubscribers / perPage);

    const pagination = {
      page: parseInt(page),
      perPage: parseInt(perPage),
      totalSubscribers,
      totalPages,
    };

    res.status(200).json({
      subscribers,
      paginationData: pagination,
    });
  } catch (error) {
    console.log("GET_SUBSCRIBERS_PAGINATED_ERROR", error);
    res.status(500).json({
      message: "Error fetching subscribers",
      status: "error",
    });
  }
};

/**********************************
  Get filtered subscribers
***********************************/
exports.getSubscribersFiltered = async (req, res) => {
  try {
    const {
      page = 1,
      perPage = 10,
      status,
      frequency,
      dateFrom,
      dateTo,
      preferences,
      sortField = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filterParams = {
      status,
      frequency,
      dateRange: {
        startDate: dateFrom,
        endDate: dateTo,
      },
      preferences: preferences ? JSON.parse(preferences) : undefined,
    };

    const sortOptions = {
      field: sortField,
      order: sortOrder === "desc" ? -1 : 1,
    };

    const { subscribers, pagination } =
      await NewsletterService.findAllSubscribersPaginated(
        parseInt(page),
        parseInt(perPage),
        filterParams,
        sortOptions
      );

    res.status(200).json({
      subscribers,
      paginationData: pagination,
      filterParams,
    });
  } catch (error) {
    console.log("GET_FILTERED_SUBSCRIBERS_ERROR", error);
    res.status(500).json({
      message: "Error fetching filtered subscribers",
      status: "error",
    });
  }
};

/**********************************
  Delete subscriber
***********************************/
exports.deleteSubscriber = async (req, res) => {
  try {
    const { id } = req.params;
    const subscriber = await NewsletterService.deleteSubscriber(id);

    if (!subscriber) {
      return res.status(404).json({
        message: "Subscriber not found",
        status: "error",
      });
    }

    res.status(200).json({
      message: "Subscriber deleted successfully",
      status: "success",
    });
  } catch (error) {
    console.log("DELETE_SUBSCRIBER_ERROR", error);
    res.status(500).json({
      message: "Error deleting subscriber",
      status: "error",
    });
  }
};

/**********************************
  Get subscriber statistics
***********************************/
exports.getSubscriberStats = async (req, res) => {
  try {
    const stats = await NewsletterService.getSubscriptionStats();

    res.status(200).json({
      stats,
      status: "success",
    });
  } catch (error) {
    console.log("GET_SUBSCRIBER_STATS_ERROR", error);
    res.status(500).json({
      message: "Error fetching subscription statistics",
      status: "error",
    });
  }
};

/**********************************
  Send test newsletter email
***********************************/
exports.sendTestNewsletterEmail = async (req, res) => {
  try {
    const { testEmail } = req.body;

    if (!testEmail) {
      return res.status(400).json({
        message: "Test email address is required",
        status: "error",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      return res.status(400).json({
        message: "Invalid email format",
        status: "error",
      });
    }

    const emailSent = await NewsletterEmailService.sendTestEmail(testEmail);

    if (emailSent) {
      res.status(200).json({
        message: "Test email sent successfully",
        status: "success",
        sentTo: testEmail,
      });
    } else {
      res.status(500).json({
        message: "Failed to send test email",
        status: "error",
      });
    }
  } catch (error) {
    console.log("SEND_TEST_EMAIL_ERROR", error);
    res.status(500).json({
      message: "Error sending test email",
      status: "error",
    });
  }
};
