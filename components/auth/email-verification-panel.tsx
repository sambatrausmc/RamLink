"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, MailCheck, RefreshCcw, Send } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getWorkspaceHref } from "@/lib/auth-navigation";
import {
  logoutCurrentUser,
  reloadCurrentUser,
  resendCurrentUserVerification,
} from "@/lib/firebase/auth";

export function EmailVerificationPanel() {
  const router = useRouter();
  const { loading, profile, refreshProfile, refreshSession, user } = useAuth();
  const [verified, setVerified] = useState(Boolean(user?.emailVerified));
  const [feedback, setFeedback] = useState("");
  const [busyAction, setBusyAction] = useState<
    "refresh" | "resend" | "signout" | null
  >(null);

  useEffect(() => {
    if (user?.emailVerified || verified) {
      router.replace(getWorkspaceHref(profile?.role));
    }
  }, [profile?.role, router, user?.emailVerified, verified]);

  async function resendVerification() {
    setBusyAction("resend");
    setFeedback("");
    try {
      await resendCurrentUserVerification();
      setFeedback("A new verification email was sent.");
    } catch {
      setFeedback("Unable to resend the verification email. Please try again.");
    } finally {
      setBusyAction(null);
    }
  }

  async function refreshVerification() {
    setBusyAction("refresh");
    setFeedback("");
    try {
      const refreshedUser = await reloadCurrentUser();
      if (!refreshedUser?.emailVerified) {
        setFeedback(
          "Your email is not verified yet. Open the email link, then try again.",
        );
        return;
      }
      await refreshProfile();
      await refreshSession();
      setVerified(true);
    } catch {
      setFeedback("Unable to refresh verification status. Please try again.");
    } finally {
      setBusyAction(null);
    }
  }

  async function signOut() {
    setBusyAction("signout");
    await logoutCurrentUser();
    router.push("/login");
  }

  if (loading) {
    return <p className="text-sm text-brand-muted">Checking your account...</p>;
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-brand-muted">
          Sign in to verify your Farmingdale account.
        </p>
        <Link
          className="font-semibold text-brand-forest hover:underline"
          href="/login"
        >
          Return to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-[8px] bg-brand-surface p-4">
        <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-forest" />
        <p className="text-sm leading-6 text-brand-muted">
          We sent a verification link to{" "}
          <strong className="text-brand-ink">{user.email}</strong>.
        </p>
      </div>
      {feedback ? (
        <p className="text-sm font-medium text-brand-forest">{feedback}</p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          type="button"
          onClick={refreshVerification}
          disabled={busyAction !== null}
        >
          <RefreshCcw className="h-4 w-4" />
          {busyAction === "refresh" ? "Checking..." : "I verified my email"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={resendVerification}
          disabled={busyAction !== null}
        >
          <Send className="h-4 w-4" />
          {busyAction === "resend" ? "Sending..." : "Resend email"}
        </Button>
      </div>
      <button
        type="button"
        onClick={signOut}
        disabled={busyAction !== null}
        className="inline-flex items-center gap-2 text-sm font-semibold text-brand-muted hover:text-brand-forest"
      >
        <LogOut className="h-4 w-4" />
        Use a different account
      </button>
    </div>
  );
}

export function EmailVerificationCard() {
  return (
    <Card>
      <CardContent>
        <p className="text-sm font-semibold text-brand-green">
          Account verification
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-brand-ink">
          Verify your school email
        </h1>
        <p className="mb-6 mt-3 text-sm leading-6 text-brand-muted">
          Verification protects RamLink workspaces and confirms your Farmingdale
          account.
        </p>
        <EmailVerificationPanel />
      </CardContent>
    </Card>
  );
}
