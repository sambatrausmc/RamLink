import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ request: vi.fn() }));

vi.mock("@/lib/firebase/protected-api", () => ({
  protectedApiRequest: mocks.request,
}));

import { submitContentReport } from "@/lib/firebase/report-workflows";

describe("content report client", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sends only report content to the protected API", async () => {
    mocks.request.mockResolvedValue({ id: "report-1" });
    await expect(
      submitContentReport({
        contentType: "Event",
        contentTitle: " Campus Event ",
        reason: " Location is incorrect. ",
      }),
    ).resolves.toBe("report-1");
    expect(mocks.request).toHaveBeenCalledWith("/api/student/reports", {
      method: "POST",
      body: JSON.stringify({
        contentType: "Event",
        contentTitle: "Campus Event",
        reason: "Location is incorrect.",
      }),
    });
  });
});
