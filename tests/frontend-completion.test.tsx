import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import StudentDashboardPage from "@/app/(student)/dashboard/page";
import { ClubProfileActions } from "@/components/club/club-profile-actions";
import { createMockReply, resolveInquiryStatus } from "@/components/club/inquiry-workflow-card";
import { filterMembers } from "@/components/club/member-search-list";
import { clubs, inquiries, studentDirectory } from "@/lib/mock-data";

describe("remaining frontend completion", () => {
  it("renders the student dashboard home base sections", () => {
    const html = renderToString(<StudentDashboardPage />);
    expect(html).toContain("Student Dashboard");
    expect(html).toContain("Upcoming events");
    expect(html).toContain("Suggested clubs");
    expect(html).toContain("Join request status");
    expect(html).toContain("Notification summary");
  });

  it("renders mocked club profile actions for a joinable club", () => {
    const joinableClub = clubs.find((club) => club.membershipStatus === "notJoined");
    expect(joinableClub).toBeDefined();
    const html = renderToString(<ClubProfileActions club={joinableClub!} />);
    expect(html).toContain("Membership status");
    expect(html).toContain("Request to join");
    expect(html).toContain("Ask club a question");
  });

  it("filters club members by major or name", () => {
    const filteredByMajor = filterMembers(studentDirectory, "business");
    const filteredByName = filterMembers(studentDirectory, "avery");
    expect(filteredByMajor.map((member) => member.displayName)).toContain("Taylor Brooks");
    expect(filteredByName.map((member) => member.displayName)).toEqual(["Avery Collins"]);
  });

  it("creates mocked inquiry replies and resolved inquiry state", () => {
    const inquiry = inquiries[0];
    const reply = createMockReply(inquiry.replies, "Thanks for asking. Beginners can attend.");
    const resolvedInquiry = resolveInquiryStatus(inquiry);
    expect(reply.senderName).toBe("Club Officer");
    expect(reply.createdAt).toBe("Just now");
    expect(reply.body).toContain("Beginners can attend");
    expect(resolvedInquiry.status).toBe("resolved");
  });
});
