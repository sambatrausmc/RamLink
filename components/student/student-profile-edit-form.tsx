"use client";
import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Interest, StudentProfile } from "@/lib/types";
import type { StudentProfileEditInput } from "@/lib/firebase/user-profile";

type StudentProfileEditFormProps = {
  student: StudentProfile;
  availableInterests: Interest[];
  isSaving?: boolean;
  onSave?: (input: StudentProfileEditInput) => Promise<void>;
};

export function StudentProfileEditForm({
  student,
  availableInterests,
  isSaving = false,
  onSave,
}: StudentProfileEditFormProps) {
  const [displayName, setDisplayName] = useState(student.displayName);
  const [major, setMajor] = useState(student.major);
  const [classYear, setClassYear] = useState(student.classYear);
  const [selectedInterests, setSelectedInterests] = useState(student.interests);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDisplayName(student.displayName);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMajor(student.major);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setClassYear(student.classYear);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedInterests(student.interests);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaved(false);
  }, [student]);

  
  function markChanged() {
    setSaved(false);
  }

  function toggleInterest(interestName: string) {
    markChanged();
    setSelectedInterests((current) =>
      current.includes(interestName)
        ? current.filter((interest) => interest !== interestName)
        : [...current, interestName]
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSave?.({
      displayName,
      major,
      classYear,
      interests: selectedInterests,
    });
    setSaved(true);
  }

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold tracking-[-0.02em] text-brand-ink">Edit profile</h2>
            <p className="mt-1 text-sm leading-6 text-brand-muted">
              Update the student details RamLink uses for recommendations and profile display.
            </p>
          </div>
          {saved ? <Badge tone="green">Saved</Badge> : null}
        </div>

        <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-semibold text-brand-ink">Display name</span>
            <Input
              className="mt-2"
              value={displayName}
              onChange={(event) => {
                setDisplayName(event.target.value);
                markChanged();
              }}
              required
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
                setMajor(event.target.value);
                markChanged();
              }}
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-brand-ink">Class year</span>
            <Input
              className="mt-2"
              value={classYear}
              onChange={(event) => {
                setClassYear(event.target.value);
                markChanged();
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

          <Button className="w-fit" type="submit" disabled={isSaving}>
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
