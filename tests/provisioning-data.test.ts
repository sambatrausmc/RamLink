import { describe, expect, it } from "vitest";
import catalog from "../scripts/provisioning/data/catalog.json";
import events from "../scripts/provisioning/data/events.json";
import announcements from "../scripts/provisioning/data/announcements.json";
import resources from "../scripts/provisioning/data/resources.json";

type RecordWithId = { id: string };
type ClubRecord = RecordWithId & { status: string; nextEventId: string };
type ClubContentRecord = RecordWithId & { clubId: string };

function expectUniqueIds(records: RecordWithId[]) {
  const ids = records.map(({ id }) => id);
  expect(ids.every(Boolean)).toBe(true);
  expect(new Set(ids).size).toBe(ids.length);
}

describe("backend provisioning data", () => {
  it("contains enough records for a multi-feature demonstration", () => {
    expect(catalog.clubs.length).toBeGreaterThanOrEqual(4);
    expect(catalog.interests.length).toBeGreaterThanOrEqual(6);
    expect(events.length).toBeGreaterThanOrEqual(6);
    expect(announcements.length).toBeGreaterThanOrEqual(4);
    expect(resources.length).toBeGreaterThanOrEqual(4);
  });

  it("uses unique deterministic document IDs", () => {
    expectUniqueIds(catalog.clubs);
    expectUniqueIds(catalog.interests);
    expectUniqueIds(events);
    expectUniqueIds(announcements);
    expectUniqueIds(resources);
  });

  it("connects every event and club-content record to a known club", () => {
    const clubIds = new Set(catalog.clubs.map(({ id }) => id));
    const relatedRecords: ClubContentRecord[] = [
      ...events,
      ...announcements,
      ...resources,
    ];
    for (const record of relatedRecords) {
      expect(clubIds.has(record.clubId)).toBe(true);
    }
  });

  it("publishes active clubs with valid next-event references", () => {
    const eventIds = new Set(events.map(({ id }) => id));
    for (const club of catalog.clubs as ClubRecord[]) {
      expect(club.status).toBe("active");
      expect(eventIds.has(club.nextEventId)).toBe(true);
    }
  });
});