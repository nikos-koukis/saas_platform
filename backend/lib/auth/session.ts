import { cookies } from "next/headers";

import { env, isProduction } from "@/lib/env";
import { unauthorized } from "@/lib/http/errors";
import {
  secondsUntilExpiry,
  signSessionToken,
  verifySessionToken,
  type SessionClaims,
} from "./jwt";

export const SESSION_COOKIE = "saas_session";

function cookieOptions() {
  return {
    httpOnly: true, // not readable from JavaScript, so XSS cannot exfiltrate it
    sameSite: "lax" as const,
    secure: isProduction(),
    path: "/",
    domain: env().COOKIE_DOMAIN,
  };
}

export async function startSession(claims: SessionClaims): Promise<void> {
  const token = await signSessionToken(claims);
  const store = await cookies();
  // Expiring the cookie with the token keeps the two from drifting apart.
  store.set(SESSION_COOKIE, token, { ...cookieOptions(), maxAge: secondsUntilExpiry(token) });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", { ...cookieOptions(), maxAge: 0 });
}

export async function getSession(): Promise<SessionClaims | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? verifySessionToken(token) : null;
}

export async function requireSession(): Promise<SessionClaims> {
  const session = await getSession();
  if (!session) throw unauthorized();
  return session;
}
