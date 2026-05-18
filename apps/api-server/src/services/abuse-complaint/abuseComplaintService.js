/**
 * @fileoverview Abuse Complaint Service
 * Service layer for handling all abuse complaint related operations
 *
 * @module AbuseComplaintService
 * @requires mongoose
 * @requires @models/abuse-complaint/abuseComplaint
 * @requires @utils/logger
 */

const mongoose = require("mongoose");
const logger = require("@utils/logger");

// Ensure module-alias is registered if not already
try {
  require("module-alias/register");
} catch (e) {
  // Already registered or not available
}

// Import the model - this should register it
let AbuseComplaint;
try {
  AbuseComplaint = require("@models/abuse-complaint/abuseComplaint");
} catch (error) {
  console.error("Failed to import AbuseComplaint model:", error);
  // Fallback to direct path
  try {
    AbuseComplaint = require("../../models/abuse-complaint/abuseComplaint");
  } catch (fallbackError) {
    console.error("Fallback import also failed:", fallbackError);
    throw new Error("Cannot import AbuseComplaint model");
  }
}

/**
 * Custom error class for complaint-related operations
 */
class ComplaintError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = "ComplaintError";
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
  status,
  priority,
  dateRange,
  abuseType,
  abuseMedium,
  assignedTo,
}) => {
  let query = {};

  if (searchText) {
    query.$or = [
      { "reporter.email": { $regex: searchText, $options: "i" } },
      { "reporter.firstName": { $regex: searchText, $options: "i" } },
      { "reporter.lastName": { $regex: searchText, $options: "i" } },
      { comments: { $regex: searchText, $options: "i" } },
    ];
  }

  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (abuseType) query.abuseType = abuseType;
  if (abuseMedium) query.abuseMedium = abuseMedium;
  if (assignedTo) query.reviewedBy = assignedTo;

  if (dateRange?.startDate && dateRange?.endDate) {
    query.createdAt = {
      $gte: new Date(dateRange.startDate),
      $lte: new Date(dateRange.endDate),
    };
  }

  return query;
};

class AbuseComplaintService {
  /**
   * Create a new abuse complaint
   * @param {Object} complaintData - The complaint data
   * @returns {Promise<Object>} Created complaint document
   */
  static createComplaint = async (complaintData) => {
    try {
      // Debug: Log the data being passed to the model
      console.log("DEBUG SERVICE - Creating complaint with data keys:", Object.keys(complaintData));
      if (complaintData.technicalInfo) {
        console.log("DEBUG SERVICE - technicalInfo keys:", Object.keys(complaintData.technicalInfo));
        console.log("DEBUG SERVICE - device structure:", {
          hasDevice: !!complaintData.technicalInfo.device,
          deviceType: typeof complaintData.technicalInfo.device,
          deviceTypeField: complaintData.technicalInfo.device?.type,
          deviceTypeFieldType: typeof complaintData.technicalInfo.device?.type,
        });
      }
      
      const newComplaint = new AbuseComplaint(complaintData);
      
      // Debug: Check if the model was created successfully
      console.log("DEBUG SERVICE - Mongoose model created, attempting to save...");
      
      const savedComplaint = await newComplaint.save();

      logger.info("New complaint created", {
        complaintId: savedComplaint._id,
        abuseType: savedComplaint.abuseType,
        reporterEmail: savedComplaint.reporter.email,
      });

      return savedComplaint;
    } catch (error) {
      console.error("DEBUG SERVICE - Detailed save error:", {
        errorName: error.name,
        errorMessage: error.message,
        validationErrors: error.errors ? Object.keys(error.errors) : 'No validation errors',
      });
      
      logger.error("Error creating complaint", { error, complaintData });
      throw error;
    }
  };

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
   * Find complaint by ID
   */
  static findComplaintById = async (id) => {
    try {
      const complaint = await AbuseComplaint.findById(id)
        .populate("reviewedBy", "name email")
        .populate("relatedComplaints")
        .populate("notes.addedBy", "name email");

      if (!complaint) {
        throw new ComplaintError("Complaint not found", 404);
      }

      return complaint;
    } catch (error) {
      if (error.name === "CastError") {
        throw new ComplaintError("Invalid complaint ID format", 400);
      }
      throw error;
    }
  };

