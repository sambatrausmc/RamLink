import type { Club, ClubCategory, EventItem } from "@/lib/types";
export type EventCategoryFilter = "all" | ClubCategory;
export function filterEvents(
 events: EventItem[],
 clubs: Club[],
 query: string,
 category: EventCategoryFilter,
) {
 const normalizedQuery = query.trim().toLowerCase();
 const clubsById = new Map(clubs.map((club) => [club.id, club]));
 return events.filter((event) => {
 const club = clubsById.get(event.clubId);
const matchesCategory = category === "all" || club?.category === category;
 const searchableText = [
 event.title,
 event.description,
 event.location,
 event.clubName,
 club?.name,
 ]
 .filter(Boolean)
 .join(" ")
 .toLowerCase();
 return matchesCategory && searchableText.includes(normalizedQuery);
 });
}
export function getEventCategories(events: EventItem[], clubs: Club[]) {
 const eventClubIds = new Set(events.map((event) => event.clubId));
 return Array.from(
 new Set(
 clubs
 .filter((club) => eventClubIds.has(club.id))
 .map((club) => club.category),
 ),
 ).sort();
}
