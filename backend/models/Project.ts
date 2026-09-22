import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

// Imported for its side effect: `assignee` populate needs the model registered.
import "./TeamMember";

export const PROJECT_STATUSES = ["active", "on_hold", "completed"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

const projectSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 2000, default: "" },
    status: {
      type: String,
      required: true,
      enum: PROJECT_STATUSES,
      default: "active",
    },
    deadline: { type: Date, required: true },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: "TeamMember",
      required: true,
    },
    // Whole currency units (EUR). Rounded on write so totals stay exact.
    budget: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

// Covers the dashboard's default read: filter by status, order by deadline.
projectSchema.index({ status: 1, deadline: 1 });
projectSchema.index({ assignee: 1 });
projectSchema.index({ name: 1 });

export type ProjectAttrs = InferSchemaType<typeof projectSchema>;

export const Project: Model<ProjectAttrs> =
  (models.Project as Model<ProjectAttrs>) ?? model<ProjectAttrs>("Project", projectSchema);
