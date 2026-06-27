"use client";

import { useState } from "react";
import { Search, Users } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

export function MemberSearchList({ members }: MemberSearchListProps) {
  const [query, setQuery] = useState("");
  const filteredMembers = filterMembers(members, query);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent>
          <label className="relative block">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-green" />
            <Input
              className="pl-10"
              placeholder="Search members by name, major, or email..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </CardContent>
      </Card>

      {filteredMembers.length ? (
        <Card>
          <CardContent>
            <div className="divide-y divide-slate-100">
              {filteredMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between gap-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-brand-mist text-brand-forest">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-display font-semibold text-brand-ink">{member.displayName}</p>
                      <p className="text-sm text-brand-muted">{member.major}</p>
                    </div>
                  </div>
                  <Badge tone="green">Member</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        // This empty state appears when the search text does not match any member.
        <EmptyState
          icon={<Users className="h-5 w-5" />}
          title="No matching members"
          description="Try a different name, major, or email search."
        />
      )}
    </div>
  );
}
