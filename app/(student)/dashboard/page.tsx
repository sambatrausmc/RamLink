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
