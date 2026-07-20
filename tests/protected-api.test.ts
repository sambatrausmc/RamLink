import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  consumeRateLimit: vi.fn(),
  verifyAppCheckRequest: vi.fn(),
  verifyIdToken: vi.fn(),
}));

vi.mock("@/lib/firebase/admin", () => ({
  getAdminAuth: () => ({ verifyIdToken: mocks.verifyIdToken }),
}));
vi.mock("@/lib/server/app-check", () => ({
  verifyAppCheckRequest: mocks.verifyAppCheckRequest,
}));
vi.mock("@/lib/server/rate-limit", () => ({
  consumeRateLimit: mocks.consumeRateLimit,
}));

import {
  authenticateProtectedRequest,
  enforceProtectedRateLimit,
} from "@/lib/server/protected-api";

function request(headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/student/action", { headers });
}

describe("protected API security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.verifyAppCheckRequest.mockResolvedValue(true);
    mocks.verifyIdToken.mockResolvedValue({
      email: "student@farmingdale.edu",
      email_verified: true,
      uid: "student-1",
    });
    mocks.consumeRateLimit.mockResolvedValue({
      allowed: true,
      retryAfterSeconds: 0,
    });
  });

  it("requires App Check and a Firebase bearer token", async () => {
    mocks.verifyAppCheckRequest.mockResolvedValueOnce(false);
    const appCheckFailure = await authenticateProtectedRequest(request());
    expect(appCheckFailure.ok).toBe(false);
    if (!appCheckFailure.ok) expect(appCheckFailure.response.status).toBe(401);

    const authFailure = await authenticateProtectedRequest(request());
    expect(authFailure.ok).toBe(false);
    if (!authFailure.ok) expect(authFailure.response.status).toBe(401);
    expect(mocks.verifyIdToken).not.toHaveBeenCalled();
  });

  it("accepts only verified Farmingdale accounts", async () => {
    const valid = await authenticateProtectedRequest(
      request({ Authorization: "Bearer valid-token" }),
    );
    expect(valid.ok).toBe(true);

    mocks.verifyIdToken.mockResolvedValueOnce({
      email: "student@example.com",
      email_verified: true,
      uid: "student-1",
    });
    const invalid = await authenticateProtectedRequest(
      request({ Authorization: "Bearer wrong-domain" }),
    );
    expect(invalid.ok).toBe(false);
    if (!invalid.ok) expect(invalid.response.status).toBe(403);
  });

  it("enforces independent UID and hashed-IP rate-limit records", async () => {
    const response = await enforceProtectedRateLimit(
      request({ "x-forwarded-for": "203.0.113.8, 10.0.0.1" }),
      "student-1",
      { scope: "student-action", uidLimit: 5, ipLimit: 20, windowSeconds: 60 },
    );
    expect(response).toBeNull();
    expect(mocks.consumeRateLimit).toHaveBeenNthCalledWith(1, {
      scope: "student-action-uid",
      subject: "student-1",
      limit: 5,
      windowSeconds: 60,
    });
    expect(mocks.consumeRateLimit).toHaveBeenNthCalledWith(2, {
      scope: "student-action-ip",
      subject: "203.0.113.8",
      limit: 20,
      windowSeconds: 60,
    });

    mocks.consumeRateLimit
      .mockResolvedValueOnce({ allowed: false, retryAfterSeconds: 90 })
      .mockResolvedValueOnce({ allowed: true, retryAfterSeconds: 0 });
    const limited = await enforceProtectedRateLimit(request(), "student-1", {
      scope: "student-action",
      uidLimit: 5,
      ipLimit: 20,
      windowSeconds: 60,
    });
    expect(limited?.status).toBe(429);
    expect(limited?.headers.get("retry-after")).toBe("90");
  });
});
