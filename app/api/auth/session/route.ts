import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { CSRF_COOKIE_NAME, verifyCsrfRequest } from "@/lib/server/csrf";
import { verifyAppCheckRequest } from "@/lib/server/app-check";
import { consumeRateLimit } from "@/lib/server/rate-limit";
import {
  getExpiredSessionCookieOptions,
  getSessionCookieOptions,
  hasRecentAuthentication,
  hasVerifiedFarmingdaleClaims,
  SESSION_COOKIE_NAME,
  SESSION_LIFETIME_SECONDS,
} from "@/lib/server/session-cookie";

function sessionResponse(
  body: object,
  status = 200,
  headers: Record<string, string> = {},
) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}

function clearSessionCookie(response: NextResponse) {
  response.cookies.set(
    SESSION_COOKIE_NAME,
    "",
    getExpiredSessionCookieOptions(),
  );
  return response;
}

export async function GET(request: NextRequest) {
  if (!(await verifyAppCheckRequest(request))) {
    return sessionResponse({ error: "Invalid application token." }, 401);
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) {
    return sessionResponse({ authenticated: false }, 401);
  }

  try {
    const decodedToken = await getAdminAuth().verifySessionCookie(
      sessionCookie,
      true,
    );
    if (!hasVerifiedFarmingdaleClaims(decodedToken)) {
      return clearSessionCookie(
        sessionResponse({ authenticated: false }, 401),
      );
    }

    return sessionResponse({ authenticated: true, uid: decodedToken.uid });
  } catch {
    return clearSessionCookie(
      sessionResponse({ authenticated: false }, 401),
    );
  }
}

export async function POST(request: NextRequest) {
  if (!(await verifyAppCheckRequest(request))) {
    return sessionResponse({ error: "Invalid application token." }, 401);
  }

  if (
    !verifyCsrfRequest(
      request,
      request.cookies.get(CSRF_COOKIE_NAME)?.value,
    )
  ) {
    return sessionResponse({ error: "Invalid request token." }, 403);
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.idToken !== "string" || !body.idToken) {
    return sessionResponse({ error: "An ID token is required." }, 400);
  }

  try {
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(body.idToken, true);

    if (!hasVerifiedFarmingdaleClaims(decodedToken)) {
      return sessionResponse(
        { error: "A verified Farmingdale account is required." },
        403,
      );
    }
    if (!hasRecentAuthentication(decodedToken)) {
      return sessionResponse({ error: "A recent sign-in is required." }, 401);
    }

    const rateLimit = await consumeRateLimit({
      scope: "session-create",
      subject: decodedToken.uid,
      limit: 10,
      windowSeconds: 10 * 60,
    });
    if (!rateLimit.allowed) {
      return sessionResponse(
        { error: "Too many session requests. Try again later." },
        429,
        { "Retry-After": String(rateLimit.retryAfterSeconds) },
      );
    }

    const sessionCookie = await auth.createSessionCookie(body.idToken, {
      expiresIn: SESSION_LIFETIME_SECONDS * 1000,
    });
    const response = sessionResponse({ authenticated: true });
    response.cookies.set(
      SESSION_COOKIE_NAME,
      sessionCookie,
      getSessionCookieOptions(),
    );
    return response;
  } catch {
    return sessionResponse({ error: "Unable to create the session." }, 401);
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await verifyAppCheckRequest(request))) {
    return sessionResponse({ error: "Invalid application token." }, 401);
  }

  if (
    !verifyCsrfRequest(
      request,
      request.cookies.get(CSRF_COOKIE_NAME)?.value,
    )
  ) {
    return sessionResponse({ error: "Invalid request token." }, 403);
  }

  return clearSessionCookie(
    sessionResponse({ authenticated: false }),
  );
}
