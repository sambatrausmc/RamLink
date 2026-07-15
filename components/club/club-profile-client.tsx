"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Save } from "lucide-react";
import { useManagedClub } from "@/components/club/use-managed-club";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { updateClubProfile } from "@/lib/firebase/club-workflows";
import { getClubByIdFromFirestore } from "@/lib/firebase/public-data";
import type { Club, ClubCategory } from "@/lib/types";

const categories: ClubCategory[] = [
  "Academic",
  "Business",
  "Community Service",
  "Culture",
  "Health",
  "Leadership",
  "Recreation",
  "Technology",
];

export function ClubProfileClient() {
  const { clubId, loading } = useManagedClub();
  const [club, setClub] = useState<Club | null>(null);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (clubId)
      getClubByIdFromFirestore(clubId)
        .then(setClub)
        .catch(() => setFeedback("Unable to load the club profile."));
  }, [clubId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!clubId) return;
    setSaving(true);
    setFeedback("");
    const form = new FormData(event.currentTarget);
    try {
      await updateClubProfile(clubId, {
        name: String(form.get("name") ?? "").trim(),
        shortName: String(form.get("shortName") ?? "").trim(),
        category: String(form.get("category") ?? "Academic") as ClubCategory,
        description: String(form.get("description") ?? "").trim(),
        meetingSchedule: String(form.get("meetingSchedule") ?? "").trim(),
        meetingLocation: String(form.get("meetingLocation") ?? "").trim(),
        contactEmail: String(form.get("contactEmail") ?? "").trim(),
        tags: String(form.get("tags") ?? "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      });
      setClub(await getClubByIdFromFirestore(clubId));
      setFeedback("Club profile saved to Firestore.");
    } catch {
      setFeedback("Unable to save the club profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return <p className="text-sm text-brand-muted">Loading club profile...</p>;

  if (!clubId)
    return (
      <p className="text-sm text-red-600">
        No managed club is assigned to this account.
      </p>
    );

  if (!club)
    return <p className="text-sm text-brand-muted">Loading club profile...</p>;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Club Profile"
        title="Manage public club information"
        description="These fields update the public club profile students see."
      />
      <Card>
        <CardContent>
          <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
            <label>
              <span className="text-sm font-semibold text-brand-ink">
                Club name
              </span>
              <Input
                name="name"
                className="mt-2"
                defaultValue={club.name}
                required
              />
            </label>
            <label>
              <span className="text-sm font-semibold text-brand-ink">
                Short name
              </span>
              <Input
                name="shortName"
                className="mt-2"
                defaultValue={club.shortName}
                required
              />
            </label>
            <label>
              <span className="text-sm font-semibold text-brand-ink">
                Category
              </span>
              <select
                name="category"
                className="mt-2 h-11 w-full rounded-[12px] border border-brand-mist bg-white px-3.5 text-sm"
                defaultValue={club.category}
              >
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="text-sm font-semibold text-brand-ink">
                Contact email
              </span>
              <Input
                name="contactEmail"
                className="mt-2"
                type="email"
                defaultValue={club.contactEmail}
                required
              />
            </label>
            <label>
              <span className="text-sm font-semibold text-brand-ink">
                Meeting schedule
              </span>
              <Input
                name="meetingSchedule"
                className="mt-2"
                defaultValue={club.meetingSchedule}
                required
              />
            </label>
            <label>
              <span className="text-sm font-semibold text-brand-ink">
                Meeting location
              </span>
              <Input
                name="meetingLocation"
                className="mt-2"
                defaultValue={club.meetingLocation}
                required
              />
            </label>
            <label className="md:col-span-2">
              <span className="text-sm font-semibold text-brand-ink">
                Tags separated by commas
              </span>
              <Input
                name="tags"
                className="mt-2"
                defaultValue={club.tags.join(", ")}
              />
            </label>
            <label className="md:col-span-2">
              <span className="text-sm font-semibold text-brand-ink">
                Description
              </span>
              <textarea
                name="description"
                className="mt-2 min-h-32 w-full rounded-[12px] border border-brand-mist px-3.5 py-3 text-sm"
                defaultValue={club.description}
                required
              />
            </label>
            <Button className="w-fit" type="submit" disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </form>
          {feedback ? (
            <p className="mt-3 text-sm font-medium text-brand-forest">
              {feedback}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}