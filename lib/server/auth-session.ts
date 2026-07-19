import "server-only";

import { cookies } from "next/headers";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { SESSION_COOKIE_NAME } from "@/lib/auth-session-contract";
import { hasVerifiedFarmingdaleClaims } from "@/lib/server/session-cookie";
import type { UserRole } from "@/lib/types";

export type AuthenticatedServerSession = {
  uid: string;
  email: string;
  role: UserRole;
  managedClubIds: string[];
};

function isUserRole(value: unknown): value is UserRole {
  return value === "student" || value === "clubOfficer" || value === "admin";
}

function readManagedClubs(value: unknown) {
  return Array.isArray(value)
    ? value.filter((clubId): clubId is string => typeof clubId === "string")
    : [];
}

export async function validateServerSessionCookie(
  sessionCookie: string | undefined,
): Promise<AuthenticatedServerSession | null> {
  if (!sessionCookie) {
    return null;
  }

  try {
    const decodedToken = await getAdminAuth().verifySessionCookie(
      sessionCookie,
      true,
    );
    if (!hasVerifiedFarmingdaleClaims(decodedToken)) {
      return null;
    }

    const profileSnapshot = await getAdminDb()
      .collection(COLLECTIONS.users)
      .doc(decodedToken.uid)
      .get();
    const profile = profileSnapshot.data();
    if (!profileSnapshot.exists || !profile || !isUserRole(profile.role)) {
      return null;
    }

    return {
      uid: decodedToken.uid,
      email: decodedToken.email as string,
      role: profile.role,
      managedClubIds: readManagedClubs(profile.managedClubIds),
    };
  } catch {
    return null;
  }
}

export async function getServerSession() {
  const cookieStore = await cookies();
  return validateServerSessionCookie(
    cookieStore.get(SESSION_COOKIE_NAME)?.value,
  );
}
