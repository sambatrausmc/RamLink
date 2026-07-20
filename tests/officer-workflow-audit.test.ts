import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  batch: { commit: vi.fn(), set: vi.fn(), update: vi.fn() },
  createBatch: vi.fn(),
  getDoc: vi.fn(),
}));

vi.mock("@/lib/firebase/client", () => ({ db: {} }));
vi.mock("@/lib/firebase/audit-logs", () => ({
  createAuditedBatch: mocks.createBatch,
  prepareClientAuditLog: vi.fn(),
}));
vi.mock("firebase/firestore", () => ({
  arrayRemove: vi.fn(),
  arrayUnion: vi.fn(),
  collection: vi.fn((_db: unknown, path: string) => ({ path })),
  doc: vi.fn((...args: unknown[]) =>
    args.length === 1
      ? { path: "notifications/generated" }
      : { path: `${String(args[1])}/${String(args[2])}` },
  ),
  getDoc: mocks.getDoc,
  getDocs: vi.fn(),
  increment: vi.fn(),
  query: vi.fn(),
  runTransaction: vi.fn(),
  serverTimestamp: vi.fn(() => "server-time"),
  where: vi.fn(),
}));

import { replyToInquiry, resolveInquiry } from "@/lib/firebase/club-workflows";

describe("officer workflow audit logs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createBatch.mockResolvedValue(mocks.batch);
    mocks.getDoc.mockResolvedValue({
      data: () => ({
        clubId: "club-1",
        replies: [],
        studentId: "student-1",
      }),
      exists: () => true,
    });
  });

  it("audits an inquiry reply without copying its message body", async () => {
    await replyToInquiry("inquiry-1", "Private reply text");

    expect(mocks.createBatch).toHaveBeenCalledWith(
      {},
      "clubOfficer",
      {
        action: "officer.inquiry_replied",
        targetType: "inquiry",
        targetId: "inquiry-1",
        clubId: "club-1",
      },
    );
    expect(mocks.createBatch.mock.calls[0][2]).not.toHaveProperty("body");
    expect(mocks.batch.commit).toHaveBeenCalledOnce();
  });

  it("audits inquiry resolution in the same batch", async () => {
    await resolveInquiry("inquiry-1");

    expect(mocks.createBatch).toHaveBeenCalledWith(
      {},
      "clubOfficer",
      expect.objectContaining({ action: "officer.inquiry_resolved" }),
    );
    expect(mocks.batch.update).toHaveBeenCalledOnce();
    expect(mocks.batch.commit).toHaveBeenCalledOnce();
  });
});
