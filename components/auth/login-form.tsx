"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  loginWithEmailAndPassword,
  resetPasswordForEmail,
} from "@/lib/firebase/auth";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");
    setIsSubmitting(true);

    try {
      await loginWithEmailAndPassword({ email, password });
      router.push("/profile");
    } catch {
      setFeedback(
        "Unable to sign in. Check your email and password, then try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePasswordReset() {
    if (!email.trim()) {
      setFeedback(
        "Enter your school email before requesting a password reset.",
      );
      return;
    }

    setIsResetting(true);
    setFeedback("");

    try {
      await resetPasswordForEmail(email.trim());
      setFeedback("Password reset email sent.");
    } catch {
      setFeedback("Unable to send a password reset email.");
    } finally {
      setIsResetting(false);
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
        <span className="text-sm font-semibold text-brand-ink">
          Password
        </span>

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

      <Button className="w-full" type="submit" disabled={isSubmitting}>
        <LogIn className="h-4 w-4" />
        {isSubmitting ? "Signing in..." : "Sign In"}
      </Button>

      <button
        type="button"
        className="w-full text-sm font-semibold text-brand-forest hover:underline"
        onClick={handlePasswordReset}
        disabled={isResetting}
      >
        {isResetting ? "Sending reset email..." : "Forgot password?"}
      </button>
    </form>
  );
}