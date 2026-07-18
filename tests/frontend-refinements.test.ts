import { describe, expect, it } from "vitest";
import { getAccountInitials } from "@/components/layout/workspace-shell";
import { filterNotifications } from "@/components/student/notifications-client";
import { filterEvents, getEventCategories } from "@/lib/event-filters";
import { clubs, events, notifications } from "@/lib/mock-data";
describe("frontend refinements", () => {
  it("searches events by location and club information", () => {
    const byLocation = filterEvents(events, clubs, "engineering tech", "all");
    const byClub = filterEvents(events, clubs, "business leadership", "all");
    expect(byLocation.map((event) => event.id)).toEqual([
      "event-robotics-build",
    ]);
    expect(byClub.map((event) => event.id)).toEqual(["event-resume-lab"]);
  });
  it("filters events by the hosting club category", () => {
    const businessEvents = filterEvents(events, clubs, "", "Business");
    expect(businessEvents.map((event) => event.id)).toEqual([
      "event-resume-lab",
    ]);
    expect(getEventCategories(events, clubs)).toContain("Technology");
  });
  it("returns only unread notifications when requested", () => {
    const unread = filterNotifications(notifications, "unread");
    expect(unread).toHaveLength(2);
    expect(
      unread.every((notification) => notification.status === "unread"),
    ).toBe(true);
  });
  it("creates stable account initials", () => {
    expect(getAccountInitials("Jordan Ellis")).toBe("JE");
    expect(getAccountInitials("Avery Morgan Chen")).toBe("AM");
    expect(getAccountInitials(" ")).toBe("RL");
  });
});
