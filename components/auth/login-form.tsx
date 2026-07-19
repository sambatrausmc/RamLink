"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth/auth-provider";
import { getSafeNextPath, getWorkspaceHref } from "@/lib/auth-navigation";
import { loginWithEmailAndPassword } from "@/lib/firebase/auth";

export function LoginForm() {
  const router = useRouter();
  const { loading, profile, refreshSession, sessionState, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function getRequestedWorkspace() {
    if (typeof window === "undefined") {
      return null;
    }
    return getSafeNextPath(
      new URLSearchParams(window.location.search).get("next"),
    );
  }

  useEffect(() => {
    if (!loading && user) {
      if (user.emailVerified && sessionState !== "ready") {
        return;
      }
      router.replace(
        user.emailVerified === false
          ? "/verify-email"
          : getRequestedWorkspace() ?? getWorkspaceHref(profile?.role),
      );
    }
  }, [loading, profile?.role, router, sessionState, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");
    setIsSubmitting(true);

    try {
      const nextUser = await loginWithEmailAndPassword({ email, password });
      if (nextUser.emailVerified) {
        await refreshSession();
      }
      router.push(
        nextUser.emailVerified
          ? getRequestedWorkspace() ?? "/dashboard"
          : "/verify-email",
      );
    } catch {
      setFeedback(
        "Unable to sign in. Check your email and password, then try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
      <label className="block">
        <span className="text-sm font-semibold text-brand-ink">
          School email
        </span>

        <Input
          className="mt-2"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          required
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-brand-ink">Password</span>

        <Input
          className="mt-2"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          required
        />
      </label>

      {feedback ? (
        <p className="text-sm font-medium text-brand-forest">{feedback}</p>
      ) : null}

      {sessionState === "error" && !feedback ? (
        <p className="text-sm font-medium text-brand-forest">
          Sign in again to renew your secure RamLink session.
        </p>
      ) : null}

      <Button className="w-full" type="submit" disabled={isSubmitting}>
        <LogIn className="h-4 w-4" />
        {isSubmitting ? "Signing in..." : "Sign In"}
      </Button>

      <Link
        href="/forgot-password"
        className="w-full text-sm font-semibold text-brand-forest hover:underline"
      >
        Forgot password?
      </Link>
    </form>
  );
}
