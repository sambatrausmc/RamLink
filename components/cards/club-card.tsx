import Link from "next/link";
import { ArrowRight, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/status-badge";
import type { Club } from "@/lib/types";

type ClubCardProps = {
  club: Club;
  showStatus?: boolean;
};
export function ClubCard({ club, showStatus = false }: ClubCardProps) {
  return (
    <Card className="overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-lift">
      <CardContent>
        <div className="flex items-start justify-between gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-[13px] bg-brand-mist font-display text-sm font-semibold text-brand-forest">
            {club.shortName}
          </div>
          {showStatus ? <StatusBadge status={club.membershipStatus ?? "notJoined"} /> : null}
        </div>
        <div className="mt-4">
          <p className="text-sm font-semibold text-brand-green">{club.category}</p>
          <h2 className="mt-1 font-display text-xl font-semibold tracking-[-0.02em] text-brand-ink">{club.name}</h2>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-brand-muted">{club.description}</p>
        </div>
        <div className="mt-4 space-y-2 text-sm text-brand-muted">
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-brand-green" />
            {club.meetingSchedule}
          </p>
          <p className="flex items-center gap-2">
            <Users className="h-4 w-4 text-brand-green" />
            {club.memberCount} members
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {club.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} tone="slate">
              {tag}
            </Badge>
          ))}
        </div>
        <Link
          href={`/clubs/${club.id}`}
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-forest hover:text-brand-green"
        >
          View club
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
