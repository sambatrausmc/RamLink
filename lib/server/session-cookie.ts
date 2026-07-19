import type { DecodedIdToken } from "firebase-admin/auth";
import { isFarmingdaleEmail } from "@/lib/auth-email-policy";
import { SESSION_COOKIE_NAME } from "@/lib/auth-session-contract";

export { SESSION_COOKIE_NAME };
export const SESSION_LIFETIME_SECONDS = 60 * 60 * 24 * 5;

const recentSignInSeconds = 5 * 60;

export function hasVerifiedFarmingdaleClaims(token: DecodedIdToken) {
  return (
    token.email_verified === true &&
    typeof token.email === "string" &&
    isFarmingdaleEmail(token.email)
  );
}

export function hasRecentAuthentication(
  token: DecodedIdToken,
  now = Date.now(),
) {
  const currentTime = Math.floor(now / 1000);
  return (
    typeof token.auth_time === "number" &&
    token.auth_time <= currentTime &&
    currentTime - token.auth_time <= recentSignInSeconds
  );
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    maxAge: SESSION_LIFETIME_SECONDS,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export function getExpiredSessionCookieOptions() {
  return {
    ...getSessionCookieOptions(),
    maxAge: 0,
  };
}
