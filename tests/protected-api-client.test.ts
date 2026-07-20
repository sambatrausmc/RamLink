import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: { currentUser: { uid: "student-1" } as object | null },
  ensureAuthPersistence: vi.fn(),
  getAppCheckRequestHeaders: vi.fn(),
  getIdToken: vi.fn(),
}));

vi.mock("@/lib/firebase/client", () => ({
  auth: mocks.auth,
  ensureAuthPersistence: mocks.ensureAuthPersistence,
}));
vi.mock("@/lib/firebase/app-check", () => ({
  getAppCheckRequestHeaders: mocks.getAppCheckRequestHeaders,
}));
vi.mock("firebase/auth", () => ({ getIdToken: mocks.getIdToken }));

import { protectedApiRequest } from "@/lib/firebase/protected-api";

describe("protected API client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.currentUser = { uid: "student-1" };
    mocks.getIdToken.mockResolvedValue("id-token");
    mocks.getAppCheckRequestHeaders.mockResolvedValue({
      "X-Firebase-AppCheck": "app-check-token",
    });
  });

  it("sends Firebase Auth and App Check tokens", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "record-1" }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      protectedApiRequest<{ id: string }>("/api/student/action", {
        method: "POST",
        body: JSON.stringify({ value: "test" }),
      }),
    ).resolves.toEqual({ id: "record-1" });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/student/action",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer id-token",
          "X-Firebase-AppCheck": "app-check-token",
        }),
      }),
    );
  });

  it("returns safe server errors and requires an active user", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "Request limit reached." }), {
          status: 429,
        }),
      ),
    );
    await expect(protectedApiRequest("/api/student/action")).rejects.toThrow(
      "Request limit reached.",
    );

    mocks.auth.currentUser = null;
    await expect(protectedApiRequest("/api/student/action")).rejects.toThrow(
      "Sign in",
    );
  });
});
