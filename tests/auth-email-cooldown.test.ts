/** @vitest-environment jsdom */

import { beforeEach, describe, expect, it } from "vitest";
import {
  getAuthEmailCooldown,
  requireAuthEmailCooldown,
  startAuthEmailCooldown,
} from "@/lib/auth-action-cooldown";

describe("authentication email cooldown", () => {
  beforeEach(() => window.localStorage.clear());

  it("records a sixty-second browser cooldown", () => {
    startAuthEmailCooldown("password-reset", 1_000);
    expect(getAuthEmailCooldown("password-reset", 1_000)).toBe(60);
    expect(getAuthEmailCooldown("password-reset", 60_001)).toBe(1);
    expect(getAuthEmailCooldown("password-reset", 61_000)).toBe(0);
  });

  it("keeps password reset and verification limits independent", () => {
    startAuthEmailCooldown("verification");
    expect(() => requireAuthEmailCooldown("password-reset")).not.toThrow();
    expect(() => requireAuthEmailCooldown("verification")).toThrow(
      /Wait \d+ seconds/,
    );
  });
});
