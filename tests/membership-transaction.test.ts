import { beforeEach, describe, expect, it, vi } from "vitest";

const firestoreMocks = vi.hoisted(() => {
  const transaction = {
    get: vi.fn(),
    set: vi.fn(),
    update: vi.fn(),
  };

  return {
    runTransaction: vi.fn(),
    transaction,
  };
});

const auditMocks = vi.hoisted(() => ({ prepare: vi.fn() }));

vi.mock("@/lib/firebase/client", () => ({ db: {} }));
vi.mock("@/lib/firebase/audit-logs", () => ({
  createAuditedBatch: vi.fn(),
  prepareClientAuditLog: auditMocks.prepare,
}));

vi.mock("firebase/firestore", () => ({
  addDoc: vi.fn(),
  arrayRemove: vi.fn((value: string) => ({ operation: "remove", value })),
  arrayUnion: vi.fn((value: string) => ({ operation: "union", value })),
  collection: vi.fn((_database: unknown, path: string) => ({ path })),
  doc: vi.fn((...args: unknown[]) => {
    if (args.length === 1) {
      const collectionReference = args[0] as { path: string };
      return { path: `${collectionReference.path}/generated` };
    }

    return { path: `${String(args[1])}/${String(args[2])}` };
  }),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  increment: vi.fn((value: number) => ({ operation: "increment", value })),
  query: vi.fn(),
  runTransaction: firestoreMocks.runTransaction,
  serverTimestamp: vi.fn(() => ({ operation: "serverTimestamp" })),
  updateDoc: vi.fn(),
  where: vi.fn(),
  writeBatch: vi.fn(),
}));

import { updateJoinRequestStatus } from "@/lib/firebase/club-workflows";

describe("membership approval transaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auditMocks.prepare.mockResolvedValue({
      data: { action: "officer.join_request_updated" },
      reference: { path: "auditLogs/audit-1" },
    });
    firestoreMocks.transaction.get.mockResolvedValue({
      exists: () => true,
      data: () => ({
        clubId: "club-1",
        studentId: "student-1",
        status: "pending",
      }),
    });
    firestoreMocks.runTransaction.mockImplementation(
      async (_database, callback) => callback(firestoreMocks.transaction),
    );
  });

  it("updates the request, membership, club count, and notification together", async () => {
    await updateJoinRequestStatus("request-1", "approved");

    expect(firestoreMocks.runTransaction).toHaveBeenCalledTimes(1);
    expect(firestoreMocks.transaction.get).toHaveBeenCalledWith({
      path: "joinRequests/request-1",
    });
    expect(firestoreMocks.transaction.update).toHaveBeenCalledWith(
      { path: "joinRequests/request-1" },
      expect.objectContaining({ status: "approved" }),
    );
    expect(firestoreMocks.transaction.update).toHaveBeenCalledWith(
      { path: "users/student-1" },
      expect.objectContaining({
        joinedClubIds: { operation: "union", value: "club-1" },
        membershipMutation: {
          requestId: "request-1",
          studentId: "student-1",
          clubId: "club-1",
          countChange: 1,
        },
      }),
    );
    expect(firestoreMocks.transaction.update).toHaveBeenCalledWith(
      { path: "clubs/club-1" },
      expect.objectContaining({
        memberCount: { operation: "increment", value: 1 },
        membershipMutation: {
          requestId: "request-1",
          studentId: "student-1",
          clubId: "club-1",
          countChange: 1,
        },
      }),
    );
    expect(firestoreMocks.transaction.set).toHaveBeenCalledWith(
      { path: "notifications/generated" },
      expect.objectContaining({
        title: "Club request approved",
        userId: "student-1",
      }),
    );
    expect(firestoreMocks.transaction.set).toHaveBeenCalledWith(
      { path: "auditLogs/audit-1" },
      { action: "officer.join_request_updated" },
    );
  });
});
