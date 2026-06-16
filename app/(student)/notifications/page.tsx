import { Bell } from "lucide-react";
import { NotificationItem } from "@/components/cards/notification-item";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { notifications } from "@/lib/mock-data";
export default function NotificationsPage() {
  const unreadCount = notifications.filter((n) => n.status === "unread").length;
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        description="Track join requests, event reminders, announcements, resources, and club replies."
      />
      <section className="grid gap-4 md:grid-cols-2">
        <StatCard label="Unread" value={unreadCount} detail="Need review" icon={<Bell className="h-5 w-5" />} color="gold" />
        <StatCard label="All updates" value={notifications.length} detail="Campus notifications" icon={<Bell className="h-5 w-5" />} />
      </section>
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-brand-ink">All notifications</h2>
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </div>
      </section>
    </div>
  );
}
