"use client";

import type { StudentProfile } from "@/lib/types";

export type MemberSearchListProps = {
  members: StudentProfile[];
};

export function filterMembers(members: StudentProfile[], query: string) {
  // Normalize the search text so name, major, and email matches are consistent.
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return members;
  }

  return members.filter((member) =>
    [member.displayName, member.major, member.email].some((value) =>
      value.toLowerCase().includes(normalizedQuery),
    ),
  );
}
