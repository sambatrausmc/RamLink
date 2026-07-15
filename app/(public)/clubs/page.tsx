import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { ClubDirectoryClient } from "@/components/public/club-directory-client";
import { PageHero } from "@/components/common/page-hero";
import { getClubs, getInterests } from "@/lib/firebase/public-data";

export const dynamic = "force-dynamic";

export default async function ClubsPage() {
  const [clubs, interests] = await Promise.all([
    getClubs(),
    getInterests(),
  ]);

  return (
    // Main page wrapper
    <div className="bg-brand-surface/70">
      <div className="mx-auto w-full max-w-[1180px] space-y-10 px-5 py-12 md:px-6 md:py-16">
        {/* Club directory hero */}
        <PageHero
          eyebrow="Club Directory"
          title={
            <>
              Find your <span className="text-brand-forest">community.</span>
            </>
          }
          description="Browse student organizations, compare meeting times, and find the campus groups that fit you."
          actions={
            <>
              {/* Create account action */}
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

              {/* Events navigation action */}
              <Link
                href="/events"
                className={`
                  inline-flex items-center justify-center rounded-[11px] border
                  border-brand-mist bg-white px-5 py-3.5 text-[15px] font-semibold
                  leading-none text-brand-forest transition hover:-translate-y-0.5
                  hover:border-brand-greenLight hover:bg-brand-surface
                `}
              >
                View Events
              </Link>
            </>
          }
          aside={
            /* Active club count */
            <div className="rounded-[22px] border border-brand-mist bg-white p-5 shadow-lift">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-[14px] bg-brand-mist text-brand-forest">
                  <Users className="h-6 w-6" />
                </div>

                <div>
                  <p className="font-display text-base font-semibold text-brand-ink">
                    {clubs.length} active clubs
                  </p>
                  <p className="text-sm text-brand-muted">
                    Across academics, service, business, and more.
                  </p>
                </div>
              </div>
            </div>
          }
        />

        {/* Club directory listing */}
        <section>
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-brand-green">
                Explore
              </p>
              <h2 className="font-display text-3xl font-semibold text-brand-ink">
                All clubs
              </h2>
            </div>

            <p className="text-sm text-brand-muted">
              Sign in to save clubs or request to join.
            </p>
          </div>

          <ClubDirectoryClient clubs={clubs} interests={interests} />
        </section>
      </div>
    </div>
  );
}