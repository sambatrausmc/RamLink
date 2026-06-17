import { JoinRequestRow } from "@/components/cards/join-request-row";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { joinRequests } from "@/lib/mock-data";
export default function JoinRequestsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Membership"
        title="Review join requests"
        description="Approve or reject student requests for the managed club."
      />
      <div className="flex flex-wrap gap-2">
        <Badge tone="gold">Pending</Badge>
        <Badge tone="green">Approved</Badge>
        <Badge tone="red">Rejected</Badge>
      </div>
      <section className="space-y-4">
        {joinRequests.map((request) => (
          <JoinRequestRow key={request.id} request={request} />
        ))}
      </section>
    </div>
  );
}
