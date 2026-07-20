import { beforeEach, describe, expect, it, vi } from "vitest";

const adminMocks = vi.hoisted(() => {
  const state = { count: 0, exists: false, windowEndsAt: new Date(0) };
  const transaction = { get: vi.fn(), set: vi.fn(), update: vi.fn() };
  const db = {
    collection: vi.fn(() => ({ doc: vi.fn((id: string) => ({ id })) })),
    runTransaction: vi.fn(),
  };
  return { db, state, transaction };
});

vi.mock("@/lib/firebase/admin", () => ({ getAdminDb: () => adminMocks.db }));

import { consumeRateLimit } from "@/lib/server/rate-limit";

describe("server rate limits", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(adminMocks.state, {
      count: 0,
      exists: false,
      windowEndsAt: new Date(0),
    });
    adminMocks.transaction.get.mockImplementation(async () => ({
      data: () => ({
        count: adminMocks.state.count,
        windowEndsAt: adminMocks.state.windowEndsAt,
      }),
      exists: adminMocks.state.exists,
    }));
    adminMocks.db.runTransaction.mockImplementation(async (callback) =>
      callback(adminMocks.transaction),
    );
  });

  it("starts a new window without storing the raw user ID", async () => {
    const result = await consumeRateLimit({
      scope: "session-create",
      subject: "student-1",
      limit: 10,
      windowSeconds: 600,
      now: 1_000,
    });

    expect(result).toEqual({ allowed: true, remaining: 9, retryAfterSeconds: 0 });
    expect(adminMocks.transaction.set).toHaveBeenCalledOnce();
    const reference = adminMocks.transaction.set.mock.calls[0][0];
    expect(reference.id).not.toContain("student-1");
  });

  it("increments an active window and blocks at the limit", async () => {
    Object.assign(adminMocks.state, {
      count: 9,
      exists: true,
      windowEndsAt: new Date(61_000),
    });
    await expect(consumeRateLimit({
      scope: "session-create",
      subject: "student-1",
      limit: 10,
      windowSeconds: 600,
      now: 1_000,
    })).resolves.toEqual({ allowed: true, remaining: 0, retryAfterSeconds: 0 });

    adminMocks.state.count = 10;
    await expect(consumeRateLimit({
      scope: "session-create",
      subject: "student-1",
      limit: 10,
      windowSeconds: 600,
      now: 1_000,
    })).resolves.toEqual({ allowed: false, remaining: 0, retryAfterSeconds: 60 });
  });
});
