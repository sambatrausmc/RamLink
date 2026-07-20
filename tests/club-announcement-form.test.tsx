/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clubs } from "@/lib/mock-data";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  getAnnouncements: vi.fn(),
  getClub: vi.fn(),
}));

vi.mock("@/components/club/use-managed-club", () => ({
  useManagedClub: () => ({ clubId: "cs-club", loading: false }),
}));
vi.mock("@/lib/firebase/club-workflows", () => ({
  createClubAnnouncement: mocks.create,
  deleteClubAnnouncement: vi.fn(),
  updateClubAnnouncement: vi.fn(),
}));
vi.mock("@/lib/firebase/public-data", () => ({
  getAnnouncementsForClub: mocks.getAnnouncements,
  getClubByIdFromFirestore: mocks.getClub,
}));

import { ClubAnnouncementsClient } from "@/components/club/club-announcements-client";

describe("club announcement form", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.create.mockResolvedValue("announcement-1");
    mocks.getAnnouncements.mockResolvedValue([]);
    mocks.getClub.mockResolvedValue(clubs[0]);
  });

  afterEach(() => cleanup());

  it("resets the submitted form after an asynchronous publish", async () => {
    render(<ClubAnnouncementsClient />);
    const title = await screen.findByPlaceholderText("Announcement title");
    const body = screen.getByPlaceholderText("Write a concise club update");

    fireEvent.change(title, { target: { value: "Weekly meeting" } });
    fireEvent.change(body, { target: { value: "Meet Tuesday at six." } });
    fireEvent.click(
      screen.getByRole("button", { name: "Publish announcement" }),
    );

    await waitFor(() => {
      expect(mocks.create).toHaveBeenCalledOnce();
      expect(screen.getByText("Announcement published to Firestore.")).toBeTruthy();
    });
    expect((title as HTMLInputElement).value).toBe("");
    expect((body as HTMLTextAreaElement).value).toBe("");
  });

  it("reports a successful publish when only the list refresh fails", async () => {
    mocks.getAnnouncements
      .mockResolvedValueOnce([])
      .mockRejectedValueOnce(new Error("refresh failed"));
    render(<ClubAnnouncementsClient />);
    const title = await screen.findByPlaceholderText("Announcement title");
    fireEvent.change(title, { target: { value: "Weekly meeting" } });

    fireEvent.submit(title.closest("form") as HTMLFormElement);

    expect(
      await screen.findByText(
        "Announcement published to Firestore. Reload the page to refresh the list.",
      ),
    ).toBeTruthy();
    expect(screen.queryByText("Unable to publish the announcement.")).toBeNull();
  });
});
