import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { CSRF_COOKIE_NAME, verifyCsrfRequest } from "@/lib/server/csrf";
import { verifyAppCheckRequest } from "@/lib/server/app-check";
import { consumeRateLimit } from "@/lib/server/rate-limit";
import { getRequestId, logServerEvent } from "@/lib/server/logger";
import {
  getExpiredSessionCookieOptions,
  getSessionCookieOptions,
  hasRecentAuthentication,
  hasVerifiedFarmingdaleClaims,
  SESSION_COOKIE_NAME,
  SESSION_LIFETIME_SECONDS,
} from "@/lib/server/session-cookie";

function sessionResponse(
  requestId: string,
  body: object,
  status = 200,
  headers: Record<string, string> = {},
) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Request-Id": requestId,
      ...headers,
    },
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
  const requestId = getRequestId(request);
  if (!(await verifyAppCheckRequest(request))) {
    logServerEvent("warn", "app_check_rejected", requestId, {
      operation: "session_read",
    });
    return sessionResponse(requestId, { error: "Invalid application token." }, 401);
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) {
    return sessionResponse(requestId, { authenticated: false }, 401);
  }

  try {
    const decodedToken = await getAdminAuth().verifySessionCookie(
      sessionCookie,
      true,
    );
    if (!hasVerifiedFarmingdaleClaims(decodedToken)) {
      return clearSessionCookie(
        sessionResponse(requestId, { authenticated: false }, 401),
      );
    }

    return sessionResponse(requestId, { authenticated: true, uid: decodedToken.uid });
  } catch {
    return clearSessionCookie(
      sessionResponse(requestId, { authenticated: false }, 401),
    );
  }
}

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);
  if (!(await verifyAppCheckRequest(request))) {
    logServerEvent("warn", "app_check_rejected", requestId, {
      operation: "session_create",
    });
    return sessionResponse(requestId, { error: "Invalid application token." }, 401);
  }

  if (
    !verifyCsrfRequest(
      request,
      request.cookies.get(CSRF_COOKIE_NAME)?.value,
    )
  ) {
    return sessionResponse(requestId, { error: "Invalid request token." }, 403);
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.idToken !== "string" || !body.idToken) {
    return sessionResponse(requestId, { error: "An ID token is required." }, 400);
  }

  try {
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(body.idToken, true);

    if (!hasVerifiedFarmingdaleClaims(decodedToken)) {
      return sessionResponse(
        requestId,
        { error: "A verified Farmingdale account is required." },
        403,
      );
    }
    if (!hasRecentAuthentication(decodedToken)) {
      return sessionResponse(requestId, { error: "A recent sign-in is required." }, 401);
    }

    const rateLimit = await consumeRateLimit({
      scope: "session-create",
      subject: decodedToken.uid,
      limit: 10,
      windowSeconds: 10 * 60,
    });
    if (!rateLimit.allowed) {
      logServerEvent("warn", "rate_limit_rejected", requestId, {
        operation: "session_create",
        retryAfterSeconds: rateLimit.retryAfterSeconds,
      });
      return sessionResponse(
        requestId,
        { error: "Too many session requests. Try again later." },
        429,
        { "Retry-After": String(rateLimit.retryAfterSeconds) },
      );
    }

    const sessionCookie = await auth.createSessionCookie(body.idToken, {
      expiresIn: SESSION_LIFETIME_SECONDS * 1000,
    });
    const response = sessionResponse(requestId, { authenticated: true });
    response.cookies.set(
      SESSION_COOKIE_NAME,
      sessionCookie,
      getSessionCookieOptions(),
    );
    return response;
  } catch {
    logServerEvent("warn", "session_create_rejected", requestId, {
      reason: "authentication_or_service_error",
    });
    return sessionResponse(requestId, { error: "Unable to create the session." }, 401);
  }
}

export async function DELETE(request: NextRequest) {
  const requestId = getRequestId(request);
  if (!(await verifyAppCheckRequest(request))) {
    logServerEvent("warn", "app_check_rejected", requestId, {
      operation: "session_delete",
    });
    return sessionResponse(requestId, { error: "Invalid application token." }, 401);
  }

  if (
    !verifyCsrfRequest(
      request,
      request.cookies.get(CSRF_COOKIE_NAME)?.value,
    )
  ) {
    return sessionResponse(requestId, { error: "Invalid request token." }, 403);
  }

  return clearSessionCookie(
    sessionResponse(requestId, { authenticated: false }),
  );
}
