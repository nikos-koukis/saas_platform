import mongoose from "mongoose";
import type { NextRequest, NextResponse } from "next/server";

import { requireSession } from "@/lib/auth/session";
import type { SessionClaims } from "@/lib/auth/jwt";
import { connectToDatabase } from "@/lib/db";
import { HttpError } from "./errors";
import { failure } from "./responses";

type RouteContext<TParams> = { params: Promise<TParams> };
type RouteHandler<TParams> = (
  request: NextRequest,
  context: RouteContext<TParams>,
) => Promise<NextResponse>;

type RouteOptions = {
  /** Set false for handlers that must keep working while Mongo is unreachable. */
  db?: boolean;
};

/**
 * Wraps a route handler with the two concerns every endpoint shares:
 * an open database connection and a consistent error envelope.
 */
export function route<TParams = Record<string, never>>(
  handler: RouteHandler<TParams>,
  { db = true }: RouteOptions = {},
): RouteHandler<TParams> {
  return async (request, context) => {
    try {
      if (db) await connectToDatabase();
      return await handler(request, context);
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

/**
 * Same as `route`, but rejects the request before the handler runs unless a
 * valid session cookie is present. Protection is opt-out rather than opt-in,
 * so a new private endpoint cannot be left open by omission.
 */
export function authedRoute<TParams = Record<string, never>>(
  handler: (
    request: NextRequest,
    context: RouteContext<TParams>,
    session: SessionClaims,
  ) => Promise<NextResponse>,
  options: RouteOptions = {},
): RouteHandler<TParams> {
  return route<TParams>(
    async (request, context) => handler(request, context, await requireSession()),
    options,
  );
}

function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof HttpError) {
    return failure(error.status, error.code, error.message, error.details);
  }

  if (isDuplicateKeyError(error)) {
    return failure(409, "CONFLICT", "That record already exists.");
  }

  if (error instanceof mongoose.Error.CastError) {
    return failure(400, "BAD_REQUEST", `Malformed value for "${error.path}".`);
  }

  if (error instanceof mongoose.Error.ValidationError) {
    const details = Object.fromEntries(
      Object.entries(error.errors).map(([field, issue]) => [field, [issue.message]]),
    );
    return failure(422, "VALIDATION_ERROR", "Some fields need attention.", details);
  }

  // Unexpected: log the cause server-side, return an opaque message.
  console.error("[api] unhandled error", error);
  return failure(500, "INTERNAL_ERROR", "Something went wrong on our side.");
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === 11000
  );
}
