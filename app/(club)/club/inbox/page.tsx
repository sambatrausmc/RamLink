import { InquiryWorkflowCard } from "@/components/club/inquiry-workflow-card";
import { PageHeader } from "@/components/common/page-header";
import { inquiries } from "@/lib/mock-data";

export default function ClubInboxPage() {
  const clubInquiries = inquiries.filter(
    (inquiry) => inquiry.clubId === "cs-club",
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Club Inbox"
        title="Student-to-club inquiries"
        description="This inbox is for official club communication. It is not a student-to-student DM feature."
      />
      <section className="space-y-4">
        {clubInquiries.map((inquiry) => (
          <InquiryWorkflowCard key={inquiry.id} inquiry={inquiry} />
        ))}
      </section>
    </div>
  );
}
