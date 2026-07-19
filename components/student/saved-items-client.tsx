"use client";

import { Bookmark, CalendarDays, Users } from "lucide-react";
import { ClubCard } from "@/components/cards/club-card";
import { EventCard } from "@/components/cards/event-card";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { EmptyState } from "@/components/common/empty-state";
import { useAuth } from "@/components/auth/auth-provider";
import { Card, CardContent } from "@/components/ui/card";
import type { Club, EventItem } from "@/lib/types";

type SavedItemsClientProps = {
  clubs: Club[];
  events: EventItem[];
};

export function SavedItemsClient({ clubs, events }: SavedItemsClientProps) {
  const { loading, profile, profileStatus, refreshProfile } = useAuth();

  if (loading || profileStatus === "loading" || profileStatus === "missing") {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-brand-muted">Loading your saved items...</p>
        </CardContent>
      </Card>
    );
  }

  if (!profile || profileStatus === "error") {
    return (
      <Card>
        <CardContent>
          <h1 className="font-display text-2xl font-semibold text-brand-ink">
            Saved items unavailable
          </h1>
          <p className="mt-2 text-sm leading-6 text-brand-muted">
            RamLink could not load your bookmarks. No sample account data was substituted.
          </p>
          <button
            type="button"
            onClick={() => void refreshProfile()}
            className="mt-4 text-sm font-semibold text-brand-forest hover:underline"
          >
            Try again
          </button>
        </CardContent>
      </Card>
    );
  }

  const student = profile;

  const savedClubs = clubs.filter((club) => student.savedClubIds.includes(club.id));
  const savedEvents = events
    .filter((event) => student.savedEventIds.includes(event.id))
    .map((event) => ({
      ...event,
      isSaved: true,
      hasRsvped: student.rsvpedEventIds?.includes(event.id) ?? event.hasRsvped,
    }));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Saved"
        title="Your bookmarks"
        description="Clubs and events you have saved to revisit later."
      />

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
