import { beforeEach, describe, expect, it, vi } from "vitest";

const firebaseMocks = vi.hoisted(() => ({
  auth: { currentUser: { uid: "admin-1" } as { uid: string } | null },
  collection: vi.fn(),
  doc: vi.fn(),
  serverTimestamp: vi.fn(),
  set: vi.fn(),
  writeBatch: vi.fn(),
}));

vi.mock("firebase/firestore", () => ({
  collection: firebaseMocks.collection,
  doc: firebaseMocks.doc,
  serverTimestamp: firebaseMocks.serverTimestamp,
  writeBatch: firebaseMocks.writeBatch,
}));
vi.mock("@/lib/firebase/client", () => ({ auth: firebaseMocks.auth }));

import { createAuditedBatch } from "@/lib/firebase/audit-logs";

describe("client audit log preparation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    firebaseMocks.auth.currentUser = { uid: "admin-1" };
    firebaseMocks.collection.mockReturnValue({ path: "auditLogs" });
    firebaseMocks.doc.mockReturnValue({ id: "audit-1" });
    firebaseMocks.serverTimestamp.mockReturnValue("server-time");
    firebaseMocks.writeBatch.mockReturnValue({ set: firebaseMocks.set });
  });

  it("adds only minimal actor and target metadata to the batch", async () => {
    await createAuditedBatch({} as never, "admin", {
      action: "admin.user_role_updated",
      targetType: "user",
      targetId: "student-1",
    });

    expect(firebaseMocks.set).toHaveBeenCalledWith(
      { id: "audit-1" },
      {
        actorId: "admin-1",
        actorRole: "admin",
        action: "admin.user_role_updated",
        targetType: "user",
        targetId: "student-1",
        createdAt: "server-time",
      },
    );
  });

  it("requires an authenticated actor", async () => {
    firebaseMocks.auth.currentUser = null;

    await expect(createAuditedBatch({} as never, "admin", {
      action: "admin.user_role_updated",
      targetType: "user",
      targetId: "student-1",
    })).rejects.toThrow("Sign in before completing this action.");
  });
});
