import { ReportRow } from "@/components/cards/report-row";
import { PageHeader } from "@/components/common/page-header";
import { reports } from "@/lib/mock-data";

export default function AdminReportsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Moderation"
        title="Review Reported Content"
        description="Admin users can review reports and decide whether content should be dismissed or removed."
      />

      <section className="space-y-4">
        {reports.map((report) => (
          <ReportRow
            key={report.id}
            report={report}
          />
        ))}
      </section>
    </div>
  );
}