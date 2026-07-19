import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/auth/csrf/route";
import {
  createCsrfToken,
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
  verifyCsrfRequest,
} from "@/lib/server/csrf";

const requestUrl = "https://ramlink.example/api/auth/session";

function createRequest(token?: string, origin = "https://ramlink.example") {
  return new Request(requestUrl, {
    method: "POST",
    headers: {
      ...(token ? { [CSRF_HEADER_NAME]: token } : {}),
      origin,
    },
  });
}

describe("authentication CSRF protection", () => {
  it("issues a no-store token and matching secure cookie settings", async () => {
    const response = GET();
    const body = await response.json();
    const cookie = response.cookies.get(CSRF_COOKIE_NAME);

    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(cookie?.value).toBe(body.csrfToken);
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    expect(response.headers.get("set-cookie")).toContain("SameSite=lax");
  });

  it("accepts matching fresh tokens from the same origin", () => {
    const now = Date.now();
    const token = createCsrfToken(now);

    expect(verifyCsrfRequest(createRequest(token), token, now)).toBe(true);
  });

  it.each([
    ["missing header", undefined, "cookie", "https://ramlink.example"],
    ["missing cookie", "header", undefined, "https://ramlink.example"],
    ["mismatched token", "header", "cookie", "https://ramlink.example"],
    ["cross-origin request", "same", "same", "https://attacker.example"],
  ])("rejects a %s", (_label, header, cookie, origin) => {
    expect(verifyCsrfRequest(createRequest(header, origin), cookie)).toBe(false);
  });

  it("rejects expired tokens", () => {
    const issuedAt = Date.now() - 61 * 60 * 1000;
    const token = createCsrfToken(issuedAt);

    expect(verifyCsrfRequest(createRequest(token), token)).toBe(false);
  });
});
