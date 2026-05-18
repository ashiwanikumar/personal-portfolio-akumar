//** Enhanced Newsletter Service for Agriculture Ministry **//
const Newsletter = require("@models/newsletter/newsletter");
// Enhanced search query builder for agriculture-specific filtering
const buildSearchQuery = ({
  searchText,
  status,
  frequency,
  dateRange,
  preferences,
  location,
  farmerProfile,
  language,
  verificationStatus,
  communicationChannel,
}) => {
  let query = {};

  // Text search across multiple fields
  if (searchText) {
    query.$or = [
      { email: { $regex: searchText, $options: "i" } },
      { phone: { $regex: searchText, $options: "i" } },
      { "name.firstName": { $regex: searchText, $options: "i" } },
      { "name.lastName": { $regex: searchText, $options: "i" } },
      { "location.village": { $regex: searchText, $options: "i" } },
      { "verification.aadhaarNumber": { $regex: searchText, $options: "i" } },
    ];
  }

  // Status filter
  if (status) {
    query.status = status;
  }

  // Communication frequency filter
  if (frequency) {
    query["communicationPrefs.emailFrequency"] = frequency;
  }

  // Date range filter
  if (dateRange) {
    const { startDate, endDate } = dateRange;
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
  }

  // Location-based filtering
  if (location) {
    if (location.state) query["location.state"] = location.state;
    if (location.district) query["location.district"] = location.district;
    if (location.pincode) query["location.pincode"] = location.pincode;
  }

  // Farmer profile filtering
  if (farmerProfile) {
    if (farmerProfile.farmerType)
      query["farmerProfile.farmerType"] = farmerProfile.farmerType;
    if (farmerProfile.crops && farmerProfile.crops.length > 0) {
      query["farmerProfile.crops.name"] = { $in: farmerProfile.crops };
    }
    if (
      farmerProfile.landSizeMin !== undefined ||
      farmerProfile.landSizeMax !== undefined
    ) {
      query["farmerProfile.landSize"] = {};
      if (farmerProfile.landSizeMin !== undefined)
        query["farmerProfile.landSize"].$gte = farmerProfile.landSizeMin;
      if (farmerProfile.landSizeMax !== undefined)
        query["farmerProfile.landSize"].$lte = farmerProfile.landSizeMax;
    }
    if (farmerProfile.hasKisanCreditCard !== undefined) {
      query["farmerProfile.hasKisanCreditCard"] =
        farmerProfile.hasKisanCreditCard;
    }
    if (farmerProfile.pmKisanBeneficiary !== undefined) {
      query["farmerProfile.pmKisanBeneficiary"] =
        farmerProfile.pmKisanBeneficiary;
    }
  }

  // Language preference filter
  if (language) {
    query["communicationPrefs.language"] = language;
  }

  // Verification status filter
  if (verificationStatus) {
    if (verificationStatus.emailVerified !== undefined) {
      query["verification.emailConfirmed"] = verificationStatus.emailVerified;
    }
    if (verificationStatus.phoneVerified !== undefined) {
      query["verification.phoneConfirmed"] = verificationStatus.phoneVerified;
    }
    if (verificationStatus.aadhaarVerified !== undefined) {
      query["verification.aadhaarVerified"] =
        verificationStatus.aadhaarVerified;
    }
  }

  // Communication channel preferences
  if (communicationChannel) {
    if (communicationChannel.smsEnabled !== undefined) {
      query["communicationPrefs.smsEnabled"] = communicationChannel.smsEnabled;
    }
  }

  // Preferences filter (enhanced for agriculture)
  if (preferences) {
    Object.entries(preferences).forEach(([key, value]) => {
      if (value !== undefined) {
        query[`preferences.${key}`] = value;
      }
    });
  }

  return query;
};

class NewsletterService {
  // Find subscriber by email
  static findSubscriberByEmail = async (email) => {
    try {
      return await Newsletter.findOne({ email: email.toLowerCase() });
    } catch (error) {
      throw error;
    }
  };

  // Find subscriber by token
  static findSubscriberByToken = async (token) => {
    try {
      return await Newsletter.findOne({ confirmationToken: token });
    } catch (error) {
      throw error;
    }
  };

  // Find subscriber by id
  static findSubscriberById = async (id) => {
    try {
      return await Newsletter.findById(id);
    } catch (error) {
      throw error;
    }
  };

