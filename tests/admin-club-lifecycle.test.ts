import { beforeEach, describe, expect, it, vi } from "vitest";

const firestoreMocks = vi.hoisted(() => {
  const transaction = {
    get: vi.fn(),
    set: vi.fn(),
  };

  return {
    runTransaction: vi.fn(),
    transaction,
    batch: {
      commit: vi.fn(),
      update: vi.fn(),
    },
  };
});

const auditMocks = vi.hoisted(() => ({
  createBatch: vi.fn(),
  prepare: vi.fn(),
}));

vi.mock("@/lib/firebase/client", () => ({ db: {} }));

vi.mock("firebase/firestore", () => ({
  doc: vi.fn((_database: unknown, collectionName: string, id: string) => ({
    path: `${collectionName}/${id}`,
  })),
  runTransaction: firestoreMocks.runTransaction,
  serverTimestamp: vi.fn(() => ({ operation: "serverTimestamp" })),
}));

vi.mock("@/lib/firebase/audit-logs", () => ({
  createAuditedBatch: auditMocks.createBatch,
  prepareClientAuditLog: auditMocks.prepare,
}));

import {
  createClubRecord,
  updateClubStatus,
} from "@/lib/firebase/admin-workflows";

const clubInput = {
  name: " Robotics Club ",
  shortName: " Robo Club ",
  category: "Technology" as const,
  description: " Build campus robots. ",
  contactEmail: " robotics@example.edu ",
};

describe("admin club lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auditMocks.createBatch.mockResolvedValue(firestoreMocks.batch);
    auditMocks.prepare.mockResolvedValue({
      data: { action: "admin.club_created" },
      reference: { path: "auditLogs/audit-1" },
    });
    firestoreMocks.transaction.get.mockResolvedValue({ exists: () => false });
    firestoreMocks.runTransaction.mockImplementation(
      async (_database, callback) => callback(firestoreMocks.transaction),
    );
  });

  it("creates a trimmed pending club inside a transaction", async () => {
    await expect(createClubRecord(clubInput)).resolves.toBe("robo-club");

    expect(firestoreMocks.transaction.set).toHaveBeenCalledWith(
      { path: "clubs/robo-club" },
      expect.objectContaining({
        name: "Robotics Club",
        shortName: "ROBO CLUB",
        description: "Build campus robots.",
        contactEmail: "robotics@example.edu",
        status: "pending",
      }),
    );
    expect(auditMocks.prepare).toHaveBeenCalledWith(
      {},
      "admin",
      expect.objectContaining({
        action: "admin.club_created",
        targetId: "robo-club",
      }),
    );
    expect(firestoreMocks.transaction.set).toHaveBeenCalledWith(
      { path: "auditLogs/audit-1" },
      { action: "admin.club_created" },
    );
  });

  it("rejects a short name that cannot generate a club ID", async () => {
    await expect(
      createClubRecord({ ...clubInput, shortName: "---" }),
    ).rejects.toThrow("Complete all required club fields");
    expect(firestoreMocks.runTransaction).not.toHaveBeenCalled();
  });

  it("rejects a duplicate generated club ID", async () => {
    firestoreMocks.transaction.get.mockResolvedValue({ exists: () => true });

    await expect(createClubRecord(clubInput)).rejects.toThrow(
      "A club with this short name already exists.",
    );
    expect(firestoreMocks.transaction.set).not.toHaveBeenCalled();
  });

  it("surfaces a failed Firestore write", async () => {
    firestoreMocks.runTransaction.mockRejectedValue(new Error("offline"));

    await expect(createClubRecord(clubInput)).rejects.toThrow("offline");
  });

  it("updates a club status only after Firestore accepts the write", async () => {
    await updateClubStatus("robo-club", "active");

    expect(firestoreMocks.batch.update).toHaveBeenCalledWith(
      { path: "clubs/robo-club" },
      expect.objectContaining({ status: "active" }),
    );
    expect(firestoreMocks.batch.commit).toHaveBeenCalledOnce();
    expect(auditMocks.createBatch).toHaveBeenCalledWith(
      {},
      "admin",
      expect.objectContaining({ action: "admin.club_status_updated" }),
    );
  });
});
