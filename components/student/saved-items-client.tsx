"use client";
import { useEffect, useMemo, useState } from "react";
import { Bookmark, CalendarDays, Users } from "lucide-react";
import { ClubCard } from "@/components/cards/club-card";
import { EventCard } from "@/components/cards/event-card";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { EmptyState } from "@/components/common/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/components/auth/auth-provider";
import { clubs, currentStudent, events } from "@/lib/mock-data";
import { type FirebaseStudentProfile, getStudentProfile } from "@/lib/firebase/user-profile";

const fallbackProfile: FirebaseStudentProfile = {
  ...currentStudent,
  role: "student",
  rsvpedEventIds: events.filter((event) => event.hasRsvped).map((event) => event.id),
};

export function SavedItemsClient() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<FirebaseStudentProfile>(fallbackProfile);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfile(fallbackProfile);
      return;
    }

    let isActive = true;
    setMessage("Loading saved items...");

    getStudentProfile(user)
      .then((studentProfile) => {
        if (isActive) {
          setProfile(studentProfile);
          setMessage("");
        }
      })
      .catch(() => {
        if (isActive) {
          setMessage("Unable to load saved items right now.");
        }
      });

    return () => {
      isActive = false;
    };
  }, [user]);

  const savedClubs = useMemo(
    () => clubs.filter((club) => profile.savedClubIds.includes(club.id)),
    [profile.savedClubIds]
  );

  const savedEvents = useMemo(
    () =>
      events
        .filter((event) => profile.savedEventIds.includes(event.id))
        .map((event) => ({
          ...event,
          isSaved: true,
          hasRsvped: profile.rsvpedEventIds.includes(event.id),
        })),
    [profile.rsvpedEventIds, profile.savedEventIds]
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Saved"
        title="Your bookmarks"
        description="Clubs and events you have saved to revisit later."
      />

      {message ? (
        <Card>
          <CardContent>
            <p className="text-sm font-semibold text-brand-ink">{message}</p>
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2">
        <StatCard label="Saved clubs" value={savedClubs.length} detail="Communities to revisit" icon={<Users className="h-5 w-5" />} />
        <StatCard label="Saved events" value={savedEvents.length} detail="Activities to review" icon={<CalendarDays className="h-5 w-5" />} color="gold" />
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-brand-ink">Saved clubs</h2>
        {savedClubs.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {savedClubs.map((club) => (
              <ClubCard key={club.id} club={{ ...club, isSaved: true }} />
            ))}
          </div>
        ) : (
          <EmptyState icon={<Bookmark className="h-5 w-5" />} title="No saved clubs yet" description="Save clubs while browsing the directory and they will appear here." />
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-brand-ink">Saved events</h2>
        {savedEvents.length ? (
          savedEvents.map((event) => <EventCard key={event.id} event={event} />)
        ) : (
          <EmptyState icon={<CalendarDays className="h-5 w-5" />} title="No saved events yet" description="Save events from the events page to keep them close." />
        )}
      </section>
    </div>
  );
}
