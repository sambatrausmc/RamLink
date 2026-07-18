/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  refreshProfile: vi.fn(),
  toggleEventRsvp: vi.fn(),
  toggleSavedEvent: vi.fn(),
}));

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => ({
    user: { uid: "student-1" },
    profile: {
      savedEventIds: [],
      rsvpedEventIds: [],
    },
    refreshProfile: mocks.refreshProfile,
  }),
}));

vi.mock("@/lib/firebase/student-actions", () => ({
  toggleEventRsvp: mocks.toggleEventRsvp,
  toggleSavedEvent: mocks.toggleSavedEvent,
}));

import { ClubCard } from "@/components/cards/club-card";
import { EventCard } from "@/components/cards/event-card";
import { clubs, events } from "@/lib/mock-data";

describe("student event and club cards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.refreshProfile.mockResolvedValue(undefined);
    mocks.toggleEventRsvp.mockResolvedValue(true);
    mocks.toggleSavedEvent.mockResolvedValue(true);
  });

  afterEach(() => cleanup());

  it("renders club details with the correct profile link", () => {
    const club = clubs[0];

    render(<ClubCard club={club} showStatus />);

    expect(screen.getByRole("heading", { name: club.name })).toBeTruthy();
    expect(screen.getByText(`${club.memberCount} members`)).toBeTruthy();
    expect(
      screen.getByRole("link", { name: /view club/i }).getAttribute("href"),
    ).toBe(`/clubs/${club.id}`);
  });

  it("persists an RSVP and updates the visible event state", async () => {
    const event = events[1];

    render(<EventCard event={event} />);
    fireEvent.click(screen.getByRole("button", { name: "RSVP" }));

    await waitFor(() => {
      expect(mocks.toggleEventRsvp).toHaveBeenCalledWith(
        "student-1",
        event.id,
      );
    });
    expect(await screen.findByText("RSVP saved.")).toBeTruthy();
    expect(screen.getByText(`${event.rsvpCount + 1} RSVPs`)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Cancel RSVP" })).toBeTruthy();
    expect(mocks.refreshProfile).toHaveBeenCalledOnce();
  });
});
