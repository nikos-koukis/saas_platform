import type { NextRequest } from "next/server";
import { z, type ZodType } from "zod";

import { HttpError, unprocessable } from "./errors";

/** Parses and validates a JSON body, reporting field errors the UI can render. */
export async function parseBody<T>(request: NextRequest, schema: ZodType<T>): Promise<T> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw new HttpError(400, "BAD_REQUEST", "Request body must be valid JSON.");
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    throw unprocessable("Some fields need attention.", z.flattenError(result.error).fieldErrors);
  }
  return result.data;
}

/** Validates query string parameters against a schema. */
export function parseQuery<T>(request: NextRequest, schema: ZodType<T>): T {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const result = schema.safeParse(params);
  if (!result.success) {
    throw unprocessable("Invalid query parameters.", z.flattenError(result.error).fieldErrors);
  }
  return result.data;
}
