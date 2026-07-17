"use client";
import { useMemo, useState } from "react";
import { CalendarDays, Search } from "lucide-react";
import { EventCard } from "@/components/cards/event-card";
import { EmptyState } from "@/components/common/empty-state";
import { Input } from "@/components/ui/input";
import type { EventItem } from "@/lib/types";
type EventSortMode = "soonest" | "popular";
export function filterAndSortEvents(
events: EventItem[],
query: string,
sortMode: EventSortMode,
) {
const normalizedQuery = query.trim().toLowerCase();
const filteredEvents = events.filter((event) =>
[event.title, event.clubName, event.description, event.location].some(
(value) => value?.toLowerCase().includes(normalizedQuery),
),
);
return [...filteredEvents].sort((firstEvent, secondEvent) => {
if (sortMode === "popular") {
return secondEvent.rsvpCount - firstEvent.rsvpCount;
}
return firstEvent.date.localeCompare(secondEvent.date);
});
}
type EventBrowserClientProps = {
events: EventItem[];
};
export function EventBrowserClient({ events }: EventBrowserClientProps) {
const [query, setQuery] = useState("");
const [sortMode, setSortMode] = useState<EventSortMode>("soonest");
const visibleEvents = useMemo(
  () => filterAndSortEvents(events, query, sortMode),
  [events, query, sortMode],
);

return (
  <section className="space-y-5">
    <div className="rounded-[22px] border border-brand-mist bg-white p-5 shadow-soft">
      <div className="grid gap-4 md:grid-cols-[1fr_210px]">
        <label className="relative block">
          <span className="sr-only">Search campus events</span>

          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-green" />

          <Input
            className="pl-10"
            placeholder="Search by event, club, or location..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
    </label>
       <select
         aria-label="Sort events"
         className={`
           h-11 rounded-[11px] border border-brand-mist bg-white px-3
           text-sm font-medium text-brand-ink outline-none
           focus:border-brand-green
         `}
         value={sortMode}
         onChange={(event) =>
           setSortMode(event.target.value as EventSortMode)
         }
       >
         <option value="soonest">Soonest date</option>
         <option value="popular">Most RSVPs</option>
       </select>
       </div>

       <p className="mt-3 text-sm font-medium text-brand-muted">
         {visibleEvents.length}{" "}
         {visibleEvents.length === 1 ? "event" : "events"}
       </p>
       </div>

       {visibleEvents.length ? (
         visibleEvents.map((event) => (
           <EventCard
             key={event.id}
             event={event}
             actionMode="public"
           />
         ))
       ) : (
         <EmptyState
           icon={<CalendarDays className="h-5 w-5" />}
           title="No matching events"
           description="Try another event name, club, or campus location."
         />
       )}
       </section>
       );
       }