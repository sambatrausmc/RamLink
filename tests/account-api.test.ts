import { beforeEach, describe, expect, it, vi } from "vitest";

const adminMocks = vi.hoisted(() => {
  const batch = {
    commit: vi.fn(),
    delete: vi.fn(),
  };
  const get = vi.fn();
  const where = vi.fn(() => ({ get }));
  const doc = vi.fn((id: string) => ({ id }));
  const collection = vi.fn(() => ({ doc, where }));

  return {
    auth: {
      deleteUser: vi.fn(),
      verifyIdToken: vi.fn(),
    },
    batch,
    db: {
      batch: vi.fn(() => batch),
      collection,
    },
    get,
  };
});

vi.mock("@/lib/firebase/admin", () => ({
  getAdminAuth: () => adminMocks.auth,
  getAdminDb: () => adminMocks.db,
}));

import { DELETE } from "@/app/api/account/route";

function deletionRequest(token?: string) {
  return new Request("http://localhost/api/account", {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}

describe("account deletion API authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminMocks.get.mockResolvedValue({ docs: [] });
    adminMocks.batch.commit.mockResolvedValue(undefined);
    adminMocks.auth.deleteUser.mockResolvedValue(undefined);
    adminMocks.auth.verifyIdToken.mockResolvedValue({
      auth_time: Math.floor(Date.now() / 1000),
      uid: "student-1",
    });
  });

  it("returns 401 when authentication is missing", async () => {
    const response = await DELETE(deletionRequest());
    expect(response.status).toBe(401);
  });

  it("returns 401 for an invalid token", async () => {
    adminMocks.auth.verifyIdToken.mockRejectedValue(new Error("invalid"));
    const response = await DELETE(deletionRequest("invalid-token"));
    expect(response.status).toBe(401);
  });

  it("returns 409 for authentication older than five minutes", async () => {
    adminMocks.auth.verifyIdToken.mockResolvedValue({
      auth_time: Math.floor(Date.now() / 1000) - 301,
      uid: "student-1",
    });
    const response = await DELETE(deletionRequest("stale-token"));
    expect(response.status).toBe(409);
  });

  it("accepts a fresh token and deletes the account", async () => {
    const response = await DELETE(deletionRequest("fresh-token"));
    expect(response.status).toBe(200);
    expect(adminMocks.auth.deleteUser).toHaveBeenCalledWith("student-1");
  });

  it("returns 500 when account deletion fails", async () => {
    adminMocks.batch.commit.mockRejectedValue(new Error("offline"));
    const response = await DELETE(deletionRequest("fresh-token"));
    expect(response.status).toBe(500);
  });
});
