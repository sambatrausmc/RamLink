"use client";
import { useState } from "react";
import { MessageSquare, PlusCircle } from "lucide-react";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import type { Club } from "@/lib/types";

type ClubProfileActionsProps = {
  club: Club;
};
export function ClubProfileActions({ club }: ClubProfileActionsProps) {
  const [status, setStatus] = useState<Club["membershipStatus"]>(club.membershipStatus ?? "notJoined");
  const [messageVisible, setMessageVisible] = useState(false);
  return (
    <div className="rounded-[18px] border border-brand-mist bg-white p-5 shadow-[0_1px_2px_rgba(7,61,39,0.04),0_10px_28px_rgba(7,61,39,0.06)]">
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={status ?? "notJoined"} />
        <span className="text-sm text-brand-muted">Membership status</span>
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Button
          disabled={status === "approved" || status === "pending"}
          onClick={() => setStatus("pending")}
        >
          <PlusCircle className="h-4 w-4" />
          {status === "approved" ? "Already joined" : status === "pending" ? "Request pending" : "Request to join"}
        </Button>
        <Button variant="outline" onClick={() => setMessageVisible((value) => !value)}>
          <MessageSquare className="h-4 w-4" />
          Ask club a question
        </Button>
      </div>
      {messageVisible ? (
        <div className="mt-5 rounded-[14px] bg-brand-mist p-4">
          <p className="text-sm font-semibold text-brand-forest">Official club inquiry</p>
          <p className="mt-1 text-sm leading-6 text-brand-muted">
            This action represents a message to the official club inbox, not a student-to-student DM.
          </p>
        </div>
      ) : null}
    </div>
  );
}
