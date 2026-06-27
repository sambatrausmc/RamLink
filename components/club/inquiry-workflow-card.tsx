"use client";

import { useState } from "react";
import { Inbox, Send } from "lucide-react";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getClubById, getStudentById } from "@/lib/mock-data";
import type { ClubInquiry } from "@/lib/types";

type InquiryReply = ClubInquiry["replies"][number];

type InquiryWorkflowCardProps = {
  inquiry: ClubInquiry;
};

export function createMockReply(existingReplies: InquiryReply[], body: string): InquiryReply {
  return {
    id: `reply-${existingReplies.length + 1}`,
    senderName: "Club Officer",
    body: body.trim(),
    createdAt: "Just now",
  };
}

export function resolveInquiryStatus(inquiry: ClubInquiry): ClubInquiry {
  return {
    ...inquiry,
    status: "resolved",
  };
}

export function InquiryWorkflowCard({ inquiry }: InquiryWorkflowCardProps) {
  const club = getClubById(inquiry.clubId);
  const student = getStudentById(inquiry.studentId);

  const [status, setStatus] = useState(inquiry.status);
  const [replies, setReplies] = useState(inquiry.replies);
  const [replyText, setReplyText] = useState("");
  const [replyVisible, setReplyVisible] = useState(false);

  const latestReply = replies.at(-1);

  function sendReply() {
    const trimmedReply = replyText.trim();
    if (!trimmedReply) {
      return;
    }
    setReplies((current) => [...current, createMockReply(current, trimmedReply)]);
    setReplyText("");
    setReplyVisible(true);
  }

  return (
    <Card className="transition duration-200 hover:-translate-y-1 hover:shadow-lift">
      <CardContent>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-brand-mist text-brand-forest">
              <Inbox className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display font-semibold text-brand-ink">{inquiry.subject}</h2>
                <StatusBadge status={status} />
              </div>
              <p className="mt-1 text-sm text-brand-muted">
                {student?.displayName} to {club?.name}
              </p>
              <p className="mt-3 text-sm leading-6 text-brand-muted">{inquiry.message}</p>

              {latestReply ? (
                <div className="mt-4 rounded-[12px] bg-brand-surface p-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-brand-green">Latest reply</p>
                  <p className="mt-1 text-sm text-brand-muted">{latestReply.body}</p>
                  <p className="mt-2 text-xs text-brand-muted/70">
                    {latestReply.senderName} - {latestReply.createdAt}
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 md:justify-end">
            <Button size="sm" variant="outline" onClick={() => setReplyVisible((value) => !value)}>
              Reply
            </Button>
            <Button size="sm" variant="secondary" disabled={status === "resolved"} onClick={() => setStatus("resolved")}>
              Mark resolved
            </Button>
          </div>
        </div>

        {replyVisible ? (
          <div className="mt-5 rounded-[14px] border border-brand-mist bg-white p-4">
            <label className="block">
              <span className="text-sm font-semibold text-brand-ink">Reply to student</span>
              <textarea
                className="mt-2 min-h-28 w-full rounded-[12px] border border-brand-mist bg-white px-3.5 py-3 text-sm text-brand-ink outline-none transition placeholder:text-brand-muted/70 focus:border-brand-green focus:ring-2 focus:ring-brand-green/15"
                placeholder="Write an official club response..."
                value={replyText}
                onChange={(event) => setReplyText(event.target.value)}
              />
            </label>
            <Button className="mt-3" size="sm" onClick={sendReply}>
              <Send className="h-4 w-4" />
              Send mocked reply
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}