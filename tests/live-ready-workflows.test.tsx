import { describe, expect, it } from "vitest";
import { buildOfficerReply, parseResourceType } from "@/lib/firebase/club-workflows";

describe("live-ready backend workflow helpers", () => {
  // Test that supported resource strings pass cleanly and unknown strings default to "Link"
  it("parses supported resource types", () => {
    expect(parseResourceType("Form")).toBe("Form");
    expect(parseResourceType("Guide")).toBe("Guide");
    expect(parseResourceType("Unknown")).toBe("Link");
  });

  // Test that officer reply generation formats IDs and default names properly
  it("builds an officer reply with a stable sender", () => {
    const reply = buildOfficerReply([], "Students can attend the first meeting.");
    expect(reply.id).toBe("reply-1");
    expect(reply.senderName).toBe("Club Officer");
    expect(reply.body).toContain("first meeting");
  });
});
