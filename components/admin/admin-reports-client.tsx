"use client";
import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { ReportRow } from "@/components/cards/report-row";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { getReports } from "@/lib/firebase/public-data";
import type { Report } from "@/lib/types";

export function AdminReportsClient() {
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState("");

  // Load content moderation reports from Firestore
  useEffect(() => {
    getReports()
      .then(setReports)
      .catch(() => setError("Unable to load reports."));
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Moderation"
        title="Review Reported Content"
        description="Review reports and decide whether content should be dismissed or removed."
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {reports.length ? (
        <section className="space-y-4">
          {reports.map((report) => (
            <ReportRow key={report.id} report={report} />
          ))}
        </section>
      ) : !error ? (
        <EmptyState
          icon={<ShieldAlert className="h-5 w-5" />}
          title="No reports"
          description="Submitted content reports will appear here."
        />
      ) : null}
    </div>
  );
}
