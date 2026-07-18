import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/firebase/public-data", async () => {
  const data = await import("@/lib/mock-data");

  return {
    getAnnouncementsForClub: async (clubId: string) =>
      data.announcements.filter(
        (announcement) => announcement.clubId === clubId,
      ),
    getClubByIdFromFirestore: async (clubId: string) =>
      data.clubs.find((club) => club.id === clubId) ?? null,
    getEventsForClub: async (clubId: string) =>
      data.events.filter((event) => event.clubId === clubId),
    getResourcesForClub: async (clubId: string) =>
      data.resources.filter((resource) => resource.clubId === clubId),
  };
});

import ClubProfilePage from "@/app/(public)/clubs/[clubId]/page";

describe("public club profile", () => {
  it("renders Firestore-backed club content with valid account actions", async () => {
    const page = await ClubProfilePage({
      params: Promise.resolve({ clubId: "cs-club" }),
    });
    const html = renderToString(page);

    expect(html).toContain("Computer Science Club");
    expect(html).toContain("Create Account");
    expect(html).toContain("Upcoming events");
    expect(html).not.toContain("surfacev");
    expect(html).not.toContain("className=&quot;");
  });
});
