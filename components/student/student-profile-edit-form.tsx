"use client";
import { useState } from "react";
import { Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Interest, StudentProfile } from "@/lib/types";
type StudentProfileEditFormProps = {
 student: StudentProfile;
 availableInterests: Interest[];
};
export function StudentProfileEditForm({ student, availableInterests }: StudentProfileEditFormProps) {
 const [selectedInterests, setSelectedInterests] = useState(student.interests);
 const [saved, setSaved] = useState(false);
 function toggleInterest(interestName: string) {
 setSaved(false);
 setSelectedInterests((current) =>
 current.includes(interestName)
 ? current.filter((interest) => interest !== interestName)
 : [...current, interestName],
 );
return (
 <Card>
 <CardContent>
 <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
 <div>
 <h2 className="font-display text-xl font-semibold tracking-[-0.02em] text-brand-ink">Edit profile preview</h2>
 <p className="mt-1 text-sm leading-6 text-brand-muted">
 These fields show the profile data RamLink will save when Firebase is connected.
 </p>
 </div>
 {saved ? <Badge tone="green">Preview saved</Badge> : null}
 </div>
