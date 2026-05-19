const mongoose = require("mongoose");
// ** SERVICES ** //
const ContactService = require("@services/contact-us/contactService");
const ContactEmailService = require("@services/contact-us/contactEmailService");
// ** UTILS ** //
const {
  collectAdvancedTechnicalInfo,
} = require("@utils/technical-info-collector/technicalInfoCollector");

/**********************************
  Create new contact (Public)
***********************************/
exports.createContact = async (req, res) => {
  try {
    console.log("📧 Contact Form Submission:", {
      name: req.body.name,
      email: req.body.email,
      category: req.body.category?.name || req.body.category?.id,
      ip: req.ip,
    });

    const {
      name,
      email,
      message,
      category,
      deviceInfo: clientDeviceInfo,
    } = req.body;

    // Collect comprehensive technical information in background (non-blocking)
    const technicalInfo = await collectAdvancedTechnicalInfo(
      req,
      clientDeviceInfo
    );

    // Create the contact
    const newContact = await ContactService.createContact(
      { name, email, message, category },
      technicalInfo
    );

    // Return success response immediately
    res.status(201).json({
      message: "Thank you for contacting us. We will get back to you soon.",
      status: "success",
      contactId: newContact._id,
    });

    // Send confirmation emails asynchronously (non-blocking)
    ContactEmailService.sendContactEmails(newContact)
      .then((emailResults) => {
        console.log("✅ Emails sent successfully:", {
          user: newContact.email,
          userConfirmed: emailResults.userConfirmation?.success || false,
          adminNotified: emailResults.adminNotification?.success || false,
        });
      })
      .catch((emailError) => {
        console.error("❌ Email sending failed:", {
          user: newContact.email,
          error: emailError.message,
        });
      });
  } catch (error) {
    console.error("CREATE_CONTACT_ERROR", {
      error: error.message,
      stack: error.stack,
      body: req.body,
    });

    // Handle specific error types
    if (error.status === 400) {
      return res.status(400).json({
        message: error.message,
        status: "error",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid contact data provided",
        status: "error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    res.status(500).json({
      message:
        "An error occurred while submitting your contact form. Please try again later.",
      status: "error",
    });
  }
};

/**********************************
  Get contacts paginated (Admin)
***********************************/
exports.getContactsPaginated = async (req, res) => {
  try {
    const {
      page = 1,
      perPage = 10,
      dateFrom,
      dateTo,
      sortField = "createdAt",
      sortOrder = "desc",
      category,
    } = req.query;

    const filterParams = {
      dateRange: {
        startDate: dateFrom,
        endDate: dateTo,
      },
      category,
    };

    const sortOptions = {
      field: sortField,
      order: sortOrder === "desc" ? -1 : 1,
    };

    const { contacts, pagination, statistics } =
      await ContactService.findContactsPaginated(
        parseInt(page),
        parseInt(perPage),
        filterParams,
        sortOptions
      );

    res.status(200).json({
      contacts,
      paginationData: pagination,
      statistics,
    });
  } catch (error) {
    console.log("GET_CONTACTS_PAGINATED_ERROR", error);
    res.status(500).json({
      message: "Error fetching contacts",
      status: "error",
    });
  }
};

/**********************************
  Delete contact
***********************************/
exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Validate contact ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid contact ID format",
        status: "error",
      });
    }

    const result = await ContactService.deleteContact(id, userId);

    res.status(200).json({
      message: "Contact deleted successfully",
      status: "success",
      deletedContactId: id,
    });
  } catch (error) {
    console.error("DELETE_CONTACT_ERROR", {
      error: error.message,
      stack: error.stack,
      contactId: req.params.id,
      userId: req.user?._id,
    });

    if (error.status === 404) {
      return res.status(404).json({
        message: error.message,
        status: "error",
      });
    }

    res.status(500).json({
      message: "Error deleting contact",
      status: "error",
    });
  }
};

