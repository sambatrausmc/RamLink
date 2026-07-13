"use client";
import { useState } from "react";
import { Check, X } from "lucide-react";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { updateJoinRequestStatus } from "@/lib/firebase/club-workflows";
import type { JoinRequest, RequestStatus } from "@/lib/types";

type JoinRequestRowProps = {
  request: JoinRequest;
};

export function JoinRequestRow({ request }: JoinRequestRowProps) {
  const [status, setStatus] = useState(request.status);
  const [feedback, setFeedback] = useState("");
  const [updating, setUpdating] = useState<RequestStatus | null>(null);

  async function handleStatusChange(nextStatus: RequestStatus) {
    setUpdating(nextStatus);
    setFeedback("");
    try {
      await updateJoinRequestStatus(request.id, nextStatus);
      setStatus(nextStatus);
      setFeedback(nextStatus === "approved" ? "Request approved." : "Request rejected.");
    } catch {
      setFeedback("Unable to update this request right now.");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <Card className="transition duration-200 hover:-translate-y-1 hover:shadow-lift">
      <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display font-semibold text-brand-ink">{request.studentName ?? "Student"}</h2>
            <StatusBadge status={status} />
          </div>
          <p className="mt-1 text-sm text-brand-muted">{request.clubName ?? "Club request"}</p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-muted">{request.message}</p>
          <p className="mt-2 text-xs font-medium text-brand-muted/70">Submitted {request.createdAt}</p>
          {feedback ? <p className="mt-2 text-sm font-medium text-brand-forest">{feedback}</p> : null}
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            disabled={status === "approved" || updating !== null}
            onClick={() => handleStatusChange("approved")}
          >
            <Check className="h-4 w-4" />
            {updating === "approved" ? "Approving..." : "Approve"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={status === "rejected" || updating !== null}
            onClick={() => handleStatusChange("rejected")}
          >
            <X className="h-4 w-4" />
            {updating === "rejected" ? "Rejecting..." : "Reject"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
