/** @vitest-environment jsdom */

import { beforeEach, describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({
  getIdToken: vi.fn(),
}));

const appCheckMocks = vi.hoisted(() => ({
  getHeaders: vi.fn(),
}));

vi.mock("firebase/auth", () => ({
  getIdToken: authMocks.getIdToken,
}));

vi.mock("@/lib/firebase/app-check", () => ({
  getAppCheckRequestHeaders: appCheckMocks.getHeaders,
}));

import {
  clearServerSession,
  createServerSession,
  readServerSession,
} from "@/lib/firebase/server-session";
import { CSRF_HEADER_NAME } from "@/lib/server/csrf";

describe("Firebase client and server session requests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.getIdToken.mockResolvedValue("fresh-id-token");
    appCheckMocks.getHeaders.mockResolvedValue({
      "X-Firebase-AppCheck": "app-check-token",
    });
  });

  it("exchanges a refreshed ID token with CSRF protection", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ csrfToken: "csrf-token" }),
      })
      .mockResolvedValueOnce({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    const user = { uid: "student-1" } as never;

    await createServerSession(user);

    expect(authMocks.getIdToken).toHaveBeenCalledWith(user, true);
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/auth/session",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "X-Firebase-AppCheck": "app-check-token",
          [CSRF_HEADER_NAME]: "csrf-token",
        }),
        body: JSON.stringify({ idToken: "fresh-id-token" }),
      }),
    );
  });

  it("returns the authenticated server session", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          authenticated: true,
          uid: "student-1",
        }),
      }),
    );

    await expect(readServerSession()).resolves.toEqual({
      authenticated: true,
      uid: "student-1",
    });
  });

  it("returns null when the server session is missing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 401 }),
    );

    await expect(readServerSession()).resolves.toBeNull();
  });

  it("clears the server session with fresh CSRF proof", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ csrfToken: "csrf-token" }),
      })
      .mockResolvedValueOnce({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    await clearServerSession();

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/auth/session",
      expect.objectContaining({
        method: "DELETE",
        headers: {
          "X-Firebase-AppCheck": "app-check-token",
          [CSRF_HEADER_NAME]: "csrf-token",
        },
      }),
    );
  });
});
