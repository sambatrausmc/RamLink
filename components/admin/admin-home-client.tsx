"use client";
import { useEffect, useState } from "react";
import { ClipboardList, Search, ShieldCheck, Users } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { getClubs, getReports, getStudents } from "@/lib/firebase/public-data";

export function AdminHomeClient() {
  const [counts, setCounts] = useState({ reports: 0, clubs: 0, users: 0 });
  const [error, setError] = useState("");

  // Concurrently load live totals from Firestore
  useEffect(() => {
    Promise.all([getReports(), getClubs(), getStudents()])
      .then(([reports, clubs, users]) =>
        setCounts({
          reports: reports.length,
          clubs: clubs.length,
          users: users.length,
        }),
      )
      .catch(() => setError("Unable to load admin statistics."));
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin"
        title="RamLink Admin Homepage"
        description="Campus oversight workspace for reports, users, clubs, and moderation."
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Reports"
          value={counts.reports}
          detail="Need attention"
          icon={<ClipboardList className="h-5 w-5" />}
        />
        <StatCard
          label="Clubs"
          value={counts.clubs}
          detail="Active records"
          icon={<Search className="h-5 w-5" />}
        />
        <StatCard
          label="Users"
          value={counts.users}
          detail="Verified accounts"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Moderation"
          value="On"
          detail="School-appropriate review"
          icon={<ShieldCheck className="h-5 w-5" />}
        />
      </section>
    </div>
  );
}
