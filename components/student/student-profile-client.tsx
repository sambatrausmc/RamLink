"use client";

import { useState } from "react";
import { UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { StudentProfileEditForm } from "@/components/student/student-profile-edit-form";
import { useAuth } from "@/components/auth/auth-provider";
import type { Club, Interest, StudentProfile } from "@/lib/types";

type StudentProfileClientProps = {
  fallbackStudent: StudentProfile;
  clubs: Club[];
  interests: Interest[];
};

function getInitials(displayName: string) {
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((namePart) => namePart[0])
    .join("");
  return initials || "ST";
}

export function StudentProfileClient({ fallbackStudent, clubs, interests }: StudentProfileClientProps) {
  const { loading, profile, user } = useAuth();
  const [updatedProfile, setUpdatedProfile] = useState<StudentProfile | null>(null);

  const latestProfile = profile ?? fallbackStudent;
  const student = updatedProfile?.id === latestProfile.id ? updatedProfile : latestProfile;
  const joinedClubs = clubs.filter((club) => student.joinedClubIds.includes(club.id));
  const initials = getInitials(student.displayName);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Student Profile"
        title={loading ? "Loading profile" : student.displayName}
        description="Manage the student details and interests used across RamLink."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Joined clubs"
          value={joinedClubs.length}
          detail="Approved memberships"
          icon={<UserRound className="h-5 w-5" />}
        />
        <StatCard
          label="Interests"
          value={student.interests.length}
          detail="Discovery topics"
          icon={<UserRound className="h-5 w-5" />}
          color="gold"
        />
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[16px] bg-brand-forest font-display text-lg font-semibold text-white">
              {initials}
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-brand-ink">{student.displayName}</p>
              <p className="text-sm text-brand-muted">{student.email}</p>
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
                <span className="text-right font-medium text-brand-ink">{student.displayName}</span>
              </div>
              <div className="h-px bg-brand-surface" />
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-brand-muted">Email</span>
                <span className="text-right font-medium text-brand-ink">{student.email}</span>
              </div>
              <div className="h-px bg-brand-surface" />
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-brand-muted">Major</span>
                <span className="text-right font-medium text-brand-ink">{student.major || "Not set yet"}</span>
              </div>
              <div className="h-px bg-brand-surface" />
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-brand-muted">Class year</span>
                <span className="text-right font-medium text-brand-ink">{student.classYear || "Not set yet"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <StudentProfileEditForm
            key={`${student.id}-${student.displayName}-${student.major}-${student.classYear}-${student.interests.join("|")}`}
            student={student}
            availableInterests={interests}
            userId={user?.uid}
            onProfileUpdated={setUpdatedProfile}
          />

          <Card>
            <CardContent>
              <h2 className="font-display text-xl font-semibold tracking-[-0.02em] text-brand-ink">Interests</h2>
              {student.interests.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {student.interests.map((interest) => (
                    <Badge key={interest} tone="green">
                      {interest}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-brand-muted">No interests selected yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h2 className="font-display text-xl font-semibold tracking-[-0.02em] text-brand-ink">Joined clubs</h2>
              {joinedClubs.length ? (
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
              ) : (
                <p className="mt-3 text-sm text-brand-muted">Approved memberships will appear here.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}