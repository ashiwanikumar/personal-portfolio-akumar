const mongoose = require("mongoose");
// ** SERVICES ** //
const AbuseComplaintService = require("@services/abuse-complaint/abuseComplaintService");
const AbuseComplaintEmailService = require("@services/abuse-complaint/abuseComplaintEmailService");
const {
  collectAdvancedTechnicalInfo,
} = require("@utils/technical-info-collector/technicalInfoCollector");
const GeoLocationService = require("@utils/technical-info-collector/geoLocationService");
const { verifyTurnstileToken } = require("@utils/turnstileVerification");
const logger = require("@utils/logger");

/**********************************
  Submit abuse complaint (Public)
***********************************/
exports.submitComplaint = async (req, res) => {
  try {
    const {
      abuseType,
      abuseMedium,
      reporter,
      comments,
      evidenceUrls,
      deviceInfo: clientDeviceInfo,
      turnstileToken,
    } = req.body;

    // Validate required fields
    if (
      !abuseType ||
      !abuseMedium ||
      !reporter ||
      !reporter.firstName ||
      !reporter.email
    ) {
      return res.status(400).json({
        message:
          "Required fields: abuseType, abuseMedium, reporter (firstName, email)",
        status: "error",
      });
    }

    // Verify Turnstile token
    if (!turnstileToken) {
      return res.status(400).json({
        message: "Security verification is required",
        status: "error",
      });
    }

    console.log("Verifying Turnstile token...");
    const turnstileResult = await verifyTurnstileToken(turnstileToken, req.ip);

    if (!turnstileResult.success) {
      console.error("Turnstile verification failed:", turnstileResult);
      return res.status(400).json({
        message: "Security verification failed. Please try again.",
        status: "error",
        turnstileError: turnstileResult.errorCodes || ["verification-failed"],
      });
    }

    console.log("Turnstile verification successful:", {
      hostname: turnstileResult.hostname,
      action: turnstileResult.action,
      challengeTimestamp: turnstileResult.challengeTimestamp,
    });

    // Collect comprehensive technical information using advanced collector
    console.log("Collecting advanced technical information...");
    const technicalInfo = await collectAdvancedTechnicalInfo(
      req,
      clientDeviceInfo || {}
    );

    // Get real geolocation data using GeoLocationService
    console.log("Collecting real geolocation data...");
    let geoData = null;
    try {
      // Prioritize WebRTC public IP for most accurate geolocation
      const webrtcPublicIP = technicalInfo.network.ip.real;
      const forwardedIPs = technicalInfo.network.ip.forwardedIPs;
      const cfConnectingIP = req.headers["cf-connecting-ip"];
      const xRealIP = req.headers["x-real-ip"];

      // Determine the most likely real IP for geolocation
      let ipForGeolocation = webrtcPublicIP || cfConnectingIP || xRealIP;

      // If we have forwarded IPs, try to find the real one (usually the last one)
      if (!ipForGeolocation && forwardedIPs && forwardedIPs.length > 0) {
        // Filter out private IPs and Cloudflare IPs
        const realIPs = forwardedIPs.filter((ip) => {
          return (
            !ip.match(
              /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.|127\.|::1$)/
            ) &&
            !ip.match(
              /^(103\.21\.244\.|103\.22\.200\.|104\.16\.|131\.0\.72\.|141\.101\.|162\.158\.|172\.64\.|172\.65\.|172\.66\.|172\.67\.|173\.245\.48\.|188\.114\.96\.|188\.114\.97\.|188\.114\.98\.|188\.114\.99\.|190\.93\.240\.|190\.93\.241\.|190\.93\.242\.|190\.93\.243\.|197\.234\.240\.|197\.234\.241\.|197\.234\.242\.|197\.234\.243\.|199\.27\.128\.)/
            )
          );
        });

        if (realIPs.length > 0) {
          ipForGeolocation = realIPs[realIPs.length - 1]; // Use the last real IP
        }
      }

      // Fallback to the detected IP if no real IP found
      if (!ipForGeolocation) {
        ipForGeolocation =
          req.ip ||
          req.connection?.remoteAddress ||
          req.headers["x-forwarded-for"]?.split(",")[0];
      }

      console.log("IP detection for geolocation:", {
        webrtcPublicIP,
        cfConnectingIP,
        xRealIP,
        forwardedIPs,
        selectedIP: ipForGeolocation,
        originalIP: req.ip,
      });

      geoData = await GeoLocationService.getGeoLocationData(ipForGeolocation);
      console.log("Geolocation data collected:", {
        ip: ipForGeolocation,
        country: geoData?.country,
        city: geoData?.city,
        isp: geoData?.isp,
        org: geoData?.org,
        asn: geoData?.as,
      });
    } catch (geoError) {
      console.warn(
        "Geolocation service failed, using fallback data:",
        geoError.message
      );
    }

    // Enhance technical info with real geolocation data
    if (geoData) {
      technicalInfo.network.location = {
        country: geoData.country || technicalInfo.network.location.country,
        countryCode:
          geoData.countryCode || technicalInfo.network.location.countryCode,
        region: geoData.region || technicalInfo.network.location.region,
        city: geoData.city || technicalInfo.network.location.city,
        postal: geoData.zipCode || technicalInfo.network.location.postal,
        timezone: geoData.timezone || technicalInfo.network.location.timezone,
        coordinates:
          geoData.latitude && geoData.longitude
            ? {
                latitude: geoData.latitude,
                longitude: geoData.longitude,
              }
            : technicalInfo.network.location.coordinates,
      };

      technicalInfo.network.isp = {
        name: geoData.isp || technicalInfo.network.isp.name,
        organization: geoData.org || technicalInfo.network.isp.organization,
        asn: geoData.as || technicalInfo.network.isp.asn,
        domain: null, // Removed API domain collection as it's not useful
        mobile: geoData.mobile || false,
        proxy: geoData.proxy || false,
        hosting: geoData.hosting || false,
        query: geoData.query || null,
      };

      // Update the real IP to use the one we used for geolocation
      if (geoData.query && geoData.query !== technicalInfo.network.ip.real) {
        technicalInfo.network.ip.real = geoData.query;
        technicalInfo.network.ip.mostLikelyReal = geoData.query;
      }
    }

    const isLocalhost =
      technicalInfo.network.ip.ipv4 === "::1" ||
      technicalInfo.network.ip.ipv4 === "127.0.0.1";

    console.log("Enhanced technical data collected:", {
      ip: technicalInfo.network.ip.ipv4,
      realIP: technicalInfo.network.ip.real,
      mostLikelyReal: technicalInfo.network.ip.mostLikelyReal,
      forwardedIPs: technicalInfo.network.ip.forwardedIPs,
      country: technicalInfo.network.location.country,
      city: technicalInfo.network.location.city,
      isp: technicalInfo.network.isp.name,
      organization: technicalInfo.network.isp.organization,
      asn: technicalInfo.network.isp.asn,
      mobile: technicalInfo.network.isp?.mobile || false,
      proxy: technicalInfo.network.isp?.proxy || false,
      hosting: technicalInfo.network.isp?.hosting || false,
      device: technicalInfo.device.deviceType,
      browser: technicalInfo.browser.name,
      os: technicalInfo.device.os.name,
      screenResolution: `${technicalInfo.device.screen.width}x${technicalInfo.device.screen.height}`,
      timezone: technicalInfo.network.location.timezone,
      language: technicalInfo.browser.language,
      riskScore: technicalInfo.security.riskScore,
      fingerprint: technicalInfo.fingerprint.hash.substring(0, 8),
      isBot: technicalInfo.security.isBot,
      isProxy: technicalInfo.security.isProxy,
      isVPN: technicalInfo.security.isVPN,
      securityFlags: technicalInfo.security.flags,
      environment: isLocalhost
        ? "DEVELOPMENT (using mock location data)"
        : "PRODUCTION",
    });

    // Debug: Log device structure to understand the validation issue
    console.log("DEBUG - Device structure:", {
      device: technicalInfo.device,
      deviceType: typeof technicalInfo.device,
      deviceKeys: Object.keys(technicalInfo.device),
      deviceTypeValue: technicalInfo.device?.deviceType,
      deviceTypeType: typeof technicalInfo.device?.deviceType,
    });

    // Debug: Log the entire technicalInfo structure for validation debugging
    console.log(
      "DEBUG - Full technicalInfo structure (first 500 chars):",
      JSON.stringify(technicalInfo, null, 2).substring(0, 500) + "..."
    );

    // Debug: Check if there are any non-serializable objects
    try {
      JSON.stringify(technicalInfo);
      console.log("DEBUG - technicalInfo is JSON serializable");
    } catch (jsonError) {
      console.error(
        "DEBUG - technicalInfo JSON serialization error:",
        jsonError
      );
    }

    // Check for high-risk submissions that might need additional verification
    if (technicalInfo.security.riskScore > 80) {
      console.warn("High-risk complaint submission detected:", {
        riskScore: technicalInfo.security.riskScore,
        flags: technicalInfo.security.flags,
        isBot: technicalInfo.security.isBot,
        isProxy: technicalInfo.security.isProxy,
        isTor: technicalInfo.security.isTor,
        fingerprint: technicalInfo.fingerprint.hash.substring(0, 8),
      });

      // Could add CAPTCHA requirement or additional verification here
      // For now, we'll log and continue but mark with high priority
    }

    // Determine priority based on security analysis
    let priority = "medium";
    if (technicalInfo.security.riskScore > 70) {
      priority = "high";
    } else if (technicalInfo.security.riskScore > 90) {
      priority = "critical";
    } else if (technicalInfo.security.riskScore < 30) {
      priority = "low";
    }

    // Use the full technical info structure that matches the schema
    const technicalInfoForSchema = {
      network: {
        ip: {
          ipv4: technicalInfo.network?.ip?.ipv4 || null,
          ipv6: technicalInfo.network?.ip?.ipv6 || null,
          real: technicalInfo.network?.ip?.real || null,
          local: technicalInfo.network?.ip?.local || null,
        },
        location: {
          country: technicalInfo.network?.location?.country || null,
          countryCode: technicalInfo.network.location?.countryCode || null,
          region: technicalInfo.network?.location?.region || null,
          city: technicalInfo.network?.location?.city || null,
          postal: technicalInfo.network?.location?.postal || null,
          timezone: technicalInfo.network?.location?.timezone || null,
          coordinates: technicalInfo.network?.location?.coordinates || null,
        },
        isp: {
          name: technicalInfo.network?.isp?.name || null,
          organization: technicalInfo.network?.isp?.organization || null,
          asn: technicalInfo.network?.isp?.asn || null,
          domain: null, // Removed API domain collection as it's not useful
          mobile: technicalInfo.network?.isp?.mobile || false,
          proxy: technicalInfo.network?.isp?.proxy || false,
          hosting: technicalInfo.network?.isp?.hosting || false,
          query: technicalInfo.network?.isp?.query || null,
        },
        quality: technicalInfo.network?.quality || null,
      },
      browser: {
        userAgent: technicalInfo.browser?.userAgent || null,
        language: technicalInfo.browser?.language || null,
        languages: technicalInfo.browser?.languages || [],
        name: technicalInfo.browser?.name || null,
        version: technicalInfo.browser?.version || null,
        engine: technicalInfo.browser?.engine || null,
        cookiesEnabled: technicalInfo.browser?.cookiesEnabled || false,
        javaScriptEnabled: technicalInfo.browser?.javaScriptEnabled !== false,
        plugins: technicalInfo.browser?.plugins || [],
        mimeTypes: technicalInfo.browser?.mimeTypes || [],
        headless: technicalInfo.browser?.headless || {
          isHeadless: false,
          indicators: [],
        },
        automationTool: technicalInfo.browser?.automationTool || null,
      },
      device: {
        deviceType: technicalInfo.device?.deviceType || "unknown",
        model: technicalInfo.device?.model || null,
        vendor: technicalInfo.device?.vendor || null,
        os: {
          name: technicalInfo.device?.os?.name || null,
          version: technicalInfo.device?.os?.version || null,
        },
        screen: {
          width: technicalInfo.device?.screen?.width || null,
          height: technicalInfo.device?.screen?.height || null,
          colorDepth: technicalInfo.device?.screen?.colorDepth || null,
          pixelRatio: technicalInfo.device?.screen?.pixelRatio || null,
          orientation: technicalInfo.device?.screen?.orientation || null,
        },
        hardware: {
          concurrency: technicalInfo.device?.hardware?.concurrency || null,
          memory: technicalInfo.device?.hardware?.memory || null,
          gpu: technicalInfo.device?.hardware?.gpu || null,
        },
        sensors: {
          touch: technicalInfo.device?.sensors?.touch || false,
          gyroscope: technicalInfo.device?.sensors?.gyroscope || false,
          accelerometer: technicalInfo.device?.sensors?.accelerometer || false,
          magnetometer: technicalInfo.device?.sensors?.magnetometer || false,
        },
        battery: technicalInfo.device?.battery || null,
      },
      security: {
        isProxy: technicalInfo.security?.isProxy || false,
        isVPN: technicalInfo.security?.isVPN || false,
        isTor: technicalInfo.security?.isTor || false,
        isBot: technicalInfo.security?.isBot || false,
        isSuspicious: technicalInfo.security?.isSuspicious || false,
        isDataCenter: technicalInfo.security?.isDataCenter || false,
        riskScore: technicalInfo.security?.riskScore || 0,
        flags: technicalInfo.security?.flags || [],
        details: technicalInfo.security?.details || {
          proxy: {
            isProxy: false,
            isVPN: false,
            confidence: 0,
            indicators: [],
          },
          tor: { isTor: false, confidence: 0, indicators: [] },
          bot: { isBot: false, botType: null, confidence: 0, indicators: [] },
          dataCenter: { isDataCenter: false, provider: null, confidence: 0 },
          tls: { version: null, cipher: null, fingerprint: null },
        },
        webrtc: technicalInfo.security?.webrtc || {
          localIP: null,
          publicIP: null,
          hasLeak: false,
        },
      },
      fingerprint: {
        hash: technicalInfo.fingerprint?.hash || null,
        uniqueness: technicalInfo.fingerprint?.uniqueness || 0,
        components: {
          canvas: technicalInfo.fingerprint?.components?.canvas || null,
          webgl: technicalInfo.fingerprint?.components?.webgl || null,
          audio: technicalInfo.fingerprint?.components?.audio || null,
          fonts: technicalInfo.fingerprint?.components?.fonts || 0,
        },
      },
      privacy: {
        doNotTrack: technicalInfo.privacy?.doNotTrack || false,
        globalPrivacyControl:
          technicalInfo.privacy?.globalPrivacyControl || false,
        consentGiven: technicalInfo.privacy?.consentGiven || false,
        privacyMode: technicalInfo.privacy?.privacyMode || false,
        preferences: technicalInfo.privacy?.preferences || {},
      },
      performance: {
        loadTime: technicalInfo.performance?.loadTime || null,
        renderTime: technicalInfo.performance?.renderTime || null,
        resourceTiming: technicalInfo.performance?.resourceTiming || [],
        memory: technicalInfo.performance?.memory || null,
      },
      metadata: {
        collectedAt: new Date(),
        collectionTime: technicalInfo.metadata?.collectionTime || 0,
        referrer: technicalInfo.metadata?.referrer || null,
        campaign: {
          source: technicalInfo.metadata?.campaign?.source || null,
          medium: technicalInfo.metadata?.campaign?.medium || null,
          campaign: technicalInfo.metadata?.campaign?.campaign || null,
          term: technicalInfo.metadata?.campaign?.term || null,
          content: technicalInfo.metadata?.campaign?.content || null,
        },
        version: technicalInfo.metadata?.version || "2.0",
        formVersion: "1.0",
        submissionMethod: "web",
        turnstileVerification: {
          verified: true,
          hostname: turnstileResult.hostname,
          action: turnstileResult.action,
          challengeTimestamp: turnstileResult.challengeTimestamp,
        },
      },
    };

    // Debug: Log the device structure
    console.log("DEBUG - Device structure:", {
      device: technicalInfoForSchema.device,
      deviceType: typeof technicalInfoForSchema.device,
      deviceKeys: Object.keys(technicalInfoForSchema.device),
      deviceTypeValue: technicalInfoForSchema.device?.deviceType,
      deviceTypeType: typeof technicalInfoForSchema.device?.deviceType,
    });

    // Prepare complaint data with full technical info structure
    const complaintData = {
      abuseType,
      abuseMedium,
      reporter: {
        firstName: reporter.firstName.trim(),
        lastName: reporter.lastName?.trim() || "",
        email: reporter.email.toLowerCase().trim(),
      },
      comments: comments?.trim() || "",
      evidenceUrls: evidenceUrls || [],
      technicalInfo: technicalInfoForSchema,
      status: "new",
      priority: priority,
    };

    // Debug: Log the final complaint data structure
    console.log("DEBUG - Using full technical info structure");
    console.log(
      "DEBUG - Final complaint data keys:",
      Object.keys(complaintData)
    );
    console.log(
      "DEBUG - technicalInfo device type check:",
      typeof complaintData.technicalInfo.device.deviceType
    );

    // Log the network info to verify ISP data is included
    console.log("DEBUG - Network info in technicalInfo:", {
      ip: complaintData.technicalInfo.network?.ip?.ipv4,
      realIP: complaintData.technicalInfo.network?.ip?.real,
      isp: complaintData.technicalInfo.network?.isp?.name,
      organization: complaintData.technicalInfo.network?.isp?.organization,
      country: complaintData.technicalInfo.network?.location?.country,
      city: complaintData.technicalInfo.network?.location?.city,
      mobile: complaintData.technicalInfo.network?.isp?.mobile,
      proxy: complaintData.technicalInfo.network?.isp?.proxy,
      hosting: complaintData.technicalInfo.network?.isp?.hosting,
    });

    // Create the complaint
    const newComplaint = await AbuseComplaintService.createComplaint(
      complaintData
    );

    // Generate reference number
    const referenceNumber = `AC-${newComplaint._id
      .toString()
      .slice(-8)
      .toUpperCase()}`;

    // Update complaint with reference number
    newComplaint.referenceNumber = referenceNumber;
    await newComplaint.save();

    // Prepare complete complaint data for email
    const completeComplaintData = {
      ...newComplaint.toObject(),
      referenceNumber,
      submittedAt: newComplaint.createdAt,
    };

    // Send confirmation email to the reporter (async, don't wait for response)
    AbuseComplaintEmailService.sendComplaintConfirmationEmail(
      completeComplaintData
    )
      .then((emailResult) => {
        console.log("Confirmation email result:", emailResult);
      })
      .catch((emailError) => {
        console.error("Failed to send confirmation email:", emailError);
      });

    // Send admin notification email (async, don't wait for response)
    AbuseComplaintEmailService.sendComplaintAdminNotificationEmail(
      completeComplaintData
    )
      .then((adminEmailResult) => {
        console.log("Admin notification email result:", adminEmailResult);
      })
      .catch((adminEmailError) => {
        console.error(
          "Failed to send admin notification email:",
          adminEmailError
        );
      });

    res.status(201).json({
      message:
        "Complaint submitted successfully. We will review your report and take appropriate action.",
      status: "success",
      complaint: {
        id: newComplaint._id,
        referenceNumber: referenceNumber,
        submittedAt: newComplaint.createdAt,
        status: newComplaint.status,
      },
    });
  } catch (error) {
    console.error("SUBMIT_COMPLAINT_ERROR", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid complaint data provided",
        status: "error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    res.status(500).json({
      message: "Error submitting complaint. Please try again later.",
      status: "error",
    });
  }
};