  /**
   * Find complaints paginated with search and filters
   */
  static findComplaintsPaginated = async (
    page,
    perPage,
    searchParams = {},
    sortOptions = { field: "createdAt", order: -1 }
  ) => {
    try {
      const searchQuery = buildSearchQuery(searchParams);
      const sortConfig = { [sortOptions.field]: sortOptions.order };

      const [complaints, total, statistics] = await Promise.all([
        AbuseComplaint.find(searchQuery)
          .populate("reviewedBy", "name email")
          .populate("relatedComplaints")
          .sort(sortConfig)
          .skip((page - 1) * perPage)
          .limit(perPage),
        AbuseComplaint.countDocuments(searchQuery),
        this.getComplaintStatistics(searchQuery.dateRange),
      ]);

      return {
        complaints,
        pagination: {
          page,
          perPage,
          total,
          totalPages: Math.ceil(total / perPage),
        },
        statistics,
      };
    } catch (error) {
      logger.error("Error finding paginated complaints", { error });
      throw error;
    }
  };

  static getComplaintStatistics = async (dateRange = {}) => {
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

      const [statusStats, priorityStats, abuseTypeStats, timeStats] =
        await Promise.all([
          // Status breakdown
          AbuseComplaint.aggregate([
            { $match: baseQuery },
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
              },
            },
          ]),

          // Priority breakdown
          AbuseComplaint.aggregate([
            { $match: baseQuery },
            {
              $group: {
                _id: "$priority",
                count: { $sum: 1 },
              },
            },
          ]),

          // Abuse type breakdown
          AbuseComplaint.aggregate([
            { $match: baseQuery },
            {
              $group: {
                _id: "$abuseType",
                count: { $sum: 1 },
              },
            },
          ]),

          // Time-based statistics
          AbuseComplaint.aggregate([
            { $match: baseQuery },
            {
              $group: {
                _id: null,
                averageResolutionTime: {
                  $avg: {
                    $subtract: ["$resolution.date", "$createdAt"],
                  },
                },
                totalComplaints: { $sum: 1 },
                unresolvedHighPriority: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $in: ["$status", ["new", "under_review"]] },
                          { $eq: ["$priority", "high"] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ]),
        ]);

      // Transform status stats into a more readable format
      const statusCounts = statusStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {});

