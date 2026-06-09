import { ClipboardList, Search, ShieldCheck, Users } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { reports, clubs, studentDirectory } from "@/lib/mock-data";

export default function AdminHomePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin"
        title="RamLink Admin Homepage"
        description="Campus oversight workspace for reports, users, clubs, and moderation."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Reports"
          value={reports.length}
          detail="Need attention"
          icon={<ClipboardList className="h-5 w-5" />}
        />

        <StatCard
          label="Clubs"
          value={clubs.length}
          detail="Active records"
          icon={<Search className="h-5 w-5" />}
        />

        <StatCard
          label="Users"
          value={studentDirectory.length}
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