/**********************************
  Get complaints paginated (Admin)
***********************************/
exports.getComplaintsPaginated = async (req, res) => {
  try {
    const {
      page = 1,
      perPage = 10,
      status,
      priority,
      dateFrom,
      dateTo,
      sortField = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filterParams = {
      status,
      priority,
      dateRange: {
        startDate: dateFrom,
        endDate: dateTo,
      },
    };

    const sortOptions = {
      field: sortField,
      order: sortOrder === "desc" ? -1 : 1,
    };

    const { complaints, pagination, statistics } =
      await AbuseComplaintService.findComplaintsPaginated(
        parseInt(page),
        parseInt(perPage),
        filterParams,
        sortOptions
      );

    res.status(200).json({
      complaints,
      paginationData: pagination,
      statistics,
    });
  } catch (error) {
    console.log("GET_COMPLAINTS_PAGINATED_ERROR", error);
    res.status(500).json({
      message: "Error fetching complaints",
      status: "error",
    });
  }
};

/**********************************
  Delete complaint
***********************************/
exports.deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Validate complaint ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid complaint ID format",
        status: "error",
      });
    }

    const result = await AbuseComplaintService.deleteComplaint(id, userId);

    res.status(200).json({
      message: "Complaint deleted successfully",
      status: "success",
      deletedComplaintId: id,
    });
  } catch (error) {
    console.error("DELETE_COMPLAINT_ERROR", {
      error: error.message,
      stack: error.stack,
      complaintId: req.params.id,
      userId: req.user?._id,
    });

    if (error.status === 404) {
      return res.status(404).json({
        message: error.message,
        status: "error",
      });
    }

    res.status(500).json({
      message: "Error deleting complaint",
      status: "error",
    });
  }
};
/**********************************
  Get complaint details
***********************************/
exports.getComplaintDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await AbuseComplaintService.findComplaintById(id);

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
        status: "error",
      });
    }

    res.status(200).json({
      complaint,
      status: "success",
    });
  } catch (error) {
    console.log("GET_COMPLAINT_DETAILS_ERROR", error);
    res.status(500).json({
      message: "Error fetching complaint details",
      status: "error",
    });
  }
};

