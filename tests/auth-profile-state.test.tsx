/** @vitest-environment jsdom */

import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StudentProfile } from "@/lib/types";

const mocks = vi.hoisted(() => ({
  auth: { currentUser: null as Record<string, unknown> | null },
  authCallback: null as ((user: Record<string, unknown> | null) => Promise<void>) | null,
  ensurePersistence: vi.fn(),
  ensureProfile: vi.fn(),
  createServerSession: vi.fn(),
  getProfile: vi.fn(),
  readServerSession: vi.fn(),
  profileCallback: null as ((profile: StudentProfile | null) => void) | null,
  profileErrorCallback: null as (() => void) | null,
  profileUnsubscribe: vi.fn(),
  subscribeProfile: vi.fn(),
  unsubscribe: vi.fn(),
}));

vi.mock("@/lib/firebase/server-session", () => ({
  createServerSession: mocks.createServerSession,
  readServerSession: mocks.readServerSession,
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
  subscribeToStudentProfile: mocks.subscribeProfile,
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
  const {
    profile,
    profileStatus,
    refreshProfile,
    refreshSession,
    sessionState,
  } = useAuth();
  return (
    <div>
      <span data-testid="profile-status">{profileStatus}</span>
      <span data-testid="profile-name">{profile?.displayName ?? "none"}</span>
      <span data-testid="profile-role">{profile?.role ?? "none"}</span>
      <span data-testid="session-status">{sessionState}</span>
      <button type="button" onClick={() => void refreshProfile()}>
        Retry profile
      </button>
      <button type="button" onClick={() => void refreshSession()}>
        Retry session
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
    mocks.profileCallback = null;
    mocks.profileErrorCallback = null;
    mocks.ensurePersistence.mockResolvedValue(undefined);
    mocks.getProfile.mockResolvedValue(studentProfile);
    mocks.ensureProfile.mockResolvedValue(studentProfile);
    mocks.createServerSession.mockResolvedValue(undefined);
    mocks.readServerSession.mockResolvedValue({
      authenticated: true,
      uid: verifiedUser.uid,
    });
    mocks.subscribeProfile.mockImplementation(
      async (_uid, onProfile, onError) => {
        mocks.profileCallback = onProfile;
        mocks.profileErrorCallback = onError;
        return mocks.profileUnsubscribe;
      },
    );
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
    expect(screen.getByTestId("session-status").textContent).toBe("ready");
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
    expect(screen.getByTestId("session-status").textContent).toBe(
      "verificationRequired",
    );
    expect(mocks.getProfile).not.toHaveBeenCalled();
  });

  it("recovers a missing server cookie for a recent browser session", async () => {
    mocks.readServerSession.mockResolvedValueOnce(null);
    await renderProvider();

    await act(async () => {
      await mocks.authCallback?.(verifiedUser);
    });

    expect(mocks.createServerSession).toHaveBeenCalledWith(verifiedUser);
    expect(screen.getByTestId("session-status").textContent).toBe("ready");
  });

  it("shares one server session exchange across concurrent callers", async () => {
    let finishSession: () => void = () => {};
    mocks.readServerSession.mockResolvedValueOnce(null);
    mocks.createServerSession.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        finishSession = resolve;
      }),
    );
    await renderProvider();

    let authChange: Promise<void> | undefined;
    act(() => {
      authChange = mocks.authCallback?.(verifiedUser);
    });
    await waitFor(() => {
      expect(mocks.createServerSession).toHaveBeenCalledOnce();
    });

    fireEvent.click(screen.getByRole("button", { name: "Retry session" }));
    expect(mocks.readServerSession).toHaveBeenCalledOnce();
    expect(mocks.createServerSession).toHaveBeenCalledOnce();

    finishSession();
    await act(async () => authChange);
    expect(screen.getByTestId("session-status").textContent).toBe("ready");
  });

  it("requires fresh sign-in when the server session cannot be renewed", async () => {
    mocks.readServerSession.mockResolvedValueOnce(null);
    mocks.createServerSession.mockRejectedValueOnce(new Error("stale login"));
    await renderProvider();

    await act(async () => {
      await mocks.authCallback?.(verifiedUser);
    });

    expect(screen.getByTestId("session-status").textContent).toBe("error");
    expect(screen.getByTestId("profile-status").textContent).toBe("missing");
    expect(mocks.getProfile).not.toHaveBeenCalled();
  });

  it("updates role and managed clubs when the Firestore profile changes", async () => {
    await renderProvider();
    await act(async () => {
      await mocks.authCallback?.(verifiedUser);
    });
    await waitFor(() => expect(mocks.subscribeProfile).toHaveBeenCalled());

    act(() => {
      mocks.profileCallback?.({
        ...studentProfile,
        role: "clubOfficer",
        managedClubIds: ["club-1"],
      });
    });

    expect(screen.getByTestId("profile-role").textContent).toBe("clubOfficer");
    expect(screen.getByTestId("profile-status").textContent).toBe("ready");
  });
});
