import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("workflow and admin integration", () => {
  // Confirms hardened authorization constraints exist inside firestore.rules
  it("keeps membership and notification writes protected", () => {
    const rules = fs.readFileSync(path.resolve("firestore.rules"), "utf8");
    expect(rules).toContain("officerUpdatesManagedMembership");
    expect(rules).toContain('hasOnly(["status", "updatedAt"])');
    expect(rules).toContain("managesClub(request.resource.data.clubId)");
  });

  // Verifies feedback notification titles exist in student action flows
  it("creates workflow notifications for student actions", () => {
    const actions = fs.readFileSync(
      path.resolve("lib/firebase/student-actions.ts"),
      "utf8",
    );
    expect(actions).toContain('title: "Join request sent"');
    expect(actions).toContain('title: "Question sent"');
  });

  // Ensures mock imports have been removed from migrated admin routes
  it("removes mock imports from migrated admin routes", () => {
    const routes = [
      "app/(admin)/admin/homepage/page.tsx",
      "app/(admin)/admin/reports/page.tsx",
      "app/(admin)/admin/users/page.tsx",
      "app/(admin)/admin/clubs/page.tsx",
    ];
    for (const route of routes) {
      expect(fs.readFileSync(path.resolve(route), "utf8")).not.toContain(
        "@/lib/mock-data",
      );
    }
  });
});
