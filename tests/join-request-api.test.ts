import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const state = {
    club: { exists: true, data: { name: "Campus Club", status: "active" } },
    profile: {
      exists: true,
      data: { displayName: "Student One", role: "student" },
    },
    request: { exists: false, data: {} as Record<string, unknown> },
  };
  const transaction = { delete: vi.fn(), get: vi.fn(), set: vi.fn() };
  const reference = (collection: string, id = "generated") => ({
    id,
    path: `${collection}/${id}`,
  });
  const db = {
    collection: vi.fn((name: string) => ({
      doc: (id?: string) => reference(name, id),
    })),
    runTransaction: vi.fn(async (callback: (value: typeof transaction) => unknown) =>
      callback(transaction),
    ),
  };
  return { db, state, transaction };
});

const security = vi.hoisted(() => ({
  authenticate: vi.fn(),
  rateLimit: vi.fn(),
}));

vi.mock("@/lib/firebase/admin", () => ({ getAdminDb: () => mocks.db }));
vi.mock("@/lib/server/protected-api", async () => {
  const { NextResponse } = await import("next/server");
  return {
    apiResponse: (body: object, status = 200) => NextResponse.json(body, { status }),
    authenticateProtectedRequest: security.authenticate,
    enforceProtectedRateLimit: security.rateLimit,
  };
});

import { DELETE, POST } from "@/app/api/student/join-requests/route";

function request(method: "DELETE" | "POST", body: object) {
  return new Request("http://localhost/api/student/join-requests", {
    method,
    body: JSON.stringify(body),
  });
}

describe("join request API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    security.authenticate.mockResolvedValue({
      ok: true,
      token: { uid: "student-1" },
    });
    security.rateLimit.mockResolvedValue(null);
    mocks.state.profile = {
      exists: true,
      data: { displayName: "Student One", role: "student" },
    };
    mocks.state.club = {
      exists: true,
      data: { name: "Campus Club", status: "active" },
    };
    mocks.state.request = { exists: false, data: {} };
    mocks.transaction.get.mockImplementation((reference: { path: string }) => {
      const value = reference.path.startsWith("users/")
        ? mocks.state.profile
        : reference.path.startsWith("clubs/")
          ? mocks.state.club
          : mocks.state.request;
      return Promise.resolve({
        exists: value.exists,
        data: () => value.data,
      });
    });
  });

  it("derives trusted names and creates the request atomically", async () => {
    const response = await POST(
      request("POST", { clubId: "club-1", message: "Please let me join." }),
    );
    expect(response.status).toBe(201);
    expect(mocks.transaction.set).toHaveBeenCalledTimes(2);
    expect(mocks.transaction.set).toHaveBeenCalledWith(
      expect.objectContaining({ path: "joinRequests/student-1_club-1" }),
      expect.objectContaining({
        clubName: "Campus Club",
        studentId: "student-1",
        studentName: "Student One",
      }),
    );
  });

  it("rejects duplicate requests and non-student profiles", async () => {
    mocks.state.request = { exists: true, data: { status: "pending" } };
    expect(
      (await POST(request("POST", { clubId: "club-1", message: "Join" }))).status,
    ).toBe(409);

    mocks.state.request = { exists: false, data: {} };
    mocks.state.profile.data.role = "admin";
    expect(
      (await POST(request("POST", { clubId: "club-1", message: "Join" }))).status,
    ).toBe(403);
  });

  it("cancels only the signed-in student's pending request", async () => {
    mocks.state.request = {
      exists: true,
      data: { studentId: "student-1", status: "pending" },
    };
    const response = await DELETE(
      request("DELETE", { requestId: "student-1_club-1" }),
    );
    expect(response.status).toBe(200);
    expect(mocks.transaction.delete).toHaveBeenCalledWith(
      expect.objectContaining({ path: "joinRequests/student-1_club-1" }),
    );

    mocks.state.request.data.studentId = "another-student";
    expect(
      (await DELETE(request("DELETE", { requestId: "student-1_club-1" }))).status,
    ).toBe(403);
  });
});
