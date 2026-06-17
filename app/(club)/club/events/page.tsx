import { Plus } from "lucide-react";
import { EventCard } from "@/components/cards/event-card";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { events } from "@/lib/mock-data";
export default function ClubEventsManagementPage() {
  const clubEvents = events.filter((event) => event.clubId === "cs-club");
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Events"
        title="Create and manage club events"
        description="Create event listings students can discover, save, and RSVP to."
      />
      <Card>
        <CardContent>
          <h2 className="font-display text-xl font-semibold tracking-[-0.02em] text-brand-ink">
            Create event
          </h2>
          <form className="mt-4 grid gap-4 md:grid-cols-2">
            <Input placeholder="Event title" />
            <Input placeholder="Location" />
            <Input type="date" />
            <Input placeholder="Start time" />
            <textarea
              className="min-h-24 rounded-[12px] border border-brand-mist bg-white px-3.5 py-3 text-sm text-brand-ink outline-none transition placeholder:text-brand-muted/70 focus:border-brand-greenfocus:ring-2 focus:ring-brand-green/15 md:col-span-2"
              placeholder="Event description"
            />
            <Button className="w-fit">
              <Plus className="h-4 w-4" />
              Create event
            </Button>
          </form>
        </CardContent>
      </Card>
      <section className="space-y-4">
        {clubEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </section>
    </div>
  );
}
