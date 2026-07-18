"use client";

import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import { JoinRequestRow } from "@/components/cards/join-request-row";
import { useManagedClub } from "@/components/club/use-managed-club";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { getJoinRequestsForClub } from "@/lib/firebase/public-data";
import type { JoinRequest } from "@/lib/types";

export function ClubJoinRequestsClient() {
  const { clubId, loading } = useManagedClub();
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!clubId) return;
    getJoinRequestsForClub(clubId)
      .then(setRequests)
      .catch(() => setError("Unable to load join requests."));
  }, [clubId]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Membership"
        title="Review join requests"
        description="Approve or reject student requests for your managed club."
      />
      <div className="flex flex-wrap gap-2">
        <Badge tone="gold">Pending</Badge>
        <Badge tone="green">Approved</Badge>
        <Badge tone="red">Rejected</Badge>
      </div>
      {loading ? (
        <p className="text-sm text-brand-muted">Loading club access...</p>
      ) : null}
      {!loading && !clubId ? (
        <p className="text-sm text-red-600">
          No managed club is assigned to this account.
        </p>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {requests.length ? (
        <section className="space-y-4">
          {requests.map((request) => (
            <JoinRequestRow key={request.id} request={request} />
          ))}
        </section>
      ) : !loading && clubId && !error ? (
        <EmptyState
          icon={<ClipboardList className="h-5 w-5" />}
          title="No join requests"
          description="New membership requests will appear here."
        />
      ) : null}
    </div>
  );
}