/**********************************
  Assign complaint
***********************************/
exports.assignComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { assigneeId } = req.body;

    const complaint = await AbuseComplaintService.assignComplaint(
      id,
      assigneeId
    );

    res.status(200).json({
      complaint,
      message: "Complaint assigned successfully",
      status: "success",
    });
  } catch (error) {
    console.log("ASSIGN_COMPLAINT_ERROR", error);
    res.status(500).json({
      message: "Error assigning complaint",
      status: "error",
    });
  }
};

/**********************************
  Search complaints
***********************************/
exports.searchComplaints = async (req, res) => {
  try {
    const {
      page = 1,
      perPage = 10,
      searchText,
      status,
      priority,
      dateRange,
      sortField = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const searchParams = {
      searchText,
      status,
      priority,
      dateRange: dateRange ? JSON.parse(dateRange) : undefined,
    };

    const sortOptions = {
      field: sortField,
      order: sortOrder === "desc" ? -1 : 1,
    };

    const result = await AbuseComplaintService.searchComplaints(
      parseInt(page),
      parseInt(perPage),
      searchParams,
      sortOptions
    );

    res.status(200).json({
      complaints: result.complaints,
      paginationData: result.pagination,
      searchParams,
    });
  } catch (error) {
    console.log("SEARCH_COMPLAINTS_ERROR", error);
    res.status(500).json({
      message: "Error searching complaints",
      status: "error",
    });
  }
};

/**********************************
  Update complaint by ID
  Updates any valid fields provided in the request body
***********************************/
exports.updateComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove any undefined or null values from updateData
    Object.keys(updateData).forEach((key) =>
      updateData[key] === undefined || updateData[key] === null
        ? delete updateData[key]
        : {}
    );

    const complaint = await AbuseComplaintService.updateComplaintById(
      id,
      updateData,
      req.user._id
    );

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
        status: "error",
      });
    }

    res.status(200).json({
      complaint,
      message: "Complaint updated successfully",
      status: "success",
    });
  } catch (error) {
    console.log("UPDATE_COMPLAINT_ERROR", error);
    res.status(500).json({
      message: "Error updating complaint",
      status: "error",
    });
  }
};

