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
      .then(([
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
      })
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

      {/* Stats, sections, etc. — copy the full return from the PDF if needed */}
      {/* ... rest of the component from Daniel's guide ... */}
    </div>
  );
}