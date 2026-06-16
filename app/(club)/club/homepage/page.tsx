import { CalendarDays, ClipboardList, FileText, Inbox } from "lucide-react";
import { AnnouncementCard } from "@/components/cards/announcement-card";
import { EventCard } from "@/components/cards/event-card";
import { InquiryCard } from "@/components/cards/inquiry-card";
import { JoinRequestRow } from "@/components/cards/join-request-row";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { Button } from "@/components/ui/button";
import { announcements, events, getClubById, inquiries, joinRequests, resources } from "@/lib/mock-data";
export default function ClubHomePage() {
 const managedClub = getClubById("cs-club");
 const clubEvents = events.filter((event) => event.clubId === managedClub?.id);
 const clubAnnouncements = announcements.filter((announcement) => announcement.clubId === managedClub?.id);
 const clubRequests = joinRequests.filter((request) => request.clubId === managedClub?.id);
 const clubInquiries = inquiries.filter((inquiry) => inquiry.clubId === managedClub?.id);
 const clubResources = resources.filter((resource) => resource.clubId === managedClub?.id);
 return (
 <div className="space-y-8">
 <PageHeader
 eyebrow="Club Mode"
 title={`${managedClub?.name ?? "Club"} homepage`}
 description="Manage club updates, requests, events, resources, and student inquiries from one officer workspace."
 action={<Button>Create announcement</Button>}
 />
