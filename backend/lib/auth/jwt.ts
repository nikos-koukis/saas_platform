import { SignJWT, decodeJwt, jwtVerify } from "jose";

import { env } from "@/lib/env";

const ALGORITHM = "HS256";

export type SessionClaims = {
  userId: string;
  email: string;
  name: string;
};

const secret = () => new TextEncoder().encode(env().JWT_SECRET);

export async function signSessionToken(claims: SessionClaims): Promise<string> {
  return new SignJWT({ email: claims.email, name: claims.name })
    .setProtectedHeader({ alg: ALGORITHM })
    .setSubject(claims.userId)
    .setIssuedAt()
    .setExpirationTime(env().JWT_EXPIRES_IN)
    .sign(secret());
}

/** Returns the claims for a valid, unexpired token, or null for anything else. */
export async function verifySessionToken(token: string): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: [ALGORITHM] });
    const { sub, email, name } = payload;

    if (typeof sub !== "string" || typeof email !== "string" || typeof name !== "string") {
      return null;
    }
    return { userId: sub, email, name };
  } catch {
    return null;
  }
}

/** Seconds until the token expires, used to keep the cookie and the token in step. */
export function secondsUntilExpiry(token: string): number {
  const { exp } = decodeJwt(token);
  if (!exp) return 0;
  return Math.max(0, exp - Math.floor(Date.now() / 1000));
}
