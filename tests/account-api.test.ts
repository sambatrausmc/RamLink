import { beforeEach, describe, expect, it, vi } from "vitest";

type TestReference = { id: string; path: string };

const adminMocks = vi.hoisted(() => {
  const state = {
    batchFailureAt: -1,
    ownedReferences: [] as TestReference[],
    profileData: {} as Record<string, unknown>,
    profileExists: true,
    relatedData: new Map<string, Record<string, unknown>>(),
  };
  const transaction = {
    delete: vi.fn(),
    get: vi.fn(),
    getAll: vi.fn(),
    update: vi.fn(),
  };
  const auth = {
    deleteUser: vi.fn(),
    verifyIdToken: vi.fn(),
  };
  const batchCommits: ReturnType<typeof vi.fn>[] = [];
  const batchDeletes: ReturnType<typeof vi.fn>[] = [];
  const collection = vi.fn((collectionName: string) => ({
    doc: (id: string) => ({ id, path: `${collectionName}/${id}` }),
    where: () => ({
      get: async () => ({
        docs: state.ownedReferences
          .filter((reference) => reference.path.startsWith(`${collectionName}/`))
          .map((reference) => ({ ref: reference })),
      }),
    }),
  }));
  const db = {
    batch: vi.fn(),
    collection,
    runTransaction: vi.fn(),
  };

  return {
    auth,
    batchCommits,
    batchDeletes,
    db,
    state,
    transaction,
  };
});

const appCheckMocks = vi.hoisted(() => ({ verify: vi.fn() }));
const rateLimitMocks = vi.hoisted(() => ({ consume: vi.fn() }));

vi.mock("@/lib/firebase/admin", () => ({
  getAdminAuth: () => adminMocks.auth,
  getAdminDb: () => adminMocks.db,
}));

vi.mock("@/lib/server/app-check", () => ({
  verifyAppCheckRequest: appCheckMocks.verify,
}));

vi.mock("@/lib/server/rate-limit", () => ({
  consumeRateLimit: rateLimitMocks.consume,
}));

import { DELETE } from "@/app/api/account/route";

