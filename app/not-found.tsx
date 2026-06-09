import Link from "next/link";
export default function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-brand-surface px-4 text-brand-ink">
      <section className="max-w-md rounded-[22px] border border-brand-mist bg-white p-8 text-center shadow-lift">
        <p className="text-sm font-semibold text-brand-green">RamLink</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-[-0.02em] text-brand-ink">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-brand-muted">
          We could not find that page. Head back home to keep exploring campus life.
        </p>
        <Link
          href="/homepage"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-[11px] bg-brand-forest px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brand-forestDark"
        >
          Back to homepage
        </Link>
      </section>
    </main>
  );
}