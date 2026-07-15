"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { EventCard } from "@/components/cards/event-card";
import { useManagedClub } from "@/components/club/use-managed-club";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClubEvent } from "@/lib/firebase/club-workflows";
import {
  getClubByIdFromFirestore,
  getEventsForClub,
} from "@/lib/firebase/public-data";
import type { Club, EventItem } from "@/lib/types";

export function ClubEventsClient() {
  const { clubId, loading } = useManagedClub();
  const [club, setClub] = useState<Club | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadEvents(activeClubId: string) {
    const [nextClub, nextEvents] = await Promise.all([
      getClubByIdFromFirestore(activeClubId),
      getEventsForClub(activeClubId),
    ]);
    setClub(nextClub);
    setEvents(nextEvents);
  }

  useEffect(() => {
    let active = true;
    async function load() {
      if (!clubId) return;
      try {
        const [nextClub, nextEvents] = await Promise.all([
          getClubByIdFromFirestore(clubId),
          getEventsForClub(clubId),
        ]);
        if (active) {
          setClub(nextClub);
          setEvents(nextEvents);
        }
      } catch {
        if (active) setFeedback("Unable to load events.");
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [clubId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!clubId || !club) return;
    setSaving(true);
    setFeedback("");
    const form = new FormData(event.currentTarget);
    try {
      await createClubEvent({
        clubId,
        clubName: club.name,
        title: String(form.get("title") ?? "").trim(),
        description: String(form.get("description") ?? "").trim(),
        date: String(form.get("date") ?? ""),
        startTime: String(form.get("startTime") ?? ""),
        endTime: String(form.get("endTime") ?? ""),
        location: String(form.get("location") ?? "").trim(),
      });
      event.currentTarget.reset();
      await loadEvents(clubId);
      setFeedback("Event published to Firestore.");
    } catch {
      setFeedback("Unable to create the event.");
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return <p className="text-sm text-brand-muted">Loading club access...</p>;

  if (!clubId)
    return (
      <p className="text-sm text-red-600">
        No managed club is assigned to this account.
      </p>
    );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Events"
        title="Create and manage club events"
        description="Create event listings students can discover, save, and RSVP to."
      />
      <Card>
        <CardContent>
          <h2 className="font-display text-xl font-semibold text-brand-ink">
            Create event
          </h2>
          <form
            className="mt-4 grid gap-4 md:grid-cols-2"
            onSubmit={handleSubmit}
          >
            <Input name="title" placeholder="Event title" required />
            <Input name="location" placeholder="Location" required />
            <Input name="date" type="date" required />
            <Input name="startTime" type="time" required />
            <Input name="endTime" type="time" required />
            <textarea
              name="description"
              className="min-h-24 rounded-[12px] border border-brand-mist px-3.5 py-3 text-sm md:col-span-2"
              placeholder="Event description"
              required
            />
            <Button className="w-fit" type="submit" disabled={saving}>
              <Plus className="h-4 w-4" />
              {saving ? "Publishing..." : "Create event"}
            </Button>
          </form>
          {feedback ? (
            <p className="mt-3 text-sm font-medium text-brand-forest">
              {feedback}
            </p>
          ) : null}
        </CardContent>
      </Card>
      <section className="space-y-4">
        {events.map((item) => (
          <EventCard key={item.id} event={item} compact />
        ))}
      </section>
    </div>
  );
}