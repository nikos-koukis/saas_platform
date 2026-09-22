import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "saas_session";
const SIGN_IN = "/login";
const DASHBOARD = "/projects";

/**
 * A fast redirect so a signed-out visitor never sees the dashboard shell
 * flash. It only checks that a cookie exists — the signing secret lives on
 * the API, so RequireAuth still has to confirm the session is real.
 *
 * Note: this reads the API's cookie, which works when both apps share a site.
 * On separate subdomains, set COOKIE_DOMAIN on the API.
 */
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE);
  const { pathname } = request.nextUrl;

  if (!hasSession && pathname.startsWith(DASHBOARD)) {
    return NextResponse.redirect(new URL(SIGN_IN, request.url));
  }

  if (hasSession && pathname === SIGN_IN) {
    return NextResponse.redirect(new URL(DASHBOARD, request.url));
  }

  return NextResponse.next();
}

export const config = { matcher: ["/login", "/projects/:path*"] };
