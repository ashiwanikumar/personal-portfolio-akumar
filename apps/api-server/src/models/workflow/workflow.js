const mongoose = require("mongoose");
const { Schema } = mongoose;

const workflowSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["draft", "active", "paused", "archived"],
      default: "draft",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workspaceId: {
      type: String,
      required: true,
    },
    trigger: {
      type: {
        type: String,
        enum: ["manual", "schedule", "webhook", "email", "form"],
        default: "manual",
      },
      config: {
        type: Schema.Types.Mixed,
        default: {},
      },
    },
    nodes: [
      {
        id: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          required: true,
        },
        position: {
          x: Number,
          y: Number,
        },
        data: {
          type: Schema.Types.Mixed,
          default: {},
        },
      },
    ],
    edges: [
      {
        id: {
          type: String,
          required: true,
        },
        source: {
          type: String,
          required: true,
        },
        target: {
          type: String,
          required: true,
        },
        sourceHandle: String,
        targetHandle: String,
        type: String,
        data: {
          type: Schema.Types.Mixed,
          default: {},
        },
      },
    ],
    variables: {
      type: Schema.Types.Mixed,
      default: {},
    },
    settings: {
      timeout: {
        type: Number,
        default: 300000, // 5 minutes in milliseconds
      },
      retryCount: {
        type: Number,
        default: 3,
      },
      enableLogging: {
        type: Boolean,
        default: true,
      },
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    lastExecutedAt: {
      type: Date,
    },
    executionCount: {
      type: Number,
      default: 0,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better performance
workflowSchema.index({ createdBy: 1, status: 1 });
workflowSchema.index({ workspaceId: 1 });
workflowSchema.index({ "trigger.type": 1 });
workflowSchema.index({ createdAt: -1 });

// Add virtual for execution statistics
workflowSchema.virtual("executionStats", {
  ref: "WorkflowExecution",
  localField: "_id",
  foreignField: "workflowId",
  count: true,
});

// Ensure virtual fields are serialized
workflowSchema.set("toJSON", { virtuals: true });
workflowSchema.set("toObject", { virtuals: true });

const Workflow = mongoose.model("Workflow", workflowSchema);

module.exports = Workflow;