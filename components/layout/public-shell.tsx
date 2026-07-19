"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Menu, UserRound, X } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { RamLinkLogo } from "@/components/brand/ramlink-logo";
import { getProfileHref, getWorkspaceHref } from "@/lib/auth-navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Clubs", href: "/clubs" },
  { label: "Events", href: "/events" },
  { label: "About", href: "/about" },
];
export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { loading, profile, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const needsVerification = user?.emailVerified === false;
  const workspaceHref = needsVerification
    ? "/verify-email"
    : getWorkspaceHref(profile?.role);
  const profileHref = needsVerification
    ? "/verify-email"
    : getProfileHref(profile?.role);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <div className="min-h-screen bg-white text-brand-ink">
      <header
        className={cn(
          "sticky top-0 z-50 border-b backdrop-blur-xl transition-all duration-300",
          scrolled
            ? "border-brand-mist bg-white/92 shadow-sm"
            : "border-transparent bg-white/82",
        )}
      >
        <div className="mx-auto flex h-[72px] w-full max-w-[1180px] items-center justify-between px-5 md:px-6">
          <RamLinkLogo />
          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Public navigation"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3.5 py-2 text-[15px] font-medium transition hover:bg-brand-surface hover:text-brand-forest",
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "text-brand-forest"
                    : "text-brand-ink",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-1.5">
            {!loading && user ? (
              <>
                <Link
                  href={workspaceHref}
                  className="hidden items-center gap-2 rounded-lg px-3.5 py-3 text-[15px] font-semibold text-brand-forest transition hover:bg-brand-surface sm:inline-flex"
                >
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
                <Link
                  href={profileHref}
                  aria-label="Open profile"
                  className="grid h-10 w-10 place-items-center rounded-full bg-brand-forest text-white transition hover:bg-brand-forestDark"
                >
                  <UserRound className="h-5 w-5" />
                </Link>
              </>
            ) : !loading ? (
              <>
                <Link
                  href="/login"
                  className="hidden rounded-lg px-3.5 py-3 text-[15px] font-semibold transition hover:text-brand-forest sm:inline-flex"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-[11px] bg-brand-forest px-3.5 py-3 text-sm font-semibold leading-none text-white shadow-[0_6px_16px_rgba(11,93,59,0.22)] transition hover:-translate-y-0.5 hover:bg-brand-forestDark hover:shadow-[0_10px_24px_rgba(11,93,59,0.3)] sm:px-5 sm:text-[15px]"
                >
                  Create Account
                </Link>
              </>
            ) : (
              <span className="hidden text-sm font-medium text-brand-muted sm:inline">
                Checking session...
              </span>
            )}
            <button
              aria-label="Menu"
              aria-expanded={menuOpen}
              className="grid h-10 w-10 place-items-center rounded-[10px] border border-brand-mist text-brand-ink md:hidden"
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
        {menuOpen ? (
          <div className="border-t border-brand-mist bg-white py-3 md:hidden">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-6 py-3 text-base font-medium hover:bg-brand-surface hover:text-brand-forest"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="grid gap-2 px-6 pb-2 pt-3">
              {!loading && user ? (
                <>
                  <Link
                    href={workspaceHref}
                    className="inline-flex items-center justify-center gap-2 rounded-[11px] bg-brand-forest px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-brand-forestDark"
                    onClick={() => setMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                  <Link
                    href={profileHref}
                    className="inline-flex items-center justify-center gap-2 rounded-[11px] border border-brand-mist bg-white px-5 py-3 text-[15px] font-semibold text-brand-forest transition hover:bg-brand-surface"
                    onClick={() => setMenuOpen(false)}
                  >
                    <UserRound className="h-4 w-4" /> My Profile
                  </Link>
                </>
              ) : !loading ? (
                <>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-[11px] border border-brand-mist bg-white px-5 py-3 text-[15px] font-semibold text-brand-forest transition hover:bg-brand-surface"
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center rounded-[11px] bg-brand-forest px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-brand-forestDark"
                    onClick={() => setMenuOpen(false)}
                  >
                    Create Account
                  </Link>
                </>
              ) : null}
            </div>
          </div>
        ) : null}
      </header>
      <main>{children}</main>
      <PublicFooter
        isAuthenticated={Boolean(user)}
        isLoading={loading}
        profileHref={profileHref}
        workspaceHref={workspaceHref}
      />
    </div>
  );
}
function PublicFooter({
  isAuthenticated,
  isLoading,
  profileHref,
  workspaceHref,
}: {
  isAuthenticated: boolean;
  isLoading: boolean;
  profileHref: string;
  workspaceHref: string;
}) {
  return (
    <footer className="border-t border-brand-mist bg-white py-10 md:py-12">
      <div className="mx-auto w-full max-w-[1180px] px-5 md:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <RamLinkLogo />
            <p className="mt-3 text-sm leading-6 text-brand-muted">
              Discover clubs, events, and student communities at Farmingdale
              State College.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            <FooterColumn
              title="Explore"
              links={[
                ["Clubs", "/clubs"],
                ["Events", "/events"],
                ["About", "/about"],
              ]}
            />
            <FooterColumn
              title="Account"
              links={
                isLoading
                  ? ([["Help", "/about"]] as [string, string][])
                  : isAuthenticated
                    ? ([
                        ["Dashboard", workspaceHref],
                        ["Profile", profileHref],
                        ["Help", "/about"],
                      ] as [string, string][])
                    : ([
                        ["Sign In", "/login"],
                        ["Create Account", "/register"],
                        ["Help", "/about"],
                      ] as [string, string][])
              }
            />
            <FooterColumn
              title="College"
              links={[
                ["Farmingdale", "https://www.farmingdale.edu"],
                ["Student Life", "/about"],
                ["Contact", "/about"],
              ]}
            />
          </div>
        </div>
        <div className="mt-9 flex flex-col gap-4 border-t border-brand-surface pt-6 text-sm text-brand-muted sm:flex-row sm:items-center sm:justify-between">
          <span>Copyright 2026 RamLink - Farmingdale State College</span>
          <div className="flex gap-6">
            <Link href="/about" className="transition hover:text-brand-forest">
              Privacy
            </Link>
            <Link href="/about" className="transition hover:text-brand-forest">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <h5 className="mb-3 font-display text-xs font-semibold uppercase tracking-[0.04em] text-brand-ink">
        {title}
      </h5>
      {links.map(([label, href]) => (
        <Link
          key={`${title}-${label}`}
          href={href}
          className="block py-1 text-sm text-brand-muted transition hover:text-brand-forest"
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
