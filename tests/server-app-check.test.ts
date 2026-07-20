import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const adminMocks = vi.hoisted(() => ({ verifyToken: vi.fn() }));

vi.mock("@/lib/firebase/admin", () => ({
  getAdminAppCheck: () => adminMocks,
}));

import { verifyAppCheckRequest } from "@/lib/server/app-check";

describe("server App Check verification", () => {
  const originalEnforcement = process.env.FIREBASE_APP_CHECK_ENFORCED;

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.FIREBASE_APP_CHECK_ENFORCED;
    adminMocks.verifyToken.mockResolvedValue({ appId: "ramlink-web" });
  });

  afterEach(() => {
    if (originalEnforcement === undefined) {
      delete process.env.FIREBASE_APP_CHECK_ENFORCED;
    } else {
      process.env.FIREBASE_APP_CHECK_ENFORCED = originalEnforcement;
    }
  });

  it("allows local requests when enforcement is disabled", async () => {
    await expect(verifyAppCheckRequest(new Request("https://ramlink.test")))
      .resolves.toBe(true);
    expect(adminMocks.verifyToken).not.toHaveBeenCalled();
  });

  it("rejects missing and invalid tokens when enforcement is enabled", async () => {
    process.env.FIREBASE_APP_CHECK_ENFORCED = "true";
    await expect(verifyAppCheckRequest(new Request("https://ramlink.test")))
      .resolves.toBe(false);

    adminMocks.verifyToken.mockRejectedValue(new Error("invalid"));
    const request = new Request("https://ramlink.test", {
      headers: { "X-Firebase-AppCheck": "invalid-token" },
    });
    await expect(verifyAppCheckRequest(request)).resolves.toBe(false);
  });

  it("accepts a valid token when enforcement is enabled", async () => {
    process.env.FIREBASE_APP_CHECK_ENFORCED = "true";
    const request = new Request("https://ramlink.test", {
      headers: { "X-Firebase-AppCheck": "valid-token" },
    });

    await expect(verifyAppCheckRequest(request)).resolves.toBe(true);
    expect(adminMocks.verifyToken).toHaveBeenCalledWith("valid-token");
  });
});
