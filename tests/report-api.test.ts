import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const report = { id: "report-1", set: vi.fn() };
  const profile = {
    exists: true,
    data: vi.fn(() => ({ displayName: "Student One" })),
  };
  const db = {
    collection: vi.fn((name: string) => ({
      doc: (id?: string) =>
        name === "users"
          ? { get: vi.fn().mockResolvedValue(profile), id }
          : report,
    })),
  };
  return { db, profile, report };
});
const security = vi.hoisted(() => ({ authenticate: vi.fn(), rateLimit: vi.fn() }));

vi.mock("@/lib/firebase/admin", () => ({ getAdminDb: () => mocks.db }));
vi.mock("@/lib/server/protected-api", async () => {
  const { NextResponse } = await import("next/server");
  return {
    apiResponse: (body: object, status = 200) => NextResponse.json(body, { status }),
    authenticateProtectedRequest: security.authenticate,
    enforceProtectedRateLimit: security.rateLimit,
  };
});

import { POST } from "@/app/api/student/reports/route";

function request(body: object) {
  return new Request("http://localhost/api/student/reports", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("content report API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    security.authenticate.mockResolvedValue({ ok: true, token: { uid: "student-1" } });
    security.rateLimit.mockResolvedValue(null);
    mocks.profile.exists = true;
    mocks.profile.data.mockReturnValue({ displayName: "Student One" });
    mocks.report.set.mockResolvedValue(undefined);
  });

  it("creates a report with a trusted reporter identity", async () => {
    const response = await POST(
      request({
        contentType: "Event",
        contentTitle: "Campus Event",
        reason: "The location is incorrect.",
        reporterName: "Forged name",
      }),
    );
    expect(response.status).toBe(201);
    expect(mocks.report.set).toHaveBeenCalledWith(
      expect.objectContaining({
        reporterId: "student-1",
        reporterName: "Student One",
        status: "new",
      }),
    );
  });

  it("rejects invalid report types and rate-limited users", async () => {
    expect(
      (
        await POST(
          request({
            contentType: "Executable",
            contentTitle: "Bad type",
            reason: "Not supported.",
          }),
        )
      ).status,
    ).toBe(400);

    security.rateLimit.mockResolvedValueOnce(new Response(null, { status: 429 }));
    expect(
      (
        await POST(
          request({
            contentType: "Event",
            contentTitle: "Campus Event",
            reason: "Repeated report.",
          }),
        )
      ).status,
    ).toBe(429);
    expect(mocks.report.set).not.toHaveBeenCalled();
  });
});
