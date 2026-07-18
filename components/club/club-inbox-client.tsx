"use client";

import { useEffect, useState } from "react";
import { Inbox } from "lucide-react";
import { InquiryWorkflowCard } from "@/components/club/inquiry-workflow-card";
import { useManagedClub } from "@/components/club/use-managed-club";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { getInquiriesForClub } from "@/lib/firebase/public-data";
import type { ClubInquiry } from "@/lib/types";

export function ClubInboxClient() {
  const { clubId, loading } = useManagedClub();
  const [inquiries, setInquiries] = useState<ClubInquiry[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!clubId) return;
    getInquiriesForClub(clubId)
      .then(setInquiries)
      .catch(() => setError("Unable to load club inquiries."));
  }, [clubId]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Club Inbox"
        title="Student-to-club inquiries"
        description="Review and answer official student questions for your managed club."
      />
      {loading ? (
        <p className="text-sm text-brand-muted">Loading club access...</p>
      ) : null}
      {!loading && !clubId ? (
        <p className="text-sm text-red-600">
          No managed club is assigned to this account.
        </p>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {inquiries.length ? (
        <section className="space-y-4">
          {inquiries.map((inquiry) => (
            <InquiryWorkflowCard key={inquiry.id} inquiry={inquiry} />
          ))}
        </section>
      ) : !loading && clubId && !error ? (
        <EmptyState
          icon={<Inbox className="h-5 w-5" />}
          title="No inquiries"
          description="Student questions will appear here."
        />
      ) : null}
    </div>
  );
}