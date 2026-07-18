"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { RamLinkLogo } from "@/components/brand/ramlink-logo";
import { useAuth } from "@/components/auth/auth-provider";
import { logoutCurrentUser } from "@/lib/firebase/auth";

export type WorkspaceNavItem = {
  label: string;
  href: string;
};
type WorkspaceShellProps = {
  roleLabel: string;
  navItems: WorkspaceNavItem[];
  children: React.ReactNode;
};
export function WorkspaceShell({ roleLabel, navItems, children }: WorkspaceShellProps) {
  const router = useRouter();
  const { profile } = useAuth();
const [signingOut, setSigningOut] = useState(false);
const initials =
  profile?.displayName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "RL";
    async function handleSignOut() {
      setSigningOut(true);

      try {
        await logoutCurrentUser();
        router.push("/login");
      } finally {
        setSigningOut(false);
      }
    }
  return (
    <div className="min-h-screen bg-brand-surface text-brand-ink">
      <header className="sticky top-0 z-50 border-b border-brand-mist bg-white/92 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[74px] w-full max-w-[1180px] items-center justify-between gap-4 px-5 md:px-6">
          <div className="flex items-center gap-3">
            <RamLinkLogo />
            <span className="hidden rounded-full bg-brand-mist px-3 py-1.5 text-xs font-semibold text-brand-forest sm:inline-flex">
              {roleLabel}
            </span>
          </div>
          <nav className="hidden items-center gap-1 lg:flex" aria-label={`${roleLabel} navigation`}>
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-semibold transition",
                    active ? "bg-brand-mist text-brand-forest" : "text-brand-muted hover:bg-brand-surface hover:text-brand-forest",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/homepage" className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-brand-muted transition hover:bg-brand-surface hover:text-brand-forest md:inline-flex">
              Public Site
            </Link>
            <span className="hidden h-9 w-9 place-items-center rounded-full bg-brand-forest text-sm font-bold text-white md:grid">
              {initials}
            </span>
            <button
              type="button"
              className="hidden h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-brand-muted hover:bg-brand-surface md:inline-flex"
              onClick={handleSignOut}
              disabled={signingOut}
            >
              <LogOut className="h-4 w-4" />
              {signingOut ? "Signing out..." : "Sign out"}
            </button>
            <button
              type="button"
              aria-label="Menu"
              aria-expanded={menuOpen}
              className="grid h-10 w-10 place-items-center rounded-[10px] border border-brand-mist bg-white text-brand-ink lg:hidden"
              onClick={() => setMenuOpen((value) => !value)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {menuOpen ? (
          <div className="border-t border-brand-mist bg-white px-5 py-3 lg:hidden">
            <div className="mx-auto grid w-full max-w-[1180px] gap-1">
              {navItems.map((item) => {
                const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "rounded-lg px-3 py-2.5 text-sm font-semibold transition",
                      active ? "bg-brand-mist text-brand-forest" : "text-brand-muted hover:bg-brand-surface hover:text-brand-forest",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link href="/homepage" className="rounded-lg px-3 py-2.5 text-sm font-semibold text-brand-muted hover:bg-brand-surface hover:text-brand-forest" onClick={() => setMenuOpen(false)}>
                Public Site
              </Link>
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
