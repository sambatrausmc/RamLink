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
