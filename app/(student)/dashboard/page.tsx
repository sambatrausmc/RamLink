import Link from "next/link";
import { Bell, CalendarDays, ClipboardList, Sparkles, Users } from "lucide-react";
import { AnnouncementCard } from "@/components/cards/announcement-card";
import { ClubCard } from "@/components/cards/club-card";
import { EventCard } from "@/components/cards/event-card";
import { NotificationItem } from "@/components/cards/notification-item";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { StatusBadge } from "@/components/common/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import {
 announcements,
 clubs,
 currentStudent,
 events,
 getClubById,
 joinRequests,
 notifications,
} from "@/lib/mock-data";
export default function StudentDashboardPage() {
 const joinedClubs = clubs.filter((club) => currentStudent.joinedClubIds.includes(club.id));
 const suggestedClubs = clubs
 .filter((club) => club.isSuggested && !currentStudent.joinedClubIds.includes(club.id))
 .slice(0, 3);
 const upcomingEvents = events.slice(0, 3);
 const recentAnnouncements = announcements.slice(0, 2);
 const studentRequests = joinRequests.filter((request) => request.studentId === currentStudent.id);
 const unreadNotifications = notifications.filter((notification) => notification.status === "unread");
 return (
 <div className="space-y-8">
 <PageHeader
 eyebrow="Student Dashboard"
 title={`Welcome back, ${currentStudent.displayName.split(" ")[0]}`}
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
<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
 <StatCard label="Joined clubs" value={joinedClubs.length} detail="Approved memberships" icon={<Users className="h-5 w-5" />} />
 <StatCard label="Saved clubs" value={currentStudent.savedClubIds.length} detail="Bookmarked communities" icon={<Users className="h-5 w-5" />} color="gold" />
 <StatCard label="Upcoming events" value={upcomingEvents.length} detail="Campus activities" icon={<CalendarDays className="h-5 w-5" />} />
 <StatCard label="Unread updates" value={unreadNotifications.length} detail="Need review" icon={<Bell className="h-5 w-5" />} color="gold" />
 </section>
 <section className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
 <div className="space-y-4">
 <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-brand-ink">Upcoming events</h2>
 {upcomingEvents.map((event) => (
 <EventCard key={event.id} event={event} />
 ))}
 </div>
 <div className="space-y-4">
 <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-brand-ink">Join request status</h2>
 {studentRequests.map((request) => {
 const club = getClubById(request.clubId);
 return (
 <Card key={request.id}>
 <CardContent>
 <div className="flex items-start justify-between gap-3">
 <div>
 <p className="font-display font-semibold text-brand-ink">{club?.name ?? "Club request"}</p>
 <p className="mt-2 text-sm leading-6 text-brand-muted">{request.message}</p>
 <p className="mt-2 text-xs font-medium text-brand-muted/70">Submitted {request.createdAt}</p>
 </div>
 <StatusBadge status={request.status} />
 </div>
 </CardContent>
 </Card>
 );
 })}
 </div>
 </section>
  <section className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
  <div className="space-y-4">
  <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-brand-ink">Suggested clubs</h2>
  <div className="grid gap-5 md:grid-cols-2">
  {suggestedClubs.map((club) => (
  <ClubCard key={club.id} club={club} showStatus />
  ))}
  </div>
  </div>
  <div className="space-y-4">
  <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-brand-ink">Notification summary</h2>
  <div className="space-y-3">
  {notifications.slice(0, 3).map((notification) => (
  <NotificationItem key={notification.id} notification={notification} />
  ))}
  </div>
  </div>
  </section>
  <section className="space-y-4">
  <div className="flex items-center gap-2">
  <ClipboardList className="h-5 w-5 text-brand-green" />
  <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-brand-ink">Recent club announcements</h2>
  </div>
  <div className="grid gap-4 md:grid-cols-2">
  {recentAnnouncements.map((announcement) => (
  <AnnouncementCard key={announcement.id} announcement={announcement} />
  ))}
  </div>
  </section>
  </div>
  );
 }
