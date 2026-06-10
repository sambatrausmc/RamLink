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
