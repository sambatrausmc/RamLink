"use client";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { NotificationItem } from "@/components/cards/notification-item";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { EmptyState } from "@/components/common/empty-state";
import { useAuth } from "@/components/auth/auth-provider";
import { getStudentNotifications } from "@/lib/firebase/student-actions";
import type { NotificationItem as NotificationType } from "@/lib/types";

type NotificationsClientProps = {
  fallbackNotifications: NotificationType[];
};

export function NotificationsClient({ fallbackNotifications }: NotificationsClientProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(fallbackNotifications);

  // Fetch live notifications from Firestore whenever the logged-in user changes
  useEffect(() => {
    let active = true;
    async function loadNotifications() {
      if (!user) {
        setNotifications(fallbackNotifications);
        return;
      }
      try {
        const nextNotifications = await getStudentNotifications(user.uid);
        if (active) {
          setNotifications(nextNotifications);
        }
      } catch {
        if (active) {
          setNotifications(fallbackNotifications);
        }
      }
    }
    loadNotifications();
    return () => {
      active = false;
    };
  }, [fallbackNotifications, user]);

  const unreadCount = notifications.filter((notification) => notification.status === "unread").length;

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
        <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-brand-ink">
          All notifications
        </h2>
        {notifications.length ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Bell className="h-5 w-5" />}
            title="No notifications yet"
            description="Notifications will appear here after RamLink actions are saved."
          />
        )}
      </section>
    </div>
  );
}
