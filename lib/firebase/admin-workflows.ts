import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import {
  createAuditedBatch,
  prepareClientAuditLog,
} from "@/lib/firebase/audit-logs";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { ClubCategory, ClubStatus, ReportStatus, UserRole } from "@/lib/types";

export type CreateClubRecordInput = {
  name: string;
  shortName: string;
  category: ClubCategory;
  description: string;
  contactEmail: string;
};

export function createClubId(shortName: string) {
  return shortName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function getDb() {
  const { db } = await import("@/lib/firebase/client");
  return db;
}

// ADMIN ACTION: Promote or demote a user's role in Firestore
export async function updateUserRole(userId: string, role: UserRole) {
  const db = await getDb();
  const batch = await createAuditedBatch(db, "admin", {
    action: "admin.user_role_updated",
    targetType: "user",
    targetId: userId,
  });
  batch.update(doc(db, COLLECTIONS.users, userId), {
    role,
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
}

// ADMIN ACTION: Update the status of a content moderation report
export async function updateReportStatus(
  reportId: string,
  status: ReportStatus,
) {
  const db = await getDb();
  const batch = await createAuditedBatch(db, "admin", {
    action: "admin.report_status_updated",
    targetType: "report",
    targetId: reportId,
  });
  batch.update(doc(db, COLLECTIONS.reports, reportId), {
    status,
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
}

// ADMIN ACTION: Assigns managed club IDs to a club officer account
export async function updateManagedClubs(
  userId: string,
  managedClubIds: string[],
) {
  const db = await getDb();
  const batch = await createAuditedBatch(db, "admin", {
    action: "admin.user_clubs_updated",
    targetType: "user",
    targetId: userId,
  });
  batch.update(doc(db, COLLECTIONS.users, userId), {
    managedClubIds,
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
}

// ADMIN ACTION: Create a pending club record with a URL-safe document ID
export async function createClubRecord(input: CreateClubRecordInput) {
  const db = await getDb();
  const name = input.name.trim();
  const shortName = input.shortName.trim();
  const description = input.description.trim();
  const contactEmail = input.contactEmail.trim();
  const clubId = createClubId(shortName);

  if (!clubId || !name || !description || !contactEmail) {
    throw new Error("Complete all required club fields before submitting.");
  }

  const clubRef = doc(db, COLLECTIONS.clubs, clubId);
  const audit = await prepareClientAuditLog(db, "admin", {
    action: "admin.club_created",
    targetType: "club",
    targetId: clubId,
    clubId,
  });

  await runTransaction(db, async (transaction) => {
    const existingClub = await transaction.get(clubRef);

    if (existingClub.exists()) {
      throw new Error("A club with this short name already exists.");
    }

    transaction.set(clubRef, {
      name,
      shortName: shortName.toUpperCase(),
      category: input.category,
      description,
      contactEmail,
      status: "pending",
      memberCount: 0,
      tags: [],
      meetingSchedule: "Schedule TBD",
      meetingLocation: "Location TBD",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    transaction.set(audit.reference, audit.data);
  });

  return clubId;
}

// ADMIN ACTION: Approve, suspend, or archive a campus club record
export async function updateClubStatus(clubId: string, status: ClubStatus) {
  const db = await getDb();
  const batch = await createAuditedBatch(db, "admin", {
    action: "admin.club_status_updated",
    targetType: "club",
    targetId: clubId,
    clubId,
  });
  batch.update(doc(db, COLLECTIONS.clubs, clubId), {
    status,
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
}
