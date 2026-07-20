import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ request: vi.fn() }));

vi.mock("@/lib/firebase/protected-api", () => ({
  protectedApiRequest: mocks.request,
}));
vi.mock("@/lib/firebase/client", () => ({ db: {} }));

import {
  cancelJoinRequest,
  createJoinRequest,
} from "@/lib/firebase/student-actions";

describe("student join request client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits only club and message data through the protected API", async () => {
    mocks.request.mockResolvedValue({
      id: "student-1_club-1",
      clubId: "club-1",
      status: "pending",
    });
    const result = await createJoinRequest({
      userId: "student-1",
      clubId: "club-1",
      clubName: "Untrusted club name",
      studentName: "Untrusted student name",
      message: "I would like to join.",
    });

    expect(result.id).toBe("student-1_club-1");
    expect(mocks.request).toHaveBeenCalledWith(
      "/api/student/join-requests",
      {
        method: "POST",
        body: JSON.stringify({
          clubId: "club-1",
          message: "I would like to join.",
        }),
      },
    );
  });

  it("cancels through the protected API", async () => {
    mocks.request.mockResolvedValue({ deleted: true });
    await cancelJoinRequest("student-1_club-1");
    expect(mocks.request).toHaveBeenCalledWith(
      "/api/student/join-requests",
      {
        method: "DELETE",
        body: JSON.stringify({ requestId: "student-1_club-1" }),
      },
    );
  });
});
