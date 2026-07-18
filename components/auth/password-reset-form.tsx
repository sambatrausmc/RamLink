"use client";
import { type FormEvent, useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPasswordForEmail } from "@/lib/firebase/auth";

export function PasswordResetForm() {
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setFeedback("");
    try {
      await resetPasswordForEmail(email.trim());
      setFeedback("Check your email for a password reset link.");
    } catch {
      setFeedback("Unable to send a reset email. Check the address and try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
      <label className="block">
        <span className="text-sm font-semibold text-brand-ink">School email</span>
        <Input
          className="mt-2"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          required
        />
      </label>
      {feedback ? <p className="text-sm font-medium text-brand-forest">{feedback}</p> : null}
      <Button className="w-full" type="submit" disabled={sending}>
        <Mail className="h-4 w-4" />
        {sending ? "Sending..." : "Send reset email"}
      </Button>
      <Link className="block text-center text-sm font-semibold text-brand-forest" href="/login">
        Return to sign in
      </Link>
    </form>
  );
}
