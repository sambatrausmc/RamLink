"use client";
import { useMemo, useState } from "react";
import { CalendarDays, Search, X } from "lucide-react";
import { EventCard } from "@/components/cards/event-card";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  filterEvents,
  getEventCategories,
  type EventCategoryFilter,
} from "@/lib/event-filters";
import type { Club, EventItem } from "@/lib/types";
type EventDirectoryClientProps = {
  events: EventItem[];
  clubs: Club[];
};
export function EventDirectoryClient({
  events,
  clubs,
}: EventDirectoryClientProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<EventCategoryFilter>("all");
  const categories = useMemo(
    () => getEventCategories(events, clubs),
    [clubs, events],
  );
  const filteredEvents = useMemo(
    () => filterEvents(events, clubs, query, category),
    [category, clubs, events, query],
  );
  const hasFilters = Boolean(query.trim()) || category !== "all";
  function clearFilters() {
    setQuery("");
    setCategory("all");
  }
  return (
    <section className="space-y-5">
      <div className="rounded-[18px] border border-brand-mist bg-white p-5 shadow-soft">
        <div className="grid gap-3 md:grid-cols-[1fr_240px_auto] md:items-end">
          <label className="space-y-2 text-sm font-semibold text-brand-green">
            Search events
            <span className="relative block">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
              <Input
                className="pl-10"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by event, club, or location"
              />
            </span>
          </label>
          <label className="space-y-2 text-sm font-semibold text-brand-green">
            Club category
            <select
              className="h-11 w-full rounded-[12px] border border-brand-mist bg-white px-3.5 text-sm text-brand-ink outline-none focus:border-brandgreen focus:ring-2 focus:ring-brand-green/15"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as EventCategoryFilter)
              }
            >
              <option value="all">All categories</option>
              {categories.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <Button
            variant="outline"
            onClick={clearFilters}
            disabled={!hasFilters}
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        </div>
      </div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-brand-green">Plan ahead</p>
          <h2 className="font-display text-3xl font-semibold text-brand-ink">
            Upcoming events
          </h2>
        </div>
        <p className="text-sm font-medium text-brand-muted" aria-live="polite">
          {filteredEvents.length}{" "}
          {filteredEvents.length === 1 ? "event" : "events"}
        </p>
      </div>
      {filteredEvents.length ? (
        <div className="space-y-5">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} actionMode="public" />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<CalendarDays className="h-5 w-5" />}
          title="No matching events"
          description="Try another search or clear the current filters."
        />
      )}
    </section>
  );
}
