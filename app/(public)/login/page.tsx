import Link from "next/link";
import { ArrowRight, LogIn, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/common/page-hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
export default function LoginPage() {
 return (
 <div className="bg-[radial-gradient(60%_70%_at_85%_0%,rgba(24,168,86,0.09),transparent_60%)]">
 <section className="mx-auto grid w-full max-w-[1180px] gap-8 px-5 py-12 md:px-6 md:py-16 lg:grid-cols-[0.9fr_1fr] lg:items-center">
 <PageHero
 eyebrow="Welcome back"
 title={
 <>
 Sign in to <span className="text-brand-forest">RamLink.</span>
 </>
 }
 description="Access your saved clubs, event plans, notifications, and student community updates."
 aside={
 <div className="rounded-[22px] border border-brand-mist bg-white p-5 shadow-lift">
 <div className="flex items-center gap-3">
 <div className="grid h-12 w-12 place-items-center rounded-[14px] bg-brand-mist text-brand-forest">
 <ShieldCheck className="h-6 w-6" />
 </div>
 <div>
 <p className="font-display text-base font-semibold text-brand-ink">Campus access</p>
 <p className="text-sm text-brand-muted">Use your Farmingdale email.</p>
 </div>
 </div>
 </div>
 }
 />