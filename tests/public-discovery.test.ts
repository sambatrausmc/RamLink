import { describe, expect, it } from "vitest";
import { filterClubs } from "@/components/public/club-directory-client";
import { filterAndSortEvents } from "@/components/public/event-browser-client";
import { clubs, events } from "@/lib/mock-data";

describe("public discovery helpers", () => {
  it("filters clubs by name, category, and tag", () => {
    expect(filterClubs(clubs, "robotics").map((club) => club.id)).toEqual([
      "robotics",
    ]);
    expect(filterClubs(clubs, "health").map((club) => club.id)).toEqual([
      "nursing-association",
    ]);
    expect(filterClubs(clubs, "careers").map((club) => club.id)).toEqual([
      "cs-club",
      "business-leaders",
    ]);
  });

  it("returns every club when the search is blank", () => {
    expect(filterClubs(clubs, "   ")).toEqual(clubs);
  });

  it("searches events by title and location", () => {
    expect(
      filterAndSortEvents(events, "hack night", "soonest").map(
        (event) => event.id,
      ),
    ).toEqual(["event-hack-night"]);
    expect(
      filterAndSortEvents(events, "campus center", "soonest").map(
        (event) => event.id,
      ),
    ).toEqual(["event-sga-townhall"]);
  });

  it("sorts events by date or RSVP count", () => {
    expect(filterAndSortEvents(events, "", "soonest")[0]?.id).toBe(
      "event-hack-night",
    );
    expect(filterAndSortEvents(events, "", "popular")[0]?.id).toBe(
      "event-sga-townhall",
    );
  });
});
