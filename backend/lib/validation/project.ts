import { z } from "zod";

import { PROJECT_STATUSES } from "@/models/Project";
import { objectIdSchema, optionalFilter } from "./common";

const name = z.string().trim().min(2, "Name must be at least 2 characters").max(120);
const description = z.string().trim().max(2000, "Description is too long");
const status = z.enum(PROJECT_STATUSES);
const deadline = z.coerce.date({ error: "Enter a valid deadline" });
const assignee = objectIdSchema;
// Stored as whole currency units; a decimal input is rounded rather than rejected.
const budget = z.coerce
  .number({ error: "Budget must be a number" })
  .min(0, "Budget cannot be negative")
  .max(1_000_000_000, "Budget is unrealistically large")
  .transform(Math.round);

export const createProjectSchema = z.object({
  name,
  description: description.default(""),
  status: status.default("active"),
  deadline,
  assignee,
  budget,
});

/** PATCH: any subset of fields, but not an empty body. */
export const patchProjectSchema = z
  .object({ name, description, status, deadline, assignee, budget })
  .partial()
  .refine((body) => Object.keys(body).length > 0, {
    message: "Provide at least one field to update",
  });

/** PUT: a full replacement, so every field must be present. */
export const replaceProjectSchema = z.object({
  name,
  description: description.default(""),
  status,
  deadline,
  assignee,
  budget,
});

export const projectQuerySchema = z.object({
  status: optionalFilter(status),
  assignee: optionalFilter(objectIdSchema),
  search: z.string().trim().max(120).optional(),
  sort: z.enum(["deadline", "name", "budget", "status", "createdAt"]).default("deadline"),
  order: z.enum(["asc", "desc"]).default("asc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type PatchProjectInput = z.infer<typeof patchProjectSchema>;
export type ProjectQuery = z.infer<typeof projectQuerySchema>;
