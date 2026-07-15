"use client";
import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { ClubCard } from "@/components/cards/club-card";
import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { Club, Interest } from "@/lib/types";
type ClubDirectoryClientProps = {
clubs: Club[];
interests: Interest[];
};
export function filterClubs(clubs: Club[], query: string) {
const normalizedQuery = query.trim().toLowerCase();
if (!normalizedQuery) return clubs;
return clubs.filter((club) =>
[club.name, club.category, club.description, ...club.tags].some((value) =>
value.toLowerCase().includes(normalizedQuery),
),
);
}
export function ClubDirectoryClient({
clubs,
interests,
}: ClubDirectoryClientProps) {
const [query, setQuery] = useState("");
const filteredClubs = useMemo(
() => filterClubs(clubs, query),
[clubs, query],
);
return (
<div className="space-y-8">
