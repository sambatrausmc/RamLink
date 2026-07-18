"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MailCheck, Trash2 } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  deleteCurrentAccount,
  sendCurrentUserVerification,
} from "@/lib/firebase/account-actions";

export function AccountSettingsClient() {
  const router = useRouter();
  const { user } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [feedback, setFeedback] = useState("");
  const [working, setWorking] = useState(false);

  // Sends an identity verification email to the user
  async function sendVerification() {
    setWorking(true);
    setFeedback("");
    try {
      await sendCurrentUserVerification();
      setFeedback("Verification email sent. Check your inbox.");
    } catch {
      setFeedback("Unable to send a verification email right now.");
    } finally {
      setWorking(false);
    }
  }

  // Reauthenticates the user before requesting permanent account deletion
  async function deleteAccount() {
    if (!password || confirmation !== "DELETE") return;
    setWorking(true);
    setFeedback("");
    try {
      await deleteCurrentAccount(password);
      router.push("/homepage");
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "Unable to delete your account. Sign in again and retry.",
      );
      setWorking(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Account"
        title="Account Settings"
        description="Verify your school email or permanently remove your RamLink account."
      />
      {feedback ? <p className="text-sm font-medium text-brand-forest">{feedback}</p> : null}
      <Card>
        <CardHeader>
          <h2 className="font-display text-xl font-semibold text-brand-ink">Email verification</h2>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-brand-ink">{user?.email}</p>
            <p className="mt-1 text-sm text-brand-muted">
              {user?.emailVerified ? "This email is verified." : "This email is not verified yet."}
            </p>
          </div>
          <Button variant="outline" disabled={!user || user.emailVerified || working} onClick={sendVerification}>
            <MailCheck className="h-4 w-4" /> Send verification email
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <h2 className="font-display text-xl font-semibold text-red-700">Delete account</h2>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-brand-muted">
            This permanently removes your login and RamLink profile data. Enter your current password and type DELETE to confirm.
          </p>
          <div className="mt-4 flex max-w-md flex-col gap-3">
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Current password"
              aria-label="Current password"
            />
            <Input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="Type DELETE" />
            <Button variant="danger" disabled={!password || confirmation !== "DELETE" || working} onClick={deleteAccount}>
              <Trash2 className="h-4 w-4" /> Delete account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
