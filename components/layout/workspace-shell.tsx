"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Menu, UserRound, X } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { RamLinkLogo } from "@/components/brand/ramlink-logo";
import { logoutCurrentUser } from "@/lib/firebase/auth";
import { cn } from "@/lib/utils";

export type WorkspaceNavItem = {
  label: string;
  href: string;
};
type WorkspaceShellProps = {
  roleLabel: string;
  navItems: WorkspaceNavItem[];
  children: React.ReactNode;
};

export function getAccountInitials(displayName: string) {
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((namePart) => namePart[0])
    .join("")
    .toUpperCase();

  return initials || "RL";
}

export function WorkspaceShell({
  roleLabel,
  navItems,
  children,
}: WorkspaceShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const displayName =
    profile?.displayName ||
    user?.displayName ||
    user?.email ||
    "RamLink account";
  const initials = getAccountInitials(displayName);
  const profileHref =
    profile?.role === "clubOfficer" || roleLabel === "Club Officer Mode"
      ? "/club/profile"
      : profile?.role === "admin" || roleLabel === "Admin Mode"
        ? "/admin/users"
        : "/profile";

  async function handleSignOut() {
    setSigningOut(true);

    try {
      await logoutCurrentUser();
      setAccountOpen(false);
      setMenuOpen(false);
      router.push("/login");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-surface text-brand-ink">
      <header className="sticky top-0 z-50 border-b border-brand-mist bg-white/92 backdrop-blur-xl">
        <div
          className={`mx-auto flex min-h-[74px] w-full max-w-[1180px] items-center justify-between gap-4 px-5 md:px-6`}
        >
          <div className="flex items-center gap-3">
            <RamLinkLogo />
            <span
              className={`hidden rounded-full bg-brand-mist px-3 py-1.5 text-xs font-semibold text-brand-forest sm:inline-flex`}
            >
              {roleLabel}
            </span>
          </div>

          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label={`${roleLabel} navigation`}
          >
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(`${item.href}/`));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-semibold transition",
                    active
                      ? "bg-brand-mist text-brand-forest"
                      : "text-brand-muted hover:bg-brand-surface hover:text-brand-forest",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="relative flex items-center gap-2">
            <Link
              href="/homepage"
              className={`hidden rounded-lg px-3 py-2 text-sm font-semibold text-brand-muted transition hover:bg-brand-surface hover:text-brand-forest md:inline-flex`}
            >
              Public Site
            </Link>

            <button
              type="button"
              className="hidden h-9 w-9 place-items-center rounded-full bg-brand-forest text-sm font-bold text-white md:grid"
              title={displayName}
              aria-label="Open account menu"
              aria-expanded={accountOpen}
              onClick={() => setAccountOpen((value) => !value)}
            >
              {initials}
            </button>
            {accountOpen ? (
              <div className="absolute right-0 top-12 z-50 hidden w-60 rounded-[12px] border border-brand-mist bg-white p-2 shadow-lift md:block">
                <div className="border-b border-brand-surface px-3 py-2">
                  <p className="truncate text-sm font-semibold text-brand-ink">
                    {displayName}
                  </p>
                  <p className="text-xs text-brand-muted">{roleLabel}</p>
                </div>
                <Link
                  href={profileHref}
                  className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-brand-muted hover:bg-brand-surface hover:text-brand-forest"
                  onClick={() => setAccountOpen(false)}
                >
                  <UserRound className="h-4 w-4" /> Profile
                </Link>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-brand-muted hover:bg-brand-surface hover:text-brand-forest"
                  onClick={handleSignOut}
                  disabled={signingOut}
                >
                  <LogOut className="h-4 w-4" />
                  {signingOut ? "Signing out..." : "Sign out"}
                </button>
              </div>
            ) : null}

            <button
              type="button"
              aria-label="Menu"
              aria-expanded={menuOpen}
              className={`grid h-10 w-10 place-items-center rounded-[10px] border border-brand-mist bg-white text-brand-ink lg:hidden`}
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
          <div className="border-t border-brand-mist bg-white px-5 py-3 lg:hidden">
            <div className="mx-auto grid w-full max-w-[1180px] gap-1">
              {navItems.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(`${item.href}/`));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "rounded-lg px-3 py-2.5 text-sm font-semibold transition",
                      active
                        ? "bg-brand-mist text-brand-forest"
                        : "text-brand-muted hover:bg-brand-surface hover:text-brand-forest",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <Link
                href="/homepage"
                className={`rounded-lg px-3 py-2.5 text-sm font-semibold text-brand-muted hover:bg-brand-surface hover:text-brand-forest`}
                onClick={() => setMenuOpen(false)}
              >
                Public Site
              </Link>

              <div className="mt-2 border-t border-brand-mist pt-2">
                <p className="px-3 py-1 text-xs font-semibold text-brand-muted">
                  {displayName}
                </p>
                <Link
                  href={profileHref}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-brand-muted hover:bg-brand-surface hover:text-brand-forest"
                  onClick={() => setMenuOpen(false)}
                >
                  <UserRound className="h-4 w-4" /> Profile
                </Link>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-brand-muted hover:bg-brand-surface hover:text-brand-forest"
                  onClick={handleSignOut}
                  disabled={signingOut}
                >
                  <LogOut className="h-4 w-4" />
                  {signingOut ? "Signing out..." : "Sign out"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </header>

      <main className="mx-auto w-full max-w-[1180px] px-5 py-8 md:px-6 md:py-10">
        {children}
      </main>
    </div>
  );
}
