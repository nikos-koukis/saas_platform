import { z } from "zod";

export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Must be a valid id");

/** Treats an empty or "all" filter value as "no filter applied". */
export const optionalFilter = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => (value === "" || value === "all" ? undefined : value), schema.optional());