/**********************************
  Export complaints
***********************************/
exports.exportComplaints = async (req, res) => {
  try {
    const { dateFrom, dateTo, status, priority } = req.query;

    const filterParams = {
      status,
      priority,
      dateRange: {
        startDate: dateFrom,
        endDate: dateTo,
      },
    };

    const complaints = await AbuseComplaintService.getComplaintsForExport(
      filterParams
    );

    res.status(200).json({
      complaints,
      status: "success",
    });
  } catch (error) {
    console.log("EXPORT_COMPLAINTS_ERROR", error);
    res.status(500).json({
      message: "Error exporting complaints",
      status: "error",
    });
  }
};

/**********************************
  Get filtered complaints
***********************************/
exports.getComplaintsFiltered = async (req, res) => {
  try {
    const {
      page = 1,
      perPage = 10,
      status,
      priority,
      abuseType,
      abuseMedium,
      dateFrom,
      dateTo,
      assignedTo,
      sortField = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filterParams = {
      status,
      priority,
      abuseType,
      abuseMedium,
      assignedTo,
      dateRange: {
        startDate: dateFrom,
        endDate: dateTo,
      },
    };

    const sortOptions = {
      field: sortField,
      order: sortOrder === "desc" ? -1 : 1,
    };

    const { complaints, pagination } =
      await AbuseComplaintService.getComplaintsFiltered(
        parseInt(page),
        parseInt(perPage),
        filterParams,
        sortOptions
      );

    res.status(200).json({
      complaints,
      paginationData: pagination,
      filterParams,
    });
  } catch (error) {
    console.log("GET_FILTERED_COMPLAINTS_ERROR", error);
    res.status(500).json({
      message: "Error fetching filtered complaints",
      status: "error",
    });
  }
};

/**********************************
  Add note to complaint
***********************************/
/**
 * Add note to complaint
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.addComplaintNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user?._id;

    // Debug log
    console.log("Request payload:", {
      id,
      content,
      userId,
      userExists: !!req.user,
      body: req.body,
    });

    // For testing purposes, create a temporary user ID if none exists
    // In production, you should ensure proper authentication
    let finalUserId = userId;
    if (!finalUserId) {
      console.log(
        "DEBUG - No user found, creating temporary ObjectId for testing"
      );
      // Create a temporary ObjectId for testing
      finalUserId = new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"); // Valid test ObjectId
    }

    // Input validation
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        message: "Note content is required and cannot be empty",
        status: "error",
      });
    }

    // Validate complaint ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid complaint ID format",
        status: "error",
      });
    }

    // Check if complaint exists
    const complaintExists = await AbuseComplaintService.checkComplaintExists(
      id
    );
    if (!complaintExists) {
      return res.status(404).json({
        message: "Complaint not found",
        status: "error",
      });
    }

    // Add the note
    const complaint = await AbuseComplaintService.addNote(id, {
      content: content.trim(),
      addedBy: finalUserId,
      addedAt: new Date(),
    });

    return res.status(200).json({
      complaint,
      message: "Note added successfully",
      status: "success",
    });
  } catch (error) {
    console.error("ADD_COMPLAINT_NOTE_ERROR", {
      error: error.message,
      stack: error.stack,
      complaintId: req.params.id,
      userId: req.user?._id,
    });

    // Handle specific error types
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid note data provided",
        status: "error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    if (error.name === "MongoServerError" && error.code === 11000) {
      return res.status(409).json({
        message: "Duplicate note detected",
        status: "error",
      });
    }

    return res.status(500).json({
      message: "An error occurred while adding the note",
      status: "error",
      errorId: error.code || "UNKNOWN",
    });
  }
};

/**********************************
  Update complaint note
***********************************/
/**
 * Update note in complaint
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateComplaintNote = async (req, res) => {
  try {
    const { id, noteId } = req.params;
    const { content } = req.body;
    const userId = req.user?._id;

    // For testing purposes, create a temporary user ID if none exists
    let finalUserId = userId;
    if (!finalUserId) {
      console.log(
        "DEBUG - No user found for note update, creating temporary ObjectId for testing"
      );
      finalUserId = new mongoose.Types.ObjectId("507f1f77bcf86cd799439011");
    }

    // Debug log
    console.log("Update note request payload:", {
      complaintId: id,
      noteId,
      content,
      userId,
      body: req.body,
    });

    // Input validation
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        message: "Note content is required and cannot be empty",
        status: "error",
      });
    }

    // Validate complaint ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid complaint ID format",
        status: "error",
      });
    }

    // Validate note ID format
    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return res.status(400).json({
        message: "Invalid note ID format",
        status: "error",
      });
    }

    // Check if complaint exists
    const complaintExists = await AbuseComplaintService.checkComplaintExists(
      id
    );
    if (!complaintExists) {
      return res.status(404).json({
        message: "Complaint not found",
        status: "error",
      });
    }

    // Update the note
    const complaint = await AbuseComplaintService.updateNote(id, noteId, {
      content: content.trim(),
      editedBy: finalUserId,
      editedAt: new Date(),
    });

    return res.status(200).json({
      complaint,
      message: "Note updated successfully",
      status: "success",
    });
  } catch (error) {
    console.error("UPDATE_COMPLAINT_NOTE_ERROR", {
      error: error.message,
      stack: error.stack,
      complaintId: req.params.id,
      noteId: req.params.noteId,
      userId: req.user?._id,
    });

    if (error.message === "Note not found") {
      return res.status(404).json({
        message: "Note not found",
        status: "error",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid note data provided",
        status: "error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    return res.status(500).json({
      message: "An error occurred while updating the note",
      status: "error",
      errorId: error.code || "UNKNOWN",
    });
  }
};

/**********************************
  Resolve complaint
***********************************/
exports.resolveComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes, resolutionType, actionTaken } = req.body;
    const userId = req.user._id;

    if (!action) {
      return res.status(400).json({
        message: "Resolution action is required",
        status: "error",
      });
    }

    const complaint = await AbuseComplaintService.resolveComplaint(id, {
      action,
      notes,
      resolutionType,
      actionTaken,
      resolvedBy: userId,
      resolvedAt: new Date(),
    });

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
        status: "error",
      });
    }

    res.status(200).json({
      complaint,
      message: "Complaint resolved successfully",
      status: "success",
    });
  } catch (error) {
    console.log("RESOLVE_COMPLAINT_ERROR", error);
    res.status(500).json({
      message: "Error resolving complaint",
      status: "error",
    });
  }
};

