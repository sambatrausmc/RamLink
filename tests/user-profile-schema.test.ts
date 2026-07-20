import { beforeEach, describe, expect, it, vi } from "vitest";

const firestoreMocks = vi.hoisted(() => ({
  get: vi.fn(),
  update: vi.fn(),
}));

vi.mock("@/lib/firebase/admin", () => ({
  getAdminDb: () => ({
    collection: () => ({ doc: (uid: string) => ({ uid }) }),
    runTransaction: async (
      callback: (transaction: typeof firestoreMocks) => Promise<unknown>,
    ) => callback(firestoreMocks),
  }),
}));

import { reconcileUserProfileSchema } from "@/lib/server/user-profile-schema";

describe("user profile schema reconciliation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("adds missing arrays without replacing existing values", async () => {
    firestoreMocks.get.mockResolvedValue({
      exists: true,
      data: () => ({
        interests: ["Technology"],
        joinedClubIds: ["cs-club"],
        savedClubIds: [],
        savedEventIds: ["event-1"],
      }),
    });

    await expect(reconcileUserProfileSchema("student-1")).resolves.toBe(
      "updated",
    );
    expect(firestoreMocks.update).toHaveBeenCalledWith(
      { uid: "student-1" },
      expect.objectContaining({
        rsvpedEventIds: [],
        managedClubIds: [],
      }),
    );
    expect(firestoreMocks.update.mock.calls[0][1]).not.toHaveProperty(
      "interests",
    );
    expect(firestoreMocks.update.mock.calls[0][1]).not.toHaveProperty(
      "joinedClubIds",
    );
  });

  it("does not write a complete profile", async () => {
    firestoreMocks.get.mockResolvedValue({
      exists: true,
      data: () => ({
        interests: [],
        joinedClubIds: [],
        savedClubIds: [],
        savedEventIds: [],
        rsvpedEventIds: [],
        managedClubIds: [],
      }),
    });

    await expect(reconcileUserProfileSchema("student-1")).resolves.toBe(
      "current",
    );
    expect(firestoreMocks.update).not.toHaveBeenCalled();
  });

  it("does not overwrite a malformed existing field", async () => {
    firestoreMocks.get.mockResolvedValue({
      exists: true,
      data: () => ({
        interests: "Technology",
      }),
    });

    await expect(reconcileUserProfileSchema("student-1")).rejects.toThrow(
      "The interests profile field must be an array.",
    );
    expect(firestoreMocks.update).not.toHaveBeenCalled();
  });
});
