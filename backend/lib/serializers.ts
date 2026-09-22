import type { Types } from "mongoose";

/**
 * Wire formats live here rather than on the schemas, so the API contract
 * stays explicit and independent of how documents are stored.
 */
export type UserDto = {
  id: string;
  name: string;
  email: string;
};

type UserSource = {
  _id: Types.ObjectId | string;
  name: string;
  email: string;
};

export function serializeUser(user: UserSource): UserDto {
  return { id: String(user._id), name: user.name, email: user.email };
}
