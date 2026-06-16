import { Bookmark, CalendarDays, Users } from "lucide-react";
import { ClubCard } from "@/components/cards/club-card";
import { EventCard } from "@/components/cards/event-card";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { EmptyState } from "@/components/common/empty-state";
import { clubs, currentStudent, events } from "@/lib/mock-data";
export default function SavedPage() {
  const savedClubs = clubs.filter((club) => currentStudent.savedClubIds.includes(club.id));
  const savedEvents = events.filter((event) => currentStudent.savedEventIds.includes(event.id));
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
              <ClubCard key={club.id} club={club} />
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
