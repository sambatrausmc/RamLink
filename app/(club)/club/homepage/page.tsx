import { CalendarDays, ClipboardList, FileText, Inbox } from "lucide-react";
import { AnnouncementCard } from "@/components/cards/announcement-card";
import { EventCard } from "@/components/cards/event-card";
import { InquiryCard } from "@/components/cards/inquiry-card";
import { JoinRequestRow } from "@/components/cards/join-request-row";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { Button } from "@/components/ui/button";
import {
  announcements,
  events,
  getClubById,
  inquiries,
  joinRequests,
  resources,
} from "@/lib/mock-data";
export default function ClubHomePage() {
  const managedClub = getClubById("cs-club");
  const clubEvents = events.filter((event) => event.clubId === managedClub?.id);
  const clubAnnouncements = announcements.filter(
    (announcement) => announcement.clubId === managedClub?.id,
  );
  const clubRequests = joinRequests.filter(
    (request) => request.clubId === managedClub?.id,
  );
  const clubInquiries = inquiries.filter(
    (inquiry) => inquiry.clubId === managedClub?.id,
  );
  const clubResources = resources.filter(
    (resource) => resource.clubId === managedClub?.id,
  );
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Club Mode"
        title={`${managedClub?.name ?? "Club"} homepage`}
        description="Manage club updates, requests, events, resources, and student inquiries from one officer workspace."
        action={<Button>Create announcement</Button>}
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Pending requests"
          value={clubRequests.length}
          detail="Need review"
          icon={<ClipboardList className="h-5 w-5" />}
        />
        <StatCard
          label="Upcoming events"
          value={clubEvents.length}
          detail="Published events"
          icon={<CalendarDays className="h-5 w-5" />}
        />
        <StatCard
          label="Resources"
          value={clubResources.length}
          detail="Forms and links"
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          label="Open inquiries"
          value={
            clubInquiries.filter((inquiry) => inquiry.status === "open").length
          }
          detail="Student questions"
          icon={<Inbox className="h-5 w-5" />}
        />
      </section>
      <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-brand-ink">
            Join requests
          </h2>
          {clubRequests.map((request) => (
            <JoinRequestRow key={request.id} request={request} />
          ))}
        </div>
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-brand-ink">
            Recent inquiries
          </h2>
          {clubInquiries.map((inquiry) => (
            <InquiryCard key={inquiry.id} inquiry={inquiry} />
          ))}
        </div>
      </section>
      <section className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-brand-ink">
            Upcoming events
          </h2>
          {clubEvents.map((event) => (
            <EventCard key={event.id} event={event} compact />
          ))}
        </div>
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-brand-ink">
            Announcements
          </h2>
          {clubAnnouncements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
