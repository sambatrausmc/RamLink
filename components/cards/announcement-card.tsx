import { Megaphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Announcement } from "@/lib/types";

type AnnouncementCardProps = {
  announcement: Announcement;
};

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  return (
    <Card className="transition duration-200 hover:-translate-y-1 hover:shadow-lift">
      <CardContent>
        <div className="flex items-start gap-3">
          <div
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-[12px] ${
              announcement.priority === "important" ? "bg-amber-50 text-amber-600" : "bg-brand-mist text-brand-forest"
            }`}
          >
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={announcement.priority === "important" ? "gold" : "green"}>
                {announcement.priority === "important" ? "Important" : "Announcement"}
              </Badge>
              <span className="text-xs font-medium text-slate-500">{announcement.clubName ?? "Club update"}</span>
            </div>
            <h2 className="mt-2 font-display text-base font-semibold text-brand-ink">{announcement.title}</h2>
            <p className="mt-2 text-sm leading-6 text-brand-muted">{announcement.body}</p>
            <p className="mt-3 text-xs font-medium text-brand-muted/70">Posted {announcement.createdAt}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
