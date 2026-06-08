import { Inbox } from "lucide-react";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getClubById, getStudentById } from "@/lib/mock-data";
import type { ClubInquiry } from "@/lib/types";

type InquiryCardProps = {
  inquiry: ClubInquiry;
};
export function InquiryCard({ inquiry }: InquiryCardProps) {
  const club = getClubById(inquiry.clubId);
  const student = getStudentById(inquiry.studentId);
  const latestReply = inquiry.replies.at(-1);
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
                <StatusBadge status={inquiry.status} />
              </div>
              <p className="mt-1 text-sm text-brand-muted">
                {student?.displayName} to {club?.name}
              </p>
              <p className="mt-3 text-sm leading-6 text-brand-muted">{inquiry.message}</p>
              {latestReply ? (
                <div className="mt-4 rounded-[12px] bg-brand-surface p-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-brand-green">Latest reply</p>
                  <p className="mt-1 text-sm text-brand-muted">{latestReply.body}</p>
                </div>
              ) : null}
            </div>
          </div>
          <Button size="sm" variant="outline">
            Reply
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
