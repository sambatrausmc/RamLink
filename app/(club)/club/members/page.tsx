import { Users } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { clubs, studentDirectory } from "@/lib/mock-data";
export default function MembersPage() {
  const club = clubs.find((item) => item.id === "cs-club");
  const members = studentDirectory.filter((student) =>
    student.joinedClubIds.includes("cs-club"),
  );
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Members"
        title={`${club?.name ?? "Club"} members`}
        description="Officer-only view of approved members for this club."
      />
      <Card>
        <CardContent>
          <div className="divide-y divide-slate-100">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-brand-mist text-brand-forest">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-brand-ink">
                      {member.displayName}
                    </p>
                    <p className="text-sm text-brand-muted">{member.major}</p>
                  </div>
                </div>
                <Badge tone="green">Member</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
