/** @vitest-environment jsdom */

import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  authState: {
    loading: false,
    profile: { role: "clubOfficer" as const },
    user: { uid: "officer-1", emailVerified: true } as {
      uid: string;
      emailVerified: boolean;
    },
  },
  push: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, replace: mocks.replace }),
}));

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => mocks.authState,
}));

vi.mock("@/lib/firebase/auth", () => ({
  loginWithEmailAndPassword: vi.fn(),
}));

import { LoginForm } from "@/components/auth/login-form";

describe("authenticated account routes", () => {
  afterEach(() => cleanup());
  beforeEach(() => vi.clearAllMocks());

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
});
