import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const state = {
    clubExists: true,
    managedClubIds: ["cs-club"],
    memberIds: ["student-1", "officer-1"],
    role: "clubOfficer",
  };
  const auth = { verifyIdToken: vi.fn() };
  const batch = { commit: vi.fn(), set: vi.fn() };
  let notificationNumber = 0;

  const collection = vi.fn((name: string) => {
    if (name === "users") {
      return {
        doc: () => ({
          get: async () => ({
            data: () => ({
              managedClubIds: state.managedClubIds,
              role: state.role,
            }),
          }),
        }),
        where: vi.fn(() => ({
          limit: vi.fn(() => ({
            get: async () => ({
              docs: state.memberIds.map((id) => ({ id })),
              size: state.memberIds.length,
            }),
          })),
        })),
      };
    }
    if (name === "clubs") {
      return {
        doc: () => ({
          get: async () => ({
            data: () => ({ name: "Computer Programming Club" }),
            exists: state.clubExists,
          }),
        }),
      };
    }
    if (name === "announcements") {
      return { doc: () => ({ id: "announcement-1", path: "announcements/announcement-1" }) };
    }
    if (name === "auditLogs") {
      return { doc: () => ({ id: "audit-1", path: "auditLogs/audit-1" }) };
    }
    if (name === "notifications") {
      notificationNumber += 1;
      return {
        doc: () => ({
          id: `notification-${notificationNumber}`,
          path: `notifications/notification-${notificationNumber}`,
        }),
      };
    }
    throw new Error(`Unexpected collection: ${name}`);
  });

  return {
    auth,
    batch,
    collection,
    db: { batch: () => batch, collection },
    resetNotificationNumber: () => {
      notificationNumber = 0;
    },
    state,
  };
});

const appCheckMocks = vi.hoisted(() => ({ verify: vi.fn() }));
const rateLimitMocks = vi.hoisted(() => ({ consume: vi.fn() }));

vi.mock("@/lib/firebase/admin", () => ({
  getAdminAuth: () => mocks.auth,
  getAdminDb: () => mocks.db,
}));
vi.mock("@/lib/server/app-check", () => ({
  verifyAppCheckRequest: appCheckMocks.verify,
}));
vi.mock("@/lib/server/rate-limit", () => ({
  consumeRateLimit: rateLimitMocks.consume,
}));

import { POST } from "@/app/api/club/announcements/route";

function request(body: object = {}, token = "officer-token") {
  return new Request("http://localhost/api/club/announcements", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "content-type": "application/json",
      "x-request-id": "request_12345",
    },
    body: JSON.stringify({
      body: "Weekly meeting begins Tuesday.",
      clubId: "cs-club",
      priority: "important",
      title: "Weekly meeting",
      ...body,
    }),
  });
}

describe("club announcement API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.resetNotificationNumber();
    mocks.state.clubExists = true;
    mocks.state.managedClubIds = ["cs-club"];
    mocks.state.memberIds = ["student-1", "officer-1"];
    mocks.state.role = "clubOfficer";
    appCheckMocks.verify.mockResolvedValue(true);
    rateLimitMocks.consume.mockResolvedValue({ allowed: true });
    mocks.auth.verifyIdToken.mockResolvedValue({
      email: "officer@farmingdale.edu",
      email_verified: true,
      uid: "officer-1",
    });
  });

  it("requires an authenticated Firebase user", async () => {
    const response = await POST(
      new Request("http://localhost/api/club/announcements", {
        method: "POST",
      }),
    );

    expect(response.status).toBe(401);
    expect(mocks.auth.verifyIdToken).not.toHaveBeenCalled();
  });

  it("rejects invalid announcement content", async () => {
    const response = await POST(request({ title: "" }));

    expect(response.status).toBe(400);
    expect(mocks.auth.verifyIdToken).not.toHaveBeenCalled();
  });

  it("rejects an invalid Firebase token", async () => {
    mocks.auth.verifyIdToken.mockRejectedValue(new Error("invalid"));

    const response = await POST(request());

    expect(response.status).toBe(401);
    expect(mocks.batch.commit).not.toHaveBeenCalled();
  });

  it("prevents officers from publishing for unmanaged clubs", async () => {
    mocks.state.managedClubIds = ["another-club"];

    const response = await POST(request());

    expect(response.status).toBe(403);
    expect(mocks.batch.commit).not.toHaveBeenCalled();
  });

  it("returns retry guidance when the publishing limit is reached", async () => {
    rateLimitMocks.consume.mockResolvedValue({
      allowed: false,
      retryAfterSeconds: 90,
    });

    const response = await POST(request());

    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("90");
  });

  it("publishes one announcement, audit entry, and member notifications", async () => {
    const response = await POST(request());
    const result = await response.json();

    expect(response.status).toBe(201);
    expect(result).toEqual({ id: "announcement-1", notifiedMembers: 2 });
    expect(mocks.batch.set).toHaveBeenCalledTimes(4);
    expect(mocks.batch.set).toHaveBeenCalledWith(
      expect.objectContaining({ path: "announcements/announcement-1" }),
      expect.objectContaining({
        clubId: "cs-club",
        clubName: "Computer Programming Club",
        title: "Weekly meeting",
      }),
    );
    expect(mocks.batch.set).toHaveBeenCalledWith(
      expect.objectContaining({ path: "auditLogs/audit-1" }),
      expect.objectContaining({
        action: "officer.announcement_created",
        actorId: "officer-1",
      }),
    );
    expect(mocks.batch.commit).toHaveBeenCalledOnce();
  });
});
