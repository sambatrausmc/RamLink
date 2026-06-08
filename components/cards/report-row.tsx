import { ShieldAlert } from "lucide-react";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Report } from "@/lib/types";

type ReportRowProps = {
  report: Report;
};
export function ReportRow({ report }: ReportRowProps) {
  return (
    <Card className="transition duration-200 hover:-translate-y-1 hover:shadow-lift">
      <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-red-50 text-red-600">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display font-semibold text-brand-ink">{report.contentTitle}</h2>
              <StatusBadge status={report.status} />
            </div>
            <p className="mt-1 text-sm text-brand-muted">
              {report.contentType} reported by {report.reporterName}
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-muted">{report.reason}</p>
            <p className="mt-2 text-xs font-medium text-brand-muted/70">Reported {report.createdAt}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            Dismiss
          </Button>
          <Button size="sm" variant="danger">
            Remove
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