function deletionRequest(token?: string) {
  return new Request("http://localhost/api/account", {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}

function reference(path: string): TestReference {
  return { id: path.split("/").at(-1) ?? path, path };
}

describe("account deletion API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    appCheckMocks.verify.mockResolvedValue(true);
    rateLimitMocks.consume.mockResolvedValue({ allowed: true });
    adminMocks.batchCommits.length = 0;
    adminMocks.batchDeletes.length = 0;
    adminMocks.state.batchFailureAt = -1;
    adminMocks.state.ownedReferences = [];
    adminMocks.state.profileData = {};
    adminMocks.state.profileExists = true;
    adminMocks.state.relatedData.clear();
    adminMocks.auth.deleteUser.mockResolvedValue(undefined);
    adminMocks.auth.verifyIdToken.mockResolvedValue({
      auth_time: Math.floor(Date.now() / 1000),
      uid: "student-1",
    });
    adminMocks.transaction.get.mockImplementation(async () => ({
      data: () => adminMocks.state.profileData,
      exists: adminMocks.state.profileExists,
    }));
    adminMocks.transaction.getAll.mockImplementation(
      async (...references: TestReference[]) =>
        references.map((item) => ({
          data: () => adminMocks.state.relatedData.get(item.path) ?? {},
          exists: adminMocks.state.relatedData.has(item.path),
          ref: item,
        })),
    );
    adminMocks.db.runTransaction.mockImplementation(async (callback) =>
      callback(adminMocks.transaction),
    );
    adminMocks.db.batch.mockImplementation(() => {
      const batchIndex = adminMocks.batchCommits.length;
      const deleteRecord = vi.fn();
      const commit = vi.fn(async () => {
        if (batchIndex === adminMocks.state.batchFailureAt) {
          throw new Error("batch failed");
        }
      });
      adminMocks.batchDeletes.push(deleteRecord);
      adminMocks.batchCommits.push(commit);
      return { commit, delete: deleteRecord };
    });
  });

  it("returns 401 when authentication is missing", async () => {
    const response = await DELETE(deletionRequest());
    expect(response.status).toBe(401);
  });

  it("returns 401 when App Check validation fails", async () => {
    appCheckMocks.verify.mockResolvedValue(false);

    const response = await DELETE(deletionRequest("fresh-token"));

    expect(response.status).toBe(401);
    expect(adminMocks.auth.verifyIdToken).not.toHaveBeenCalled();
  });

  it("returns 401 for an invalid token", async () => {
    adminMocks.auth.verifyIdToken.mockRejectedValue(new Error("invalid"));
    const response = await DELETE(deletionRequest("invalid-token"));
    expect(response.status).toBe(401);
  });

  it("returns 409 for authentication older than five minutes", async () => {
    adminMocks.auth.verifyIdToken.mockResolvedValue({
      auth_time: Math.floor(Date.now() / 1000) - 301,
      uid: "student-1",
    });
    const response = await DELETE(deletionRequest("stale-token"));
    expect(response.status).toBe(409);
  });

  it("returns retry guidance after too many deletion requests", async () => {
    rateLimitMocks.consume.mockResolvedValue({
      allowed: false,
      retryAfterSeconds: 120,
    });

    const response = await DELETE(deletionRequest("fresh-token"));

    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("120");
    expect(adminMocks.auth.deleteUser).not.toHaveBeenCalled();
  });

  it("reconciles membership and RSVP counters before deleting Auth", async () => {
    adminMocks.state.profileData = {
      joinedClubIds: ["club-1", "club-2", "club-2"],
      rsvpedEventIds: ["event-1"],
    };
    adminMocks.state.relatedData.set("clubs/club-1", { memberCount: 3 });
    adminMocks.state.relatedData.set("clubs/club-2", { memberCount: 0 });
    adminMocks.state.relatedData.set("events/event-1", { rsvpCount: 8 });

    const response = await DELETE(deletionRequest("fresh-token"));

    expect(response.status).toBe(200);
    expect(adminMocks.transaction.update).toHaveBeenCalledWith(
      reference("clubs/club-1"),
      { memberCount: 2 },
    );
    expect(adminMocks.transaction.update).toHaveBeenCalledWith(
      reference("clubs/club-2"),
      { memberCount: 0 },
    );
    expect(adminMocks.transaction.update).toHaveBeenCalledWith(
      reference("events/event-1"),
      { rsvpCount: 7 },
    );
    expect(adminMocks.transaction.delete).toHaveBeenCalledWith(
      reference("users/student-1"),
    );
    expect(adminMocks.auth.deleteUser).toHaveBeenCalledWith("student-1");
  });

  it("deletes large owned-record collections in batches below 500 writes", async () => {
    adminMocks.state.ownedReferences = Array.from({ length: 801 }, (_, index) =>
      reference(`notifications/notification-${index}`),
    );

    const response = await DELETE(deletionRequest("fresh-token"));

    expect(response.status).toBe(200);
    expect(adminMocks.db.batch).toHaveBeenCalledTimes(3);
    expect(adminMocks.batchDeletes.map((item) => item.mock.calls.length)).toEqual([
      400,
      400,
      1,
    ]);
  });

  it("skips counter changes when a retry finds no profile", async () => {
    adminMocks.state.profileExists = false;
    adminMocks.state.ownedReferences = [reference("inquiries/inquiry-1")];

    const response = await DELETE(deletionRequest("fresh-token"));

    expect(response.status).toBe(200);
    expect(adminMocks.transaction.update).not.toHaveBeenCalled();
    expect(adminMocks.transaction.delete).not.toHaveBeenCalled();
    expect(adminMocks.batchDeletes[0]).toHaveBeenCalledWith(
      reference("inquiries/inquiry-1"),
    );
  });

  it("treats an already deleted Auth user as a successful retry", async () => {
    adminMocks.state.profileExists = false;
    adminMocks.auth.deleteUser.mockRejectedValue({
      code: "auth/user-not-found",
    });

    const response = await DELETE(deletionRequest("fresh-token"));
    expect(response.status).toBe(200);
  });

  it("stops before Auth deletion when a record batch fails", async () => {
    adminMocks.state.ownedReferences = Array.from({ length: 401 }, (_, index) =>
      reference(`reports/report-${index}`),
    );
    adminMocks.state.batchFailureAt = 1;

    const response = await DELETE(deletionRequest("fresh-token"));

    expect(response.status).toBe(500);
    expect(adminMocks.batchCommits[0]).toHaveBeenCalledOnce();
    expect(adminMocks.batchCommits[1]).toHaveBeenCalledOnce();
    expect(adminMocks.auth.deleteUser).not.toHaveBeenCalled();
  });
});
