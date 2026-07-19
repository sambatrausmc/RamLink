import { describe, expect, it } from "vitest";
import {
  isFarmingdaleEmail,
  normalizeSchoolEmail,
  requireFarmingdaleEmail,
} from "@/lib/auth-email-policy";

describe("Farmingdale email policy", () => {
  it("normalizes valid school email addresses", () => {
    expect(normalizeSchoolEmail("  Student@FARMINGDALE.EDU ")).toBe(
      "student@farmingdale.edu",
    );
    expect(isFarmingdaleEmail("Student@FARMINGDALE.EDU")).toBe(true);
  });

  it.each([
    "student@gmail.com",
    "student@mail.farmingdale.edu",
    "student@farmingdale.edu.example.com",
    "student@notfarmingdale.edu",
    "@farmingdale.edu",
    "student name@farmingdale.edu",
    "student@@farmingdale.edu",
  ])("rejects unsupported email address %s", (email) => {
    expect(isFarmingdaleEmail(email)).toBe(false);
  });

  it("returns a normalized address or throws a clear policy error", () => {
    expect(requireFarmingdaleEmail(" Student@Farmingdale.edu ")).toBe(
      "student@farmingdale.edu",
    );
    expect(() => requireFarmingdaleEmail("student@example.com")).toThrow(
      "Use a valid @farmingdale.edu email address.",
    );
  });
});
