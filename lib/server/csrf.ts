import { randomBytes, timingSafeEqual } from "node:crypto";
import {
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
} from "@/lib/auth-session-contract";

export { CSRF_COOKIE_NAME, CSRF_HEADER_NAME };

const csrfLifetimeSeconds = 60 * 60;

export function createCsrfToken(now = Date.now()) {
  const issuedAt = Math.floor(now / 1000);
  return `${issuedAt}.${randomBytes(32).toString("base64url")}`;
}

function tokensMatch(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function firstHeaderValue(value: string | null) {
  return value?.split(",", 1)[0]?.trim() || null;
}

function getExpectedOrigins(request: Request) {
  const requestUrl = new URL(request.url);
  const expectedOrigins = new Set([requestUrl.origin]);
  const forwardedHost =
    firstHeaderValue(request.headers.get("x-forwarded-host")) ??
    firstHeaderValue(request.headers.get("x-fh-requested-host")) ??
    firstHeaderValue(request.headers.get("host"));
  const forwardedProtocol =
    firstHeaderValue(request.headers.get("x-forwarded-proto")) ??
    requestUrl.protocol.slice(0, -1);

  if (forwardedHost && forwardedProtocol) {
    try {
      expectedOrigins.add(
        new URL(`${forwardedProtocol}://${forwardedHost}`).origin,
      );
    } catch {
      // The request URL remains the safe fallback for malformed proxy headers.
    }
  }

  return expectedOrigins;
}

export function isCsrfTokenFresh(token: string, now = Date.now()) {
  const [issuedAtText, randomValue, extraValue] = token.split(".");
  const issuedAt = Number(issuedAtText);
  const age = Math.floor(now / 1000) - issuedAt;

  return (
    extraValue === undefined &&
    Boolean(randomValue) &&
    Number.isInteger(issuedAt) &&
    age >= 0 &&
    age <= csrfLifetimeSeconds
  );
}

export function verifyCsrfRequest(
  request: Request,
  cookieToken: string | undefined,
  now = Date.now(),
) {
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  const origin = request.headers.get("origin");

  return Boolean(
    cookieToken &&
      headerToken &&
      origin &&
      getExpectedOrigins(request).has(origin) &&
      isCsrfTokenFresh(cookieToken, now) &&
      isCsrfTokenFresh(headerToken, now) &&
      tokensMatch(cookieToken, headerToken),
  );
}

export function getCsrfCookieOptions() {
  return {
    httpOnly: true,
    maxAge: csrfLifetimeSeconds,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}
