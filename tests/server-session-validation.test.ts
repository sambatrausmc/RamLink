import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  profileGet: vi.fn(),
  verifySessionCookie: vi.fn(),
}));

vi.mock("@/lib/firebase/admin", () => ({
  getAdminAuth: () => ({
    verifySessionCookie: mocks.verifySessionCookie,
  }),
  getAdminDb: () => ({
    collection: () => ({
      doc: () => ({ get: mocks.profileGet }),
    }),
  }),
}));

import { validateServerSessionCookie } from "@/lib/server/auth-session";

function verifiedToken(overrides: Record<string, unknown> = {}) {
  return {
    email: "officer@farmingdale.edu",
    email_verified: true,
    uid: "officer-1",
    ...overrides,
  };
}

function profileSnapshot(
  data: Record<string, unknown> | null = {
    role: "clubOfficer",
    managedClubIds: ["cs-club", "robotics-club"],
  },
) {
  return {
    exists: data !== null,
    data: () => data ?? undefined,
  };
}

describe("server session validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.verifySessionCookie.mockResolvedValue(verifiedToken());
    mocks.profileGet.mockResolvedValue(profileSnapshot());
  });

  it("returns the verified Firestore role and managed clubs", async () => {
    await expect(validateServerSessionCookie("signed-session")).resolves.toEqual({
      uid: "officer-1",
      email: "officer@farmingdale.edu",
      role: "clubOfficer",
      managedClubIds: ["cs-club", "robotics-club"],
    });
    expect(mocks.verifySessionCookie).toHaveBeenCalledWith(
      "signed-session",
      true,
    );
  });

  it("does not call Firebase Admin when the cookie is missing", async () => {
    await expect(validateServerSessionCookie(undefined)).resolves.toBeNull();
    expect(mocks.verifySessionCookie).not.toHaveBeenCalled();
  });

  it.each([
    ["revoked session", new Error("revoked"), undefined],
    ["unverified account", undefined, { email_verified: false }],
    ["wrong email domain", undefined, { email: "officer@example.com" }],
  ])("rejects a %s", async (_label, error, overrides) => {
    if (error) {
      mocks.verifySessionCookie.mockRejectedValue(error);
    } else {
      mocks.verifySessionCookie.mockResolvedValue(verifiedToken(overrides));
    }

    await expect(
      validateServerSessionCookie("signed-session"),
    ).resolves.toBeNull();
  });

  it.each([
    ["missing profile", null],
    ["invalid role", { role: "superAdmin" }],
  ])("rejects a %s", async (_label, profile) => {
    mocks.profileGet.mockResolvedValue(profileSnapshot(profile));

    await expect(
      validateServerSessionCookie("signed-session"),
    ).resolves.toBeNull();
  });

  it("filters malformed managed club identifiers", async () => {
    mocks.profileGet.mockResolvedValue(
      profileSnapshot({
        role: "clubOfficer",
        managedClubIds: ["cs-club", 42, null],
      }),
    );

    const session = await validateServerSessionCookie("signed-session");

    expect(session?.managedClubIds).toEqual(["cs-club"]);
  });
});
