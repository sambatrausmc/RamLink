import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { ClubDirectoryClient } from "@/components/public/club-directory-client";
import { PageHero } from "@/components/common/page-hero";
import { getClubs, getInterests } from "@/lib/firebase/public-data";
export const dynamic = "force-dynamic";
export default async function ClubsPage() {
const [clubs, interests] = await Promise.all([getClubs(), getInterests()]);
return (
       <div className="bg-brand-surface/70">
       <div className="bg-brand-surface/70">
       <div className="mx-auto w-full max-w-[1180px] space-y-10 px-5 py-12 md:px-6 md:py-16">
       <PageHero
       eyebrow="Club Directory"
       title={
       <>
           </>
           }
           description="Browse student organizations, compare meeting times, and find the campus groups that fit you."
           actions={
           <>
           <Link
           href="/register"
           className={`
           inline-flex items-center justify-center gap-2 rounded-[11px]
           bg-brand-forest px-5 py-3.5 text-[15px] font-semibold leading-none
           text-white shadow-[0_6px_16px_rgba(11,93,59,0.22)] transition
           hover:-translate-y-0.5 hover:bg-brand-forestDark
           `}
               >
               Create Account
               <ArrowRight className="h-4 w-4" />
               </Link>
               <Link
               href="/events"
               className={`
               inline-flex items-center justify-center rounded-[11px] border
               border-brand-mist bg-white px-5 py-3.5 text-[15px] font-semibold
               leading-none text-brand-forest transition hover:-translate-y-0.5
               hover:border-brand-greenLight hover:bg-brand-surface
               `}

                    description="Browse student organizations, compare meeting times, and find the campus groups that fit you."
                    actions={
                        <>
                            {/* Primary call to action for unregistered students */}
                            <Link
                                href="/register"
                                className="inline-flex items-center justify-center gap-2 rounded-[11px] bg-brand-forest px-5 py-3.5 text-[15px] font-semibold leading-none text-white shadow-[0_6px_16px_rgba(11,93,59,0.22)] transition hover:-translate-y-0.5 hover:bg-brand-forestDark"
                            >
                                Create Account
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            {/* Secondary action to navigate to the events discovery page */}
                            <Link
                                href="/events"
                                className="inline-flex items-center justify-center rounded-[11px] border border-brand-mist bg-white px-5 py-3.5 text-[15px] font-semibold leading-none text-brand-forest transition hover:-translate-y-0.5 hover:border-brand-greenLight hover:bg-brand-surface"
                            >
                                View Events
                            </Link>
                        </>
                    }
                    aside={
                    // Quick stats card displayed alongside the hero text. 
                    // Dynamically pulls the total club count from our mock data.
                        <div className="rounded-[22px] border border-brand-mist bg-white p-5 shadow-lift">
                            <div className="flex items-center gap-3">
                                <div className="grid h-12 w-12 place-items-center rounded-[14px] bg-brand-mist text-brand-forest">
                                    <Users className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="font-display text-base font-semibold text-brand-ink">{clubs.length} active clubs</p>
                                    <p className="text-sm text-brand-muted">Across academics, service, business, and more.</p>
                                </div>
                            </div>
                        </div>
                    }
                />

                {/* Search & Filter Section: 
                  Provides the discovery controls for students to narrow down the club list. 
                */}
                <section className="rounded-[22px] border border-brand-mist bg-white p-5 shadow-soft">
                    <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                        
                        {/* Text search input utilizing the shared Input primitive */}
                        <label className="relative block">
                            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-green" />
                            <Input className="pl-10" placeholder="Search clubs by name, category, or interest..." />
                        </label>

                        {/* Interest filters: 
                          Slices the first 5 interests from our mock data and renders them as Badges.
                        */}
                        <div className="flex flex-wrap gap-2">
                            {interests.slice(0, 5).map((interest) => (
                                <Badge key={interest.id} tone="green">
                                    {interest.name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Directory Listing Section: 
                  The main grid displaying all available campus clubs.
                */}
                <section>
                    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-brand-green">Explore</p>
                            <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-brand-ink">All clubs</h2>
                        </div>
                        <p className="text-sm text-brand-muted">Sign in to save clubs or request to join.</p>
                    </div>
                    
                    {/* Responsive grid layout: 
                      1 column on mobile, 2 on medium screens, 3 on extra-large screens.
                    */}
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {/* Iterates through the imported mock clubs array to render individual cards */}
                        {clubs.map((club) => (
                            <ClubCard key={club.id} club={club} />
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
}