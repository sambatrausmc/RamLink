"use client";

import { useEffect, useState } from "react";
import { MemberSearchList } from "@/components/club/member-search-list";
import { useManagedClub } from "@/components/club/use-managed-club";
import { PageHeader } from "@/components/common/page-header";
import {
  getClubByIdFromFirestore,
  getMembersForClub,
} from "@/lib/firebase/public-data";
import type { Club, StudentProfile } from "@/lib/types";

export function ClubMembersClient() {
  const { clubId, loading } = useManagedClub();
  const [club, setClub] = useState<Club | null>(null);
  const [members, setMembers] = useState<StudentProfile[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!clubId) return;
    Promise.all([getClubByIdFromFirestore(clubId), getMembersForClub(clubId)])
      .then(([nextClub, nextMembers]) => {
        setClub(nextClub);
        setMembers(nextMembers);
      })
      .catch(() => setError("Unable to load club members."));
  }, [clubId]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Members"
        title={`${club?.name ?? "Club"} members`}
        description="Officer-only view of approved members for this club."
      />
      {loading ? (
        <p className="text-sm text-brand-muted">Loading club access...</p>
      ) : null}
      {!loading && !clubId ? (
        <p className="text-sm text-red-600">
          No managed club is assigned to this account.
        </p>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {clubId && !error ? <MemberSearchList members={members} /> : null}
    </div>
  );
}