import { Check, X } from "lucide-react";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getClubById, getStudentById } from "@/lib/mock-data";
import type { JoinRequest } from "@/lib/types";

type JoinRequestRowProps = {
  request: JoinRequest;
};
export function JoinRequestRow({ request }: JoinRequestRowProps) {
  const student = getStudentById(request.studentId);
  const club = getClubById(request.clubId);
  return (
    <Card className="transition duration-200 hover:-translate-y-1 hover:shadow-lift">
      <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display font-semibold text-brand-ink">{student?.displayName ?? "Student"}</h2>
            <StatusBadge status={request.status} />
          </div>
          <p className="mt-1 text-sm text-brand-muted">{club?.name}</p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-muted">{request.message}</p>
          <p className="mt-2 text-xs font-medium text-brand-muted/70">Submitted {request.createdAt}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary">
            <Check className="h-4 w-4" />
            Approve
          </Button>
          <Button size="sm" variant="outline">
            <X className="h-4 w-4" />
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
