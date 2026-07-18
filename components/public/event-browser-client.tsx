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

type EventSortMode = "soonest" | "popular";

export function filterAndSortEvents(
  events: EventItem[],
  query: string,
  sortMode: EventSortMode,
  clubs: Club[] = [],
  category: EventCategoryFilter = "all",
) {
  const filteredEvents = filterEvents(events, clubs, query, category);

  return [...filteredEvents].sort((firstEvent, secondEvent) => {
    if (sortMode === "popular") {
      return secondEvent.rsvpCount - firstEvent.rsvpCount;
    }
    return firstEvent.date.localeCompare(secondEvent.date);
  });
}
type EventBrowserClientProps = {
  events: EventItem[];
  clubs: Club[];
};

export function EventBrowserClient({ events, clubs }: EventBrowserClientProps) {
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<EventSortMode>("soonest");
  const [category, setCategory] = useState<EventCategoryFilter>("all");
  const categories = useMemo(
    () => getEventCategories(events, clubs),
    [clubs, events],
  );
  const visibleEvents = useMemo(
    () => filterAndSortEvents(events, query, sortMode, clubs, category),
    [category, clubs, events, query, sortMode],
  );
  const hasFilters =
    Boolean(query.trim()) || category !== "all" || sortMode !== "soonest";

  function clearFilters() {
    setQuery("");
    setCategory("all");
    setSortMode("soonest");
  }

  return (
    <section className="space-y-5">
      <div className="rounded-[22px] border border-brand-mist bg-white p-5 shadow-soft">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_220px_180px_auto] xl:items-end">
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
            aria-label="Filter by club category"
            className="h-11 rounded-[11px] border border-brand-mist bg-white px-3 text-sm font-medium text-brand-ink outline-none focus:border-brand-green"
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
          <Button
            variant="outline"
            onClick={clearFilters}
            disabled={!hasFilters}
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        </div>
        <p className="mt-3 text-sm font-medium text-brand-muted">
          {visibleEvents.length}{" "}
          {visibleEvents.length === 1 ? "event" : "events"}
        </p>
      </div>

      {visibleEvents.length ? (
        visibleEvents.map((event) => (
          <EventCard key={event.id} event={event} actionMode="public" />
        ))
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
