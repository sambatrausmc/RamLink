import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  batch: {
    commit: vi.fn(),
    delete: vi.fn(),
    set: vi.fn(),
    update: vi.fn(),
  },
  createBatch: vi.fn(),
  doc: vi.fn((...args: unknown[]) =>
    args.length === 1
      ? { id: "generated-1", path: "generated/generated-1" }
      : { id: String(args[2]), path: `${String(args[1])}/${String(args[2])}` },
  ),
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
  deleteDoc: vi.fn(),
  doc: mocks.doc,
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  increment: vi.fn(),
  query: vi.fn(),
  runTransaction: vi.fn(),
  serverTimestamp: vi.fn(() => "server-time"),
  updateDoc: vi.fn(),
  where: vi.fn(),
  writeBatch: vi.fn(),
}));

import {
  createClubEvent,
  deleteClubAnnouncement,
  updateClubProfile,
  updateClubResource,
} from "@/lib/firebase/club-workflows";

describe("officer content audit logs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createBatch.mockResolvedValue(mocks.batch);
  });

  it("creates an event and its audit entry in one batch", async () => {
    await expect(createClubEvent({
      clubId: "club-1",
      clubName: "Campus Club",
      title: "Welcome Night",
      description: "Meet the club.",
      date: "2026-08-01",
      startTime: "18:00",
      endTime: "19:00",
      location: "Campus Center",
    })).resolves.toBe("generated-1");

    expect(mocks.createBatch).toHaveBeenCalledWith(
      {},
      "clubOfficer",
      expect.objectContaining({ action: "officer.event_created" }),
    );
    expect(mocks.batch.set).toHaveBeenCalledOnce();
    expect(mocks.batch.commit).toHaveBeenCalledOnce();
  });

  it.each([
    ["resource update", () => updateClubResource("resource-1", "club-1", {
      title: "Handbook",
      description: "Club rules",
      type: "Guide" as const,
      url: "https://example.com/guide",
    }), "officer.resource_updated", "update"],
    ["announcement deletion", () => deleteClubAnnouncement("announcement-1", "club-1"), "officer.announcement_deleted", "delete"],
    ["profile update", () => updateClubProfile("club-1", {
      name: "Campus Club",
      shortName: "CC",
      category: "Academic" as const,
      description: "A campus club.",
      meetingSchedule: "Fridays",
      meetingLocation: "Campus Center",
      contactEmail: "club@farmingdale.edu",
      tags: ["Campus"],
    }), "officer.club_profile_updated", "update"],
  ])("audits a %s atomically", async (_label, action, auditAction, batchMethod) => {
    await action();

    expect(mocks.createBatch).toHaveBeenCalledWith(
      {},
      "clubOfficer",
      expect.objectContaining({ action: auditAction, clubId: "club-1" }),
    );
    expect(mocks.batch[batchMethod as "update" | "delete"]).toHaveBeenCalledOnce();
    expect(mocks.batch.commit).toHaveBeenCalledOnce();
  });
});
