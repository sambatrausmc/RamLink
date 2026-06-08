import { type ReactNode } from "react";

type PageHeroProps = {
  eyebrow?: string;
  title: ReactNode;
  description: string;
  actions?: ReactNode;
  aside?: ReactNode;
};
export function PageHero({ eyebrow, title, description, actions, aside }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-brand-mist bg-white px-6 py-12 shadow-[0_1px_2px_rgba(7,61,39,0.04),0_18px_50px_rgba(7,61,39,0.08)] md:px-10 md:py-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_80%_at_88%_0%,rgba(24,168,86,0.1),transparent_62%),radial-gradient(45%_70%_at_8%_100%,rgba(240,180,41,0.12),transparent_62%)]"
      />
      <div className="relative grid gap-8 lg:grid-cols-[1fr_0.75fr] lg:items-center">
        <div>
          {eyebrow ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-mist px-3.5 py-2 text-[13px] font-semibold text-brand-green">
              <span className="h-2 w-2 rounded-full bg-brand-greenLight shadow-[0_0_0_4px_rgba(24,168,86,0.16)]" />
              {eyebrow}
            </span>
          ) : null}
          <h1 className="mt-5 max-w-[12ch] font-display text-[clamp(34px,5vw,56px)] font-semibold leading-[1.08] tracking-[-0.02em] text-brand-ink">
            {title}
          </h1>
          <p className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-brand-muted md:text-lg">
            {description}
          </p>
          {actions ? <div className="mt-8 flex flex-col gap-3 sm:flex-row">{actions}</div> : null}
        </div>
        {aside ? <div className="relative">{aside}</div> : null}
      </div>
    </section>
  );
}
