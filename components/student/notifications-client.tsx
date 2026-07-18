"use client";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { NotificationItem } from "@/components/cards/notification-item";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";
import { getStudentNotifications } from "@/lib/firebase/student-actions";
import type { NotificationItem as NotificationType } from "@/lib/types";
type NotificationsClientProps = {
 fallbackNotifications: NotificationType[];
};
export type NotificationFilter = "all" | "unread";
export function filterNotifications(
 notifications: NotificationType[],
 filter: NotificationFilter,
) {
 return filter === "unread"
 ? notifications.filter((notification) => notification.status === "unread")
 : notifications;
}
export function NotificationsClient({ fallbackNotifications }: NotificationsClientProps) {
 const { loading: authLoading, user } = useAuth();
 const [notifications, setNotifications] = useState(fallbackNotifications);
 const [filter, setFilter] = useState<NotificationFilter>
 const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
 // Fetch live notifications from Firestore whenever the logged-in user changes
 useEffect(() => {
 let active = true;
 async function loadNotifications() {
 if (authLoading) {
 setLoadState("loading");
 return;
 }
 if (!user) {
 setNotifications(fallbackNotifications);
 setLoadState("ready");
 return;
 }
 setLoadState("loading");
 try {
 const nextNotifications = await getStudentNotifications(user.uid);
 if (active) {
 setNotifications(nextNotifications);
 setLoadState("ready");
 }
 } catch {
 if (active) {
 setNotifications(fallbackNotifications);
 setLoadState("error");
 }
 }
 }
 loadNotifications();
 return () => {
 active = false;
 };
 }, [authLoading, fallbackNotifications, user]);
 const unreadCount = notifications.filter((notification) => notification.status === "unread").length;
 const visibleNotifications = filterNotifications(notifications, filter);
 return (
 <div className="space-y-8">
 <PageHeader
 eyebrow="Inbox"
 title="Notifications"
 description="Track join requests, event reminders, announcements, resources, and club replies."
 />
 <section className="grid gap-4 md:grid-cols-2">
 <StatCard
 label="Unread"
 value={unreadCount}
 detail="Need review"
 icon={<Bell className="h-5 w-5" />}
 color="gold"
 />
 <StatCard
label="All updates"
 value={notifications.length}
 detail="Campus notifications"
 icon={<Bell className="h-5 w-5" />}
 />
 </section>
 <section className="space-y-4">
 <div className="flex flex-wrap items-center justify-between gap-3">
 <h2 className="font-display text-2xl font-semibold text-brand-ink">Notifications</h2>
 <div className="flex gap-2" aria-label="Notification filters">
 <Button
 size="sm"
 variant={filter === "all" ? "secondary" : "outline"}
 onClick={() => setFilter("all")}
 >
 All
 </Button>
 <Button
 size="sm"
 variant={filter === "unread" ? "secondary" : "outline"}
 onClick={() => setFilter("unread")}
 >
 Unread
 </Button>
 </div>
 </div>
 {loadState === "loading" ? (
 <p className="rounded-[12px] border border-brand-mist bg-white p-4 text-sm text-brand-muted" role="status">
 Loading notifications...
 </p>
 ) : null}
 {loadState === "error" ? (
 <p className="rounded-[12px] border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
 Notifications could not be refreshed. Showing the available saved data.
 </p>
 ) : null}
 {loadState !== "loading" && visibleNotifications.length ? (
 <div className="space-y-3">
 {visibleNotifications.map((notification) => (
 <NotificationItem key={notification.id} notification={notification} />
 ))}
 </div>
 ) : loadState !== "loading" ? (
 <EmptyState
 icon={<Bell className="h-5 w-5" />}
 title={filter === "unread" ? "No unread notifications" : "No notifications yet"}
 description={filter === "unread" ? "You are caught up." : "Notifications will appear here after RamLink actions are saved."}
 />
 ) : null}
 </section>
 </div>
 );
}