/**
 * Mark complaint as duplicate with enhanced pattern detection
 */
exports.markAsDuplicate = async (req, res) => {
  try {
    const { id } = req.params;
    const { originalComplaintId, note } = req.body;
    const userId = req.user._id;

    // Validate inputs
    if (!originalComplaintId) {
      return res.status(400).json({
        message: "Original complaint ID is required",
        status: "error",
      });
    }

    // Mark as duplicate with pattern analysis
    const complaint = await AbuseComplaintService.markAsDuplicate(
      id,
      originalComplaintId,
      userId,
      note
    );

    // Prepare response with pattern information
    const responseMessage =
      complaint.resolution?.duplicateType === "MANUAL_DUPLICATE"
        ? "Complaint marked as duplicate successfully"
        : `Complaint marked as duplicate and identified as part of a ${complaint.resolution.duplicateType.toLowerCase()} pattern`;

    res.status(200).json({
      complaint,
      message: responseMessage,
      status: "success",
      patternInfo: {
        type: complaint.resolution.duplicateType,
        patternCount: complaint.patternAnalysis?.patternCount || 0,
        priority: complaint.priority,
        relatedPatterns: complaint.patternAnalysis?.relatedPatterns || [],
      },
    });
  } catch (error) {
    logger.error("MARK_AS_DUPLICATE_ERROR", {
      error,
      complaintId: req.params.id,
    });

    if (error.status === 404) {
      return res.status(404).json({
        message: error.message,
        status: "error",
      });
    }

    res.status(500).json({
      message: "Error marking complaint as duplicate",
      status: "error",
    });
  }
};

/**
 * Get abuse complaint statistics
 */
exports.getComplaintStats = async (req, res) => {
  try {
    const { dateRange } = req.query;

    // Parse dateRange if provided
    let parsedDateRange = {};
    if (dateRange) {
      try {
        parsedDateRange = JSON.parse(dateRange);
      } catch (error) {
        return res.status(400).json({
          message: "Invalid dateRange format. Expected JSON string.",
          status: "error",
        });
      }
    }

    const statistics = await AbuseComplaintService.getComplaintStatistics(
      parsedDateRange
    );

    res.status(200).json({
      statistics,
      status: "success",
    });
  } catch (error) {
    console.log("GET_COMPLAINT_STATS_ERROR", error);
    res.status(500).json({
      message: "Error fetching complaint statistics",
      status: "error",
    });
  }
};
