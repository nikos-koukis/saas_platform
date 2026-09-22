import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // `select: false` keeps the hash out of every query that does not ask for it.
    passwordHash: { type: String, required: true, select: false },
  },
  { timestamps: true },
);

export type UserAttrs = InferSchemaType<typeof userSchema>;

export const User: Model<UserAttrs> =
  (models.User as Model<UserAttrs>) ?? model<UserAttrs>("User", userSchema);
