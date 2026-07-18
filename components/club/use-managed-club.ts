"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { DEFAULT_MANAGED_CLUB_ID } from "@/lib/firebase/public-data";
import type { StudentProfile } from "@/lib/types";

export function getManagedClubId(profile: StudentProfile | null) {
  return (
    profile?.managedClubIds?.[0] ??
    (profile?.role === "admin" ? DEFAULT_MANAGED_CLUB_ID : null)
  );
}

export function useManagedClub() {
  const { loading, profile } = useAuth();
  const clubId = getManagedClubId(profile);

  return { clubId, loading };
}