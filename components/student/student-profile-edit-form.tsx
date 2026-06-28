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
<form
 className="mt-5 grid gap-4 md:grid-cols-2"
 onSubmit={(event) => {
 event.preventDefault();
 setSaved(true);
 }}
 >
 <label className="block">
 <span className="text-sm font-semibold text-brand-ink">Display name</span>
 <Input className="mt-2" defaultValue={student.displayName} onChange={() => setSaved(false)} />
 </label>
 <label className="block">
 <span className="text-sm font-semibold text-brand-ink">School email</span>
 <Input className="mt-2" defaultValue={student.email} readOnly />
 </label>
 <label className="block">
 <span className="text-sm font-semibold text-brand-ink">Major</span>
 <Input className="mt-2" defaultValue={student.major} onChange={() => setSaved(false)} />
  </label>
  <label className="block">
  <span className="text-sm font-semibold text-brand-ink">Class year</span>
  <Input className="mt-2" defaultValue={student.classYear} onChange={() => setSaved(false)} />
  </label>
  <div className="md:col-span-2">
  <p className="text-sm font-semibold text-brand-ink">Interests</p>
  <div className="mt-3 flex flex-wrap gap-2">
  {availableInterests.map((interest) => {
  const selected = selectedInterests.includes(interest.name);
  return (
  <button
  key={interest.id}
  type="button"
  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
  selected
  ? "bg-brand-forest text-white"
  : "border border-brand-mist bg-white text-brand-muted hover:border-brand-greenLight hover:text-brand-forest"
  }`}
  onClick={() => toggleInterest(interest.name)}
  >
   {interest.name}
   </button>
   );
   })}
   </div>
   </div>
   <Button className="w-fit" type="submit">
   <Save className="h-4 w-4" />
   Save preview
   </Button>
   </form>
   </CardContent>
   </Card>
   );
  }
