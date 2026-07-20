import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function VerificationCompletePage() {
  return (
    <main className="mx-auto w-full max-w-lg px-5 py-16">
      <Card>
        <CardContent className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-greenPale text-brand-forest">
            <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="mt-5 text-sm font-semibold text-brand-green">
            Email verified
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-brand-ink">
            Return to your original RamLink tab
          </h1>
          <p className="mt-3 text-sm leading-6 text-brand-muted">
            Select <strong>I verified my email</strong> in the original tab to
            finish signing in. You may close this window afterward.
          </p>
          <div className="mt-6 rounded-[8px] bg-brand-surface p-4 text-sm text-brand-muted">
            Original tab closed?{" "}
            <Link
              className="font-semibold text-brand-forest hover:underline"
              href="/login"
            >
              Continue to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
