import { NextResponse, type NextRequest } from "next/server";

// Read directly rather than through lib/env: middleware runs on every request
// and must not fail closed because an unrelated variable is missing.
const ALLOWED_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:3000";

/**
 * The dashboard is served from a different origin than this API, so browsers
 * need an explicit grant before they will attach the session cookie.
 * Credentialed requests cannot use a wildcard origin.
 */
function applyCors(headers: Headers, origin: string | null) {
  if (origin !== ALLOWED_ORIGIN) return;

  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Credentials", "true");
  headers.set("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  headers.set("Access-Control-Max-Age", "86400");
  headers.set("Vary", "Origin");
}

export function proxy(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (request.method === "OPTIONS") {
    const preflight = new NextResponse(null, { status: 204 });
    applyCors(preflight.headers, origin);
    return preflight;
  }

  const response = NextResponse.next();
  applyCors(response.headers, origin);
  return response;
}

export const config = { matcher: "/api/:path*" };
