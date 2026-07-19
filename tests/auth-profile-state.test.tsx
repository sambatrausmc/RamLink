/** @vitest-environment jsdom */

import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: { currentUser: null as Record<string, unknown> | null },
  authCallback: null as ((user: Record<string, unknown> | null) => Promise<void>) | null,
  ensurePersistence: vi.fn(),
  ensureProfile: vi.fn(),
  getProfile: vi.fn(),
  unsubscribe: vi.fn(),
}));

vi.mock("@/lib/firebase/client", () => ({
  auth: mocks.auth,
  ensureAuthPersistence: mocks.ensurePersistence,
}));

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: vi.fn((_auth, callback) => {
    mocks.authCallback = callback;
    return mocks.unsubscribe;
  }),
}));

vi.mock("@/lib/firebase/user-profile", () => ({
  ensureStudentProfile: mocks.ensureProfile,
  getStudentProfile: mocks.getProfile,
}));

import { AuthProvider, useAuth } from "@/components/auth/auth-provider";

const verifiedUser = {
  uid: "student-1",
  email: "student-1@farmingdale.edu",
  emailVerified: true,
  displayName: "Student One",
};

const studentProfile = {
  id: "student-1",
  role: "student" as const,
  displayName: "Student One",
  email: "student-1@farmingdale.edu",
  major: "Computer Programming",
  classYear: "Senior",
  interests: [],
  joinedClubIds: [],
  savedClubIds: [],
  savedEventIds: [],
  rsvpedEventIds: [],
  managedClubIds: [],
};

function AuthStateProbe() {
  const { profile, profileStatus, refreshProfile } = useAuth();
  return (
    <div>
      <span data-testid="profile-status">{profileStatus}</span>
      <span data-testid="profile-name">{profile?.displayName ?? "none"}</span>
      <button type="button" onClick={() => void refreshProfile()}>
        Retry profile
      </button>
    </div>
  );
}

describe("authenticated profile states", () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.currentUser = verifiedUser;
    mocks.authCallback = null;
    mocks.ensurePersistence.mockResolvedValue(undefined);
    mocks.getProfile.mockResolvedValue(studentProfile);
    mocks.ensureProfile.mockResolvedValue(studentProfile);
  });

  async function renderProvider() {
    render(
      <AuthProvider>
        <AuthStateProbe />
      </AuthProvider>,
    );
    await waitFor(() => expect(mocks.authCallback).toBeTypeOf("function"));
  }

  it("reports ready when the Firestore profile exists", async () => {
    await renderProvider();

    await act(async () => {
      await mocks.authCallback?.(verifiedUser);
    });

    expect(screen.getByTestId("profile-status").textContent).toBe("ready");
    expect(screen.getByTestId("profile-name").textContent).toBe("Student One");
    expect(mocks.ensureProfile).not.toHaveBeenCalled();
  });

  it("reports missing while a verified profile is being recovered", async () => {
    let finishRecovery: (profile: typeof studentProfile) => void = () => {};
    mocks.getProfile.mockResolvedValueOnce(null);
    mocks.ensureProfile.mockReturnValueOnce(
      new Promise((resolve) => {
        finishRecovery = resolve;
      }),
    );
    await renderProvider();

    let authChange: Promise<void> | undefined;
    act(() => {
      authChange = mocks.authCallback?.(verifiedUser);
    });
    await waitFor(() => {
      expect(screen.getByTestId("profile-status").textContent).toBe("missing");
    });

    finishRecovery(studentProfile);
    await act(async () => authChange);
    expect(screen.getByTestId("profile-status").textContent).toBe("ready");
  });

  it("reports Firestore failures and retries recovery", async () => {
    mocks.getProfile.mockRejectedValueOnce(new Error("Firestore unavailable"));
    await renderProvider();
    await act(async () => {
      await mocks.authCallback?.(verifiedUser);
    });
    expect(screen.getByTestId("profile-status").textContent).toBe("error");

    mocks.getProfile.mockResolvedValueOnce(null);
    fireEvent.click(screen.getByRole("button", { name: "Retry profile" }));
    await waitFor(() => {
      expect(screen.getByTestId("profile-status").textContent).toBe("ready");
    });
    expect(mocks.ensureProfile).toHaveBeenCalledWith(verifiedUser);
  });

  it("does not query a profile for an unverified account", async () => {
    await renderProvider();
    await act(async () => {
      await mocks.authCallback?.({ ...verifiedUser, emailVerified: false });
    });

    expect(screen.getByTestId("profile-status").textContent).toBe("missing");
    expect(mocks.getProfile).not.toHaveBeenCalled();
  });
});
