/** @vitest-environment jsdom */

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: { name: "ramlink-auth" },
  createUser: vi.fn(),
  createServerSession: vi.fn(),
  ensurePersistence: vi.fn(),
  getIdToken: vi.fn(),
  resetPassword: vi.fn(),
  sendVerification: vi.fn(),
  signIn: vi.fn(),
  updateProfile: vi.fn(),
  user: {
    uid: "student-1",
    email: "student@farmingdale.edu",
    displayName: null,
    emailVerified: false,
  },
}));

vi.mock("@/lib/firebase/server-session", () => ({
  createServerSession: mocks.createServerSession,
}));

vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: mocks.createUser,
  getIdToken: mocks.getIdToken,
  reload: vi.fn(),
  sendEmailVerification: mocks.sendVerification,
  sendPasswordResetEmail: mocks.resetPassword,
  signInWithEmailAndPassword: mocks.signIn,
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
    window.localStorage.clear();
    mocks.ensurePersistence.mockResolvedValue(undefined);
    mocks.createUser.mockResolvedValue({ user: mocks.user });
    mocks.updateProfile.mockResolvedValue(undefined);
    mocks.sendVerification.mockResolvedValue(undefined);
    mocks.signIn.mockResolvedValue({ user: mocks.user });
    mocks.createServerSession.mockResolvedValue(undefined);
    mocks.user.emailVerified = false;
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

  it("normalizes login and password-reset addresses", async () => {
    const { loginWithEmailAndPassword, resetPasswordForEmail } = await import(
      "@/lib/firebase/auth"
    );

    await loginWithEmailAndPassword({
      email: " Student@Farmingdale.edu ",
      password: "password123",
    });
    await resetPasswordForEmail(" Student@Farmingdale.edu ");

    expect(mocks.signIn).toHaveBeenCalledWith(
      mocks.auth,
      "student@farmingdale.edu",
      "password123",
    );
    expect(mocks.resetPassword).toHaveBeenCalledWith(
      mocks.auth,
      "student@farmingdale.edu",
    );
  });

  it("blocks repeated password-reset email requests during the cooldown", async () => {
    const { resetPasswordForEmail } = await import("@/lib/firebase/auth");

    await resetPasswordForEmail("student@farmingdale.edu");
    await expect(
      resetPasswordForEmail("student@farmingdale.edu"),
    ).rejects.toThrow(/Wait \d+ seconds/);
    expect(mocks.resetPassword).toHaveBeenCalledOnce();
  });

  it("creates a server session after verified login", async () => {
    mocks.user.emailVerified = true;
    const { loginWithEmailAndPassword } = await import("@/lib/firebase/auth");

    await loginWithEmailAndPassword({
      email: "student@farmingdale.edu",
      password: "password123",
    });

    expect(mocks.createServerSession).toHaveBeenCalledWith(mocks.user);
  });

  it("rejects unsupported login domains before Firebase authentication", async () => {
    const { loginWithEmailAndPassword } = await import("@/lib/firebase/auth");

    await expect(
      loginWithEmailAndPassword({
        email: "student@example.com",
        password: "password123",
      }),
    ).rejects.toThrow("Use a valid @farmingdale.edu email address.");
    expect(mocks.signIn).not.toHaveBeenCalled();
  });
});
