import { NextResponse } from "next/server";
import {
  createCsrfToken,
  CSRF_COOKIE_NAME,
  getCsrfCookieOptions,
} from "@/lib/server/csrf";

export function GET() {
  const csrfToken = createCsrfToken();
  const response = NextResponse.json(
    { csrfToken },
    { headers: { "Cache-Control": "no-store" } },
  );

  response.cookies.set(CSRF_COOKIE_NAME, csrfToken, getCsrfCookieOptions());
  return response;
}
