import { describe, expect, it } from "vitest";
import nextConfig from "@/next.config";

describe("production security headers", () => {
  it("protects every route from framing, sniffing, and browser permissions", async () => {
    const entries = await nextConfig.headers?.();
    const headers = new Map(
      entries?.[0].headers.map((header) => [header.key, header.value]),
    );

    expect(entries?.[0].source).toBe("/(.*)");
    expect(headers.get("X-Frame-Options")).toBe("DENY");
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(headers.get("Permissions-Policy")).toContain("microphone=()");
  });
});
