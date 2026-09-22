import { z } from "zod";

import { PROJECT_STATUSES } from "./types";

export type AuthMode = "sign-in" | "sign-up";

/**
 * One shape serves both modes, so a single form can switch between them.
 * Signing in only needs a password to be present; signing up must meet the
 * policy, and asks for a name the sign-in form leaves blank.
 */
export const credentialsSchema = (mode: AuthMode) =>
  z.object({
    name:
      mode === "sign-up"
        ? z.string().trim().min(2, "Name must be at least 2 characters").max(120)
        : z.string(),
    email: z.email("Enter a valid email address"),
    password:
      mode === "sign-up"
        ? z.string().min(8, "Password must be at least 8 characters")
        : z.string().min(1, "Password is required"),
  });

/** Mirrors the API contract so the form reports problems before a round trip. */
export const projectFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120),
  description: z.string().trim().max(2000, "Description is too long"),
  status: z.enum(PROJECT_STATUSES),
  deadline: z.string().min(1, "Pick a deadline"),
  assignee: z.string().min(1, "Choose a team member"),
  budget: z.coerce
    .number<number>({ error: "Budget must be a number" })
    .min(0, "Budget cannot be negative")
    .max(1_000_000_000, "Budget is unrealistically large"),
});

export type CredentialValues = z.infer<ReturnType<typeof credentialsSchema>>;
export type ProjectFormValues = z.infer<typeof projectFormSchema>;