/**********************************
  Get contact details
***********************************/
exports.getContactDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if ID is a valid MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid contact ID format",
        status: "error",
      });
    }

    const contact = await ContactService.findContactById(id);

    if (!contact) {
      return res.status(404).json({
        message: "Contact not found",
        status: "error",
      });
    }

    res.status(200).json({
      contact,
      status: "success",
    });
  } catch (error) {
    console.log("GET_CONTACT_DETAILS_ERROR", error);

    // Handle errors based on their status code if available
    if (error.status) {
      return res.status(error.status).json({
        message: error.message,
        status: "error",
      });
    }

    res.status(500).json({
      message: "Error fetching contact details",
      status: "error",
    });
  }
};

/**********************************
  Search contacts
***********************************/
exports.searchContacts = async (req, res) => {
  try {
    const {
      page = 1,
      perPage = 10,
      searchText,
      dateRange,
      sortField = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const searchParams = {
      searchText,
      dateRange: dateRange ? JSON.parse(dateRange) : undefined,
    };

    const sortOptions = {
      field: sortField,
      order: sortOrder === "desc" ? -1 : 1,
    };

    const result = await ContactService.searchContacts(
      parseInt(page),
      parseInt(perPage),
      searchParams,
      sortOptions
    );

    res.status(200).json({
      contacts: result.contacts,
      paginationData: result.pagination,
      searchParams,
    });
  } catch (error) {
    console.log("SEARCH_CONTACTS_ERROR", error);
    res.status(500).json({
      message: "Error searching contacts",
      status: "error",
    });
  }
};

/**********************************
  Update contact by ID
  Updates any valid fields provided in the request body
***********************************/
exports.updateContactById = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove any undefined or null values from updateData
    Object.keys(updateData).forEach((key) =>
      updateData[key] === undefined || updateData[key] === null
        ? delete updateData[key]
        : {}
    );

    const contact = await ContactService.updateContactById(
      id,
      updateData,
      req.user._id
    );

    if (!contact) {
      return res.status(404).json({
        message: "Contact not found",
        status: "error",
      });
    }

    res.status(200).json({
      contact,
      message: "Contact updated successfully",
      status: "success",
    });
  } catch (error) {
    console.log("UPDATE_CONTACT_ERROR", error);
    res.status(500).json({
      message: "Error updating contact",
      status: "error",
    });
  }
};

/**********************************
  Export contacts
***********************************/
exports.exportContacts = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;

    const filterParams = {
      dateRange: {
        startDate: dateFrom,
        endDate: dateTo,
      },
    };

    const contacts = await ContactService.getContactsForExport(filterParams);

    res.status(200).json({
      contacts,
      status: "success",
    });
  } catch (error) {
    console.log("EXPORT_CONTACTS_ERROR", error);
    res.status(500).json({
      message: "Error exporting contacts",
      status: "error",
    });
  }
};

/**********************************
  Get filtered contacts
***********************************/
exports.getContactsFiltered = async (req, res) => {
  try {
    const {
      page = 1,
      perPage = 10,
      country,
      dateFrom,
      dateTo,
      sortField = "createdAt",
      sortOrder = "desc",
      category,
    } = req.query;

    const filterParams = {
      country,
      category,
      dateRange: {
        startDate: dateFrom,
        endDate: dateTo,
      },
    };

    const sortOptions = {
      field: sortField,
      order: sortOrder === "desc" ? -1 : 1,
    };

    const { contacts, pagination } = await ContactService.getContactsFiltered(
      parseInt(page),
      parseInt(perPage),
      filterParams,
      sortOptions
    );

    res.status(200).json({
      contacts,
      paginationData: pagination,
      filterParams,
    });
  } catch (error) {
    console.log("GET_FILTERED_CONTACTS_ERROR", error);
    res.status(500).json({
      message: "Error fetching filtered contacts",
      status: "error",
    });
  }
};

