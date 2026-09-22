import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const teamMemberSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: { type: String, required: true, trim: true, maxlength: 80 },
  },
  { timestamps: true },
);

export type TeamMemberAttrs = InferSchemaType<typeof teamMemberSchema>;

export const TeamMember: Model<TeamMemberAttrs> =
  (models.TeamMember as Model<TeamMemberAttrs>) ??
  model<TeamMemberAttrs>("TeamMember", teamMemberSchema);
