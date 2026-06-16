import { UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { clubs, currentStudent } from "@/lib/mock-data";
export default function ProfilePage() {
  const joinedClubs = clubs.filter((club) => currentStudent.joinedClubIds.includes(club.id));
  const initials = currentStudent.displayName
    .split(" ")
    .map((n) => n[0])
    .join("");
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Student Profile"
        title={currentStudent.displayName}
        description="Manage the student details and interests used across RamLink."
      />
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Joined clubs" value={joinedClubs.length} detail="Approved memberships" icon={<UserRound className="h-5 w-5" />} />
        <StatCard label="Interests" value={currentStudent.interests.length} detail="Discovery topics" icon={<UserRound className="h-5 w-5" />} color="gold" />
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[16px] bg-brand-forest font-display text-lg font-semibold text-white">
              {initials}
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-brand-ink">{currentStudent.displayName}</p>
              <p className="text-sm text-brand-muted">{currentStudent.email}</p>
            </div>
          </CardContent>
        </Card>
      </section>
      <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Card>
          <CardContent>
            <h2 className="font-display text-xl font-semibold tracking-[-0.02em] text-brand-ink">Account details</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-brand-muted">Name</span>
                <span className="text-right font-medium text-brand-ink">{currentStudent.displayName}</span>
              </div>
              <div className="h-px bg-brand-surface" />
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-brand-muted">Email</span>
                <span className="text-right font-medium text-brand-ink">{currentStudent.email}</span>
              </div>
              <div className="h-px bg-brand-surface" />
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-brand-muted">Major</span>
                <span className="text-right font-medium text-brand-ink">{currentStudent.major}</span>
              </div>
              <div className="h-px bg-brand-surface" />
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-brand-muted">Class year</span>
                <span className="text-right font-medium text-brand-ink">{currentStudent.classYear}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardContent>
              <h2 className="font-display text-xl font-semibold tracking-[-0.02em] text-brand-ink">Interests</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {currentStudent.interests.map((interest) => (
                  <Badge key={interest} tone="green">
                    {interest}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <h2 className="font-display text-xl font-semibold tracking-[-0.02em] text-brand-ink">Joined clubs</h2>
              <div className="mt-4 divide-y divide-brand-surface">
                {joinedClubs.map((club) => (
                  <div key={club.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-semibold text-brand-ink">{club.name}</p>
                      <p className="text-sm text-brand-muted">{club.category}</p>
                    </div>
                    <Badge tone="green">Member</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
