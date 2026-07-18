"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { registerStudentAccount } from "@/lib/firebase/auth";
import { getWorkspaceHref } from "@/lib/auth-navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RegisterForm() {
  const router = useRouter();
  const { loading, profile, user } = useAuth();

  // Track all three input fields
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace(getWorkspaceHref(profile?.role));
    }
  }, [loading, profile?.role, router, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Pass the form data over to our auth helper to create the account AND the database doc
      await registerStudentAccount({ displayName, email, password });

      // Success! Open the new student's dashboard.
      router.push("/dashboard");
    } catch {
      // Something went wrong (email already in use, password too weak, etc.)
      setError("Unable to create account. Check the form and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
      <label className="block">
        <span className="text-sm font-semibold text-brand-ink">Full name</span>
        <Input
          className="mt-2"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          required
        />
      </label>
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
        {/* Enforce a minimum length because Firebase Auth requires at least 6 characters */}
        <Input
          className="mt-2"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          minLength={6}
          required
        />
      </label>

      {error ? (
        <p className="text-sm font-medium text-red-600">{error}</p>
      ) : null}

      <Button className="w-full" type="submit" disabled={isSubmitting}>
        <UserPlus className="h-4 w-4" />
        {isSubmitting ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
}
