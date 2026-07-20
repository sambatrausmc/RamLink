import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const state = {
    club: { exists: true, data: { name: "Campus Club", status: "active" } },
    profile: {
      exists: true,
      data: { displayName: "Student One", role: "student" },
    },
  };
  const transaction = { get: vi.fn(), set: vi.fn() };
  const db = {
    collection: vi.fn((name: string) => ({
      doc: (id = "generated") => ({ id, path: `${name}/${id}` }),
    })),
    runTransaction: vi.fn(async (callback: (value: typeof transaction) => unknown) =>
      callback(transaction),
    ),
  };
  return { db, state, transaction };
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

import { POST } from "@/app/api/student/inquiries/route";

function request(body: object) {
  return new Request("http://localhost/api/student/inquiries", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("student inquiry API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    security.authenticate.mockResolvedValue({ ok: true, token: { uid: "student-1" } });
    security.rateLimit.mockResolvedValue(null);
    mocks.state.profile.data = { displayName: "Student One", role: "student" };
    mocks.state.club.data = { name: "Campus Club", status: "active" };
    mocks.transaction.get.mockImplementation((reference: { path: string }) => {
      const value = reference.path.startsWith("users/")
        ? mocks.state.profile
        : mocks.state.club;
      return Promise.resolve({ exists: value.exists, data: () => value.data });
    });
  });

  it("creates the inquiry with server-derived identity data", async () => {
    const response = await POST(
      request({
        clubId: "club-1",
        subject: "Meeting question",
        message: "May I attend?",
        studentName: "Forged name",
      }),
    );
    expect(response.status).toBe(201);
    expect(mocks.transaction.set).toHaveBeenCalledTimes(2);
    expect(mocks.transaction.set).toHaveBeenCalledWith(
      expect.objectContaining({ path: "inquiries/generated" }),
      expect.objectContaining({
        clubName: "Campus Club",
        studentId: "student-1",
        studentName: "Student One",
      }),
    );
  });

  it("rejects invalid content, inactive clubs, and rate-limited users", async () => {
    expect((await POST(request({ clubId: "club-1", subject: "", message: "Hi" }))).status)
      .toBe(400);

    mocks.state.club.data.status = "suspended";
    expect(
      (await POST(request({ clubId: "club-1", subject: "Question", message: "Hi" }))).status,
    ).toBe(404);

    security.rateLimit.mockResolvedValueOnce(new Response(null, { status: 429 }));
    expect(
      (await POST(request({ clubId: "club-1", subject: "Question", message: "Hi" }))).status,
    ).toBe(429);
  });
});
