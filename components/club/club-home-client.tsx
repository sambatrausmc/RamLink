"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, ClipboardList, FileText, Inbox } from "lucide-react";
import { AnnouncementCard } from "@/components/cards/announcement-card";
import { EventCard } from "@/components/cards/event-card";
import { JoinRequestRow } from "@/components/cards/join-request-row";
import { InquiryWorkflowCard } from "@/components/club/inquiry-workflow-card";
import { useManagedClub } from "@/components/club/use-managed-club";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import {
  getAnnouncementsForClub,
  getClubByIdFromFirestore,
  getEventsForClub,
  getInquiriesForClub,
  getJoinRequestsForClub,
  getResourcesForClub,
} from "@/lib/firebase/public-data";
import type {
  Announcement,
  Club,
  ClubInquiry,
  EventItem,
  JoinRequest,
  Resource,
} from "@/lib/types";

export function ClubHomeClient() {
  const { clubId, loading } = useManagedClub();
  const [club, setClub] = useState<Club | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [inquiries, setInquiries] = useState<ClubInquiry[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!clubId) return;
    Promise.all([
      getClubByIdFromFirestore(clubId),
      getEventsForClub(clubId),
      getAnnouncementsForClub(clubId),
      getJoinRequestsForClub(clubId),
      getInquiriesForClub(clubId),
      getResourcesForClub(clubId),
    ])
      .then(
        ([
          nextClub,
          nextEvents,
          nextAnnouncements,
          nextRequests,
          nextInquiries,
          nextResources,
        ]) => {
          setClub(nextClub);
          setEvents(nextEvents);
          setAnnouncements(nextAnnouncements);
          setRequests(nextRequests);
          setInquiries(nextInquiries);
          setResources(nextResources);
        },
      )
      .catch(() => setError("Unable to load the club workspace."));
  }, [clubId]);

  if (loading)
    return <p className="text-sm text-brand-muted">Loading club access...</p>;

  if (!clubId)
    return (
      <p className="text-sm text-red-600">
        No managed club is assigned to this account.
      </p>
    );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Club Mode"
        title={`${club?.name ?? "Club"} homepage`}
        description="Manage club updates, requests, events, resources, and student inquiries from one officer workspace."
        action={
          <Link
            href="/club/announcements"
            className="inline-flex h-11 items-center rounded-[11px] bg-brand-forest px-4 text-sm font-semibold text-white"
          >
            Create announcement
          </Link>
        }
      />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Pending requests"
          value={
            requests.filter((request) => request.status === "pending").length
          }
          detail="Need review"
          icon={<ClipboardList className="h-5 w-5" />}
        />
        <StatCard
          label="Upcoming events"
          value={events.length}
          detail="Published events"
          icon={<CalendarDays className="h-5 w-5" />}
        />
        <StatCard
          label="Resources"
          value={resources.length}
          detail="Forms and links"
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          label="Open inquiries"
          value={
            inquiries.filter((inquiry) => inquiry.status === "open").length
          }
          detail="Student questions"
          icon={<Inbox className="h-5 w-5" />}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-semibold text-brand-ink">
            Join requests
          </h2>
          {requests.slice(0, 3).map((request) => (
            <JoinRequestRow key={request.id} request={request} />
          ))}
        </div>
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-semibold text-brand-ink">
            Recent inquiries
          </h2>
          {inquiries.slice(0, 3).map((inquiry) => (
            <InquiryWorkflowCard key={inquiry.id} inquiry={inquiry} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-semibold text-brand-ink">
            Upcoming events
          </h2>
          {events.slice(0, 3).map((event) => (
            <EventCard key={event.id} event={event} compact />
          ))}
        </div>
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-semibold text-brand-ink">
            Announcements
          </h2>
          {announcements.slice(0, 3).map((announcement) => (
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