import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const appCheckMocks = vi.hoisted(() => ({
  getToken: vi.fn(),
  initializeAppCheck: vi.fn(),
  provider: vi.fn(),
}));

vi.mock("firebase/app-check", () => ({
  getToken: appCheckMocks.getToken,
  initializeAppCheck: appCheckMocks.initializeAppCheck,
  ReCaptchaEnterpriseProvider: appCheckMocks.provider,
}));

describe("Firebase App Check initialization", () => {
  const originalSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    appCheckMocks.initializeAppCheck.mockReturnValue({ name: "app-check" });
    appCheckMocks.getToken.mockResolvedValue({ token: "app-check-token" });
    delete process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (originalSiteKey === undefined) {
      delete process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY;
    } else {
      process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY = originalSiteKey;
    }
  });

  it("does nothing during server-side rendering", async () => {
    process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY = "site-key";
    const { initializeFirebaseAppCheck } = await import(
      "@/lib/firebase/app-check"
    );

    initializeFirebaseAppCheck({ name: "server-app" } as never);
    expect(appCheckMocks.initializeAppCheck).not.toHaveBeenCalled();
  });

  it("does nothing in the browser without a site key", async () => {
    vi.stubGlobal("window", {});
    const { initializeFirebaseAppCheck } = await import(
      "@/lib/firebase/app-check"
    );

    initializeFirebaseAppCheck({ name: "browser-app" } as never);
    expect(appCheckMocks.initializeAppCheck).not.toHaveBeenCalled();
  });

  it("initializes only once when the browser has a site key", async () => {
    vi.stubGlobal("window", {});
    process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY = "site-key";
    const { initializeFirebaseAppCheck } = await import(
      "@/lib/firebase/app-check"
    );
    const app = { name: "browser-app" } as never;

    initializeFirebaseAppCheck(app);
    initializeFirebaseAppCheck(app);

    expect(appCheckMocks.provider).toHaveBeenCalledOnce();
    expect(appCheckMocks.provider).toHaveBeenCalledWith("site-key");
    expect(appCheckMocks.initializeAppCheck).toHaveBeenCalledOnce();
    expect(appCheckMocks.initializeAppCheck).toHaveBeenCalledWith(
      app,
      expect.objectContaining({ isTokenAutoRefreshEnabled: true }),
    );
  });

  it("adds the current App Check token to custom API headers", async () => {
    vi.stubGlobal("window", {});
    process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY = "site-key";
    const { getAppCheckRequestHeaders, initializeFirebaseAppCheck } =
      await import("@/lib/firebase/app-check");

    initializeFirebaseAppCheck({ name: "browser-app" } as never);

    await expect(getAppCheckRequestHeaders()).resolves.toEqual({
      "X-Firebase-AppCheck": "app-check-token",
    });
  });
});
