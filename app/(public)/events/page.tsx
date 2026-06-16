// pulling in standard next.js tools and lucide icons
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";

// grabbing the shared event card, hero layout, and badge components
import { EventCard } from "@/components/cards/event-card";
import { PageHero } from "@/components/common/page-hero";
import { Badge } from "@/components/ui/badge";

// grabbing our dummy data arrays
import { events, interests } from "@/lib/mock-data";

export default function EventsPage() {
    return (
        // standard background wrapper to match the rest of the app
        <div className="bg-brand-surface/70">
            {/* responsive container keeping everything centered */}
            <div className="mx-auto w-full max-w-[1180px] space-y-10 px-5 py-12 md:px-6 md:py-16">
                
                {/* main header section using the reusable PageHero component */}
                <PageHero
                    eyebrow="Campus Events"
                    title={
                        <>
                            See what&apos;s happening <span className="text-brand-forest">on campus.</span>
                        </>
                    }
                    description="Find meetings, workshops, deadlines, and activities hosted by student organizations."
                    actions={
                        <>
                            {/* button bouncing users back to the clubs directory */}
                            <Link
                                href="/clubs"
                                className="inline-flex items-center justify-center gap-2 rounded-[11px] bg-brand-forest px-5 py-3.5 text-[15px] font-semibold leading-none text-white shadow-[0_6px_16px_rgba(11,93,59,0.22)] transition hover:-translate-y-0.5 hover:bg-brand-forestDark"
                            >
                                Explore Clubs
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            {/* prompt to get unregistered users to sign up */}
                            <Link
                                href="/register"
                                className="inline-flex items-center justify-center rounded-[11px] border border-brand-mist bg-white px-5 py-3.5 text-[15px] font-semibold leading-none text-brand-forest transition hover:-translate-y-0.5 hover:border-brand-greenLight hover:bg-brand-surface"
                            >
                                Create Account
                            </Link>
                        </>
                    }
                    aside={
                        // side card that dynamically counts the total events in our mock data file
                        <div className="rounded-[22px] border border-brand-mist bg-white p-5 shadow-lift">
                            <div className="flex items-center gap-3">
                                <div className="grid h-12 w-12 place-items-center rounded-[14px] bg-amber-50 text-amber-600">
                                    <CalendarDays className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="font-display text-base font-semibold text-brand-ink">{events.length} upcoming events</p>
                                    <p className="text-sm text-brand-muted">Browse now, sign in when you are ready to RSVP.</p>
                                </div>
                            </div>
                        </div>
                    }
                />

                {/* quick filter section */}
                <section className="rounded-[22px] border border-brand-mist bg-white p-5 shadow-soft">
                    <p className="mb-3 text-sm font-semibold text-brand-green">Filter by interest</p>
                    <div className="flex flex-wrap gap-2">
                        {/* looping through the interests array to generate filter badges */}
                        {interests.map((interest) => (
                            <Badge key={interest.id} tone="green">
                                {interest.name}
                            </Badge>
                        ))}
                    </div>
                </section>

                {/* the actual events feed */}
                <section className="space-y-5">
                    <div>
                        <p className="text-sm font-semibold text-brand-green">Plan ahead</p>
                        <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-brand-ink">Upcoming events</h2>
                    </div>
                    {/* mapping over the events array and rendering our shared EventCard. 
                        setting actionMode to public so it renders the right buttons for unregistered users.
                    */}
                    {events.map((event) => (
                        <EventCard key={event.id} event={event} actionMode="public" />
                    ))}
                </section>
            </div>
        </div>
    );
}