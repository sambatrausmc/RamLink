"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { EventCard } from "@/components/cards/event-card";
import { useManagedClub } from "@/components/club/use-managed-club";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toEventDateInputValue } from "@/lib/event-format";
import {
  createClubEvent,
  deleteClubEvent,
  updateClubEvent,
} from "@/lib/firebase/club-workflows";
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

  async function handleEdit(
    formEvent: FormEvent<HTMLFormElement>,
    eventId: string,
  ) {
    formEvent.preventDefault();
    if (!clubId) return;
    const form = new FormData(formEvent.currentTarget);
    try {
      await updateClubEvent(eventId, {
        title: String(form.get("title") ?? "").trim(),
        description: String(form.get("description") ?? "").trim(),
        date: String(form.get("date") ?? ""),
        startTime: String(form.get("startTime") ?? ""),
        endTime: String(form.get("endTime") ?? ""),
        location: String(form.get("location") ?? "").trim(),
      });
      await loadEvents(clubId);
      setFeedback("Event updated.");
    } catch {
      setFeedback("Unable to update the event.");
    }
  }

  async function handleDelete(eventId: string) {
    if (!clubId || !window.confirm("Delete this event?")) return;
    try {
      await deleteClubEvent(eventId);
      await loadEvents(clubId);
      setFeedback("Event deleted.");
    } catch {
      setFeedback("Unable to delete the event.");
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
          <div key={item.id} className="space-y-3">
            <EventCard event={item} compact />
            <details className="rounded-[12px] border border-brand-mist bg-white p-4">
              <summary className="cursor-pointer text-sm font-semibold text-brand-forest">
                Edit event
              </summary>
              <form
                className="mt-4 grid gap-3 md:grid-cols-2"
                onSubmit={(event) => handleEdit(event, item.id)}
              >
                <Input name="title" defaultValue={item.title} required />
                <Input name="location" defaultValue={item.location} required />
                <Input
                  name="date"
                  type="date"
                  defaultValue={toEventDateInputValue(item.date)}
                  required
                />
                <Input
                  name="startTime"
                  defaultValue={item.startTime}
                  placeholder="5:00 PM"
                  required
                />
                <Input
                  name="endTime"
                  defaultValue={item.endTime}
                  placeholder="7:00 PM"
                  required
                />
                <textarea
                  name="description"
                  defaultValue={item.description}
                  className="min-h-24 rounded-[12px] border border-brand-mist px-3.5 py-3 text-sm md:col-span-2"
                  required
                />
                <Button className="w-fit" size="sm" type="submit">
                  <Pencil className="h-4 w-4" /> Update event
                </Button>
              </form>
            </details>
            <Button size="sm" variant="outline" onClick={() => handleDelete(item.id)}>
              <Trash2 className="h-4 w-4" /> Delete event
            </Button>
          </div>
        ))}
      </section>
    </div>
  );
}
