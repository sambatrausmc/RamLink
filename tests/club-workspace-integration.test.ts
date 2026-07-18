import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getManagedClubId } from "@/components/club/use-managed-club";
import { currentStudent } from "@/lib/mock-data";

describe("club workspace integration", () => {
  it("uses an officer's assigned managed club", () => {
    expect(
      getManagedClubId({
        ...currentStudent,
        role: "clubOfficer",
        managedClubIds: ["cs-club"],
      }),
    ).toBe("cs-club");
    expect(
      getManagedClubId({
        ...currentStudent,
        role: "student",
        managedClubIds: [],
      }),
    ).toBeNull();
  });

  it("normalizes managed club assignments from user profiles", () => {
    const profileSource = fs.readFileSync(
      path.resolve("lib/firebase/user-profile.ts"),
      "utf8",
    );
    expect(profileSource).toContain("managedClubIds");
  });

  it("removes mock imports from migrated club workspace routes", () => {
    const routes = [
      "app/(club)/club/homepage/page.tsx",
      "app/(club)/club/events/page.tsx",
      "app/(club)/club/announcements/page.tsx",
      "app/(club)/club/resources/page.tsx",
      "app/(club)/club/profile/page.tsx",
      "app/(club)/club/members/page.tsx",
      "app/(club)/club/inbox/page.tsx",
      "app/(club)/club/join-requests/page.tsx",
    ];

    for (const route of routes) {
      expect(fs.readFileSync(path.resolve(route), "utf8")).not.toContain(
        "@/lib/mock-data",
      );
    }
  });
});