import { NextResponse } from "next/server";

/**
 * Every response uses one of two envelopes: `{ data }` on success,
 * `{ error: { code, message, details? } }` on failure.
 */
export function ok<T>(data: T, meta?: Record<string, unknown>) {
  return NextResponse.json(meta ? { data, meta } : { data }, { status: 200 });
}

export function created<T>(data: T) {
  return NextResponse.json({ data }, { status: 201 });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function failure(status: number, code: string, message: string, details?: unknown) {
  return NextResponse.json(
    { error: details === undefined ? { code, message } : { code, message, details } },
    { status },
  );
}
