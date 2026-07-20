import { describe, expect, it, vi } from "vitest";
import {
  createLogEntry,
  getRequestId,
  logServerEvent,
} from "@/lib/server/logger";

describe("structured server logging", () => {
  it("accepts safe request IDs and replaces malformed values", () => {
    const safe = new Request("https://ramlink.test", {
      headers: { "x-request-id": "request_12345" },
    });
    const unsafe = new Request("https://ramlink.test", {
      headers: { "x-request-id": "bad id value" },
    });

    expect(getRequestId(safe)).toBe("request_12345");
    expect(getRequestId(unsafe)).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("removes sensitive metadata from structured entries", () => {
    const entry = createLogEntry("warn", "request_rejected", "request_12345", {
      email: "student@farmingdale.edu",
      idToken: "private-token",
      password: "private-password",
      reason: "invalid_authentication",
    });

    expect(entry).toMatchObject({ reason: "invalid_authentication" });
    expect(JSON.stringify(entry)).not.toContain("student@farmingdale.edu");
    expect(JSON.stringify(entry)).not.toContain("private-token");
    expect(JSON.stringify(entry)).not.toContain("private-password");
  });

  it("writes one JSON object to the matching log level", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    logServerEvent("warn", "rate_limit_rejected", "request_12345", {
      operation: "session_create",
    });

    expect(warn).toHaveBeenCalledOnce();
    expect(() => JSON.parse(String(warn.mock.calls[0][0]))).not.toThrow();
    warn.mockRestore();
  });
});
