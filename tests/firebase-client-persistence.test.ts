import { beforeEach, describe, expect, it, vi } from "vitest";

const firebaseMocks = vi.hoisted(() => ({
  app: { name: "ramlink" },
  auth: { name: "ramlink-auth" },
  browserLocalPersistence: { type: "LOCAL" },
  setPersistence: vi.fn(),
}));

vi.mock("firebase/app", () => ({
  getApp: () => firebaseMocks.app,
  getApps: () => [firebaseMocks.app],
  initializeApp: () => firebaseMocks.app,
}));

vi.mock("firebase/auth", () => ({
  browserLocalPersistence: firebaseMocks.browserLocalPersistence,
  getAuth: () => firebaseMocks.auth,
  setPersistence: firebaseMocks.setPersistence,
}));

vi.mock("firebase/firestore", () => ({
  getFirestore: () => ({ name: "ramlink-db" }),
}));

vi.mock("@/lib/firebase/app-check", () => ({
  initializeFirebaseAppCheck: vi.fn(),
}));

describe("Firebase client persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    vi.stubGlobal("window", {});
    firebaseMocks.setPersistence.mockResolvedValue(undefined);
  });

  it("selects browser-local persistence only once", async () => {
    const { ensureAuthPersistence } = await import("@/lib/firebase/client");

    await ensureAuthPersistence();
    await ensureAuthPersistence();

    expect(firebaseMocks.setPersistence).toHaveBeenCalledOnce();
    expect(firebaseMocks.setPersistence).toHaveBeenCalledWith(
      firebaseMocks.auth,
      firebaseMocks.browserLocalPersistence,
    );
  });
});
