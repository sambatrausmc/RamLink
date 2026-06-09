import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { studentDirectory } from "@/lib/mock-data";

export default function AdminUsersPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Users"
        title="User Directory"
        description="Admin view for verified student accounts and future role assignments."
      />

      <Card>
        <CardContent>
          <div className="divide-y divide-brand-surface">
            {studentDirectory.map((student) => (
              <div
                key={student.id}
                className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-display font-semibold text-brand-ink">
                    {student.displayName}
                  </p>
                  <p className="text-sm text-brand-muted">
                    {student.email}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge tone="green">Verified</Badge>
                  <Badge tone="slate">{student.major}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}