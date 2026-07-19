"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/components/auth/auth-provider";
import type { UserRole } from "@/lib/types";

type RoleGateProps = {
  allowedRoles: UserRole[];
  children: ReactNode;
};

export function RoleGate({ allowedRoles, children }: RoleGateProps) {
  const {
    loading,
    profile,
    profileStatus,
    refreshProfile,
    sessionState,
    user,
  } = useAuth();
  const role = profile?.role ?? "student";

  // Show a loading card while Firebase verifies authentication status
  if (loading) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-brand-muted">Checking your RamLink access...</p>
        </CardContent>
      </Card>
    );
  }

  // Prompt the user to log in if no authenticated Firebase user exists
  if (!user) {
    return (
      <Card>
        <CardContent>
          <h1 className="font-display text-2xl font-semibold text-brand-ink">Sign in required</h1>
          <p className="mt-2 text-sm leading-6 text-brand-muted">
            Please sign in before opening this RamLink workspace.
          </p>
          <Link
            href="/login"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-[11px] bg-brand-forest px-4 text-sm font-semibold leading-none text-white transition hover:-translate-y-0.5 hover:bg-brand-forestDark"
          >
            Sign in
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (user.emailVerified === false) {
    return (
      <Card>
        <CardContent>
          <h1 className="font-display text-2xl font-semibold text-brand-ink">
            Verify your school email
          </h1>
          <p className="mt-2 text-sm leading-6 text-brand-muted">
            Confirm your Farmingdale email before opening a RamLink workspace.
          </p>
          <Link
            href="/verify-email"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-[11px] bg-brand-forest px-4 text-sm font-semibold leading-none text-white transition hover:bg-brand-forestDark"
          >
            Verify account
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (sessionState === "error") {
    return (
      <Card>
        <CardContent>
          <h1 className="font-display text-2xl font-semibold text-brand-ink">
            Secure session expired
          </h1>
          <p className="mt-2 text-sm leading-6 text-brand-muted">
            Sign in again before opening this RamLink workspace.
          </p>
          <Link
            href="/login"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-[11px] bg-brand-forest px-4 text-sm font-semibold leading-none text-white transition hover:bg-brand-forestDark"
          >
            Sign in again
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (profileStatus === "loading" || profileStatus === "missing") {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-brand-muted">
            Preparing your RamLink profile...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (profileStatus === "error") {
    return (
      <Card>
        <CardContent>
          <h1 className="font-display text-2xl font-semibold text-brand-ink">
            Profile unavailable
          </h1>
          <p className="mt-2 text-sm leading-6 text-brand-muted">
            RamLink could not load your account data. Your placeholder profile
            was not displayed.
          </p>
          <button
            type="button"
            onClick={() => void refreshProfile()}
            className="mt-5 text-sm font-semibold text-brand-forest hover:underline"
          >
            Try again
          </button>
        </CardContent>
      </Card>
    );
  }

  // Restrict access if the user's assigned role is not included in the allowedRoles array
  if (!allowedRoles.includes(role)) {
    return (
      <Card>
        <CardContent>
          <h1 className="font-display text-2xl font-semibold text-brand-ink">Access not available</h1>
          <p className="mt-2 text-sm leading-6 text-brand-muted">
            Your current RamLink account does not have permission to open this workspace.
          </p>
          <Link
            href="/dashboard"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-[11px] border border-brand-mist bg-white px-4 text-sm font-semibold leading-none text-brand-forest transition hover:-translate-y-0.5 hover:bg-brand-surface"
          >
            Return to dashboard
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Render the protected workspace pages if permissions are valid
  return <>{children}</>;
}
