import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { CSRF_COOKIE_NAME, verifyCsrfRequest } from "@/lib/server/csrf";
import {
  getSessionCookieOptions,
  hasRecentAuthentication,
  hasVerifiedFarmingdaleClaims,
  SESSION_COOKIE_NAME,
  SESSION_LIFETIME_SECONDS,
} from "@/lib/server/session-cookie";

export async function POST(request: NextRequest) {
  if (
    !verifyCsrfRequest(
      request,
      request.cookies.get(CSRF_COOKIE_NAME)?.value,
    )
  ) {
    return NextResponse.json({ error: "Invalid request token." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.idToken !== "string" || !body.idToken) {
    return NextResponse.json({ error: "An ID token is required." }, { status: 400 });
  }

  try {
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(body.idToken, true);

    if (!hasVerifiedFarmingdaleClaims(decodedToken)) {
      return NextResponse.json(
        { error: "A verified Farmingdale account is required." },
        { status: 403 },
      );
    }
    if (!hasRecentAuthentication(decodedToken)) {
      return NextResponse.json(
        { error: "A recent sign-in is required." },
        { status: 401 },
      );
    }

    const sessionCookie = await auth.createSessionCookie(body.idToken, {
      expiresIn: SESSION_LIFETIME_SECONDS * 1000,
    });
    const response = NextResponse.json({ authenticated: true });
    response.cookies.set(
      SESSION_COOKIE_NAME,
      sessionCookie,
      getSessionCookieOptions(),
    );
    return response;
  } catch {
    return NextResponse.json(
      { error: "Unable to create the session." },
      { status: 401 },
    );
  }
}
