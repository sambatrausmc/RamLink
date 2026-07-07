"use client";
import { useEffect, useMemo, useState } from "react";
import { UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { StudentProfileEditForm } from "@/components/student/student-profile-edit-form";
import { useAuth } from "@/components/auth/auth-provider";
import { clubs, currentStudent, events, interests } from "@/lib/mock-data";
import { type FirebaseStudentProfile, type StudentProfileEditInput, getStudentProfile, updateStudentProfile } from "@/lib/firebase/user-profile";

const fallbackProfile: FirebaseStudentProfile = {
  ...currentStudent,
  role: "student",
  rsvpedEventIds: events.filter((event) => event.hasRsvped).map((event) => event.id),
};

export function StudentProfileClient() {
  const { user, isLoading } = useAuth();
  const [profile, setProfile] = useState<FirebaseStudentProfile>(fallbackProfile);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfile(fallbackProfile);
      return;
    }

    let isActive = true;
    setIsProfileLoading(true);
    setMessage("");

    getStudentProfile(user)
      .then((studentProfile) => {
        if (isActive) {
          setProfile(studentProfile);
        }
      })
      .catch(() => {
        if (isActive) setMessage("Unable to load your Firebase profile right now.");
      })
      .finally(() => {
        if (isActive) setIsProfileLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [user]);

  const joinedClubs = useMemo(
    () => clubs.filter((club) => profile.joinedClubIds.includes(club.id)),
    [profile.joinedClubIds]
  );

  const initials = profile.displayName
    .split(" ")
    .filter(Boolean)
    .map((namePart) => namePart[0])
    .join("")
    .slice(0, 2);

  async function handleSaveProfile(input: StudentProfileEditInput) {
    if (!user) {
      setProfile((current) => ({ ...current, ...input }));
      setMessage("Preview updated. Sign in to save this profile to Firebase.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const updatedProfile = await updateStudentProfile(user.uid, input);
      setProfile(updatedProfile);
      setMessage("Profile saved to Firebase.");
    } catch {
      setMessage("Unable to save your profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Student Profile"
        title={profile.displayName}
        description="Manage the student details and interests used across RamLink."
      />

      {isLoading || isProfileLoading || message ? (
        <Card>
          <CardContent>
            <p className="text-sm font-semibold text-brand-ink">
              {isLoading || isProfileLoading ? "Loading personalized profile data..." : message}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Joined clubs" value={joinedClubs.length} detail="Approved memberships" icon={<UserRound className="h-5 w-5" />} />
        <StatCard label="Interests" value={profile.interests.length} detail="Discovery topics" icon={<UserRound className="h-5 w-5" />} color="gold" />
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[16px] bg-brand-forest font-display text-lg font-semibold text-white">
              {initials || "ST"}
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-brand-ink">{profile.displayName}</p>
              <p className="text-sm text-brand-muted">{profile.email}</p>
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
                <span className="text-right font-medium text-brand-ink">{profile.displayName}</span>
              </div>
              <div className="h-px bg-brand-surface" />
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-brand-muted">Email</span>
                <span className="text-right font-medium text-brand-ink">{profile.email}</span>
              </div>
              <div className="h-px bg-brand-surface" />
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-brand-muted">Major</span>
                <span className="text-right font-medium text-brand-ink">{profile.major || "Not set"}</span>
              </div>
              <div className="h-px bg-brand-surface" />
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-brand-muted">Class year</span>
                <span className="text-right font-medium text-brand-ink">{profile.classYear || "Not set"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <StudentProfileEditForm
            student={profile}
            availableInterests={interests}
            isSaving={isSaving}
            onSave={handleSaveProfile}
          />

          <Card>
            <CardContent>
              <h2 className="font-display text-xl font-semibold tracking-[-0.02em] text-brand-ink">Interests</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.interests.length ? (
                  profile.interests.map((interest) => (
                    <Badge key={interest} tone="green">
                      {interest}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-brand-muted">No interests selected yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h2 className="font-display text-xl font-semibold tracking-[-0.02em] text-brand-ink">Joined clubs</h2>
              <div className="mt-4 divide-y divide-brand-surface">
                {joinedClubs.length ? (
                  joinedClubs.map((club) => (
                    <div key={club.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-semibold text-brand-ink">{club.name}</p>
                        <p className="text-sm text-brand-muted">{club.category}</p>
                      </div>
                      <Badge tone="green">Member</Badge>
                    </div>
                  ))
                ) : (
                  <p className="py-3 text-sm text-brand-muted">No approved club memberships yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
