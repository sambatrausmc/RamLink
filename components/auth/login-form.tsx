"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { loginWithEmailAndPassword } from "@/lib/firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  // Grab the Next.js router so we can redirect them after a successful login
  const router = useRouter();
  
  // Setup our state to hold what the user is typing in the boxes
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // Stop the browser from doing a full page refresh (classic form behavior)
    event.preventDefault();
    
    // Clear out any old errors and turn on the loading state
    setError("");
    setIsSubmitting(true);
    
    try {
      // Fire off the login request to our auth helper function
      await loginWithEmailAndPassword({ email, password });
      
      // If it works, boot them over to their profile page!
      router.push("/profile");
    } catch {
      // If Firebase yells at us (bad password, etc.), catch it and show a friendly error
      setError("Unable to sign in. Check your email and password, then try again.");
    } finally {
      // Turn off the loading state whether it succeeded or failed
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
      
      {/* Conditionally render the error message only if one exists */}
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      
      <Button className="w-full" type="submit" disabled={isSubmitting}>
        <LogIn className="h-4 w-4" />
        {/* Swap the button text if we are waiting for Firebase to respond */}
        {isSubmitting ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}