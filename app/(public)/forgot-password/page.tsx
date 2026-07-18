import { PasswordResetForm } from "@/components/auth/password-reset-form";
import { Card, CardContent } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto w-full max-w-md px-5 py-16">
      <Card>
        <CardContent>
          <p className="text-sm font-semibold text-brand-green">Account recovery</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-brand-ink">Reset your password</h1>
          <p className="mt-3 text-sm leading-6 text-brand-muted">
            Enter your school email and Firebase will send a secure reset link.
          </p>
          <PasswordResetForm />
        </CardContent>
      </Card>
    </main>
  );
}
