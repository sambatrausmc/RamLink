import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const adminMocks = vi.hoisted(() => ({
  verifySessionCookie: vi.fn(),
}));

vi.mock("@/lib/firebase/admin", () => ({
  getAdminAuth: () => adminMocks,
}));

import { DELETE, GET } from "@/app/api/auth/session/route";
import { createCsrfToken, CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from "@/lib/server/csrf";
import { SESSION_COOKIE_NAME } from "@/lib/server/session-cookie";

const endpoint = "https://ramlink.example/api/auth/session";

function verifiedToken(overrides: Record<string, unknown> = {}) {
  return {
    email: "student@farmingdale.edu",
    email_verified: true,
    uid: "student-1",
    ...overrides,
  };
}

function sessionRequest(cookie = "signed-session") {
  return new NextRequest(endpoint, {
    headers: cookie ? { cookie: `${SESSION_COOKIE_NAME}=${cookie}` } : {},
  });
}

function logoutRequest(includeSession = true) {
  const csrfToken = createCsrfToken();
  const cookies = [
    `${CSRF_COOKIE_NAME}=${csrfToken}`,
    ...(includeSession ? [`${SESSION_COOKIE_NAME}=signed-session`] : []),
  ];

  return new NextRequest(endpoint, {
    method: "DELETE",
    headers: {
      cookie: cookies.join("; "),
      [CSRF_HEADER_NAME]: csrfToken,
      origin: "https://ramlink.example",
    },
  });
}

describe("Firebase server session lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminMocks.verifySessionCookie.mockResolvedValue(verifiedToken());
  });

  it("validates a current session with revocation checks", async () => {
    const response = await GET(sessionRequest());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      authenticated: true,
      uid: "student-1",
    });
    expect(adminMocks.verifySessionCookie).toHaveBeenCalledWith(
      "signed-session",
      true,
    );
  });

  it("rejects a missing session", async () => {
    const response = await GET(sessionRequest(""));

    expect(response.status).toBe(401);
    expect(adminMocks.verifySessionCookie).not.toHaveBeenCalled();
  });

  it.each([
    ["invalid signature", new Error("invalid"), undefined],
    ["unverified claim", undefined, { email_verified: false }],
    ["wrong domain", undefined, { email: "student@gmail.com" }],
  ])("clears a session with an %s", async (_label, error, overrides) => {
    if (error) {
      adminMocks.verifySessionCookie.mockRejectedValue(error);
    } else {
      adminMocks.verifySessionCookie.mockResolvedValue(verifiedToken(overrides));
    }

    const response = await GET(sessionRequest());

    expect(response.status).toBe(401);
    expect(response.cookies.get(SESSION_COOKIE_NAME)?.value).toBe("");
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
  });

  it("clears a session after a CSRF-protected logout", async () => {
    const response = await DELETE(logoutRequest());

    expect(response.status).toBe(200);
    expect(response.cookies.get(SESSION_COOKIE_NAME)?.value).toBe("");
  });

  it("allows repeated logout after the session is already gone", async () => {
    const response = await DELETE(logoutRequest(false));

    expect(response.status).toBe(200);
  });

  it("rejects logout without CSRF proof", async () => {
    const response = await DELETE(
      new NextRequest(endpoint, { method: "DELETE" }),
    );

    expect(response.status).toBe(403);
  });
});
