import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { ReportStatus, UserRole } from "@/lib/types";

async function getDb() {
  const { db } = await import("@/lib/firebase/client");
  return db;
}

// ADMIN ACTION: Promote or demote a user's role in Firestore
export async function updateUserRole(userId: string, role: UserRole) {
  const db = await getDb();
  await updateDoc(doc(db, COLLECTIONS.users, userId), {
    role,
    updatedAt: serverTimestamp(),
  });
}

// ADMIN ACTION: Update the status of a content moderation report
export async function updateReportStatus(
  reportId: string,
  status: ReportStatus,
) {
  const db = await getDb();
  await updateDoc(doc(db, COLLECTIONS.reports, reportId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

// ADMIN ACTION: Assigns managed club IDs to a club officer account
export async function updateManagedClubs(
  userId: string,
  managedClubIds: string[],
) {
  const db = await getDb();
  await updateDoc(doc(db, COLLECTIONS.users, userId), {
    managedClubIds,
    updatedAt: serverTimestamp(),
  });
}
