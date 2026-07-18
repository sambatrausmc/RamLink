/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  authState: {
    loading: false,
    profile: null as { role?: "student" | "clubOfficer" | "admin" } | null,
    user: null as { uid: string } | null,
  },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/clubs",
}));

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => mocks.authState,
}));

import { PublicShell } from "@/components/layout/public-shell";

describe("persistent session navigation", () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.authState = { loading: false, profile: null, user: null };
  });

  it("shows sign-in actions to signed-out public visitors", () => {
    render(
      <PublicShell>
        <p>Club directory</p>
      </PublicShell>,
    );

    expect(
      screen.getAllByRole("link", { name: "Sign In" }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: "Create Account" }).length,
    ).toBeGreaterThan(0);
  });

  it("keeps signed-in students connected to their workspace on public pages", () => {
    mocks.authState = {
      loading: false,
      profile: { role: "student" },
      user: { uid: "student-1" },
    };

    render(
      <PublicShell>
        <p>Club directory</p>
      </PublicShell>,
    );

    expect(
      screen
        .getAllByRole("link", { name: /Dashboard/ })[0]
        ?.getAttribute("href"),
    ).toBe("/dashboard");
    expect(
      screen.getByRole("link", { name: "Open profile" }).getAttribute("href"),
    ).toBe("/profile");
    expect(screen.queryByRole("link", { name: "Sign In" })).toBeNull();
  });
});
