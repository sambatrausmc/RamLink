import Link from "next/link";
import { ArrowRight, Sparkles, UserPlus } from "lucide-react";
import { PageHero } from "@/components/common/page-hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
 <div className="flex items-center gap-3"