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
<section className="rounded-[22px] border border-brand-mist bg-white p-5 shadow-soft">
<div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
<label className="relative block">
<Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-green" />
<Input
className="pl-10"
placeholder="Search clubs by name, category, or interest..."
value={query}
onChange={(event) => setQuery(event.target.value)}
/>
</label>
<div className="flex flex-wrap gap-2">
{interests.slice(0, 5).map((interest) => (
<Badge key={interest.id} tone="green">
{interest.name}
</Badge>
))}
</div>
</div>
</section>