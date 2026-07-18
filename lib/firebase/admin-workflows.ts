import { doc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { ClubCategory, ClubStatus, ReportStatus, UserRole } from "@/lib/types";

export type CreateClubRecordInput = {
  name: string;
  shortName: string;
  category: ClubCategory;
  description: string;
  contactEmail: string;
};

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

// ADMIN ACTION: Create a pending club record with a URL-safe document ID
export async function createClubRecord(input: CreateClubRecordInput) {
  const db = await getDb();
  const clubId = input.shortName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  await setDoc(doc(db, COLLECTIONS.clubs, clubId), {
    ...input,
    shortName: input.shortName.trim().toUpperCase(),
    status: "pending",
    memberCount: 0,
    tags: [],
    meetingSchedule: "Schedule TBD",
    meetingLocation: "Location TBD",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return clubId;
}

// ADMIN ACTION: Approve, suspend, or archive a campus club record
export async function updateClubStatus(clubId: string, status: ClubStatus) {
  const db = await getDb();
  await updateDoc(doc(db, COLLECTIONS.clubs, clubId), {
    status,
    updatedAt: serverTimestamp(),
  });
}
