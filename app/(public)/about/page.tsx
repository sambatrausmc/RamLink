import Link from "next/link";
import { ArrowRight, CalendarDays, Search, Users } from "lucide-react";
import { PageHero } from "@/components/common/page-hero";

const points = [
  {
    title: "Discover campus groups",
    description: "Find student organizations by interest, category, and meeting schedule.",
    icon: Search,
  },
  {
    title: "Follow events",
    description: "See what clubs are hosting and keep track of events you want to attend.",
    icon: CalendarDays,
  },
  {
    title: "Join communities",
    description: "Create an account when you are ready to save clubs or request membership.",
    icon: Users,
  },
];

export default function AboutPage() {
  return (
    <div className="bg-brand-surface/70">
      <div className="mx-auto w-full max-w-[1180px] space-y-10 px-5 py-12 md:px-6 md:py-16">
        <PageHero
          eyebrow="About RamLink"
          title={
            <>
              A simple way to find your <span className="text-brand-forest">campus circle.</span>
            </>
          }
          description="RamLink helps Farmingdale students discover clubs, events, and student communities without digging through scattered updates."
          actions={
            <>
              <Link
                href="/clubs"
                className="inline-flex items-center justify-center gap-2 rounded-[11px] bg-brand-forest px-5 py-3.5 text-[15px] font-semibold leading-none text-white shadow-[0_6px_16px_rgba(11,93,59,0.22)] transition hover:-translate-y-0.5 hover:bg-brand-forestDark"
              >
                Explore Clubs
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-[11px] border border-brand-mist bg-white px-5 py-3.5 text-[15px] font-semibold leading-none text-brand-forest transition hover:-translate-y-0.5 hover:border-brand-greenLight hover:bg-brand-surface"
              >
                Create Account
              </Link>
            </>
          }
        />

        <section className="grid gap-5 md:grid-cols-3">
          {points.map((point) => {
            const Icon = point.icon;
            return (
              <article
                key={point.title}
                className="rounded-[22px] border border-brand-mist bg-white p-7 shadow-soft transition hover:-translate-y-1 hover:shadow-lift"
              >
                <div className="grid h-12 w-12 place-items-center rounded-[14px] bg-brand-mist text-brand-forest">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mt-5 font-display text-xl font-semibold tracking-[-0.02em] text-brand-ink">
                  {point.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-brand-muted">{point.description}</p>
              </article>
            );
          })}
        </section>

        <section className="rounded-[28px] bg-brand-forest px-6 py-12 text-center text-white shadow-lift md:px-10 md:py-16">
          <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] md:text-4xl">
            Ready to get involved?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-mist/85">
            Start by browsing clubs, then create an account when you want to save, RSVP, or join.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/clubs"
              className="inline-flex items-center justify-center rounded-[11px] bg-brand-goldLight px-5 py-3.5 text-sm font-semibold leading-none text-brand-forestDark transition hover:-translate-y-0.5 hover:bg-brand-gold"
            >
              Browse Clubs
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-[11px] border border-white/20 bg-white/10 px-5 py-3.5 text-sm font-semibold leading-none text-white transition hover:-translate-y-0.5 hover:bg-white/15"
            >
              Create Account
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}