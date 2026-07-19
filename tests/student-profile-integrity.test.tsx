/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StudentProfile } from "@/lib/types";

const liveProfile: StudentProfile = {
  id: "student-live",
  role: "student",
  displayName: "Avery Morgan",
  email: "avery.morgan@farmingdale.edu",
  major: "Applied Mathematics",
  classYear: "Junior",
  interests: ["Technology"],
  joinedClubIds: ["cs-club"],
  savedClubIds: ["cs-club"],
  savedEventIds: [],
  rsvpedEventIds: [],
};

const mocks = vi.hoisted(() => ({
  authState: {
    loading: false,
    profile: null as StudentProfile | null,
    profileStatus: "ready" as "loading" | "ready" | "missing" | "error",
    refreshProfile: vi.fn(),
    user: { uid: "student-live", emailVerified: true },
  },
}));

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => mocks.authState,
}));

vi.mock("@/lib/firebase/student-actions", () => ({
  toggleEventRsvp: vi.fn(),
  toggleSavedClub: vi.fn(),
  toggleSavedEvent: vi.fn(),
}));

import { SavedItemsClient } from "@/components/student/saved-items-client";
import { StudentProfileClient } from "@/components/student/student-profile-client";
import { clubs, events, interests } from "@/lib/mock-data";

describe("authenticated student profile integrity", () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.authState.loading = false;
    mocks.authState.profile = liveProfile;
    mocks.authState.profileStatus = "ready";
  });

  it("renders the signed-in profile without the shared mock identity", () => {
    render(<StudentProfileClient clubs={clubs} interests={interests} />);

    expect(screen.getAllByText("Avery Morgan").length).toBeGreaterThan(0);
    expect(screen.queryByText("Jordan Ellis")).toBeNull();
    expect(
      screen.getAllByText("avery.morgan@farmingdale.edu").length,
    ).toBeGreaterThan(0);
  });

  it("uses only the signed-in profile bookmark IDs", () => {
    render(<SavedItemsClient clubs={clubs} events={events} />);

    expect(screen.getByText("Computer Science Club")).toBeTruthy();
    expect(screen.queryByText("Robotics Club")).toBeNull();
  });

  it("shows a recovery state instead of a mock profile after failure", () => {
    mocks.authState.profile = null;
    mocks.authState.profileStatus = "error";
    render(<StudentProfileClient clubs={clubs} interests={interests} />);

    expect(screen.getByText("Student profile unavailable")).toBeTruthy();
    expect(screen.queryByText("Jordan Ellis")).toBeNull();
  });
});