  // Create new subscriber
  static createSubscriber = async (subscriberData) => {
    try {
      const subscriber = new Newsletter(subscriberData);
      return await subscriber.save();
    } catch (error) {
      throw error;
    }
  };

  // Update subscriber
  static updateSubscriber = async (subscriberId, updateData) => {
    try {
      return await Newsletter.findByIdAndUpdate(
        subscriberId,
        { $set: updateData },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  };

  // Find all subscribers paginated with advanced search and filters
  static findAllSubscribersPaginated = async (
    page,
    perPage,
    searchParams = {},
    sortOptions = { field: "createdAt", order: -1 }
  ) => {
    try {
      const searchQuery = buildSearchQuery(searchParams);
      const sortConfig = { [sortOptions.field]: sortOptions.order };

      const subscribers = await Newsletter.find(searchQuery)
        .sort(sortConfig)
        .skip((page - 1) * perPage)
        .limit(perPage);

      const total = await Newsletter.countDocuments(searchQuery);
      const totalPages = Math.ceil(total / perPage);

      return {
        subscribers,
        pagination: {
          page,
          perPage,
          total,
          totalPages,
        },
      };
    } catch (error) {
      throw error;
    }
  };

  // Get active subscribers
  static getActiveSubscribers = async () => {
    try {
      return await Newsletter.find({ status: "active", emailConfirmed: true });
    } catch (error) {
      throw error;
    }
  };

  // Get all subscribers without pagination
  static getAllSubscribers = async (searchParams = {}) => {
    try {
      const searchQuery = buildSearchQuery(searchParams);
      return await Newsletter.find(searchQuery).sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  };

  // Count all subscribers
  static countAllSubscribers = async (searchParams = {}) => {
    try {
      const searchQuery = buildSearchQuery(searchParams);
      return await Newsletter.countDocuments(searchQuery);
    } catch (error) {
      throw error;
    }
  };

  // Delete subscriber
  static deleteSubscriber = async (subscriberId) => {
    try {
      return await Newsletter.findByIdAndDelete(subscriberId);
    } catch (error) {
      throw error;
    }
  };

  // Enhanced subscription statistics for agriculture ministry
  static getSubscriptionStats = async () => {
    try {
      const stats = await Newsletter.aggregate([
        {
          $facet: {
            // Basic status distribution
            statusStats: [
              {
                $group: {
                  _id: "$status",
                  count: { $sum: 1 },
                },
              },
            ],

            // Communication frequency distribution
            frequencyStats: [
              {
                $match: { status: "active" },
              },
              {
                $group: {
                  _id: "$communicationPrefs.emailFrequency",
                  count: { $sum: 1 },
                },
              },
            ],

            // Geographic distribution
            stateStats: [
              {
                $match: { status: "active" },
              },
              {
                $group: {
                  _id: "$location.state",
                  count: { $sum: 1 },
                },
              },
              { $sort: { count: -1 } },
              { $limit: 10 },
            ],

            // Language preference distribution
            languageStats: [
              {
                $match: { status: "active" },
              },
              {
                $group: {
                  _id: "$communicationPrefs.language",
                  count: { $sum: 1 },
                },
              },
            ],

            // Farmer type distribution
            farmerTypeStats: [
              {
                $match: {
                  status: "active",
                  "farmerProfile.farmerType": { $exists: true, $ne: null },
                },
              },
              {
                $group: {
                  _id: "$farmerProfile.farmerType",
                  count: { $sum: 1 },
                  avgLandSize: { $avg: "$farmerProfile.landSize" },
                },
              },
            ],

            // Verification statistics
            verificationStats: [
              {
                $group: {
                  _id: null,
                  emailVerified: {
                    $sum: { $cond: ["$verification.emailConfirmed", 1, 0] },
                  },
                  phoneVerified: {
                    $sum: { $cond: ["$verification.phoneConfirmed", 1, 0] },
                  },
                  aadhaarVerified: {
                    $sum: { $cond: ["$verification.aadhaarVerified", 1, 0] },
                  },
                  total: { $sum: 1 },
                },
              },
            ],

            // Government scheme participation
            schemeStats: [
              {
                $match: { status: "active" },
              },
              {
                $group: {
                  _id: null,
                  pmKisanBeneficiaries: {
                    $sum: {
                      $cond: ["$farmerProfile.pmKisanBeneficiary", 1, 0],
                    },
                  },
                  kccHolders: {
                    $sum: {
                      $cond: ["$farmerProfile.hasKisanCreditCard", 1, 0],
                    },
                  },
                  smsEnabled: {
                    $sum: { $cond: ["$communicationPrefs.smsEnabled", 1, 0] },
                  },
                  total: { $sum: 1 },
                },
              },
            ],

            // Monthly growth trend
            timeStats: [
              {
                $group: {
                  _id: {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" },
                  },
                  count: { $sum: 1 },
                  verified: {
                    $sum: { $cond: ["$verification.emailConfirmed", 1, 0] },
                  },
                },
              },
              { $sort: { "_id.year": -1, "_id.month": -1 } },
              { $limit: 12 },
            ],

            // Top crops
            cropStats: [
              {
                $match: {
                  status: "active",
                  "farmerProfile.crops": { $exists: true, $ne: [] },
                },
              },
              { $unwind: "$farmerProfile.crops" },
              {
                $group: {
                  _id: "$farmerProfile.crops.name",
                  count: { $sum: 1 },
                  totalArea: { $sum: "$farmerProfile.crops.area" },
                },
              },
              { $sort: { count: -1 } },
              { $limit: 10 },
            ],
          },
        },
      ]);

      return {
        overview: {
          statusDistribution: stats[0].statusStats,
          frequencyDistribution: stats[0].frequencyStats,
          monthlyTrend: stats[0].timeStats,
        },
        geographic: {
          stateDistribution: stats[0].stateStats,
        },
        demographics: {
          languageDistribution: stats[0].languageStats,
          farmerTypeDistribution: stats[0].farmerTypeStats,
          cropDistribution: stats[0].cropStats,
        },
        verification: stats[0].verificationStats[0] || {},
        governmentSchemes: stats[0].schemeStats[0] || {},
      };
    } catch (error) {
      throw error;
    }
  };

  // Find subscribers by frequency for sending newsletters
  static findSubscribersByFrequency = async (frequency) => {
    try {
      return await Newsletter.find({
        status: "active",
        frequency,
        emailConfirmed: true,
      }).select("email preferences");
    } catch (error) {
      throw error;
    }
  };

  // Bulk update last email sent
  static updateLastEmailSent = async (subscriberIds) => {
    try {
      return await Newsletter.updateMany(
        { _id: { $in: subscriberIds } },
        { $set: { lastEmailSent: new Date() } }
      );
    } catch (error) {
      throw error;
    }
  };

  // Get subscribers by date range
  static getSubscribersByDateRange = async (startDate, endDate) => {
    try {
      return await Newsletter.find({
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      }).sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  };

  // Update subscriber preferences
  static updateSubscriberPreferences = async (subscriberId, preferences) => {
    try {
      return await Newsletter.findByIdAndUpdate(
        subscriberId,
        { $set: { preferences } },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  };

  // Update subscriber frequency
  static updateSubscriberFrequency = async (subscriberId, frequency) => {
    try {
      return await Newsletter.findByIdAndUpdate(
        subscriberId,
        { $set: { frequency } },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  };

  // =================== AGRICULTURE-SPECIFIC METHODS ===================

  // Find farmers by location and crop for targeted campaigns
  static findFarmersByLocationAndCrop = async (
    state,
    district,
    cropName,
    season = null
  ) => {
    try {
      const query = {
        "location.state": state,
        "location.district": district,
        "farmerProfile.crops.name": new RegExp(cropName, "i"),
        status: "active",
      };

      if (season) {
        query["farmerProfile.crops.season"] = season;
      }

      return await Newsletter.find(query)
        .select("email phone name location farmerProfile communicationPrefs")
        .sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  };

  // Find farmers eligible for specific government schemes
  static findFarmersEligibleForSchemes = async (
    schemeType,
    additionalCriteria = {}
  ) => {
    try {
      let query = {
        status: "active",
        "verification.emailConfirmed": true,
        ...additionalCriteria,
      };

      switch (schemeType.toLowerCase()) {
        case "pmkisan":
          query["farmerProfile.pmKisanBeneficiary"] = false;
          query["farmerProfile.farmerType"] = { $in: ["small", "marginal"] };
          break;
        case "kcc":
          query["farmerProfile.hasKisanCreditCard"] = false;
          break;
        case "crop_insurance":
          query["farmerProfile.crops"] = { $exists: true, $ne: [] };
          break;
        default:
          break;
      }

      return await Newsletter.find(query)
        .select("email phone name location farmerProfile verification")
        .sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  };

  // Get state-wise farmer distribution with crop details
  static getStateWiseFarmerDistribution = async () => {
    try {
      return await Newsletter.aggregate([
        {
          $match: { status: "active" },
        },
        {
          $group: {
            _id: "$location.state",
            totalFarmers: { $sum: 1 },
            districts: { $addToSet: "$location.district" },
            farmerTypes: { $addToSet: "$farmerProfile.farmerType" },
            crops: { $addToSet: "$farmerProfile.crops.name" },
            avgLandSize: { $avg: "$farmerProfile.landSize" },
            languages: { $addToSet: "$communicationPrefs.language" },
            verifiedFarmers: {
              $sum: { $cond: ["$verification.emailConfirmed", 1, 0] },
            },
            smsEnabledFarmers: {
              $sum: { $cond: ["$communicationPrefs.smsEnabled", 1, 0] },
            },
          },
        },
        {
          $sort: { totalFarmers: -1 },
        },
      ]);
    } catch (error) {
      throw error;
    }
  };

  // Create farmer subscription with profile validation
  static createFarmerSubscription = async (subscriptionData) => {
    try {
      // Validate required fields for farmers
      const requiredFields = ["email", "location.state", "location.district"];
      for (const field of requiredFields) {
        const fieldValue = field
          .split(".")
          .reduce((obj, key) => obj?.[key], subscriptionData);
        if (!fieldValue) {
          throw new Error(`${field} is required for farmer subscription`);
        }
      }

      // Generate verification tokens
      if (!subscriptionData.confirmationToken) {
        subscriptionData.confirmationToken = require("crypto")
          .randomBytes(32)
          .toString("hex");
      }

      // Set default communication preferences for farmers
      if (!subscriptionData.communicationPrefs) {
        subscriptionData.communicationPrefs = {
          language: "hindi",
          emailFrequency: "weekly",
          smsEnabled: false,
          contentFormat: "text",
        };
      }

      // Set default agriculture preferences
      if (!subscriptionData.preferences) {
        subscriptionData.preferences = {
          policyUpdates: true,
          schemeNotifications: true,
          subsidyAlerts: true,
          cropAdvisory: true,
          weatherAlerts: true,
          marketPrices: true,
          seasonalGuidance: true,
          emergencyAlerts: true,
          disasterManagement: true,
          pestDiseaseAlerts: true,
        };
      }

      const subscriber = new Newsletter(subscriptionData);
      return await subscriber.save();
    } catch (error) {
      throw error;
    }
  };

  // Find farmers by communication preference and language
  static findFarmersByCommPreference = async (
    language,
    frequency,
    smsEnabled = false
  ) => {
    try {
      const query = {
        status: "active",
        "communicationPrefs.language": language,
        "communicationPrefs.emailFrequency": frequency,
        "verification.emailConfirmed": true,
      };

      if (smsEnabled) {
        query["communicationPrefs.smsEnabled"] = true;
        query["verification.phoneConfirmed"] = true;
      }

      return await Newsletter.find(query)
        .select("email phone name location communicationPrefs preferences")
        .sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  };

  // Get crop-wise farmer analytics
  static getCropWiseAnalytics = async () => {
    try {
      return await Newsletter.aggregate([
        {
          $match: {
            status: "active",
            "farmerProfile.crops": { $exists: true, $ne: [] },
          },
        },
        { $unwind: "$farmerProfile.crops" },
        {
          $group: {
            _id: {
              crop: "$farmerProfile.crops.name",
              season: "$farmerProfile.crops.season",
              state: "$location.state",
            },
            farmerCount: { $sum: 1 },
            totalArea: { $sum: "$farmerProfile.crops.area" },
            avgArea: { $avg: "$farmerProfile.crops.area" },
            farmers: {
              $push: {
                email: "$email",
                district: "$location.district",
                farmerType: "$farmerProfile.farmerType",
              },
            },
          },
        },
        {
          $group: {
            _id: "$_id.crop",
            totalFarmers: { $sum: "$farmerCount" },
            totalCultivatedArea: { $sum: "$totalArea" },
            seasonalData: {
              $push: {
                season: "$_id.season",
                state: "$_id.state",
                farmers: "$farmerCount",
                area: "$totalArea",
              },
            },
          },
        },
        {
          $sort: { totalFarmers: -1 },
        },
      ]);
    } catch (error) {
      throw error;
    }
  };

  // Update farmer profile with agricultural data
  static updateFarmerProfile = async (subscriberId, profileData) => {
    try {
      // Validate crop data if provided
      if (profileData.crops) {
        profileData.crops.forEach((crop) => {
          if (!crop.name || !crop.season) {
            throw new Error("Crop name and season are required");
          }
        });
      }

      return await Newsletter.findByIdAndUpdate(
        subscriberId,
        {
          $set: {
            farmerProfile: profileData,
            "admin.lastModified": new Date(),
          },
        },
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw error;
    }
  };

  // Bulk update communication preferences by criteria
  static bulkUpdateCommPreferences = async (criteria, updates) => {
    try {
      const query = buildSearchQuery(criteria);

      return await Newsletter.updateMany(query, {
        $set: {
          ...Object.keys(updates).reduce((acc, key) => {
            acc[`communicationPrefs.${key}`] = updates[key];
            return acc;
          }, {}),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      throw error;
    }
  };

  // Get farmers requiring immediate attention (unverified, incomplete profiles)
  static getFarmersRequiringAttention = async () => {
    try {
      return await Newsletter.aggregate([
        {
          $match: { status: "active" },
        },
        {
          $addFields: {
            hasIncompleteProfile: {
              $or: [
                { $eq: ["$verification.emailConfirmed", false] },
                { $eq: ["$verification.phoneConfirmed", false] },
                { $not: { $ifNull: ["$farmerProfile.farmerType", false] } },
                {
                  $eq: [
                    { $size: { $ifNull: ["$farmerProfile.crops", []] } },
                    0,
                  ],
                },
                { $not: { $ifNull: ["$location.district", false] } },
              ],
            },
          },
        },
        {
          $match: { hasIncompleteProfile: true },
        },
        {
          $group: {
            _id: "$location.state",
            count: { $sum: 1 },
            farmers: {
              $push: {
                email: "$email",
                phone: "$phone",
                district: "$location.district",
                issues: {
                  emailUnverified: { $not: "$verification.emailConfirmed" },
                  phoneUnverified: { $not: "$verification.phoneConfirmed" },
                  missingFarmerType: {
                    $not: { $ifNull: ["$farmerProfile.farmerType", false] },
                  },
                  noCrops: {
                    $eq: [
                      { $size: { $ifNull: ["$farmerProfile.crops", []] } },
                      0,
                    ],
                  },
                  missingDistrict: {
                    $not: { $ifNull: ["$location.district", false] },
                  },
                },
              },
            },
          },
        },
        {
          $sort: { count: -1 },
        },
      ]);
    } catch (error) {
      throw error;
    }
  };

  // Export farmers data for government reporting
  static exportFarmersForReporting = async (criteria = {}, format = "json") => {
    try {
      const query = buildSearchQuery(criteria);

      const farmers = await Newsletter.find(query)
        .select({
          email: 1,
          phone: 1,
          name: 1,
          location: 1,
          farmerProfile: 1,
          communicationPrefs: 1,
          verification: 1,
          createdAt: 1,
          updatedAt: 1,
        })
        .sort({ createdAt: -1 });

      if (format === "csv") {
        // Convert to CSV format for government reporting
        const csvData = farmers.map((farmer) => ({
          Email: farmer.email,
          Phone: farmer.phone || "",
          FirstName: farmer.name?.firstName || "",
          LastName: farmer.name?.lastName || "",
          State: farmer.location?.state || "",
          District: farmer.location?.district || "",
          Village: farmer.location?.village || "",
          Pincode: farmer.location?.pincode || "",
          FarmerType: farmer.farmerProfile?.farmerType || "",
          LandSize: farmer.farmerProfile?.landSize || 0,
          Crops:
            farmer.farmerProfile?.crops?.map((c) => c.name).join("; ") || "",
          HasKCC: farmer.farmerProfile?.hasKisanCreditCard ? "Yes" : "No",
          PMKisanBeneficiary: farmer.farmerProfile?.pmKisanBeneficiary
            ? "Yes"
            : "No",
          Language: farmer.communicationPrefs?.language || "",
          EmailVerified: farmer.verification?.emailConfirmed ? "Yes" : "No",
          PhoneVerified: farmer.verification?.phoneConfirmed ? "Yes" : "No",
          RegistrationDate: farmer.createdAt?.toISOString().split("T")[0] || "",
        }));

        return csvData;
      }

      return farmers;
    } catch (error) {
      throw error;
    }
  };
}

module.exports = NewsletterService;
