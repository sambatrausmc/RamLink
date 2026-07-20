/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clubs } from "@/lib/mock-data";

const mocks = vi.hoisted(() => ({
  createEvent: vi.fn(),
  createResource: vi.fn(),
  getClub: vi.fn(),
  getEvents: vi.fn(),
  getResources: vi.fn(),
}));

vi.mock("@/components/club/use-managed-club", () => ({
  useManagedClub: () => ({ clubId: "cs-club", loading: false }),
}));
vi.mock("@/lib/firebase/club-workflows", () => ({
  createClubEvent: mocks.createEvent,
  createClubResource: mocks.createResource,
  deleteClubEvent: vi.fn(),
  deleteClubResource: vi.fn(),
  parseResourceType: (value: string) => value,
  updateClubEvent: vi.fn(),
  updateClubResource: vi.fn(),
}));
vi.mock("@/lib/firebase/public-data", () => ({
  getClubByIdFromFirestore: mocks.getClub,
  getEventsForClub: mocks.getEvents,
  getResourcesForClub: mocks.getResources,
}));

import { ClubEventsClient } from "@/components/club/club-events-client";
import { ClubResourcesClient } from "@/components/club/club-resources-client";

describe("officer form lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createEvent.mockResolvedValue("event-1");
    mocks.createResource.mockResolvedValue("resource-1");
    mocks.getClub.mockResolvedValue(clubs[0]);
    mocks.getEvents.mockResolvedValue([]);
    mocks.getResources.mockResolvedValue([]);
  });

  afterEach(() => cleanup());

  it("resets an event form after its asynchronous write", async () => {
    render(<ClubEventsClient />);
    const title = await screen.findByPlaceholderText("Event title");
    fireEvent.change(title, { target: { value: "Officer workshop" } });

    fireEvent.submit(title.closest("form") as HTMLFormElement);

    await waitFor(() => {
      expect(mocks.createEvent).toHaveBeenCalledOnce();
      expect(screen.getByText("Event published to Firestore.")).toBeTruthy();
    });
    expect((title as HTMLInputElement).value).toBe("");
  });

  it("resets a resource form after its asynchronous write", async () => {
    render(<ClubResourcesClient />);
    const title = await screen.findByPlaceholderText("Resource title");
    fireEvent.change(title, { target: { value: "Officer handbook" } });

    fireEvent.submit(title.closest("form") as HTMLFormElement);

    await waitFor(() => {
      expect(mocks.createResource).toHaveBeenCalledOnce();
      expect(screen.getByText("Resource saved to Firestore.")).toBeTruthy();
    });
    expect((title as HTMLInputElement).value).toBe("");
  });
});
