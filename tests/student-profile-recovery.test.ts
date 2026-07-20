import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  db: { name: "ramlink-db" },
  doc: vi.fn(() => ({ path: "users/student-1" })),
  get: vi.fn(),
  getDoc: vi.fn(),
  runTransaction: vi.fn(),
  serverTimestamp: vi.fn(() => "server-time"),
  set: vi.fn(),
  updateDoc: vi.fn(),
}));

vi.mock("firebase/firestore", () => ({
  doc: mocks.doc,
  getDoc: mocks.getDoc,
  runTransaction: mocks.runTransaction,
  serverTimestamp: mocks.serverTimestamp,
  updateDoc: mocks.updateDoc,
}));

vi.mock("@/lib/firebase/client", () => ({ db: mocks.db }));

const verifiedUser = {
  uid: "student-1",
  email: "student-1@farmingdale.edu",
  displayName: "Student One",
  emailVerified: true,
};

describe("student profile recovery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.runTransaction.mockImplementation(async (_database, operation) =>
      operation({ get: mocks.get, set: mocks.set }),
    );
  });

  it("creates a default student profile when the document is missing", async () => {
    mocks.get.mockResolvedValue({ exists: () => false });
    const { ensureStudentProfile } = await import("@/lib/firebase/user-profile");

    const profile = await ensureStudentProfile(verifiedUser);

    expect(profile).toMatchObject({
      id: "student-1",
      role: "student",
      displayName: "Student One",
      joinedClubIds: [],
      savedClubIds: [],
    });
    expect(mocks.set).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        email: "student-1@farmingdale.edu",
        createdAt: "server-time",
        updatedAt: "server-time",
      }),
    );
  });

  it("returns an existing profile without changing roles or memberships", async () => {
    mocks.get.mockResolvedValue({
      exists: () => true,
      id: "student-1",
      data: () => ({
        role: "clubOfficer",
        displayName: "Officer One",
        email: "student-1@farmingdale.edu",
        joinedClubIds: ["club-1"],
        managedClubIds: ["club-1"],
      }),
    });
    const { ensureStudentProfile } = await import("@/lib/firebase/user-profile");

    const profile = await ensureStudentProfile(verifiedUser);

    expect(profile.role).toBe("clubOfficer");
    expect(profile.joinedClubIds).toEqual(["club-1"]);
    expect(profile.managedClubIds).toEqual(["club-1"]);
    expect(mocks.set).not.toHaveBeenCalled();
  });

  it("supports transaction retries during concurrent recovery", async () => {
    mocks.get
      .mockResolvedValueOnce({ exists: () => false })
      .mockResolvedValueOnce({
        exists: () => true,
        id: "student-1",
        data: () => ({
          role: "student",
          displayName: "Student One",
          email: "student-1@farmingdale.edu",
        }),
      });
    mocks.runTransaction.mockImplementationOnce(async (_database, operation) => {
      const transaction = { get: mocks.get, set: mocks.set };
      await operation(transaction);
      return operation(transaction);
    });
    const { ensureStudentProfile } = await import("@/lib/firebase/user-profile");

    const profile = await ensureStudentProfile(verifiedUser);

    expect(profile.id).toBe("student-1");
    expect(mocks.runTransaction).toHaveBeenCalledOnce();
    expect(mocks.set).toHaveBeenCalledOnce();
  });

  it("rejects unverified users and surfaces Firestore failures", async () => {
    const { ensureStudentProfile } = await import("@/lib/firebase/user-profile");

    await expect(
      ensureStudentProfile({ ...verifiedUser, emailVerified: false }),
    ).rejects.toThrow("Verify your Farmingdale email");

    mocks.runTransaction.mockRejectedValueOnce(new Error("Firestore unavailable"));
    await expect(ensureStudentProfile(verifiedUser)).rejects.toThrow(
      "Firestore unavailable",
    );
  });

  it("finishes profile saves without requiring a second Firestore read", async () => {
    mocks.updateDoc.mockResolvedValueOnce(undefined);
    const { updateStudentProfile } = await import("@/lib/firebase/user-profile");

    await expect(
      updateStudentProfile("student-1", {
        displayName: "Updated Student",
        major: "Computer Programming",
        classYear: "Senior",
        interests: ["Technology"],
      }),
    ).resolves.toBeUndefined();

    expect(mocks.updateDoc).toHaveBeenCalledOnce();
    expect(mocks.getDoc).not.toHaveBeenCalled();
  });
});
