import { describe, expect, it, vi } from "vitest";

// @ts-expect-error The Node provisioning helper is intentionally plain ESM.
import { upsertAuthUser } from "../scripts/provisioning/auth-users.mjs";

type AuthUser = { uid: string; email: string };

const account = {
  uid: "ramlink-demo-student",
  displayName: "Avery Morgan",
};

function userNotFound() {
  return Object.assign(new Error("User not found"), {
    code: "auth/user-not-found",
  });
}

function createAuthMock(uidUser: AuthUser | null, emailUser: AuthUser | null) {
  return {
    getUser: vi.fn(async () => {
      if (!uidUser) throw userNotFound();
      return uidUser;
    }),
    getUserByEmail: vi.fn(async () => {
      if (!emailUser) throw userNotFound();
      return emailUser;
    }),
    updateUser: vi.fn(
      async (uid: string, properties: Record<string, unknown>) => ({
        uid,
        ...properties,
      }),
    ),
    createUser: vi.fn(
      async (properties: Record<string, unknown>) => properties,
    ),
  };
}

describe("test account provisioning", () => {
  it("creates a missing account with its deterministic UID", async () => {
    const auth = createAuthMock(null, null);

    await upsertAuthUser(
      auth,
      account,
      "student@farmingdale.edu",
      "strong-password",
    );

    expect(auth.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        uid: account.uid,
        email: "student@farmingdale.edu",
        displayName: account.displayName,
      }),
    );
    expect(auth.updateUser).not.toHaveBeenCalled();
  });

  it("updates the deterministic account on repeated runs", async () => {
    const user = { uid: account.uid, email: "student@farmingdale.edu" };
    const auth = createAuthMock(user, user);

    await upsertAuthUser(auth, account, user.email, "new-strong-password");

    expect(auth.updateUser).toHaveBeenCalledWith(
      account.uid,
      expect.objectContaining({ password: "new-strong-password" }),
    );
    expect(auth.createUser).not.toHaveBeenCalled();
  });

  it("updates the email when the deterministic UID already exists", async () => {
    const auth = createAuthMock(
      { uid: account.uid, email: "old-student@farmingdale.edu" },
      null,
    );

    await upsertAuthUser(
      auth,
      account,
      "new-student@farmingdale.edu",
      "strong-password",
    );

    expect(auth.updateUser).toHaveBeenCalledWith(
      account.uid,
      expect.objectContaining({ email: "new-student@farmingdale.edu" }),
    );
  });

  it("rejects an email owned by a different Firebase UID", async () => {
    const auth = createAuthMock(null, {
      uid: "another-user",
      email: "student@farmingdale.edu",
    });

    await expect(
      upsertAuthUser(
        auth,
        account,
        "student@farmingdale.edu",
        "strong-password",
      ),
    ).rejects.toThrow("already assigned to another Firebase user");
    expect(auth.createUser).not.toHaveBeenCalled();
    expect(auth.updateUser).not.toHaveBeenCalled();
  });
});
