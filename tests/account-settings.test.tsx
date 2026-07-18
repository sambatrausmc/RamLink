/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  deleteCurrentAccount: vi.fn(),
  push: vi.fn(),
  sendCurrentUserVerification: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => ({
    user: {
      email: "student@farmingdale.edu",
      emailVerified: true,
    },
  }),
}));

vi.mock("@/lib/firebase/account-actions", () => ({
  deleteCurrentAccount: mocks.deleteCurrentAccount,
  sendCurrentUserVerification: mocks.sendCurrentUserVerification,
}));

import { AccountSettingsClient } from "@/components/student/account-settings-client";

describe("account settings deletion", () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.deleteCurrentAccount.mockResolvedValue(undefined);
  });

  it("requires a password and exact DELETE confirmation", () => {
    render(<AccountSettingsClient />);
    const deleteButton = screen.getByRole("button", { name: "Delete account" });

    expect((deleteButton as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(screen.getByLabelText("Current password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Type DELETE"), {
      target: { value: "delete" },
    });
    expect((deleteButton as HTMLButtonElement).disabled).toBe(true);

    fireEvent.change(screen.getByPlaceholderText("Type DELETE"), {
      target: { value: "DELETE" },
    });
    expect((deleteButton as HTMLButtonElement).disabled).toBe(false);
  });

  it("passes the current password and redirects after deletion", async () => {
    render(<AccountSettingsClient />);
    fireEvent.change(screen.getByLabelText("Current password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Type DELETE"), {
      target: { value: "DELETE" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Delete account" }));

    await waitFor(() => {
      expect(mocks.deleteCurrentAccount).toHaveBeenCalledWith("password123");
      expect(mocks.push).toHaveBeenCalledWith("/homepage");
    });
  });
});
