import { ClubCard } from "@/components/cards/club-card";
import { PageHeader } from "@/components/common/page-header";
import { getClubs } from "@/lib/firebase/public-data";

export const dynamic = "force-dynamic";

export default async function AdminClubsPage() {
  const clubs = await getClubs();
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Clubs"
        title="Campus Club Records"
        description="Admin view of active club records, role access, and moderation status."
      />
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {clubs.map((club) => (
          <ClubCard key={club.id} club={club} showStatus />
        ))}
      </section>
    </div>
  );
}
