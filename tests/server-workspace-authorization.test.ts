import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  redirect: vi.fn((destination: string) => {
    throw new Error(`REDIRECT:${destination}`);
  }),
}));

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/server/auth-session", () => ({
  getServerSession: mocks.getServerSession,
}));

import { requireWorkspaceRole } from "@/lib/server/workspace-authorization";
import type { UserRole } from "@/lib/types";

function serverSession(role: UserRole) {
  return {
    uid: `${role}-1`,
    email: `${role}@farmingdale.edu`,
    role,
    managedClubIds: role === "clubOfficer" ? ["cs-club"] : [],
  };
}

describe("server workspace role authorization", () => {
  beforeEach(() => vi.clearAllMocks());

  it("redirects a missing session to login with a safe destination", async () => {
    mocks.getServerSession.mockResolvedValue(null);

    await expect(
      requireWorkspaceRole(["student"], "/dashboard"),
    ).rejects.toThrow("REDIRECT:/login?next=%2Fdashboard");
  });

  it.each([
    ["student", ["student", "clubOfficer", "admin"], "/dashboard", null],
    ["clubOfficer", ["student", "clubOfficer", "admin"], "/dashboard", null],
    ["admin", ["student", "clubOfficer", "admin"], "/dashboard", null],
    ["student", ["clubOfficer", "admin"], "/club/homepage", "/dashboard"],
    ["clubOfficer", ["clubOfficer", "admin"], "/club/homepage", null],
    ["admin", ["clubOfficer", "admin"], "/club/homepage", null],
    ["student", ["admin"], "/admin/homepage", "/dashboard"],
    ["clubOfficer", ["admin"], "/admin/homepage", "/club/homepage"],
    ["admin", ["admin"], "/admin/homepage", null],
  ] as const)(
    "checks %s access for its requested workspace",
    async (role, allowedRoles, requestedPath, redirectTarget) => {
      const session = serverSession(role);
      mocks.getServerSession.mockResolvedValue(session);

      if (redirectTarget) {
        await expect(
          requireWorkspaceRole([...allowedRoles], requestedPath),
        ).rejects.toThrow(`REDIRECT:${redirectTarget}`);
      } else {
        await expect(
          requireWorkspaceRole([...allowedRoles], requestedPath),
        ).resolves.toEqual(session);
      }
    },
  );
});
