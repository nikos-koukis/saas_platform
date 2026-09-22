import type { NextRequest } from "next/server";
import { z, type ZodType } from "zod";

import { HttpError, unprocessable } from "./errors";

/**
 * Zod reports whole-object rules (`.refine`) separately from per-field ones.
 * Field errors become `details` for the form to render; an object-level
 * failure has no field to attach to, so it becomes the message itself.
 */
function reject(error: z.ZodError, fallback: string): never {
  const { formErrors, fieldErrors } = z.flattenError(error);
  throw unprocessable(formErrors[0] ?? fallback, fieldErrors);
}

/** Parses and validates a JSON body, reporting field errors the UI can render. */
export async function parseBody<T>(request: NextRequest, schema: ZodType<T>): Promise<T> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw new HttpError(400, "BAD_REQUEST", "Request body must be valid JSON.");
  }

  const result = schema.safeParse(raw);
  if (!result.success) reject(result.error, "Some fields need attention.");
  return result.data;
}

/** Validates query string parameters against a schema. */
export function parseQuery<T>(request: NextRequest, schema: ZodType<T>): T {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());

  const result = schema.safeParse(params);
  if (!result.success) reject(result.error, "Invalid query parameters.");
  return result.data;
}
