import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ request: vi.fn() }));

vi.mock("@/lib/firebase/protected-api", () => ({
  protectedApiRequest: mocks.request,
}));
vi.mock("@/lib/firebase/client", () => ({ db: {} }));

import { createClubInquiry } from "@/lib/firebase/student-actions";

describe("student inquiry client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits only the club ID and question through the protected API", async () => {
    mocks.request.mockResolvedValue({
      id: "inquiry-1",
      clubId: "club-1",
      status: "open",
    });
    const inquiry = await createClubInquiry({
      userId: "student-1",
      clubId: "club-1",
      clubName: "Untrusted club name",
      studentName: "Untrusted student name",
      subject: "Meeting question",
      message: "Can new students attend?",
    });

    expect(inquiry.id).toBe("inquiry-1");
    expect(mocks.request).toHaveBeenCalledWith("/api/student/inquiries", {
      method: "POST",
      body: JSON.stringify({
        clubId: "club-1",
        subject: "Meeting question",
        message: "Can new students attend?",
      }),
    });
  });

  it("does not report success when the protected request fails", async () => {
    mocks.request.mockRejectedValueOnce(new Error("Request limit reached."));
    await expect(
      createClubInquiry({
        userId: "student-1",
        clubId: "club-1",
        subject: "Meeting question",
        message: "Can new students attend?",
      }),
    ).rejects.toThrow("Request limit reached.");
  });
});
