"use client";
import Link from "next/link";
import { useEffect } from "react";
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  CalendarDays,
  Check,
  Music,
  Search,
  Users,
  Wrench,
} from "lucide-react";
const features = [
  {
    title: "Discover Clubs",
    description: "Browse student organizations that match your interests.",
    icon: Search,
    gradient: "from-brand-greenLight to-brand-forest",
  },
  {
    title: "Find Events",
    description: "See what is happening on campus this week.",
    icon: CalendarDays,
    gradient: "from-brand-goldLight to-brand-gold",
  },
  {
    title: "Join Communities",
    description: "Connect with students who share your passions.",
    icon: Users,
    gradient: "from-brand-green to-brand-forestDark",
  },
];
const steps = [
  { label: "Browse", detail: "Explore clubs and events across campus.", icon: Search },
  { label: "Save", detail: "Keep track of the ones you love.", icon: Bookmark },
  { label: "Join", detail: "Become part of the community.", icon: Check },
];
const previewClubs = [
  {
    name: "Robotics Club",
    meta: "Engineering - 48 members",
    status: "Open",
    icon: Wrench,
    gradient: "from-brand-greenLight to-brand-forest",
    statusTone: "bg-brand-mist text-brand-green",
  },
  {
    name: "Music & Arts",
    meta: "Creative - 72 members",
    status: "Popular",
    icon: Music,
    gradient: "from-brand-goldLight to-brand-gold",
    statusTone: "bg-[#FBEFCB] text-[#9A7000]",
  },
  {
    name: "Honors Society",
    meta: "Academic - 35 members",
    status: "Open",
    icon: BookOpen,
    gradient: "from-brand-green to-brand-forestDark",
    statusTone: "bg-brand-mist text-brand-green",
  },
];
export default function HomePage() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(".ram-reveal"));
    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("ram-reveal-in"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("ram-reveal-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -40px 0px" },
    );
    elements.forEach((element) => observer.observe(element));
    const fallback = window.setTimeout(() => {
      elements.forEach((element) => element.classList.add("ram-reveal-in"));
    }, 2500);
    return () => {
      window.clearTimeout(fallback);
      observer.disconnect();
    };
  }, []);
  return (
    <>
      <section className="relative overflow-hidden py-16 md:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_70%_at_85%_0%,rgba(24,168,86,0.1),transparent_60%),radial-gradient(50%_60%_at_8%_90%,rgba(240,180,41,0.1),transparent_60%)]"
        />
        <div className="relative mx-auto grid w-full max-w-[1180px] items-center gap-14 px-5 md:px-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="animate-fade-up inline-flex items-center gap-2 rounded-full bg-brand-mist py-2 pl-3 pr-4 text-[13px] font-semibold text-brand-green">
              <span className="h-2 w-2 rounded-full bg-brand-greenLight shadow-[0_0_0_4px_rgba(24,168,86,0.18)]" />
              Farmingdale State College
            </span>
            <h1 className="animate-fade-up mt-5 max-w-[10ch] font-display text-[clamp(40px,6vw,66px)] font-semibold leading-[1.08] tracking-[-0.02em] text-brand-ink">
              Find your place <span className="text-brand-forest">on campus.</span>
            </h1>
            <p className="animate-fade-up mt-5 max-w-[30ch] text-[clamp(17px,2.1vw,20px)] leading-relaxed text-brand-muted">
              Discover clubs, events, and student communities at Farmingdale.
            </p>
            <div className="animate-fade-up mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/clubs"
                className="inline-flex items-center justify-center gap-2 rounded-[11px] bg-brand-forest px-5 py-3.5 text-[15px] font-semibold leading-none text-white shadow-[0_6px_16px_rgba(11,93,59,0.22)] transition hover:-translate-y-0.5 hover:bg-brand-forestDark hover:shadow-[0_10px_24px_rgba(11,93,59,0.3)]"
              >
                <Search className="h-4 w-4" />
                Explore Clubs
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-[11px] border border-brand-mist bg-white px-5 py-3.5 text-[15px] font-semibold leading-none text-brand-forest transition hover:-translate-y-0.5 hover:border-brand-greenLight hover:bg-brand-surface"
              >
                Create Account
              </Link>
            </div>
            <div className="animate-fade-up mt-7 flex items-center gap-3 text-sm text-brand-muted">
              <div className="flex">
                {[
                  ["A", "bg-brand-green"],
                  ["M", "bg-brand-greenLight"],
                  ["J", "bg-brand-gold"],
                  ["+", "bg-brand-forest"],
                ].map(([label, color], index) => (
                  <span
                    key={label}
                    className={`grid h-8 w-8 place-items-center rounded-full border-2 border-white text-xs font-bold text-white ${color}`}
                    style={{ marginLeft: index === 0 ? 0 : -9 }}
                  >
                    {label}
                  </span>
                ))}
              </div>
              Join students already getting involved
            </div>
          </div>
          <HeroPreview />
        </div>
      </section>
      <section className="bg-brand-surface py-20 md:py-24">
        <div className="mx-auto w-full max-w-[1180px] px-5 md:px-6">
          <SectionHeading kicker="Everything in one place" title="One link to campus life" />
          <div className="grid gap-5 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className="ram-reveal rounded-[22px] border border-brand-mist bg-white p-8 transition hover:-translate-y-1.5 hover:border-transparent hover:shadow-lift"
                >
                  <div className={`grid h-[52px] w-[52px] place-items-center rounded-[14px] bg-gradient-to-br ${feature.gradient} text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 font-display text-[21px] font-semibold tracking-[-0.02em] text-brand-ink">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-[15.5px] leading-relaxed text-brand-muted">{feature.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <section className="py-20 md:py-24">
        <div className="mx-auto w-full max-w-[1180px] px-5 md:px-6">
          <SectionHeading kicker="How it works" title="Get involved in three steps" />
          <div className="relative grid gap-10 md:grid-cols-3 md:gap-6">
            <div
              aria-hidden="true"
              className="absolute left-[16%] right-[16%] top-8 hidden h-px bg-[repeating-linear-gradient(90deg,#E8F1EC_0_9px,transparent_9px_18px)] md:block"
            />
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <article key={step.label} className="ram-reveal relative z-10 text-center">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-brand-mist bg-white text-brand-forest shadow-soft">
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="mt-5 text-xs font-bold uppercase tracking-[0.1em] text-brand-gold">
                    Step {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 font-display text-xl font-semibold tracking-[-0.02em] text-brand-ink">
                    {step.label}
                  </h3>
                  <p className="mx-auto mt-2 max-w-[24ch] text-[15px] leading-relaxed text-brand-muted">{step.detail}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <section className="px-5 pb-24 pt-10 md:px-6">
        <div className="mx-auto w-full max-w-[1180px]">
          <div className="ram-reveal relative overflow-hidden rounded-[28px] bg-gradient-to-br from-brand-forest to-brand-forestDark px-6 py-14 text-center shadow-[0_18px_50px_rgba(7,61,39,0.16)] md:px-10 md:py-20">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_80%_at_90%_10%,rgba(240,180,41,0.2),transparent_60%),radial-gradient(40%_80%_at_5%_100%,rgba(24,168,86,0.3),transparent_60%)]"
            />
            <div className="relative">
              <h2 className="font-display text-[clamp(30px,4.5vw,48px)] font-semibold tracking-[-0.02em] text-white">
                Ready to get involved?
              </h2>
              <p className="mt-3 text-lg text-brand-mist/85">Your campus community is waiting.</p>
              <Link
                href="/clubs"
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-[11px] bg-brand-goldLight px-7 py-4 text-base font-semibold leading-none text-brand-forestDark shadow-[0_6px_16px_rgba(212,154,0,0.24)] transition hover:-translate-y-0.5 hover:bg-brand-gold hover:shadow-[0_10px_24px_rgba(212,154,0,0.32)]"
              >
                Start Exploring
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[440px] [perspective:1400px] lg:max-w-none">
      <div className="animate-floaty absolute -right-5 -top-7 z-10 hidden items-center gap-3 rounded-[14px] border border-brand-mist bg-white px-4 py-3 shadow-lift sm:flex">
        <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-gradient-to-br from-brand-goldLight to-brand-gold text-white">
          <CalendarDays className="h-5 w-5" />
        </div>
        <div>
          <strong className="block font-display text-sm font-semibold tracking-[-0.02em]">
            Fall Club Fair
          </strong>
          <span className="text-xs text-brand-muted">Thu - Campus Green</span>
        </div>
      </div>
      <div className="animate-floaty motion-delay-1600 absolute -bottom-7 -left-7 z-10 hidden items-center gap-3 rounded-[14px] border border-brand-mist bg-white px-4 py-3 shadow-lift sm:flex">
        <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-gradient-to-br from-brand-greenLight to-brand-forest text-white">
          <Check className="h-5 w-5" />
        </div>
        <div>
          <strong className="block font-display text-sm font-semibold tracking-[-0.02em]">
            You&apos;re in!
          </strong>
          <span className="text-xs text-brand-muted">Robotics Club</span>
        </div>
      </div>
      <div className="relative rounded-[22px] border border-brand-mist bg-white p-4 shadow-[0_18px_50px_rgba(7,61,39,0.16)] lg:[transform:rotateY(-6deg)_rotateX(3deg)]">
        <div className="mb-4 flex items-center justify-between border-b border-brand-surface px-1 pb-4">
          <span className="font-display text-[15px] font-semibold tracking-[-0.02em]">
            Discover Clubs
          </span>
          <span className="inline-flex items-center gap-2 rounded-lg bg-brand-surface px-3 py-2 text-xs text-brand-muted">
            <Search className="h-3.5 w-3.5" />
            Search clubs...
          </span>
        </div>
        <div className="grid gap-2.5">
          {previewClubs.map((club) => {
            const Icon = club.icon;
            return (
              <div
                key={club.name}
                className="grid grid-cols-[46px_1fr_auto] items-center gap-3 rounded-[13px] border border-brand-surface bg-white p-3 transition hover:-translate-y-0.5 hover:border-brand-mist hover:shadow-sm"
              >
                <span className={`grid h-[46px] w-[46px] place-items-center rounded-[11px] bg-gradient-to-br ${club.gradient} text-white`}>
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="font-display text-[15px] font-semibold tracking-[-0.02em]">
                    {club.name}
                  </h4>
                  <span className="text-xs text-brand-muted">{club.meta}</span>
                </div>
                <span className={`rounded-full px-3 py-1.5 text-[11.5px] font-semibold ${club.statusTone}`}>
                  {club.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
function SectionHeading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="ram-reveal mx-auto mb-14 max-w-2xl text-center">
      <p className="mb-3 text-[13px] font-bold uppercase tracking-[0.08em] text-brand-gold">{kicker}</p>
      <h2 className="font-display text-[clamp(30px,4vw,44px)] font-semibold leading-tight tracking-[-0.02em] text-brand-ink">
        {title}
      </h2>
    </div>
  );
}
