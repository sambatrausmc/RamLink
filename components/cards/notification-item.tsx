import Link from "next/link";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { NotificationItem as NotificationItemType } from "@/lib/types";

type NotificationItemProps = {
notification: NotificationItemType;
onOpen?: (notificationId: string) => void;
};
export function NotificationItem({
notification,
onOpen,
}: NotificationItemProps) {
return (
  <Link
  href={notification.relatedHref}
  onClick={() => onOpen?.(notification.id)}
  className={`
  flex gap-3 rounded-[18px] border border-brand-mist bg-white p-4
  shadow-[0_1px_2px_rgba(7,61,39,0.04),0_10px_28px_rgba(7,61,39,0.06)]
  transition duration-200 hover:-translate-y-1 hover:border-brand-greenLight
  hover:shadow-lift
  `}
  >

      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-brand-mist text-brand-forest">
        <Bell className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display font-semibold text-brand-ink">{notification.title}</h2>
          <Badge tone={notification.status === "unread" ? "gold" : "slate"}>
            {notification.status}
          </Badge>
        </div>
        <p className="mt-1 text-sm leading-6 text-brand-muted">{notification.body}</p>
        <p className="mt-2 text-xs font-medium text-brand-muted/70">{notification.createdAt}</p>
      </div>
    </Link>
  );
}
