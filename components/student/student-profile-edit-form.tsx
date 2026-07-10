"use client";

import { useState, type FormEvent } from "react";
import { Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { updateStudentProfile } from "@/lib/firebase/user-profile";
import type { Interest, StudentProfile } from "@/lib/types";

type StudentProfileEditFormProps = {
  student: StudentProfile;
  availableInterests: Interest[];
  userId?: string;
  onProfileUpdated?: (student: StudentProfile) => void;
};

export function StudentProfileEditForm({
  student,
  availableInterests,
  userId,
  onProfileUpdated,
}: StudentProfileEditFormProps) {
  const [displayName, setDisplayName] = useState(student.displayName);
  const [major, setMajor] = useState(student.major);
  const [classYear, setClassYear] = useState(student.classYear);
  const [selectedInterests, setSelectedInterests] = useState(student.interests);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function markDirty() {
    setSaved(false);
    setError("");
  }

  function toggleInterest(interestName: string) {
    markDirty();
    setSelectedInterests((current) =>
      current.includes(interestName)
        ? current.filter((interest) => interest !== interestName)
        : [...current, interestName],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      if (userId) {
        const updatedProfile = await updateStudentProfile(userId, {
          displayName: displayName.trim() || student.displayName,
          major: major.trim(),
          classYear: classYear.trim(),
          interests: selectedInterests,
        });
        onProfileUpdated?.(updatedProfile);
      }
      setSaved(true);
    } catch {
      setError("Unable to save profile changes. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold tracking-[-0.02em] text-brand-ink">Edit profile</h2>
            <p className="mt-1 text-sm leading-6 text-brand-muted">
              Update the student details and interests saved to your RamLink profile.
            </p>
          </div>
          {saved ? <Badge tone="green">{userId ? "Profile saved" : "Preview saved"}</Badge> : null}
        </div>

        <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-semibold text-brand-ink">Display name</span>
            <Input
              className="mt-2"
              value={displayName}
              onChange={(event) => {
                markDirty();
                setDisplayName(event.target.value);
              }}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-brand-ink">School email</span>
            <Input className="mt-2" value={student.email} readOnly />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-brand-ink">Major</span>
            <Input
              className="mt-2"
              value={major}
              onChange={(event) => {
                markDirty();
                setMajor(event.target.value);
              }}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-brand-ink">Class year</span>
            <Input
              className="mt-2"
              value={classYear}
              onChange={(event) => {
                markDirty();
                setClassYear(event.target.value);
              }}
            />
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

          {error ? <p className="text-sm font-medium text-red-600 md:col-span-2">{error}</p> : null}

          <Button className="w-fit" type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4" />
            {isSubmitting ? "Saving..." : userId ? "Save profile" : "Save preview"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}