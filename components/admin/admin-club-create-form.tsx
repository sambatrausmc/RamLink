"use client";
import { type FormEvent, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClubRecord } from "@/lib/firebase/admin-workflows";
import type { ClubCategory } from "@/lib/types";

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

export function AdminClubCreateForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [category, setCategory] = useState<ClubCategory>("Academic");
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  // Submits the new club data to Firestore as a pending record
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFeedback("");
    try {
      await createClubRecord({ name, shortName, category, description, contactEmail });
      setName("");
      setShortName("");
      setDescription("");
      setContactEmail("");
      setFeedback("Pending club record created.");
      onCreated();
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "Unable to create this club record.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
      <label className="text-sm font-semibold text-brand-ink">
        Club name
        <Input className="mt-2" value={name} onChange={(event) => setName(event.target.value)} required />
      </label>
      <label className="text-sm font-semibold text-brand-ink">
        Short name
        <Input className="mt-2" value={shortName} onChange={(event) => setShortName(event.target.value)} required />
      </label>
      <label className="text-sm font-semibold text-brand-ink">
        Category
        <select
          className="mt-2 h-11 w-full rounded-[12px] border border-brand-mist bg-white px-3.5 text-sm"
          value={category}
          onChange={(event) => setCategory(event.target.value as ClubCategory)}
        >
          {categories.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
      <label className="text-sm font-semibold text-brand-ink">
        Contact email
        <Input className="mt-2" type="email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} required />
      </label>
      <label className="text-sm font-semibold text-brand-ink md:col-span-2">
        Description
        <textarea
          className="mt-2 min-h-28 w-full rounded-[12px] border border-brand-mist bg-white p-3.5 text-sm outline-none focus:border-brand-green"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
        />
      </label>
      <div className="flex flex-wrap items-center gap-3 md:col-span-2">
        <Button type="submit" disabled={saving}>
          <Plus className="h-4 w-4" />
          {saving ? "Creating..." : "Create club record"}
        </Button>
        {feedback ? <p className="text-sm font-medium text-brand-forest">{feedback}</p> : null}
      </div>
    </form>
  );
}
