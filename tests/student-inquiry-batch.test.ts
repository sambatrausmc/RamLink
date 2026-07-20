import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  batch: {
    commit: vi.fn(),
    set: vi.fn(),
  },
  generatedId: 0,
  writeBatch: vi.fn(),
}));

vi.mock("@/lib/firebase/client", () => ({ db: { name: "ramlink-db" } }));
vi.mock("firebase/firestore", () => ({
  arrayRemove: vi.fn(),
  arrayUnion: vi.fn(),
  collection: vi.fn((_db: unknown, path: string) => ({ path })),
  doc: vi.fn((...args: Array<{ path?: string } | string>) => {
    if (args.length === 1) {
      mocks.generatedId += 1;
      return {
        id: mocks.generatedId === 1 ? "inquiry-1" : "notification-1",
      };
    }
    return { id: String(args[2]) };
  }),
  getDocs: vi.fn(),
  query: vi.fn(),
  runTransaction: vi.fn(),
  serverTimestamp: vi.fn(() => "server-time"),
  updateDoc: vi.fn(),
  where: vi.fn(),
  writeBatch: mocks.writeBatch,
}));

import { createClubInquiry } from "@/lib/firebase/student-actions";

describe("student inquiry creation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.generatedId = 0;
    mocks.batch.commit.mockResolvedValue(undefined);
    mocks.writeBatch.mockReturnValue(mocks.batch);
  });

  it("commits the inquiry and confirmation notification together", async () => {
    const inquiry = await createClubInquiry({
      userId: "student-1",
      clubId: "club-1",
      clubName: "Campus Club",
      studentName: "Student One",
      subject: "Meeting question",
      message: "Can new students attend?",
    });

    expect(inquiry.id).toBe("inquiry-1");
    expect(mocks.batch.set).toHaveBeenCalledTimes(2);
    expect(mocks.batch.set).toHaveBeenCalledWith(
      expect.objectContaining({ id: "inquiry-1" }),
      expect.objectContaining({ status: "open" }),
    );
    expect(mocks.batch.set).toHaveBeenCalledWith(
      expect.objectContaining({ id: "notification-1" }),
      expect.objectContaining({ title: "Question sent" }),
    );
    expect(mocks.batch.commit).toHaveBeenCalledOnce();
  });

  it("reports failure without performing separate document commits", async () => {
    mocks.batch.commit.mockRejectedValueOnce(new Error("permission denied"));

    await expect(
      createClubInquiry({
        userId: "student-1",
        clubId: "club-1",
        subject: "Meeting question",
        message: "Can new students attend?",
      }),
    ).rejects.toThrow("permission denied");
    expect(mocks.batch.commit).toHaveBeenCalledOnce();
  });
});
