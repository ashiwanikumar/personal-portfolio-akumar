/**
 * @fileoverview Contact Service
 * Service layer for handling all contact form related operations
 *
 * @module ContactService
 * @requires mongoose
 * @requires @models/contact-us/contact
 * @requires @utils/logger
 */

const mongoose = require("mongoose");
const Contact = require("@models/contact-us/contact");
const logger = require("@utils/logger");

/**
 * Custom error class for contact-related operations
 */
class ContactError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = "ContactError";
    this.status = status;
  }
}

/**
 * Builds a MongoDB query object based on search parameters
 * @param {Object} params Search parameters
 * @returns {Object} MongoDB query object
 */
const buildSearchQuery = ({
  searchText,
  dateRange,
  country,
  isSpam,
  category,
}) => {
  let query = {};

  if (searchText) {
    query.$or = [
      { email: { $regex: searchText, $options: "i" } },
      { name: { $regex: searchText, $options: "i" } },
      { "message.content": { $regex: searchText, $options: "i" } },
    ];
  }

  if (isSpam !== undefined) query.isSpam = isSpam;
  if (country) query["technicalInfo.location.country"] = country;
  if (category) query["category.id"] = category;

  if (dateRange?.startDate && dateRange?.endDate) {
    query.createdAt = {
      $gte: new Date(dateRange.startDate),
      $lte: new Date(dateRange.endDate),
    };
  }

  return query;
};