      return {
        totalComplaints: timeStats[0]?.totalComplaints || 0,
        statusBreakdown: {
          new: statusCounts.new || 0,
          under_review: statusCounts.under_review || 0,
          resolved: statusCounts.resolved || 0,
          rejected: statusCounts.rejected || 0,
          duplicate: statusCounts.duplicate || 0,
        },
        priorityBreakdown: priorityStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        abuseTypeBreakdown: abuseTypeStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        metrics: {
          averageResolutionTime: timeStats[0]?.averageResolutionTime
            ? Math.floor(timeStats[0].averageResolutionTime / (1000 * 60 * 60)) // Convert to hours
            : 0,
          unresolvedHighPriority: timeStats[0]?.unresolvedHighPriority || 0,
        },
      };
    } catch (error) {
      logger.error("Error getting complaint statistics", { error });
      throw error;
    }
  };

  /**
   * Delete complaint
   */
  static deleteComplaint = async (complaintId, userId) => {
    try {
      // Check if complaint exists
      const complaint = await AbuseComplaint.findById(complaintId);

      if (!complaint) {
        throw new ComplaintError("Complaint not found", 404);
      }

      // Check if complaint has related complaints
      if (complaint.relatedComplaints?.length > 0) {
        // Remove this complaint's ID from related complaints
        await AbuseComplaint.updateMany(
          { _id: { $in: complaint.relatedComplaints } },
          { $pull: { relatedComplaints: complaintId } }
        );
      }

      // Create an audit log before deletion
      logger.info("Complaint deleted", {
        complaintId,
        deletedBy: userId,
        complaintType: complaint.abuseType,
        complaintStatus: complaint.status,
        deletedAt: new Date(),
      });

      // Delete the complaint
      const deletedComplaint = await AbuseComplaint.findByIdAndDelete(
        complaintId
      );

      if (!deletedComplaint) {
        throw new ComplaintError("Error deleting complaint", 500);
      }

      return deletedComplaint;
    } catch (error) {
      logger.error("Error in deleteComplaint service", {
        error,
        complaintId,
        userId,
      });
      throw error;
    }
  };

  /**
   * Resolve complaint
   */
  static resolveComplaint = async (complaintId, resolutionData) => {
    try {
      const updates = {
        status: "resolved",
        resolution: {
          action: resolutionData.action,
          notes: resolutionData.notes || "",
          type: resolutionData.resolutionType,
          actionTaken: resolutionData.actionTaken,
          date: resolutionData.resolvedAt,
        },
        reviewedBy: resolutionData.resolvedBy,
        reviewedAt: resolutionData.resolvedAt,
      };

      const resolvedComplaint = await AbuseComplaint.findByIdAndUpdate(
        complaintId,
        { $set: updates },
        { new: true }
      )
        .populate("reviewedBy", "name email")
        .populate("relatedComplaints");

      if (!resolvedComplaint) {
        throw new ComplaintError("Complaint not found", 404);
      }

      // Update related complaints if any
      if (resolvedComplaint.relatedComplaints?.length > 0) {
        await AbuseComplaint.updateMany(
          { _id: { $in: resolvedComplaint.relatedComplaints } },
          {
            $set: {
              status: "resolved",
              resolution: {
                action: "related_resolved",
                notes: `Resolved as related to complaint ${complaintId}`,
                date: resolutionData.resolvedAt,
              },
            },
          }
        );
      }

      return resolvedComplaint;
    } catch (error) {
      logger.error("Error resolving complaint", { error, complaintId });
      throw error;
    }
  };

  /**
   * Update complaint status
   */
  static updateStatus = async (complaintId, status, reviewerId, notes = "") => {
    try {
      const complaint = await AbuseComplaint.findByIdAndUpdate(
        complaintId,
        {
          $set: {
            status,
            reviewedBy: reviewerId,
            reviewedAt: new Date(),
            "resolution.notes": notes,
          },
        },
        { new: true }
      ).populate("reviewedBy", "name email");

      if (!complaint) {
        throw new ComplaintError("Complaint not found", 404);
      }

      return complaint;
    } catch (error) {
      logger.error("Error updating complaint status", { error, complaintId });
      throw error;
    }
  };

  /**
   * Assign complaint
   */
  static assignComplaint = async (complaintId, assigneeId) => {
    try {
      const complaint = await AbuseComplaint.findByIdAndUpdate(
        complaintId,
        {
          $set: {
            reviewedBy: assigneeId,
            status: "under_review",
          },
        },
        { new: true }
      ).populate("reviewedBy", "name email");

      if (!complaint) {
        throw new ComplaintError("Complaint not found", 404);
      }

      return complaint;
    } catch (error) {
      logger.error("Error assigning complaint", { error, complaintId });
      throw error;
    }
  };

  /**
   * Search complaints
   */
  static searchComplaints = async (
    page,
    perPage,
    searchParams,
    sortOptions = { field: "createdAt", order: -1 }
  ) => {
    try {
      const searchQuery = buildSearchQuery(searchParams);
      const sortConfig = { [sortOptions.field]: sortOptions.order };

      const [complaints, total] = await Promise.all([
        AbuseComplaint.find(searchQuery)
          .populate("reviewedBy", "name email")
          .sort(sortConfig)
          .skip((page - 1) * perPage)
          .limit(perPage),
        AbuseComplaint.countDocuments(searchQuery),
      ]);

      return {
        complaints,
        pagination: {
          page,
          perPage,
          total,
          totalPages: Math.ceil(total / perPage),
        },
      };
    } catch (error) {
      logger.error("Error searching complaints", { error });
      throw error;
    }
  };

  /**
   * Get complaint statistics
   */
  /**
   * Update complaint by ID
   * @param {string} complaintId - The ID of the complaint to update
   * @param {Object} updateData - Object containing fields to update
   * @param {string} userId - ID of the user making the update
   * @returns {Promise<Object>} Updated complaint document
   */
  static updateComplaintById = async (complaintId, updateData, userId) => {
    try {
      // Prepare the update object
      const updateObject = {
        ...updateData,
        reviewedBy: userId,
        reviewedAt: new Date(),
      };

      // If there's a status change, update resolution details
      if (updateData.status) {
        updateObject["reviewedAt"] = new Date();
        updateObject["reviewedBy"] = userId;
      }

      // If there's a resolution action, update resolution date
      if (updateData.resolution?.action) {
        updateObject["resolution.date"] = new Date();
      }

      const updatedComplaint = await AbuseComplaint.findByIdAndUpdate(
        complaintId,
        { $set: updateObject },
        {
          new: true,
          runValidators: true,
        }
      ).populate("reviewedBy", "firstName lastName email");

      return updatedComplaint;
    } catch (error) {
      logger.error("Error updating complaint by ID", { error, complaintId });
      throw error;
    }
  };

  /**
   * Bulk update complaints
   * @param {Array<string>} complaintIds - Array of complaint IDs
   * @param {Object} updateData - Data to update
   * @param {string} userId - ID of the user making the update
   * @returns {Promise<number>} Number of modified documents
   */
  static bulkUpdateComplaints = async (complaintIds, updateData, userId) => {
    try {
      const updateObject = {
        ...updateData,
        reviewedBy: userId,
        reviewedAt: new Date(),
      };

      const result = await AbuseComplaint.updateMany(
        { _id: { $in: complaintIds } },
        { $set: updateObject },
        { runValidators: true }
      );

      return result.modifiedCount;
    } catch (error) {
      logger.error("Error bulk updating complaints", { error, complaintIds });
      throw error;
    }
  };

  /**
   * Get complaints for export
   */
  static getComplaintsForExport = async (filterParams = {}) => {
    try {
      const searchQuery = buildSearchQuery(filterParams);
      const complaints = await AbuseComplaint.find(searchQuery)
        .populate("reviewedBy", "name email")
        .sort({ createdAt: -1 });

      return complaints;
    } catch (error) {
      logger.error("Error exporting complaints", { error });
      throw error;
    }
  };

  /**
   * Find similar complaints
   */
  static findSimilarComplaints = async (complaint) => {
    try {
      return await AbuseComplaint.find({
        "reporter.email": complaint.reporter.email,
        abuseType: complaint.abuseType,
        createdAt: {
          $gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      })
        .limit(5)
        .select("_id");
    } catch (error) {
      logger.error("Error finding similar complaints", { error });
      throw error;
    }
  };

  /**
   * Get filtered complaints
   */
  static getComplaintsFiltered = async (
    page,
    perPage,
    filterParams = {},
    sortOptions = { field: "createdAt", order: -1 }
  ) => {
    try {
      const searchQuery = buildSearchQuery(filterParams);
      const sortConfig = { [sortOptions.field]: sortOptions.order };

      const [complaints, total] = await Promise.all([
        AbuseComplaint.find(searchQuery)
          .populate("reviewedBy", "name email")
          .populate("relatedComplaints")
          .sort(sortConfig)
          .skip((page - 1) * perPage)
          .limit(perPage),
        AbuseComplaint.countDocuments(searchQuery),
      ]);

      return {
        complaints,
        pagination: {
          page,
          perPage,
          total,
          totalPages: Math.ceil(total / perPage),
        },
      };
    } catch (error) {
      logger.error("Error getting filtered complaints", { error });
      throw error;
    }
  };

  /**
   * Add note to complaint
   */
  static addNote = async (complaintId, noteData) => {
    console.log("DEBUG addNote - Input data:", {
      complaintId,
      noteData,
      hasContent: !!noteData.content,
      hasAddedBy: !!noteData.addedBy,
    });

    if (!noteData.content || !noteData.addedBy) {
      throw new Error("Note content and author are required");
    }

    try {
      console.log("DEBUG addNote - About to update complaint...");
      
      const complaint = await AbuseComplaint.findByIdAndUpdate(
        complaintId,
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
      );

      console.log("DEBUG addNote - Update result:", {
        found: !!complaint,
        complaintId: complaint?._id,
        notesCount: complaint?.notes?.length,
      });

      if (!complaint) {
        throw new Error("Complaint not found");
      }

      return complaint;
    } catch (error) {
      console.error("DEBUG addNote - Error details:", {
        errorName: error.name,
        errorMessage: error.message,
        errorCode: error.code,
        validationErrors: error.errors ? Object.keys(error.errors) : null,
      });
      
      if (error.name === "ValidationError") {
        throw error;
      }
      throw new Error(`Failed to add note to complaint: ${error.message}`);
    }
  };

  // Method to update note
  /**
   * Update note in complaint
   * @param {string} complaintId - ID of the complaint
   * @param {string} noteId - ID of the note to update
   * @param {Object} updateData - Data for updating the note
   * @returns {Promise<Document>} Updated complaint document
   */
  static updateNote = async (complaintId, noteId, updateData) => {
    if (!updateData.content || !updateData.editedBy) {
      throw new Error("Note content and editor are required");
    }

    try {
      // Find the complaint and update the specific note
      const complaint = await AbuseComplaint.findOneAndUpdate(
        {
          _id: complaintId,
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
      );

      if (!complaint) {
        throw new Error("Note not found");
      }

      return complaint;
    } catch (error) {
      if (error.name === "ValidationError") {
        throw error;
      }
      throw new Error("Failed to update note in complaint");
    }
  };

  /**
   * Enhanced service for marking complaints as duplicate with pattern detection
   */
  static markAsDuplicate = async (
    complaintId,
    originalComplaintId,
    userId,
    note = ""
  ) => {
    try {
      // Verify both complaints exist
      const [complaint, originalComplaint] = await Promise.all([
        AbuseComplaint.findById(complaintId),
        AbuseComplaint.findById(originalComplaintId),
      ]);

      if (!complaint) {
        throw new ComplaintError("Complaint not found", 404);
      }
      if (!originalComplaint) {
        throw new ComplaintError("Original complaint not found", 404);
      }

      // Check for pattern matches
      const patternMatches = await this.findPatternMatches({
        abuseType: complaint.abuseType,
        abuseMedium: complaint.abuseMedium,
        email: complaint.reporter.email,
        createdAt: complaint.createdAt,
      });

      // Determine duplicate type and priority
      const duplicateType = this.determineDuplicateType(
        complaint,
        originalComplaint,
        patternMatches
      );
      const priority = this.calculatePriority(duplicateType, patternMatches);

      // Build updates object
      const updates = {
        status: "duplicate",
        priority,
        resolution: {
          action: "duplicate",
          notes: this.buildDuplicateNote(note, duplicateType, patternMatches),
          date: new Date(),
          duplicateType,
        },
        reviewedBy: userId,
        reviewedAt: new Date(),
        relatedComplaints: [originalComplaintId],
        patternAnalysis: {
          matchType: duplicateType,
          patternCount: patternMatches.length,
          timeframe: "24h",
          relatedPatterns: patternMatches.map((m) => ({
            id: m._id,
            type: m.abuseType,
            medium: m.abuseMedium,
            date: m.createdAt,
          })),
        },
      };

      // Update the complaint
      const updatedComplaint = await AbuseComplaint.findByIdAndUpdate(
        complaintId,
        { $set: updates },
        { new: true }
      )
        .populate("reviewedBy", "name email")
        .populate("relatedComplaints");

      // Log the duplicate marking for analysis
      logger.info("Complaint marked as duplicate", {
        complaintId,
        originalComplaintId,
        duplicateType,
        patternCount: patternMatches.length,
        priority,
      });

      return updatedComplaint;
    } catch (error) {
      logger.error("Error marking complaint as duplicate", {
        error,
        complaintId,
        originalComplaintId,
      });
      throw error;
    }
  };

  /**
   * Find similar complaints based on various patterns
   */
  static findPatternMatches = async (complaintData) => {
    const timeThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours

    return await AbuseComplaint.find({
      $or: [
        // Exact matches (same email and abuse type)
        {
          "reporter.email": complaintData.email,
          abuseType: complaintData.abuseType,
          createdAt: { $gte: timeThreshold },
        },
        // Pattern matches (same abuse type and medium)
        {
          abuseType: complaintData.abuseType,
          abuseMedium: complaintData.abuseMedium,
          createdAt: { $gte: timeThreshold },
        },
        // Medium pattern matches (same medium with high frequency)
        {
          abuseMedium: complaintData.abuseMedium,
          createdAt: { $gte: timeThreshold },
        },
      ],
      _id: { $ne: complaintData._id }, // Exclude the current complaint
    });
  };

  /**
   * Determine the type of duplicate based on matching criteria
   */
  static determineDuplicateType = (
    complaint,
    originalComplaint,
    patternMatches
  ) => {
    if (complaint.reporter.email === originalComplaint.reporter.email) {
      return "SAME_REPORTER";
    }

    if (
      complaint.abuseType === originalComplaint.abuseType &&
      complaint.abuseMedium === originalComplaint.abuseMedium
    ) {
      return "EXACT_PATTERN";
    }

    if (
      complaint.abuseMedium === originalComplaint.abuseMedium &&
      patternMatches.length >= 3
    ) {
      return "MEDIUM_PATTERN";
    }

    if (complaint.abuseType === originalComplaint.abuseType) {
      return "TYPE_PATTERN";
    }

    return "MANUAL_DUPLICATE";
  };

  /**
   * Calculate priority based on duplicate type and pattern matches
   */
  static calculatePriority = (duplicateType, patternMatches) => {
    if (patternMatches.length >= 5) return "critical";
    if (duplicateType === "EXACT_PATTERN" || patternMatches.length >= 3)
      return "high";
    if (duplicateType === "SAME_REPORTER") return "medium";
    return "low";
  };

  /**
   * Build detailed note for duplicate marking
   */
  static buildDuplicateNote = (userNote, duplicateType, patternMatches) => {
    let systemNote = `Marked as duplicate (${duplicateType}). `;

    if (patternMatches.length > 0) {
      systemNote += `Found ${patternMatches.length} similar complaints in the last 24 hours. `;
    }

    if (userNote) {
      systemNote += `Admin note: ${userNote}`;
    }

    return systemNote;
  };

  /**
   * Helper method to check if a complaint exists
   */
  static checkComplaintExists = async (complaintId) => {
    try {
      return await AbuseComplaint.exists({ _id: complaintId });
    } catch (error) {
      if (error.name === "CastError") {
        throw new ComplaintError("Invalid complaint ID format", 400);
      }
      logger.error("Error checking complaint existence", {
        error,
        complaintId,
      });
      throw error;
    }
  };

  /**
   * Get daily complaint statistics
   */
  static getDailyStats = async (startDate, endDate) => {
    try {
      const stats = await AbuseComplaint.aggregate([
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
              abuseType: "$abuseType",
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
   * Update complaint priority
   */
  static updatePriority = async (complaintId, priority, userId) => {
    try {
      const complaint = await AbuseComplaint.findByIdAndUpdate(
        complaintId,
        {
          $set: {
            priority,
            reviewedBy: userId,
            reviewedAt: new Date(),
          },
        },
        { new: true }
      ).populate("reviewedBy", "name email");

      if (!complaint) {
        throw new ComplaintError("Complaint not found", 404);
      }

      return complaint;
    } catch (error) {
      logger.error("Error updating complaint priority", { error, complaintId });
      throw error;
    }
  };

  /**
   * Get unassigned complaints
   */
  static getUnassignedComplaints = async (page = 1, perPage = 10) => {
    try {
      const [complaints, total] = await Promise.all([
        AbuseComplaint.find({ reviewedBy: null })
          .sort({ createdAt: -1 })
          .skip((page - 1) * perPage)
          .limit(perPage),
        AbuseComplaint.countDocuments({ reviewedBy: null }),
      ]);

      return {
        complaints,
        pagination: {
          page,
          perPage,
          total,
          totalPages: Math.ceil(total / perPage),
        },
      };
    } catch (error) {
      logger.error("Error getting unassigned complaints", { error });
      throw error;
    }
  };

  /**
   * Get complaint audit trail
   */
  static getComplaintAuditTrail = async (complaintId) => {
    try {
      const complaint = await AbuseComplaint.findById(complaintId)
        .populate("reviewedBy", "name email")
        .populate("notes.addedBy", "name email")
        .lean();

      if (!complaint) {
        throw new ComplaintError("Complaint not found", 404);
      }

      const auditTrail = [
        {
          action: "created",
          date: complaint.createdAt,
          details: `Complaint created by ${complaint.reporter.email}`,
        },
        ...complaint.notes.map((note) => ({
          action: "note_added",
          date: note.addedAt,
          details: `Note added by ${note.addedBy.email}: ${note.content}`,
        })),
      ];

      if (complaint.reviewedAt) {
        auditTrail.push({
          action: "reviewed",
          date: complaint.reviewedAt,
          details: `Reviewed by ${complaint.reviewedBy.email}`,
        });
      }

      if (complaint.resolution?.date) {
        auditTrail.push({
          action: "resolved",
          date: complaint.resolution.date,
          details: `Resolved with action: ${complaint.resolution.action}`,
        });
      }

      return auditTrail.sort((a, b) => b.date - a.date);
    } catch (error) {
      logger.error("Error getting complaint audit trail", {
        error,
        complaintId,
      });
      throw error;
    }
  };
}

module.exports = AbuseComplaintService;
