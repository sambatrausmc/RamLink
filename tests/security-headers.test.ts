import { describe, expect, it } from "vitest";
import nextConfig from "@/next.config";

describe("production security headers", () => {
  it("protects every route with browser and transport security headers", async () => {
    const entries = await nextConfig.headers?.();
    const headers = new Map(
      entries?.[0].headers.map((header) => [header.key, header.value]),
    );

    expect(entries?.[0].source).toBe("/(.*)");
    expect(headers.get("X-Frame-Options")).toBe("DENY");
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(headers.get("Strict-Transport-Security")).toContain("max-age=31536000");
    expect(headers.get("Cross-Origin-Opener-Policy")).toBe(
      "same-origin-allow-popups",
    );
    expect(headers.get("Cross-Origin-Resource-Policy")).toBe("same-site");
    expect(headers.get("Permissions-Policy")).toContain("microphone=()");

    const policy = headers.get("Content-Security-Policy") ?? "";
    expect(policy).toContain("default-src 'self'");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("object-src 'none'");
  });
});
