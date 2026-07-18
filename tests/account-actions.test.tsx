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
  loginWithEmailAndPassword: vi.fn(),
  logoutCurrentUser: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
  resetPasswordForEmail: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
}));

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => ({ profile: { displayName: "Jordan Ellis" } }),
}));

vi.mock("@/lib/firebase/auth", () => ({
  loginWithEmailAndPassword: mocks.loginWithEmailAndPassword,
  logoutCurrentUser: mocks.logoutCurrentUser,
  resetPasswordForEmail: mocks.resetPasswordForEmail,
}));

import { LoginForm } from "@/components/auth/login-form";
import { WorkspaceShell } from "@/components/layout/workspace-shell";

describe("account actions", () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.logoutCurrentUser.mockResolvedValue(undefined);
    mocks.resetPasswordForEmail.mockResolvedValue(undefined);
  });

  it("requires an email before requesting a password reset", () => {
    render(<LoginForm />);

    fireEvent.click(screen.getByRole("button", { name: "Forgot password?" }));

    expect(
      screen.getByText(
        "Enter your school email before requesting a password reset.",
      ),
    ).toBeTruthy();
    expect(mocks.resetPasswordForEmail).not.toHaveBeenCalled();
  });

  it("sends a password reset to the entered email", async () => {
    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText("School email"), {
      target: { value: " student@farmingdale.edu " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Forgot password?" }));

    await waitFor(() => {
      expect(mocks.resetPasswordForEmail).toHaveBeenCalledWith(
        "student@farmingdale.edu",
      );
    });
    expect(screen.getByText("Password reset email sent.")).toBeTruthy();
  });

  it("signs out and returns the user to login", async () => {
    render(
      <WorkspaceShell
        roleLabel="Student"
        navItems={[{ label: "Dashboard", href: "/dashboard" }]}
      >
        <p>Student workspace</p>
      </WorkspaceShell>,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Open account menu" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));

    await waitFor(() => {
      expect(mocks.logoutCurrentUser).toHaveBeenCalledOnce();
      expect(mocks.push).toHaveBeenCalledWith("/login");
      expect(mocks.refresh).toHaveBeenCalledOnce();
    });
  });

  it("opens the student account menu with profile access", () => {
    render(
      <WorkspaceShell
        roleLabel="Student Mode"
        navItems={[{ label: "Dashboard", href: "/dashboard" }]}
      >
        <p>Student workspace</p>
      </WorkspaceShell>,
    );

    const accountButton = screen.getByRole("button", {
      name: "Open account menu",
    });
    expect(accountButton.textContent).toBe("JE");
    fireEvent.click(accountButton);

    expect(screen.getByRole("link", { name: "Profile" }).getAttribute("href"))
      .toBe("/profile");
    expect(screen.getAllByText("Student Mode")).toHaveLength(2);
  });
});
