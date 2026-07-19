import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: { name: "ramlink-auth" },
  clearServerSession: vi.fn(),
  ensurePersistence: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("@/lib/firebase/client", () => ({
  auth: mocks.auth,
  ensureAuthPersistence: mocks.ensurePersistence,
}));

vi.mock("@/lib/firebase/server-session", () => ({
  clearServerSession: mocks.clearServerSession,
  createServerSession: vi.fn(),
}));

vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: vi.fn(),
  getIdToken: vi.fn(),
  reload: vi.fn(),
  sendEmailVerification: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: mocks.signOut,
  updateProfile: vi.fn(),
}));

import { logoutCurrentUser } from "@/lib/firebase/auth";

describe("coordinated Firebase logout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.ensurePersistence.mockResolvedValue(undefined);
    mocks.clearServerSession.mockResolvedValue(undefined);
    mocks.signOut.mockResolvedValue(undefined);
  });

  it("clears the server cookie before browser authentication", async () => {
    await logoutCurrentUser();

    expect(mocks.clearServerSession).toHaveBeenCalledOnce();
    expect(mocks.signOut).toHaveBeenCalledWith(mocks.auth);
    expect(mocks.clearServerSession.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.signOut.mock.invocationCallOrder[0],
    );
  });

  it("keeps browser authentication when cookie clearing fails", async () => {
    mocks.clearServerSession.mockRejectedValue(new Error("network failure"));

    await expect(logoutCurrentUser()).rejects.toThrow("network failure");
    expect(mocks.signOut).not.toHaveBeenCalled();
  });
});
