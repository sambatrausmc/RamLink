import "server-only";

import type { DecodedIdToken } from "firebase-admin/auth";
import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { verifyAppCheckRequest } from "@/lib/server/app-check";
import { consumeRateLimit } from "@/lib/server/rate-limit";
import { hasVerifiedFarmingdaleClaims } from "@/lib/server/session-cookie";

type ApiFailure = { ok: false; response: NextResponse };
type ApiSuccess = { ok: true; token: DecodedIdToken };

export type ProtectedApiResult = ApiFailure | ApiSuccess;

type RateLimitOptions = {
  ipLimit: number;
  scope: string;
  uidLimit: number;
  windowSeconds: number;
};

export function apiResponse(
  body: object,
  status = 200,
  headers: Record<string, string> = {},
) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}

export async function authenticateProtectedRequest(
  request: Request,
): Promise<ProtectedApiResult> {
  if (!(await verifyAppCheckRequest(request))) {
    return {
      ok: false,
      response: apiResponse({ error: "Invalid application token." }, 401),
    };
  }

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return {
      ok: false,
      response: apiResponse({ error: "Authentication required." }, 401),
    };
  }

  try {
    const token = await getAdminAuth().verifyIdToken(
      authorization.slice("Bearer ".length),
      true,
    );
    if (!hasVerifiedFarmingdaleClaims(token)) {
      return {
        ok: false,
        response: apiResponse(
          { error: "A verified Farmingdale account is required." },
          403,
        ),
      };
    }
    return { ok: true, token };
  } catch {
    return {
      ok: false,
      response: apiResponse({ error: "Invalid authentication token." }, 401),
    };
  }
}

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0];
  const value = forwarded?.trim() || request.headers.get("x-real-ip")?.trim();
  return value?.slice(0, 128) || "unknown";
}

export async function enforceProtectedRateLimit(
  request: Request,
  uid: string,
  options: RateLimitOptions,
) {
  const [userLimit, ipLimit] = await Promise.all([
    consumeRateLimit({
      scope: `${options.scope}-uid`,
      subject: uid,
      limit: options.uidLimit,
      windowSeconds: options.windowSeconds,
    }),
    consumeRateLimit({
      scope: `${options.scope}-ip`,
      subject: getClientIp(request),
      limit: options.ipLimit,
      windowSeconds: options.windowSeconds,
    }),
  ]);

  if (userLimit.allowed && ipLimit.allowed) return null;
  const retryAfterSeconds = Math.max(
    userLimit.retryAfterSeconds,
    ipLimit.retryAfterSeconds,
  );
  return apiResponse(
    { error: "Too many requests. Try again later." },
    429,
    { "Retry-After": String(retryAfterSeconds) },
  );
}
