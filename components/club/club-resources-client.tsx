"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { ResourceCard } from "@/components/cards/resource-card";
import { useManagedClub } from "@/components/club/use-managed-club";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  createClubResource,
  deleteClubResource,
  parseResourceType,
  updateClubResource,
} from "@/lib/firebase/club-workflows";
import { getResourcesForClub } from "@/lib/firebase/public-data";
import type { Resource } from "@/lib/types";

export function ClubResourcesClient() {
  const { clubId, loading } = useManagedClub();
  const [resources, setResources] = useState<Resource[]>([]);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadResources(activeClubId: string) {
    setResources(await getResourcesForClub(activeClubId));
  }

  async function refreshAfterMutation(
    activeClubId: string,
    successMessage: string,
  ) {
    try {
      await loadResources(activeClubId);
      setFeedback(successMessage);
    } catch {
      setFeedback(`${successMessage} Reload the page to refresh the list.`);
    }
  }

  useEffect(() => {
    let active = true;
    async function load() {
      if (!clubId) return;
      try {
        const nextResources = await getResourcesForClub(clubId);
        if (active) setResources(nextResources);
      } catch {
        if (active) setFeedback("Unable to load resources.");
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [clubId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!clubId) return;
    setSaving(true);
    setFeedback("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      await createClubResource({
        clubId,
        title: String(form.get("title") ?? "").trim(),
        description: String(form.get("description") ?? "").trim(),
        type: parseResourceType(String(form.get("type") ?? "Link")),
        url: String(form.get("url") ?? "").trim(),
      });
      formElement.reset();
      await refreshAfterMutation(clubId, "Resource saved to Firestore.");
    } catch {
      setFeedback("Unable to add the resource.");
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(
    formEvent: FormEvent<HTMLFormElement>,
    resourceId: string,
  ) {
    formEvent.preventDefault();
    if (!clubId) return;
    const form = new FormData(formEvent.currentTarget);
    try {
      await updateClubResource(resourceId, clubId, {
        title: String(form.get("title") ?? "").trim(),
        description: String(form.get("description") ?? "").trim(),
        type: parseResourceType(String(form.get("type") ?? "Link")),
        url: String(form.get("url") ?? "").trim(),
      });
      await refreshAfterMutation(clubId, "Resource updated.");
    } catch {
      setFeedback("Unable to update the resource.");
    }
  }

  async function handleDelete(resourceId: string) {
    if (!clubId || !window.confirm("Delete this resource?")) return;
    try {
      await deleteClubResource(resourceId, clubId);
      await refreshAfterMutation(clubId, "Resource deleted.");
    } catch {
      setFeedback("Unable to delete the resource.");
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
        eyebrow="Resources"
        title="Manage forms and resources"
        description="Share forms, guides, links, and documents with students."
      />
      <Card>
        <CardContent>
          <h2 className="font-display text-xl font-semibold text-brand-ink">
            Add resource
          </h2>
          <form
            className="mt-4 grid gap-4 md:grid-cols-2"
            onSubmit={handleSubmit}
          >
            <Input name="title" placeholder="Resource title" required />
            <select
              name="type"
              className="h-11 rounded-[12px] border border-brand-mist bg-white px-3.5 text-sm text-brand-ink"
            >
              <option>Link</option>
              <option>Form</option>
              <option>Waiver</option>
              <option>Guide</option>
              <option>Document</option>
            </select>
            <Input
              name="url"
              className="md:col-span-2"
              type="url"
              placeholder="https://example.com/resource"
              required
            />
            <textarea
              name="description"
              className="min-h-24 rounded-[12px] border border-brand-mist px-3.5 py-3 text-sm md:col-span-2"
              placeholder="Resource description"
              required
            />
            <Button className="w-fit" type="submit" disabled={saving}>
              <Plus className="h-4 w-4" />
              {saving ? "Saving..." : "Add resource"}
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
        {resources.map((resource) => (
          <div key={resource.id} className="space-y-3">
            <ResourceCard resource={resource} />
            <details className="rounded-[12px] border border-brand-mist bg-white p-4">
              <summary className="cursor-pointer text-sm font-semibold text-brand-forest">
                Edit resource
              </summary>
              <form
                className="mt-4 grid gap-3 md:grid-cols-2"
                onSubmit={(event) => handleEdit(event, resource.id)}
              >
                <Input name="title" defaultValue={resource.title} required />
                <select
                  name="type"
                  defaultValue={resource.type}
                  className="h-11 rounded-[12px] border border-brand-mist bg-white px-3.5 text-sm"
                >
                  <option>Link</option>
                  <option>Form</option>
                  <option>Waiver</option>
                  <option>Guide</option>
                  <option>Document</option>
                </select>
                <Input name="url" type="url" defaultValue={resource.url} required />
                <textarea
                  name="description"
                  defaultValue={resource.description}
                  className="min-h-24 rounded-[12px] border border-brand-mist px-3.5 py-3 text-sm md:col-span-2"
                  required
                />
                <Button className="w-fit" size="sm" type="submit">
                  <Pencil className="h-4 w-4" /> Update resource
                </Button>
              </form>
            </details>
            <Button size="sm" variant="outline" onClick={() => handleDelete(resource.id)}>
              <Trash2 className="h-4 w-4" /> Delete resource
            </Button>
          </div>
        ))}
      </section>
    </div>
  );
}
