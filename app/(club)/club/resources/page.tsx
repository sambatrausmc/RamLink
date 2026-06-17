import { Plus } from "lucide-react";
import { ResourceCard } from "@/components/cards/resource-card";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { resources } from "@/lib/mock-data";
export default function ClubResourcesPage() {
  const clubResources = resources.filter(
    (resource) => resource.clubId === "cs-club",
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
          <h2 className="font-display text-xl font-semibold tracking-[-0.02em] text-brand-ink">
            Add resource
          </h2>
          <form className="mt-4 grid gap-4 md:grid-cols-2">
            <Input placeholder="Resource title" />
            <Input placeholder="Resource type" />
            <Input
              className="md:col-span-2"
              placeholder="Link or file reference"
            />
            <Button className="w-fit">
              <Plus className="h-4 w-4" />
              Add resource
            </Button>
          </form>
        </CardContent>
      </Card>
      <section className="space-y-4">
        {clubResources.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </section>
    </div>
  );
}
