import { Plus } from "lucide-react";
import { AnnouncementCard } from "@/components/cards/announcement-card";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { announcements } from "@/lib/mock-data";
export default function ClubAnnouncementsPage() {
  const clubAnnouncements = announcements.filter(
    (announcement) => announcement.clubId === "cs-club",
  );
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Announcements"
        title="Manage club announcements"
        description="Announcements appear on the club profile and relevant student homepages."
      />
      <Card>
        <CardContent>
          <h2 className="font-display text-xl font-semibold tracking-[-0.02em] text-brand-ink">
            Create announcement
          </h2>
          <form className="mt-4 grid gap-4">
            <Input placeholder="Announcement title" />
            <textarea
              className="min-h-24 rounded-[12px] border border-brand-mist bg-white px-3.5 py-3 text-sm text-brand-ink outline-none transition placeholder:text-brand-muted/70 focus:border-brand-greenfocus:ring-2 focus:ring-brand-green/15"
              placeholder="Write a concise club update"
            />
            <Button className="w-fit">
              <Plus className="h-4 w-4" />
              Publish announcement
            </Button>
          </form>
        </CardContent>
      </Card>
      <section className="space-y-4">
        {clubAnnouncements.map((announcement) => (
          <AnnouncementCard key={announcement.id} announcement={announcement} />
        ))}
      </section>
    </div>
  );
}
