"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { getWorkspaceHref } from "@/lib/auth-navigation";

type SessionAwareLinkProps = {
  className: string;
  signedInContent?: ReactNode;
  signedOutContent: ReactNode;
  signedOutHref: string;
};

export function SessionAwareLink({
  className,
  signedInContent = "Dashboard",
  signedOutContent,
  signedOutHref,
}: SessionAwareLinkProps) {
  const { loading, profile, user } = useAuth();

  if (loading) {
    return <span className={className}>Checking session...</span>;
  }

  return (
    <Link
      className={className}
      href={user ? getWorkspaceHref(profile?.role) : signedOutHref}
    >
      {user ? signedInContent : signedOutContent}
    </Link>
  );
}

export function SignedOutOnly({ children }: { children: ReactNode }) {
  const { loading, user } = useAuth();
  return loading || user ? null : <>{children}</>;
}
