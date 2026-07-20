/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  authState: {
    loading: false,
    profile: { role: "clubOfficer" as const } as {
      role: "clubOfficer";
    } | null,
    refreshSession: vi.fn(),
    sessionState: "ready" as "loading" | "ready" | "error",
    user: { uid: "officer-1", emailVerified: true } as {
      uid: string;
      emailVerified: boolean;
    } | null,
  },
  login: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.push,
    refresh: mocks.refresh,
    replace: mocks.replace,
  }),
}));

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => mocks.authState,
}));

vi.mock("@/lib/firebase/auth", () => ({
  loginWithEmailAndPassword: mocks.login,
}));

import { LoginForm } from "@/components/auth/login-form";

describe("authenticated account routes", () => {
  afterEach(() => cleanup());
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.authState.sessionState = "ready";
    mocks.authState.profile = { role: "clubOfficer" };
    mocks.authState.user = {
      uid: "officer-1",
      emailVerified: true,
    };
    mocks.authState.refreshSession.mockResolvedValue(true);
    mocks.login.mockResolvedValue({
      uid: "student-1",
      emailVerified: true,
    });
  });

  it("returns an authenticated user to the role workspace", async () => {
    render(<LoginForm />);

    await waitFor(() => {
      expect(mocks.replace).toHaveBeenCalledWith("/club/homepage");
    });
  });

  it("returns an unverified user to account verification", async () => {
    mocks.authState.user = { uid: "student-1", emailVerified: false };
    render(<LoginForm />);

    await waitFor(() => {
      expect(mocks.replace).toHaveBeenCalledWith("/verify-email");
    });
  });

  it.each(["loading", "error"] as const)(
    "does not redirect a verified user while the server session is %s",
    async (sessionState) => {
      mocks.authState.sessionState = sessionState;
      render(<LoginForm />);

      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(mocks.replace).not.toHaveBeenCalled();
    },
  );

  it("replaces login after the secure server session is ready", async () => {
    mocks.authState.profile = null;
    mocks.authState.user = null;
    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText("School email"), {
      target: { value: "student@farmingdale.edu" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password1234" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(mocks.authState.refreshSession).toHaveBeenCalledOnce();
      expect(mocks.replace).toHaveBeenCalledWith("/dashboard");
    });
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });

  it("reports a server session failure without redirecting", async () => {
    mocks.authState.profile = null;
    mocks.authState.user = null;
    mocks.authState.refreshSession.mockResolvedValueOnce(false);
    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText("School email"), {
      target: { value: "student@farmingdale.edu" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password1234" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

    expect(
      await screen.findByText(/password was accepted.*secure session/i),
    ).toBeTruthy();
    expect(mocks.replace).not.toHaveBeenCalled();
  });
});
