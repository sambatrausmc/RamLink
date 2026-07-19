/** @vitest-environment jsdom */

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: { name: "ramlink-auth" },
  createUser: vi.fn(),
  ensurePersistence: vi.fn(),
  sendVerification: vi.fn(),
  updateProfile: vi.fn(),
  user: {
    uid: "student-1",
    email: "student@farmingdale.edu",
    displayName: null,
  },
}));

vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: mocks.createUser,
  sendEmailVerification: mocks.sendVerification,
  sendPasswordResetEmail: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  updateProfile: mocks.updateProfile,
}));

vi.mock("@/lib/firebase/client", () => ({
  auth: mocks.auth,
  ensureAuthPersistence: mocks.ensurePersistence,
}));

describe("verified student registration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.ensurePersistence.mockResolvedValue(undefined);
    mocks.createUser.mockResolvedValue({ user: mocks.user });
    mocks.updateProfile.mockResolvedValue(undefined);
    mocks.sendVerification.mockResolvedValue(undefined);
  });

  it("normalizes the school email and sends a verification link", async () => {
    const { registerStudentAccount } = await import("@/lib/firebase/auth");

    await registerStudentAccount({
      displayName: "  Avery Morgan  ",
      email: " Avery@Farmingdale.edu ",
      password: "password123",
    });

    expect(mocks.createUser).toHaveBeenCalledWith(
      mocks.auth,
      "avery@farmingdale.edu",
      "password123",
    );
    expect(mocks.updateProfile).toHaveBeenCalledWith(mocks.user, {
      displayName: "Avery Morgan",
    });
    expect(mocks.sendVerification).toHaveBeenCalledWith(
      mocks.user,
      expect.objectContaining({
        url: "http://localhost:3000/verify-email",
        handleCodeInApp: false,
      }),
    );
  });

  it("rejects non-Farmingdale addresses before creating an account", async () => {
    const { registerStudentAccount } = await import("@/lib/firebase/auth");

    await expect(
      registerStudentAccount({
        displayName: "Avery Morgan",
        email: "avery@example.com",
        password: "password123",
      }),
    ).rejects.toThrow("Use a valid @farmingdale.edu email address.");
    expect(mocks.createUser).not.toHaveBeenCalled();
  });

  it("reports verification delivery failures to the caller", async () => {
    mocks.sendVerification.mockRejectedValueOnce(
      new Error("Verification service unavailable"),
    );
    const { registerStudentAccount } = await import("@/lib/firebase/auth");

    await expect(
      registerStudentAccount({
        displayName: "Avery Morgan",
        email: "avery@farmingdale.edu",
        password: "password123",
      }),
    ).rejects.toThrow("Verification service unavailable");
  });
});
