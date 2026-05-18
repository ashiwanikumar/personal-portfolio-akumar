const mongoose = require("mongoose");
const { Schema } = mongoose;

const workflowExecutionSchema = new Schema(
  {
    workflowId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    workspaceId: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "RUNNING", "COMPLETED", "FAILED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },
    trigger: {
      type: String,
      enum: ["manual", "schedule", "webhook", "email", "form"],
      required: true,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    duration: {
      type: Number, // Duration in milliseconds
    },
    creditsConsumed: {
      type: Number,
      default: 0,
    },
    executionData: {
      input: {
        type: Schema.Types.Mixed,
        default: {},
      },
      output: {
        type: Schema.Types.Mixed,
        default: {},
      },
      variables: {
        type: Schema.Types.Mixed,
        default: {},
      },
    },
    nodeExecutions: [
      {
        nodeId: {
          type: String,
          required: true,
        },
        status: {
          type: String,
          enum: ["PENDING", "RUNNING", "COMPLETED", "FAILED", "SKIPPED"],
          default: "PENDING",
        },
        startedAt: Date,
        completedAt: Date,
        duration: Number,
        input: Schema.Types.Mixed,
        output: Schema.Types.Mixed,
        error: {
          message: String,
          stack: String,
          code: String,
        },
        creditsUsed: {
          type: Number,
          default: 0,
        },
      },
    ],
    error: {
      message: String,
      stack: String,
      code: String,
      nodeId: String,
    },
    logs: [
      {
        timestamp: {
          type: Date,
          default: Date.now,
        },
        level: {
          type: String,
          enum: ["info", "warn", "error", "debug"],
          default: "info",
        },
        message: String,
        nodeId: String,
        data: Schema.Types.Mixed,
      },
    ],
    retryCount: {
      type: Number,
      default: 0,
    },
    maxRetries: {
      type: Number,
      default: 3,
    },
    priority: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
workflowExecutionSchema.index({ workflowId: 1, status: 1 });
workflowExecutionSchema.index({ userId: 1, createdAt: -1 });
workflowExecutionSchema.index({ status: 1, createdAt: -1 });
workflowExecutionSchema.index({ completedAt: -1 });

// Add a pre-save hook to calculate duration
workflowExecutionSchema.pre("save", function (next) {
  if (this.startedAt && this.completedAt) {
    this.duration = this.completedAt.getTime() - this.startedAt.getTime();
  }
  next();
});

// Virtual for execution time in a readable format
workflowExecutionSchema.virtual("executionTime").get(function () {
  if (!this.duration) return null;
  
  const seconds = Math.floor(this.duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
});

// Ensure virtual fields are serialized
workflowExecutionSchema.set("toJSON", { virtuals: true });
workflowExecutionSchema.set("toObject", { virtuals: true });

const WorkflowExecution = mongoose.model("WorkflowExecution", workflowExecutionSchema);

module.exports = WorkflowExecution;