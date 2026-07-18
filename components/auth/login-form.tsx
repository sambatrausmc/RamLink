"use client";
import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Login } from "lucide-react";
import { loginWithEmailAndPassword } from "@/lib/firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await loginWithEmailAndPassword({ email, password });
      router.push("/profile");
    } catch {
      setError("Unable to sign in. Check your email and password, then try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
      <label className="block">
        <span className="text-sm font-semibold text-brand-ink">School email</span>
        <Input className="mt-2" value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-brand-ink">Password</span>
        <Input className="mt-2" value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
      </label>
      <Link className="block text-right text-sm font-semibold text-brand-forest" href="/forgot-password">
        Forgot password?
      </Link>
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      <Button className="w-full" type="submit" disabled={isSubmitting}>
        <Login className="h-4 w-4" />
        {isSubmitting ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}