class ContactService {
  /**
   * Database transaction wrapper
   */
  static async withTransaction(operation) {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const result = await operation(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Find contact by ID
   */
  static findContactById = async (id) => {
    try {
      const contact = await Contact.findById(id).populate(
        "notes.addedBy",
        "name email"
      );

      if (!contact) {
        throw new ContactError("Contact not found", 404);
      }

      return contact;
    } catch (error) {
      if (error.name === "CastError") {
        throw new ContactError("Invalid contact ID format", 400);
      }
      throw error;
    }
  };

  /**
   * Find contacts paginated with search and filters
   */
  static findContactsPaginated = async (
    page,
    perPage,
    searchParams = {},
    sortOptions = { field: "createdAt", order: -1 }
  ) => {
    try {
      const searchQuery = buildSearchQuery(searchParams);
      const sortConfig = { [sortOptions.field]: sortOptions.order };

      const [contacts, total, statistics] = await Promise.all([
        Contact.find(searchQuery)
          .sort(sortConfig)
          .skip((page - 1) * perPage)
          .limit(perPage),
        Contact.countDocuments(searchQuery),
        this.getContactStatistics(searchQuery.dateRange),
      ]);

      return {
        contacts,
        pagination: {
          page,
          perPage,
          total,
          totalPages: Math.ceil(total / perPage),
        },
        statistics,
      };
    } catch (error) {
      logger.error("Error finding paginated contacts", { error });
      throw error;
    }
  };

  /**
   * Get contact statistics
   */
  static getContactStatistics = async (dateRange = {}) => {
    try {
      const baseQuery = {};
      if (dateRange?.startDate || dateRange?.endDate) {
        baseQuery.createdAt = {};
        if (dateRange.startDate) {
          baseQuery.createdAt.$gte = new Date(dateRange.startDate);
        }
        if (dateRange.endDate) {
          baseQuery.createdAt.$lte = new Date(dateRange.endDate);
        }
      }

      const [countryStats, spamStats, timeStats, categoryStats] =
        await Promise.all([
          // Country breakdown
          Contact.aggregate([
            { $match: baseQuery },
            {
              $group: {
                _id: "$technicalInfo.location.country",
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1 } },
            { $limit: 10 },
          ]),

          // Spam breakdown
          Contact.aggregate([
            { $match: baseQuery },
            {
              $group: {
                _id: "$isSpam",
                count: { $sum: 1 },
              },
            },
          ]),

          // Time-based statistics
          Contact.aggregate([
            { $match: baseQuery },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
            { $limit: 30 },
          ]),

          // Category breakdown
          Contact.aggregate([
            { $match: baseQuery },
            {
              $group: {
                _id: "$category.id",
                count: { $sum: 1 },
                name: { $first: "$category.name" },
              },
            },
            { $sort: { count: -1 } },
          ]),
        ]);

      // Transform country stats into a more readable format
      const countryCounts = countryStats.reduce((acc, stat) => {
        acc[stat._id || "Unknown"] = stat.count;
        return acc;
      }, {});

      // Transform spam stats
      const spamCounts = {
        spam: 0,
        legitimate: 0,
      };
      spamStats.forEach((stat) => {
        if (stat._id === true) {
          spamCounts.spam = stat.count;
        } else if (stat._id === false) {
          spamCounts.legitimate = stat.count;
        }
      });

      // Transform category stats
      const categoryCounts = categoryStats.reduce((acc, stat) => {
        acc[stat._id] = {
          count: stat.count,
          name: stat.name,
        };
        return acc;
      }, {});

      return {
        totalContacts: spamCounts.spam + spamCounts.legitimate || 0,
        countryBreakdown: countryCounts,
        spamBreakdown: spamCounts,
        categoryBreakdown: categoryCounts,
        timeStats: timeStats.map((stat) => ({
          date: stat._id,
          count: stat.count,
        })),
      };
    } catch (error) {
      logger.error("Error getting contact statistics", { error });
      throw error;
    }
  };

  /**
   * Delete contact
   */
  static deleteContact = async (contactId, userId) => {
    try {
      // Check if contact exists
      const contact = await Contact.findById(contactId);

      if (!contact) {
        throw new ContactError("Contact not found", 404);
      }

      // Create an audit log before deletion
      logger.info("Contact deleted", {
        contactId,
        deletedBy: userId,
        contactEmail: contact.email,
        deletedAt: new Date(),
      });

      // Delete the contact
      const deletedContact = await Contact.findByIdAndDelete(contactId);

      if (!deletedContact) {
        throw new ContactError("Error deleting contact", 500);
      }

      return deletedContact;
    } catch (error) {
      logger.error("Error in deleteContact service", {
        error,
        contactId,
        userId,
      });
      throw error;
    }
  };

  /**
   * Bulk delete contacts
   */
  static bulkDeleteContacts = async (contactIds, userId) => {
    return await this.withTransaction(async (session) => {
      try {
        // Log the deletion attempt
        logger.info("Bulk contact deletion initiated", {
          contactIds,
          deletedBy: userId,
          deletedAt: new Date(),
        });

        // Delete the contacts
        const result = await Contact.deleteMany({
          _id: { $in: contactIds },
        }).session(session);

        return {
          deletedCount: result.deletedCount,
        };
      } catch (error) {
        logger.error("Error in bulkDeleteContacts service", {
          error,
          contactIds,
          userId,
        });
        throw error;
      }
    });
  };

  /**
   * Flag contact as spam
   */
  static flagAsSpam = async (contactId, flagData) => {
    try {
      const contact = await Contact.findByIdAndUpdate(
        contactId,
        {
          $set: {
            isSpam: true,
            spamInfo: {
              notes: flagData.notes || "",
              flaggedBy: flagData.flaggedBy,
              flaggedAt: flagData.flaggedAt,
            },
          },
        },
        { new: true }
      );

      if (!contact) {
        throw new ContactError("Contact not found", 404);
      }

      return contact;
    } catch (error) {
      logger.error("Error flagging contact as spam", { error, contactId });
      throw error;
    }
  };

  /**
   * Search contacts
   */
  static searchContacts = async (
    page,
    perPage,
    searchParams,
    sortOptions = { field: "createdAt", order: -1 }
  ) => {
    try {
      const searchQuery = buildSearchQuery(searchParams);
      const sortConfig = { [sortOptions.field]: sortOptions.order };

      const [contacts, total] = await Promise.all([
        Contact.find(searchQuery)
          .sort(sortConfig)
          .skip((page - 1) * perPage)
          .limit(perPage),
        Contact.countDocuments(searchQuery),
      ]);

      return {
        contacts,
        pagination: {
          page,
          perPage,
          total,
          totalPages: Math.ceil(total / perPage),
        },
      };
    } catch (error) {
      logger.error("Error searching contacts", { error });
      throw error;
    }
  };

  /**
   * Update contact by ID
   * @param {string} contactId - The ID of the contact to update
   * @param {Object} updateData - Object containing fields to update
   * @param {string} userId - ID of the user making the update
   * @returns {Promise<Object>} Updated contact document
   */
  static updateContactById = async (contactId, updateData, userId) => {
    return await this.withTransaction(async (session) => {
      // Prepare the update object
      const updateObject = {
        ...updateData,
        lastUpdatedBy: userId,
        lastUpdatedAt: new Date(),
      };

      const updatedContact = await Contact.findByIdAndUpdate(
        contactId,
        { $set: updateObject },
        {
          new: true,
          runValidators: true,
          session,
        }
      );

      return updatedContact;
    });
  };

  /**
   * Get contacts for export
   */
  static getContactsForExport = async (filterParams = {}) => {
    try {
      const searchQuery = buildSearchQuery(filterParams);
      const contacts = await Contact.find(searchQuery).sort({ createdAt: -1 });

      return contacts;
    } catch (error) {
      logger.error("Error exporting contacts", { error });
      throw error;
    }
  };

  /**
   * Get filtered contacts
   */
  static getContactsFiltered = async (
    page,
    perPage,
    filterParams = {},
    sortOptions = { field: "createdAt", order: -1 }
  ) => {
    try {
      const searchQuery = buildSearchQuery(filterParams);
      const sortConfig = { [sortOptions.field]: sortOptions.order };

      const [contacts, total] = await Promise.all([
        Contact.find(searchQuery)
          .sort(sortConfig)
          .skip((page - 1) * perPage)
          .limit(perPage),
        Contact.countDocuments(searchQuery),
      ]);

      return {
        contacts,
        pagination: {
          page,
          perPage,
          total,
          totalPages: Math.ceil(total / perPage),
        },
      };
    } catch (error) {
      logger.error("Error getting filtered contacts", { error });
      throw error;
    }
  };

  /**
   * Check if contact exists
   */
  static checkContactExists = async (contactId) => {
    try {
      return await Contact.exists({ _id: contactId });
    } catch (error) {
      if (error.name === "CastError") {
        throw new ContactError("Invalid contact ID format", 400);
      }
      logger.error("Error checking contact existence", {
        error,
        contactId,
      });
      throw error;
    }
  };

  /**
   * Add note to contact (first update schema to support notes)
   */
  static addNote = async (contactId, noteData) => {
    if (!noteData.content || !noteData.addedBy) {
      throw new Error("Note content and author are required");
    }

    try {
      // First, check if the contact exists
      const contact = await Contact.findById(contactId);

      if (!contact) {
        throw new Error("Contact not found");
      }

      // Initialize notes array if it doesn't exist
      if (!contact.notes) {
        await Contact.updateOne({ _id: contactId }, { $set: { notes: [] } });
      }

      // Now add the note
      const updatedContact = await Contact.findByIdAndUpdate(
        contactId,
        {
          $push: {
            notes: {
              content: noteData.content,
              addedBy: noteData.addedBy,
              addedAt: noteData.addedAt || new Date(),
            },
          },
        },
        {
          new: true,
          runValidators: true,
        }
      ).populate("notes.addedBy", "name email");

      if (!updatedContact) {
        throw new Error("Failed to add note to contact");
      }

      return updatedContact;
    } catch (error) {
      if (error.name === "ValidationError") {
        throw error;
      }
      logger.error("Error adding note to contact", {
        error,
        contactId,
        noteData,
      });
      throw new Error("Failed to add note to contact");
    }
  };

  /**
   * Update note in contact
   */
  static updateNote = async (contactId, noteId, updateData) => {
    if (!updateData.content || !updateData.editedBy) {
      throw new Error("Note content and editor are required");
    }

    try {
      // Find the contact and update the specific note
      const contact = await Contact.findOneAndUpdate(
        {
          _id: contactId,
          "notes._id": noteId,
        },
        {
          $set: {
            "notes.$.content": updateData.content,
            "notes.$.lastEdited": updateData.editedAt,
          },
          $push: {
            "notes.$.editHistory": {
              previousContent: updateData.content,
              editedBy: updateData.editedBy,
              editedAt: updateData.editedAt,
            },
          },
        },
        {
          new: true,
          runValidators: true,
        }
      )
        .populate("notes.addedBy", "name email")
        .populate("notes.editHistory.editedBy", "name email");

      if (!contact) {
        throw new Error("Note not found");
      }

      return contact;
    } catch (error) {
      logger.error("Error updating note in contact", {
        error,
        contactId,
        noteId,
        updateData,
      });

      if (error.name === "ValidationError") {
        throw error;
      }
      throw new Error("Failed to update note in contact");
    }
  };

  /**
   * Get daily contact statistics
   */
  static getDailyStats = async (startDate, endDate) => {
    try {
      const stats = await Contact.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(startDate),
              $lte: new Date(endDate),
            },
          },
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              country: "$technicalInfo.location.country",
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { "_id.date": 1 },
        },
      ]);

      return stats;
    } catch (error) {
      logger.error("Error getting daily stats", { error });
      throw error;
    }
  };

  /**
   * Get contact audit trail
   */
  static getContactAuditTrail = async (contactId) => {
    try {
      const contact = await Contact.findById(contactId)
        .populate("notes.addedBy", "name email")
        .lean();

      if (!contact) {
        throw new ContactError("Contact not found", 404);
      }

      // Start with creation event
      const auditTrail = [
        {
          action: "created",
          date: contact.createdAt,
          details: `Contact form submitted by ${contact.name} (${contact.email})`,
        },
      ];

      // Add note events if notes exist
      if (contact.notes && contact.notes.length > 0) {
        contact.notes.forEach((note) => {
          auditTrail.push({
            action: "note_added",
            date: note.addedAt,
            details: `Note added by ${
              note.addedBy ? note.addedBy.email : "Unknown"
            }: ${note.content}`,
            user: note.addedBy ? note.addedBy.name : "Unknown",
          });

          // Add edit history for notes if available
          if (note.editHistory && note.editHistory.length > 0) {
            note.editHistory.forEach((edit) => {
              auditTrail.push({
                action: "note_edited",
                date: edit.editedAt,
                details: `Note edited by ${
                  edit.editedBy ? edit.editedBy.email : "Unknown"
                }`,
                user: edit.editedBy ? edit.editedBy.name : "Unknown",
              });
            });
          }
        });
      }

      // Add spam flag event if flagged
      if (contact.isSpam && contact.spamInfo) {
        auditTrail.push({
          action: "flagged_as_spam",
          date: contact.spamInfo.flaggedAt,
          details: `Flagged as spam${
            contact.spamInfo.notes ? ": " + contact.spamInfo.notes : ""
          }`,
        });
      }

      // Add update event if last updated
      if (contact.lastUpdatedAt) {
        auditTrail.push({
          action: "updated",
          date: contact.lastUpdatedAt,
          details: "Contact information updated",
        });
      }

      return auditTrail.sort((a, b) => b.date - a.date);
    } catch (error) {
      logger.error("Error getting contact audit trail", {
        error,
        contactId,
      });
      throw error;
    }
  };

  /**
   * Create a new contact submission
   * @param {Object} contactData - Contact form data
   * @param {Object} technicalInfo - IP and browser information
   * @returns {Promise<Object>} Created contact document
   */
  static createContact = async (contactData, technicalInfo = {}) => {
    try {
      // Validate required fields
      if (!contactData.name || !contactData.email || !contactData.message) {
        throw new ContactError("Name, email, and message are required", 400);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contactData.email)) {
        throw new ContactError("Invalid email format", 400);
      }

      // Validate category
      if (!contactData.category || !contactData.category.id) {
        throw new ContactError("Category is required", 400);
      }

      const validCategories = [
        "services", "feedback", "analyst",
        "devops-consulting", "cloud-infrastructure", "kubernetes",
        "ci-cd", "other",
      ];
      if (!validCategories.includes(contactData.category.id)) {
        throw new ContactError("Invalid category", 400);
      }

      // Map category names
      const categoryNames = {
        services: "Services Inquiry",
        feedback: "General Feedback",
        analyst: "Analyst Relations",
        "devops-consulting": "DevOps Consulting",
        "cloud-infrastructure": "Cloud Infrastructure",
        kubernetes: "Kubernetes / OpenShift",
        "ci-cd": "CI/CD Automation",
        other: "Other",
      };

      // Create the contact document
      const newContact = new Contact({
        name: contactData.name.trim(),
        email: contactData.email.trim().toLowerCase(),
        message: contactData.message,
        category: {
          id: contactData.category.id,
          name: categoryNames[contactData.category.id] || contactData.category.name,
        },
        technicalInfo: {
          ip: technicalInfo.ip || {},
          location: technicalInfo.location || {},
          network: {
            isp: typeof technicalInfo.network?.isp === "object"
              ? technicalInfo.network.isp.name || ""
              : technicalInfo.network?.isp || "",
            organization: typeof technicalInfo.network?.organization === "object"
              ? technicalInfo.network.organization.name || ""
              : technicalInfo.network?.organization || "",
            asn: typeof technicalInfo.network?.asn === "object"
              ? String(technicalInfo.network.asn.number || "")
              : technicalInfo.network?.asn || "",
            domain: technicalInfo.network?.domain || "",
          },
          browser: technicalInfo.browser || {},
          metadata: {
            collectedAt: new Date(),
            ...technicalInfo.metadata,
          },
        },
        isSpam: false,
        notes: [],
      });

      // Save to database without transaction
      const savedContact = await newContact.save();

      logger.info("New contact form submission", {
        contactId: savedContact._id,
        email: savedContact.email,
        category: savedContact.category.id,
        createdAt: savedContact.createdAt,
      });

      return savedContact;
    } catch (error) {
      logger.error("Error creating contact", {
        error,
        contactData,
      });
      throw error;
    }
  };
}

module.exports = ContactService;
