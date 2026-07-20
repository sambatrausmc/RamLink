import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  batch: {
    commit: vi.fn(),
    set: vi.fn(),
  },
  runTransaction: vi.fn(),
  writeBatch: vi.fn(),
}));

vi.mock("@/lib/firebase/client", () => ({ db: { name: "ramlink-db" } }));
vi.mock("firebase/firestore", () => ({
  arrayRemove: vi.fn(),
  arrayUnion: vi.fn(),
  collection: vi.fn((_db: unknown, path: string) => ({ path })),
  doc: vi.fn((...args: Array<{ path?: string } | string>) =>
    args.length === 1
      ? { id: "notification-1" }
      : { id: String(args[2]) },
  ),
  getDocs: vi.fn(() => Promise.resolve({ docs: [] })),
  query: vi.fn(),
  runTransaction: mocks.runTransaction,
  serverTimestamp: vi.fn(() => "server-time"),
  updateDoc: vi.fn(),
  where: vi.fn(),
  writeBatch: mocks.writeBatch,
}));

import { createJoinRequest } from "@/lib/firebase/student-actions";

describe("student join request creation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.batch.commit.mockResolvedValue(undefined);
    mocks.writeBatch.mockReturnValue(mocks.batch);
  });

  it("creates a new request without reading the missing document", async () => {
    const request = await createJoinRequest({
      userId: "student-1",
      clubId: "club-1",
      clubName: "Campus Club",
      studentName: "Student One",
      message: "I would like to join.",
    });

    expect(request.id).toBe("student-1_club-1");
    expect(mocks.runTransaction).not.toHaveBeenCalled();
    expect(mocks.batch.set).toHaveBeenCalledTimes(2);
    expect(mocks.batch.set).toHaveBeenCalledWith(
      expect.objectContaining({ id: "student-1_club-1" }),
      expect.objectContaining({ status: "pending" }),
      { merge: true },
    );
    expect(mocks.batch.set).toHaveBeenCalledWith(
      expect.objectContaining({ id: "notification-1" }),
      expect.objectContaining({ title: "Join request sent" }),
    );
    expect(mocks.batch.commit).toHaveBeenCalledOnce();
  });

  it("does not report success when the atomic batch fails", async () => {
    mocks.batch.commit.mockRejectedValueOnce(new Error("permission denied"));

    await expect(
      createJoinRequest({
        userId: "student-1",
        clubId: "club-1",
        message: "I would like to join.",
      }),
    ).rejects.toThrow("permission denied");
    expect(mocks.batch.commit).toHaveBeenCalledOnce();
  });
});
