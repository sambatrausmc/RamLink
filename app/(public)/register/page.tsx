import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { ArrowRight, Sparkles } from "lucide-react";
import { PageHero } from "@/components/common/page-hero";
import { Card, CardContent } from "@/components/ui/card";
export default function RegisterPage() {
  return (
    <div className="bg-[radial-gradient(60%_70%_at_10%_0%,rgba(240,180,41,0.1),transparent_60%)]">
      <section className="mx-auto grid w-full max-w-[1180px] gap-8 px-5 py-12 md:px-6 md:py-16 lg:grid-cols-[0.9fr_1fr] lg:items-center">
        <PageHero
          eyebrow="Create account"
          title={
            <>
              Start your campus <span className="text-brand-forest">connection.</span>
            </>
          }
          description="Create an account to save clubs, follow events, and request to join student communities."
          aside={
            <div className="rounded-[22px] border border-brand-mist bg-white p-5 shadow-lift">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-[14px] bg-amber-50 text-amber-600">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-display text-base font-semibold text-brand-ink">Simple setup</p>
                  <p className="text-sm text-brand-muted">Use your school email and start browsing.</p>
                </div>
              </div>
            </div>
          }
        />
        <Card className="mx-auto w-full max-w-md">
          <CardContent className="p-6 md:p-8">
            <p className="text-sm font-semibold text-brand-green">Student account</p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-[-0.02em] text-brand-ink">
              Create your account
            </h1>
            <p className="mt-2 text-sm leading-6 text-brand-muted">
              Join RamLink with your Farmingdale email.
            </p>

            <RegisterForm />
            
            <p className="mt-5 text-center text-sm text-brand-muted">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-brand-forest hover:text-brand-green">
                Sign in
              </Link>
            </p>
            <Link href="/clubs" className="mt-6 inline-flex items-center justify-center gap-2 text-sm font-semibold text-brand-forest hover:text-brand-green">
              Explore clubs first
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
