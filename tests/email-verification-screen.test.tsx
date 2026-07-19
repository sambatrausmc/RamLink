/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  authState: {
    loading: false,
    profile: null as { role?: "student" | "clubOfficer" | "admin" } | null,
    refreshProfile: vi.fn(),
    refreshSession: vi.fn(),
    user: {
      uid: "student-1",
      email: "student@farmingdale.edu",
      emailVerified: false,
    } as { uid: string; email: string; emailVerified: boolean } | null,
  },
  logout: vi.fn(),
  push: vi.fn(),
  reload: vi.fn(),
  replace: vi.fn(),
  resend: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, replace: mocks.replace }),
}));

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => mocks.authState,
}));

vi.mock("@/lib/firebase/auth", () => ({
  logoutCurrentUser: mocks.logout,
  reloadCurrentUser: mocks.reload,
  resendCurrentUserVerification: mocks.resend,
}));

import { EmailVerificationPanel } from "@/components/auth/email-verification-panel";

describe("student email verification screen", () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.authState.loading = false;
    mocks.authState.profile = null;
    mocks.authState.user = {
      uid: "student-1",
      email: "student@farmingdale.edu",
      emailVerified: false,
    };
    mocks.authState.refreshProfile.mockResolvedValue(undefined);
    mocks.authState.refreshSession.mockResolvedValue(true);
    mocks.logout.mockResolvedValue(undefined);
    mocks.reload.mockResolvedValue(mocks.authState.user);
    mocks.resend.mockResolvedValue(undefined);
  });

  it("shows the active unverified account", () => {
    render(<EmailVerificationPanel />);

    expect(screen.getByText("student@farmingdale.edu")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "I verified my email" }),
    ).toBeTruthy();
  });

  it("resends verification and confirms delivery", async () => {
    render(<EmailVerificationPanel />);
    fireEvent.click(screen.getByRole("button", { name: "Resend email" }));

    await waitFor(() => expect(mocks.resend).toHaveBeenCalledOnce());
    expect(screen.getByText("A new verification email was sent.")).toBeTruthy();
  });

  it("shows a useful message when resend fails", async () => {
    mocks.resend.mockRejectedValueOnce(new Error("Unavailable"));
    render(<EmailVerificationPanel />);
    fireEvent.click(screen.getByRole("button", { name: "Resend email" }));

    expect(
      await screen.findByText(
        "Unable to resend the verification email. Please try again.",
      ),
    ).toBeTruthy();
  });

  it("refreshes the profile and opens the workspace after verification", async () => {
    mocks.reload.mockResolvedValueOnce({
      ...mocks.authState.user,
      emailVerified: true,
    });
    render(<EmailVerificationPanel />);
    fireEvent.click(
      screen.getByRole("button", { name: "I verified my email" }),
    );

    await waitFor(() => {
      expect(mocks.authState.refreshProfile).toHaveBeenCalledOnce();
      expect(mocks.authState.refreshSession).toHaveBeenCalledOnce();
      expect(mocks.replace).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("redirects an already verified officer", async () => {
    mocks.authState.profile = { role: "clubOfficer" };
    mocks.authState.user = {
      uid: "officer-1",
      email: "officer@farmingdale.edu",
      emailVerified: true,
    };
    render(<EmailVerificationPanel />);

    await waitFor(() => {
      expect(mocks.replace).toHaveBeenCalledWith("/club/homepage");
    });
  });

  it("returns signed-out visitors to login", () => {
    mocks.authState.user = null;
    render(<EmailVerificationPanel />);

    expect(
      screen.getByRole("link", { name: "Return to sign in" }).getAttribute("href"),
    ).toBe("/login");
  });
});