/**********************************
  Add note to contact
***********************************/
/**
 * Add note to contact
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.addContactNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    // Debug log
    console.log("Request payload:", {
      id,
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

    // Validate contact ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid contact ID format",
        status: "error",
      });
    }

    // Check if contact exists
    const contactExists = await ContactService.checkContactExists(id);
    if (!contactExists) {
      return res.status(404).json({
        message: "Contact not found",
        status: "error",
      });
    }

    // Add the note
    const contact = await ContactService.addNote(id, {
      content: content.trim(),
      addedBy: userId,
      addedAt: new Date(),
    });

    return res.status(200).json({
      contact,
      message: "Note added successfully",
      status: "success",
    });
  } catch (error) {
    console.error("ADD_CONTACT_NOTE_ERROR", {
      error: error.message,
      stack: error.stack,
      contactId: req.params.id,
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
  Update contact note
***********************************/
/**
 * Update note in contact
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateContactNote = async (req, res) => {
  try {
    const { id, noteId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    // Debug log
    console.log("Update note request payload:", {
      contactId: id,
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

    // Validate contact ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid contact ID format",
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

    // Check if contact exists
    const contactExists = await ContactService.checkContactExists(id);
    if (!contactExists) {
      return res.status(404).json({
        message: "Contact not found",
        status: "error",
      });
    }

    // Update the note
    const contact = await ContactService.updateNote(id, noteId, {
      content: content.trim(),
      editedBy: userId,
      editedAt: new Date(),
    });

    return res.status(200).json({
      contact,
      message: "Note updated successfully",
      status: "success",
    });
  } catch (error) {
    console.error("UPDATE_CONTACT_NOTE_ERROR", {
      error: error.message,
      stack: error.stack,
      contactId: req.params.id,
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
  Flag contact as spam
***********************************/
exports.flagContactAsSpam = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const userId = req.user._id;

    const contact = await ContactService.flagAsSpam(id, {
      notes,
      flaggedBy: userId,
      flaggedAt: new Date(),
    });

    if (!contact) {
      return res.status(404).json({
        message: "Contact not found",
        status: "error",
      });
    }

    res.status(200).json({
      contact,
      message: "Contact flagged as spam successfully",
      status: "success",
    });
  } catch (error) {
    console.log("FLAG_CONTACT_AS_SPAM_ERROR", error);
    res.status(500).json({
      message: "Error flagging contact as spam",
      status: "error",
    });
  }
};

/**********************************
  Get contact statistics
***********************************/
exports.getContactStatistics = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;

    const dateRange = {
      startDate: dateFrom,
      endDate: dateTo,
    };

    const statistics = await ContactService.getContactStatistics(dateRange);

    res.status(200).json({
      statistics,
      status: "success",
    });
  } catch (error) {
    console.log("GET_CONTACT_STATISTICS_ERROR", error);
    // Send the actual error message for debugging
    res.status(500).json({
      message: `Error fetching contact statistics: ${error.message}`,
      status: "error",
    });
  }
};

/**********************************
  Bulk delete contacts
***********************************/
exports.bulkDeleteContacts = async (req, res) => {
  try {
    const { contactIds } = req.body;
    const userId = req.user._id;

    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return res.status(400).json({
        message: "No valid contact IDs provided",
        status: "error",
      });
    }

    // Validate all contact IDs
    const invalidIds = contactIds.filter(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );
    if (invalidIds.length > 0) {
      return res.status(400).json({
        message: "Invalid contact ID format found in request",
        invalidIds,
        status: "error",
      });
    }

    const result = await ContactService.bulkDeleteContacts(contactIds, userId);

    res.status(200).json({
      message: `Successfully deleted ${result.deletedCount} contacts`,
      status: "success",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.log("BULK_DELETE_CONTACTS_ERROR", error);
    res.status(500).json({
      message: "Error performing bulk delete operation",
      status: "error",
    });
  }
};

/**********************************
  Get contact audit trail
***********************************/
exports.getContactAuditTrail = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate contact ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid contact ID format",
        status: "error",
      });
    }

    const auditTrail = await ContactService.getContactAuditTrail(id);

    res.status(200).json({
      auditTrail,
      status: "success",
    });
  } catch (error) {
    console.log("GET_CONTACT_AUDIT_TRAIL_ERROR", error);

    if (error.status === 404) {
      return res.status(404).json({
        message: error.message,
        status: "error",
      });
    }

    res.status(500).json({
      message: "Error fetching contact audit trail",
      status: "error",
    });
  }
};
