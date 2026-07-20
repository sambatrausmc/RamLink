import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";
import { SESSION_COOKIE_NAME } from "@/lib/auth-session-contract";
import {
  getSafeNextPath,
  isProtectedWorkspacePath,
} from "@/lib/auth-navigation";

function request(path: string, withSession = false) {
  return new NextRequest(`https://ramlink.example${path}`, {
    headers: withSession
      ? { cookie: `${SESSION_COOKIE_NAME}=signed-session` }
      : {},
  });
}

describe("protected workspace proxy", () => {
  it.each([
    "/dashboard",
    "/account",
    "/profile",
    "/club/homepage",
    "/admin/users",
  ])("recognizes %s as protected", (path) => {
    expect(isProtectedWorkspacePath(path)).toBe(true);
  });

  it.each(["/", "/homepage", "/clubs", "/clubs/cs-club", "/events"])(
    "keeps %s public",
    (path) => {
      expect(isProtectedWorkspacePath(path)).toBe(false);
      expect(proxy(request(path)).headers.get("x-middleware-next")).toBe("1");
    },
  );

  it("redirects a missing cookie and preserves the requested path", () => {
    const response = proxy(request("/club/inbox?filter=open"));
    const location = new URL(response.headers.get("location") as string);

    expect(location.pathname).toBe("/login");
    expect(location.searchParams.get("next")).toBe(
      "/club/inbox?filter=open",
    );
  });

  it("allows a cookie through for full server validation", () => {
    const response = proxy(request("/admin/users", true));

    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it.each([
    ["https://attacker.example", null],
    ["//attacker.example/path", null],
    ["/\\attacker.example", null],
    ["/login?next=/dashboard", null],
    ["/verification-complete", null],
    ["/verify-email", null],
    ["/dashboard?tab=events", "/dashboard?tab=events"],
  ])("sanitizes a requested destination", (value, expected) => {
    expect(getSafeNextPath(value)).toBe(expected);
  });
});
