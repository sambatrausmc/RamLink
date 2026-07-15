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
  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [requests, setRequests] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [resources, setResources] = useState([]);
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
    return Loading club access...;

  if (!clubId)
    return (
      <div>
        No managed club is assigned to this account.
      </div>
    );

  return (
    <div>
      <PageHeader
        title={club?.name || "Club Dashboard"}
        description="Manage your club's content, join requests, and student inquiries."
        actions={
          <Link href={`/dashboard/clubs/${clubId}/announcements/new`}>
            Create announcement
          </Link>
        }
      />
      {error ? <p>{error}</p> : null}

      <div>
        <StatCard
          title="Join Requests"
          value={
            requests.filter((request) => request.status === "pending").length
          }
          detail="Need review"
          icon={<ClipboardList />}
        />
        <StatCard
          title="Events"
          value={events.length}
          detail="Upcoming events"
          icon={<CalendarDays />}
        />
        <StatCard
          title="Resources"
          value={resources.length}
          detail="Club documents"
          icon={<FileText />}
        />
        <StatCard
          title="Inquiries"
          value={
            inquiries.filter((inquiry) => inquiry.status === "open").length
          }
          detail="Student questions"
          icon={<Inbox />}
        />
      </div>

      <div>
        <div>
          <h3>Join requests</h3>
          {requests.slice(0, 3).map((request) => (
            <JoinRequestRow key={request.id} request={request} />
          ))}
        </div>

        <div>
          <h3>Recent inquiries</h3>
          {inquiries.slice(0, 3).map((inquiry) => (
            <InquiryWorkflowCard key={inquiry.id} inquiry={inquiry} />
          ))}
        </div>
      </div>

      <div>
        <div>
          <h3>Upcoming events</h3>
          {events.slice(0, 3).map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        <div>
          <h3>Announcements</h3>
          {announcements.slice(0, 3).map((announcement) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))}
        </div>
      </div>
    </div>
  );
}