import { InquiryWorkflowCard } from "@/components/club/inquiry-workflow-card";
import { PageHeader } from "@/components/common/page-header";
import { DEFAULT_MANAGED_CLUB_ID, getInquiriesForClub } from "@/lib/firebase/public-data";

export const dynamic = "force-dynamic";

export default async function ClubInboxPage() {
  const clubInquiries = await getInquiriesForClub(DEFAULT_MANAGED_CLUB_ID);
  
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
