import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const adminMocks = vi.hoisted(() => ({
  createSessionCookie: vi.fn(),
  verifyIdToken: vi.fn(),
}));

const appCheckMocks = vi.hoisted(() => ({ verify: vi.fn() }));

vi.mock("@/lib/firebase/admin", () => ({
  getAdminAuth: () => adminMocks,
}));

vi.mock("@/lib/server/app-check", () => ({
  verifyAppCheckRequest: appCheckMocks.verify,
}));

import { POST } from "@/app/api/auth/session/route";
import { createCsrfToken, CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from "@/lib/server/csrf";
import { SESSION_COOKIE_NAME } from "@/lib/server/session-cookie";

const endpoint = "https://ramlink.example/api/auth/session";

function createRequest(csrfToken = createCsrfToken()) {
  return new NextRequest(endpoint, {
    method: "POST",
    body: JSON.stringify({ idToken: "firebase-id-token" }),
    headers: {
      "content-type": "application/json",
      cookie: `${CSRF_COOKIE_NAME}=${csrfToken}`,
      [CSRF_HEADER_NAME]: csrfToken,
      origin: "https://ramlink.example",
    },
  });
}

function verifiedToken(overrides: Record<string, unknown> = {}) {
  return {
    auth_time: Math.floor(Date.now() / 1000),
    email: "student@farmingdale.edu",
    email_verified: true,
    uid: "student-1",
    ...overrides,
  };
}

describe("Firebase server session creation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    appCheckMocks.verify.mockResolvedValue(true);
    adminMocks.verifyIdToken.mockResolvedValue(verifiedToken());
    adminMocks.createSessionCookie.mockResolvedValue("signed-session-cookie");
  });

  it("creates a five-day HTTP-only session for a recent verified user", async () => {
    const response = await POST(createRequest());

    expect(response.status).toBe(200);
    expect(adminMocks.verifyIdToken).toHaveBeenCalledWith("firebase-id-token", true);
    expect(adminMocks.createSessionCookie).toHaveBeenCalledWith(
      "firebase-id-token",
      { expiresIn: 432000000 },
    );
    expect(response.cookies.get(SESSION_COOKIE_NAME)?.value).toBe(
      "signed-session-cookie",
    );
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    expect(response.headers.get("set-cookie")).toContain("SameSite=lax");
  });

  it("rejects a request without valid CSRF proof", async () => {
    const response = await POST(
      new NextRequest(endpoint, {
        method: "POST",
        body: JSON.stringify({ idToken: "firebase-id-token" }),
      }),
    );

    expect(response.status).toBe(403);
    expect(adminMocks.verifyIdToken).not.toHaveBeenCalled();
  });

  it("rejects a request without valid application proof", async () => {
    appCheckMocks.verify.mockResolvedValue(false);

    const response = await POST(createRequest());

    expect(response.status).toBe(401);
    expect(adminMocks.verifyIdToken).not.toHaveBeenCalled();
  });

  it.each([
    ["an unverified account", { email_verified: false }, 403],
    ["a non-Farmingdale account", { email: "student@gmail.com" }, 403],
    ["a stale sign-in", { auth_time: Math.floor(Date.now() / 1000) - 301 }, 401],
  ])("rejects %s", async (_label, overrides, status) => {
    adminMocks.verifyIdToken.mockResolvedValue(verifiedToken(overrides));

    const response = await POST(createRequest());

    expect(response.status).toBe(status);
    expect(adminMocks.createSessionCookie).not.toHaveBeenCalled();
  });

  it("rejects invalid Firebase ID tokens", async () => {
    adminMocks.verifyIdToken.mockRejectedValue(new Error("invalid token"));

    const response = await POST(createRequest());

    expect(response.status).toBe(401);
    expect(adminMocks.createSessionCookie).not.toHaveBeenCalled();
  });
});
