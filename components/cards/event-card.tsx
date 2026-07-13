"use client";
import Link from "next/link";
import { useState } from "react";
import { format } from "date-fns";
import { Bookmark, CalendarDays, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/status-badge";
import { useAuth } from "@/components/auth/auth-provider";
import { toggleEventRsvp, toggleSavedEvent } from "@/lib/firebase/student-actions";
import type { EventItem } from "@/lib/types";

type EventCardProps = {
  event: EventItem;
  compact?: boolean;
  actionMode?: "workspace" | "public";
};

export function EventCard({ event, compact = false, actionMode = "workspace" }: EventCardProps) {
  const { profile, refreshProfile, user } = useAuth();
  
  const [savedOverride, setSavedOverride] = useState<boolean | null>(null);
  const [rsvpOverride, setRsvpOverride] = useState<boolean | null>(null);
  const [rsvpCountAdjustment, setRsvpCountAdjustment] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isRsvping, setIsRsvping] = useState(false);

  const date = format(new Date(`${event.date}T12:00:00`), "MMM d, yyyy");
  const profileSaved = profile?.savedEventIds.includes(event.id) ?? event.isSaved ?? false;
  const profileRsvped = profile?.rsvpedEventIds?.includes(event.id) ?? event.hasRsvped ?? false;
  
  const isSaved = savedOverride ?? profileSaved;
  const hasRsvped = rsvpOverride ?? profileRsvped;
  const rsvpCount = Math.max(0, event.rsvpCount + rsvpCountAdjustment);

  async function handleSaveEvent() {
    if (!user) {
      setFeedback("Sign in to save this event.");
      return;
    }
    setIsSaving(true);
    setFeedback("");
    try {
      const nextSaved = await toggleSavedEvent(user.uid, event.id, isSaved);
      setSavedOverride(nextSaved);
      setFeedback(nextSaved ? "Event saved." : "Event removed from saved items.");
      await refreshProfile();
    } catch {
      setFeedback("Unable to update saved event right now.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRsvp() {
    if (!user) {
      setFeedback("Sign in to RSVP for this event.");
      return;
    }
    setIsRsvping(true);
    setFeedback("");
    try {
      const nextRsvp = await toggleEventRsvp(user.uid, event.id, hasRsvped);
      setRsvpOverride(nextRsvp);
      setRsvpCountAdjustment((current) => current + (nextRsvp ? 1 : -1));
      setFeedback(nextRsvp ? "RSVP saved." : "RSVP removed.");
      await refreshProfile();
    } catch {
      setFeedback("Unable to update RSVP right now.");
    } finally {
      setIsRsvping(false);
    }
  }

  return (
    <Card className="transition duration-200 hover:-translate-y-1 hover:shadow-lift">
      <CardContent className={compact ? "p-4" : undefined}>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Badge tone="blue">{event.clubName ?? "Campus event"}</Badge>
            <h2 className="mt-3 font-display text-xl font-semibold tracking-[-0.02em] text-brand-ink">
              {event.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-brand-muted">{event.description}</p>
          </div>
          <div className="flex gap-2">
            {hasRsvped ? <StatusBadge status="rsvped" /> : null}
            {isSaved ? <StatusBadge status="saved" /> : null}
          </div>
        </div>
        <div className="mt-4 grid gap-2 text-sm text-brand-muted md:grid-cols-3">
          <p className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-brand-green" />
            {date}
          </p>
          <p className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-brand-green" />
            {event.startTime} - {event.endTime}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-brand-green" />
            {event.location}
          </p>
        </div>
        {!compact ? (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {actionMode === "public" ? (
              <>
                <Link
                  href="/login"
                  className="inline-flex h-9 items-center justify-center rounded-[11px] bg-brand-forest px-3.5 text-sm font-semibold leading-none text-white shadow-[0_6px_16px_rgba(11,93,59,0.18)] transition hover:-translate-y-0.5 hover:bg-brand-forestDark"
                >
                  Sign in to RSVP
                </Link>
                <Link
                  href="/register"
                  className="inline-flex h-9 items-center justify-center rounded-[11px] border border-brand-mist bg-white px-3.5 text-sm font-semibold leading-none text-brand-forest transition hover:-translate-y-0.5 hover:border-brand-greenLight hover:bg-brand-surface"
                >
                  Create account
                </Link>
              </>
            ) : (
              <>
                <Button size="sm" onClick={handleRsvp} disabled={isRsvping}>
                  {isRsvping ? "Saving..." : hasRsvped ? "Cancel RSVP" : "RSVP"}
                </Button>
                <Button size="sm" variant="outline" onClick={handleSaveEvent} disabled={isSaving}>
                  <Bookmark className="h-4 w-4" />
                  {isSaving ? "Saving..." : isSaved ? "Saved" : "Save event"}
                </Button>
              </>
            )}
            <span className="text-sm text-brand-muted">{rsvpCount} RSVPs</span>
            {feedback ? <span className="text-sm font-medium text-brand-forest">{feedback}</span> : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
