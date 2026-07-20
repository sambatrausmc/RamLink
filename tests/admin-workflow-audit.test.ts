import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  batch: { commit: vi.fn(), update: vi.fn() },
  createBatch: vi.fn(),
  doc: vi.fn((_db: unknown, collection: string, id: string) => ({
    path: `${collection}/${id}`,
  })),
  serverTimestamp: vi.fn(() => "server-time"),
}));

vi.mock("@/lib/firebase/client", () => ({ db: {} }));
vi.mock("@/lib/firebase/audit-logs", () => ({
  createAuditedBatch: mocks.createBatch,
  prepareClientAuditLog: vi.fn(),
}));
vi.mock("firebase/firestore", () => ({
  doc: mocks.doc,
  runTransaction: vi.fn(),
  serverTimestamp: mocks.serverTimestamp,
}));

import {
  updateManagedClubs,
  updateReportStatus,
  updateUserRole,
} from "@/lib/firebase/admin-workflows";

describe("administrative workflow audit logs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createBatch.mockResolvedValue(mocks.batch);
  });

  it.each([
    ["role", () => updateUserRole("student-1", "clubOfficer"), "admin.user_role_updated"],
    ["club assignment", () => updateManagedClubs("student-1", ["club-1"]), "admin.user_clubs_updated"],
    ["report", () => updateReportStatus("report-1", "reviewing"), "admin.report_status_updated"],
  ])("audits a %s update atomically", async (_label, action, auditAction) => {
    await action();

    expect(mocks.createBatch).toHaveBeenCalledWith(
      {},
      "admin",
      expect.objectContaining({ action: auditAction }),
    );
    expect(mocks.batch.update).toHaveBeenCalledOnce();
    expect(mocks.batch.commit).toHaveBeenCalledOnce();
  });

  it("clears managed clubs in the same write when removing officer access", async () => {
    await updateUserRole("student-1", "student");

    expect(mocks.batch.update).toHaveBeenCalledWith(
      { path: "users/student-1" },
      expect.objectContaining({
        role: "student",
        managedClubIds: [],
      }),
    );
    expect(mocks.batch.commit).toHaveBeenCalledOnce();
  });
});
