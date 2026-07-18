"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { AnnouncementCard } from "@/components/cards/announcement-card";
import { useManagedClub } from "@/components/club/use-managed-club";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  createClubAnnouncement,
  deleteClubAnnouncement,
  updateClubAnnouncement,
} from "@/lib/firebase/club-workflows";
import {
  getAnnouncementsForClub,
  getClubByIdFromFirestore,
} from "@/lib/firebase/public-data";
import type { Announcement, Club } from "@/lib/types";

export function ClubAnnouncementsClient() {
  const { clubId, loading } = useManagedClub();
  const [club, setClub] = useState<Club | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadAnnouncements(activeClubId: string) {
    const [nextClub, nextAnnouncements] = await Promise.all([
      getClubByIdFromFirestore(activeClubId),
      getAnnouncementsForClub(activeClubId),
    ]);
    setClub(nextClub);
    setAnnouncements(nextAnnouncements);
  }

  useEffect(() => {
    let active = true;
    async function load() {
      if (!clubId) return;
      try {
        const [nextClub, nextAnnouncements] = await Promise.all([
          getClubByIdFromFirestore(clubId),
          getAnnouncementsForClub(clubId),
        ]);
        if (active) {
          setClub(nextClub);
          setAnnouncements(nextAnnouncements);
        }
      } catch {
        if (active) setFeedback("Unable to load announcements.");
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
      await createClubAnnouncement({
        clubId,
        clubName: club.name,
        title: String(form.get("title") ?? "").trim(),
        body: String(form.get("body") ?? "").trim(),
        priority: form.get("priority") === "important" ? "important" : "normal",
      });
      event.currentTarget.reset();
      await loadAnnouncements(clubId);
      setFeedback("Announcement published to Firestore.");
    } catch {
      setFeedback("Unable to publish the announcement.");
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(
    formEvent: FormEvent<HTMLFormElement>,
    announcementId: string,
  ) {
    formEvent.preventDefault();
    if (!clubId) return;
    const form = new FormData(formEvent.currentTarget);
    try {
      await updateClubAnnouncement(announcementId, {
        title: String(form.get("title") ?? "").trim(),
        body: String(form.get("body") ?? "").trim(),
        priority: form.get("priority") === "important" ? "important" : "normal",
      });
      await loadAnnouncements(clubId);
      setFeedback("Announcement updated.");
    } catch {
      setFeedback("Unable to update the announcement.");
    }
  }

  async function handleDelete(announcementId: string) {
    if (!clubId || !window.confirm("Delete this announcement?")) return;
    try {
      await deleteClubAnnouncement(announcementId);
      await loadAnnouncements(clubId);
      setFeedback("Announcement deleted.");
    } catch {
      setFeedback("Unable to delete the announcement.");
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
        eyebrow="Announcements"
        title="Manage club announcements"
        description="Publish updates to the public club profile and student dashboard."
      />
      <Card>
        <CardContent>
          <h2 className="font-display text-xl font-semibold text-brand-ink">
            Create announcement
          </h2>
          <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
            <Input name="title" placeholder="Announcement title" required />
            <textarea
              name="body"
              className="min-h-24 rounded-[12px] border border-brand-mist px-3.5 py-3 text-sm"
              placeholder="Write a concise club update"
              required
            />
            <label className="flex items-center gap-2 text-sm text-brand-ink">
              <input name="priority" type="checkbox" value="important" />
              Mark as important
            </label>
            <Button className="w-fit" type="submit" disabled={saving}>
              <Plus className="h-4 w-4" />
              {saving ? "Publishing..." : "Publish announcement"}
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
        {announcements.map((item) => (
          <div key={item.id} className="space-y-3">
            <AnnouncementCard announcement={item} />
            <details className="rounded-[12px] border border-brand-mist bg-white p-4">
              <summary className="cursor-pointer text-sm font-semibold text-brand-forest">
                Edit announcement
              </summary>
              <form
                className="mt-4 grid gap-3"
                onSubmit={(event) => handleEdit(event, item.id)}
              >
                <Input name="title" defaultValue={item.title} required />
                <textarea
                  name="body"
                  defaultValue={item.body}
                  className="min-h-24 rounded-[12px] border border-brand-mist px-3.5 py-3 text-sm"
                  required
                />
                <label className="flex items-center gap-2 text-sm text-brand-ink">
                  <input
                    name="priority"
                    type="checkbox"
                    value="important"
                    defaultChecked={item.priority === "important"}
                  />
                  Mark as important
                </label>
                <Button className="w-fit" size="sm" type="submit">
                  <Pencil className="h-4 w-4" /> Update announcement
                </Button>
              </form>
            </details>
            <Button size="sm" variant="outline" onClick={() => handleDelete(item.id)}>
              <Trash2 className="h-4 w-4" /> Delete announcement
            </Button>
          </div>
        ))}
      </section>
    </div>
  );
}