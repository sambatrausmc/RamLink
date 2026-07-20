import { beforeEach, describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({
  auth: { currentUser: null as unknown },
  credential: vi.fn(),
  reauthenticateWithCredential: vi.fn(),
  signOut: vi.fn(),
}));

const appCheckMocks = vi.hoisted(() => ({
  getHeaders: vi.fn(),
}));

vi.mock("@/lib/firebase/client", () => ({ auth: authMocks.auth }));

vi.mock("firebase/auth", () => ({
  EmailAuthProvider: { credential: authMocks.credential },
  reauthenticateWithCredential: authMocks.reauthenticateWithCredential,
  sendEmailVerification: vi.fn(),
  signOut: authMocks.signOut,
}));

vi.mock("@/lib/firebase/app-check", () => ({
  getAppCheckRequestHeaders: appCheckMocks.getHeaders,
}));

import { deleteCurrentAccount } from "@/lib/firebase/account-actions";

describe("account deletion reauthentication", () => {
  const getIdToken = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.auth.currentUser = {
      email: "student@farmingdale.edu",
      getIdToken,
    };
    authMocks.credential.mockReturnValue({ provider: "password" });
    authMocks.reauthenticateWithCredential.mockResolvedValue(undefined);
    getIdToken.mockResolvedValue("fresh-token");
    appCheckMocks.getHeaders.mockResolvedValue({
      "X-Firebase-AppCheck": "app-check-token",
    });
    authMocks.signOut.mockResolvedValue(undefined);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: vi.fn() }),
    );
  });

  it("reauthenticates and force-refreshes the ID token", async () => {
    await deleteCurrentAccount("password123");

    expect(authMocks.credential).toHaveBeenCalledWith(
      "student@farmingdale.edu",
      "password123",
    );
    expect(authMocks.reauthenticateWithCredential).toHaveBeenCalledWith(
      authMocks.auth.currentUser,
      { provider: "password" },
    );
    expect(getIdToken).toHaveBeenCalledWith(true);
    expect(fetch).toHaveBeenCalledWith(
      "/api/account",
      expect.objectContaining({
        headers: {
          "X-Firebase-AppCheck": "app-check-token",
          Authorization: "Bearer fresh-token",
        },
      }),
    );
    expect(authMocks.signOut).toHaveBeenCalledWith(authMocks.auth);
  });

  it("does not request deletion when reauthentication fails", async () => {
    authMocks.reauthenticateWithCredential.mockRejectedValue(
      new Error("wrong password"),
    );

    await expect(deleteCurrentAccount("wrong-password")).rejects.toThrow(
      "wrong password",
    );
    expect(fetch).not.toHaveBeenCalled();
  });
});
