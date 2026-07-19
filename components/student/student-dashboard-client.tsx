"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bell,
  CalendarDays,
  ClipboardList,
  Sparkles,
  Users,
} from "lucide-react";
import { AnnouncementCard } from "@/components/cards/announcement-card";
import { ClubCard } from "@/components/cards/club-card";
import { EventCard } from "@/components/cards/event-card";
import { NotificationItem } from "@/components/cards/notification-item";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { StatusBadge } from "@/components/common/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/components/auth/auth-provider";
import {
  getStudentJoinRequests,
  getStudentNotifications,
} from "@/lib/firebase/student-actions";
import type {
  Announcement,
  Club,
  EventItem,
  JoinRequest,
  NotificationItem as NotificationType,
} from "@/lib/types";
type StudentDashboardClientProps = {
  clubs: Club[];
  events: EventItem[];
  announcements: Announcement[];
};
function getFirstName(displayName: string) {
  return displayName.split(" ").filter(Boolean)[0] ?? "there";
}
export function StudentDashboardClient({
  clubs,
  events,
  announcements,
}: StudentDashboardClientProps) {
  const { loading, profile, profileStatus, user } = useAuth();
  const [studentRequests, setStudentRequests] = useState<JoinRequest[]>([]);
  const [studentNotifications, setStudentNotifications] = useState<
    NotificationType[]
  >([]);
  const [activityStatus, setActivityStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");
  useEffect(() => {
    let active = true;
    async function loadStudentData() {
      if (!user) {
        setStudentRequests([]);
        setStudentNotifications([]);
        setActivityStatus("error");
        return;
      }
      setActivityStatus("loading");
      try {
        const [requests, nextNotifications] = await Promise.all([
          getStudentJoinRequests(user.uid),
          getStudentNotifications(user.uid),
        ]);
        if (active) {
          setStudentRequests(requests);
          setStudentNotifications(nextNotifications);
          setActivityStatus("ready");
        }
      } catch {
        if (active) {
          setStudentRequests([]);
          setStudentNotifications([]);
          setActivityStatus("error");
        }
      }
    }
    loadStudentData();
    return () => {
      active = false;
    };
  }, [user]);

  if (loading || profileStatus === "loading" || profileStatus === "missing") {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-brand-muted">Loading your dashboard...</p>
        </CardContent>
      </Card>
    );
  }

  if (!user || !profile || profileStatus === "error") {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-red-700">
            Your student profile could not be loaded. Try again from the
            workspace access screen.
          </p>
        </CardContent>
      </Card>
    );
  }

  const student = profile;
  const savedClubIds = new Set(student.savedClubIds);
  const savedEventIds = new Set(student.savedEventIds);
  const rsvpedEventIds = new Set(student.rsvpedEventIds ?? []);
  const joinedClubs = clubs.filter((club) =>
    student.joinedClubIds.includes(club.id),
  );
  const requestsByClub = new Map(
    studentRequests.map((request) => [request.clubId, request]),
  );
  const suggestedClubs = clubs
    .filter(
      (club) => club.isSuggested && !student.joinedClubIds.includes(club.id),
    )
    .slice(0, 3)
    .map((club) => ({
      ...club,
      isSaved: savedClubIds.has(club.id),
      membershipStatus:
        requestsByClub.get(club.id)?.status ??
        club.membershipStatus ??
        "notJoined",
    }));
  const upcomingEvents = events.slice(0, 3).map((event) => ({
    ...event,
    isSaved: savedEventIds.has(event.id),
    hasRsvped: rsvpedEventIds.has(event.id),
  }));
  const recentAnnouncements = announcements.slice(0, 2);
  const unreadNotifications = studentNotifications.filter(
    (notification) => notification.status === "unread",
  );

  function handleNotificationStatusChange(
    notificationId: string,
    status: NotificationType["status"],
  ) {
    setStudentNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? { ...notification, status }
          : notification,
      ),
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Student Dashboard"
        title={`Welcome back, ${getFirstName(student.displayName)}`}
        description="Your home base for club updates, upcoming events, join requests, and campus notifications."
        action={
          <Link
            href="/clubs"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[11px] bg-brand-forest px-4 text-sm font-semibold leading-none text-white shadow-[0_6px_16px_rgba(11,93,59,0.18)] transition hover:-translate-y-0.5 hover:bg-brand-forestDark"
          >
            <Sparkles className="h-4 w-4" />
            Browse clubs
          </Link>
        }
      />
      {activityStatus === "error" ? (
        <Card>
          <CardContent>
            <p className="text-sm font-medium text-red-700">
              Join requests and notifications could not be loaded. Refresh the
              page to try again.
            </p>
          </CardContent>
        </Card>
      ) : null}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Joined clubs"
          value={joinedClubs.length}
          detail="Approved memberships"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Saved clubs"
          value={student.savedClubIds.length}
          detail="Bookmarked communities"
          icon={<Users className="h-5 w-5" />}
          color="gold"
        />
        <StatCard
          label="Upcoming events"
          value={upcomingEvents.length}
          detail="Campus activities"
          icon={<CalendarDays className="h-5 w-5" />}
        />
        <StatCard
          label="Unread updates"
          value={unreadNotifications.length}
          detail="Need review"
          icon={<Bell className="h-5 w-5" />}
          color="gold"
        />
      </section>
      <section className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-brand-ink">
            Upcoming events
          </h2>
          {upcomingEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-brand-ink">
            Join request status
          </h2>
          {studentRequests.length ? (
            studentRequests.map((request) => {
              const club = clubs.find(
                (clubItem) => clubItem.id === request.clubId,
              );
              return (
                <Card key={request.id}>
                  <CardContent>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-display font-semibold text-brand-ink">
                          {club?.name ?? "Club request"}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-brand-muted">
                          {request.message}
                        </p>
                        <p className="mt-2 text-xs font-medium text-brand-muted/70">
                          Submitted {request.createdAt}
                        </p>
                      </div>
                      <StatusBadge status={request.status} />
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent>
                <p className="text-sm text-brand-muted">
                  Membership requests will appear here after you ask to join a
                  club.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
      <section className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-brand-ink">
            Suggested clubs
          </h2>
          <div className="grid gap-5 md:grid-cols-2">
            {suggestedClubs.map((club) => (
              <ClubCard key={club.id} club={club} showStatus />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-brand-ink">
            Notification summary
          </h2>
          <div className="space-y-3">
            {studentNotifications.length ? (
              studentNotifications
                .slice(0, 3)
                .map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onStatusChange={handleNotificationStatusChange}
                  />
                ))
            ) : (
              <Card>
                <CardContent>
                  <p className="text-sm text-brand-muted">
                    No notifications yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-brand-green" />
          <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-brand-ink">
            Recent club announcements
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {recentAnnouncements.map((announcement) => (
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
