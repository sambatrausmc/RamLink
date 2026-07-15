import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, Mail, MapPin, Users } from "lucide-react";
import { AnnouncementCard } from "@/components/cards/announcement-card";
import { EventCard } from "@/components/cards/event-card";
import { ResourceCard } from "@/components/cards/resource-card";
import { ClubProfileActions } from "@/components/club/club-profile-actions";
import { PageHero } from "@/components/common/page-hero";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
getAnnouncementsForClub,
getClubByIdFromFirestore,
getEventsForClub,
getResourcesForClub,
} from "@/lib/firebase/public-data";

type ClubProfilePageProps = {
params: Promise<{ clubId: string }>;
};
export const dynamic = "force-dynamic";
export default async function ClubProfilePage({
params,
}: ClubProfilePageProps) {
const { clubId } = await params;
const club = await getClubByIdFromFirestore(clubId);
if (!club) {
notFound();
}
const [clubEvents, clubAnnouncements, clubResources] = await Promise.all([
  getEventsForClub(club.id),
  getAnnouncementsForClub(club.id),
  getResourcesForClub(club.id),
]);

return (
  <div className="bg-brand-surface/70">
    <div className="mx-auto w-full max-w-[1180px] space-y-10 px-5 py-12 md:px-6 md:py-16">
      <PageHero
        eyebrow={club.category}
        title={club.name}
        description={club.description}
        actions={
          <>
  <Link
    href="/login"
    className={`
      inline-flex items-center justify-center gap-2 rounded-[11px]
      bg-brand-forest px-5 py-3.5 text-[15px] font-semibold leading-none
      text-white shadow-[0_6px_16px_rgba(11,93,59,0.22)] transition
      hover:-translate-y-0.5 hover:bg-brand-forestDark
    `}
  >
    Sign in to join
    <ArrowRight className="h-4 w-4" />
  </Link>
  <Link
    href="/register"
    className={`
      inline-flex items-center justify-center rounded-[11px] border
      border-brand-mist bg-white px-5 py-3.5 text-[15px] font-semibold
      leading-none text-brand-forest transition hover:-translate-y-0.5
      hover:border-brand-greenLight hover:bg-brand-surface
    `}
  >
    Create Account
  </Link>
  </>
}
aside={
  <div className="rounded-[22px] border border-brand-mist bg-white p-5 shadow-lift">
    <div
      className={`
        grid h-16 w-16 place-items-center rounded-[18px]
        bg-brand-mist font-display text-xl font-semibold
        text-brand-forest
      `}
    >
      {club.shortName}
    </div>

    <div className="mt-4 space-y-2 text-sm text-brand-muted">
      <p className="flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-brand-green" />
        {club.meetingSchedule}
      </p>
       <p className="flex items-center gap-2">
         <MapPin className="h-4 w-4 text-brand-green" />
         {club.meetingLocation}
       </p>
       <p className="flex items-center gap-2">
         <Users className="h-4 w-4 text-brand-green" />
         {club.memberCount} members
       </p>
      </div>
     </div>
    }
/>
<section className="grid gap-6 xl:grid-cols-[1fr_360px]">
  <div className="space-y-6">
    <Card>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {club.tags.map((tag) => (
            <Badge key={tag} tone="slate">
              {tag}
            </Badge>
          ))}
        </div>
        <p className="mt-5 flex items-center gap-2 text-sm text-brand-muted">
          <Mail className="h-4 w-4 text-brand-green" />
          {club.contactEmail}
        </p>
      </CardContent>
    </Card>
                        {/* upcoming events list */}
                       <section className="space-y-4">
                         <h2 className="font-display text-2xl font-semibold text-brand-ink">
                           Upcoming events
                         </h2>

                         {clubEvents.length ? (
                           clubEvents.map((event) => (
                             <EventCard
                               key={event.id}
                               event={event}
                               actionMode="public"
                             />
                           ))
                         ) : (
                           <Card>
                             <CardContent>
                               <p className="text-sm text-brand-muted">
                                 No upcoming events are listed yet.
                               </p>
                             </CardContent>
                           </Card>
                         )}
                       </section>

                        {/* forms and resources list */}
                        <section className="space-y-4">
                            <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-brand-ink">Forms and resources</h2>
                            {/* same empty state logic here for resources */}
                            {clubResources.length ? (
                                clubResources.map((resource) => <ResourceCard key={resource.id} resource={resource} />)
                            ) : (
                                <Card>
                                    <CardContent>
                                        <p className="text-sm text-brand-muted">No resources are listed yet.</p>
                                    </CardContent>
                                </Card>
                            )}
                        </section>
                    </div>

                    {/* RIGHT COLUMN */}
                    <aside className="space-y-6">
                        {/* Mocked student action panel for join requests and official club questions. */}
                        <ClubProfileActions club={club} />

                        {/* big green call-to-action box to encourage signups */}
                        <Card className="bg-brand-forest text-white">
                            <CardContent>
                                <h2 className="font-display text-xl font-semibold">Sign in to join or save this club.</h2>
                                <p className="mt-2 text-sm leading-6 text-brand-mist/85">
                                    Create an account to request membership, save clubs, and follow updates.
                                </p>
                                <Link
                                    href="/login"
                                    className="mt-5 inline-flex items-center justify-center rounded-[11px] bg-brand-goldLight px-4 py-3 text-sm font-semibold leading-none text-brand-forestDark transition hover:-translate-y-0.5 hover:bg-brand-gold"
                                >
                                    Sign In
                                </Link>
                            </CardContent>
                        </Card>

                        {/* latest club announcements feed */}
                        <section className="space-y-4">
                            <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-brand-ink">Recent updates</h2>
                            {clubAnnouncements.map((announcement) => (
                                <AnnouncementCard key={announcement.id} announcement={announcement} />
                            ))}
                        </section>
                    </aside>

                </section>
            </div>
        </div>
    );
}
