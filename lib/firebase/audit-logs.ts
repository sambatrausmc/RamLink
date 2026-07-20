import {
  collection,
  doc,
  serverTimestamp,
  writeBatch,
  type Firestore,
} from "firebase/firestore";
import { COLLECTIONS } from "@/lib/firebase/collections";

export type AuditActorRole = "admin" | "clubOfficer";

export type AuditAction =
  | "admin.club_created"
  | "admin.club_status_updated"
  | "admin.report_status_updated"
  | "admin.user_clubs_updated"
  | "admin.user_role_updated"
  | "officer.announcement_created"
  | "officer.announcement_deleted"
  | "officer.announcement_updated"
  | "officer.club_profile_updated"
  | "officer.event_created"
  | "officer.event_deleted"
  | "officer.event_updated"
  | "officer.inquiry_replied"
  | "officer.inquiry_resolved"
  | "officer.join_request_updated"
  | "officer.resource_created"
  | "officer.resource_deleted"
  | "officer.resource_updated";

export type AuditInput = {
  action: AuditAction;
  targetType: string;
  targetId: string;
  clubId?: string;
};

export async function prepareClientAuditLog(
  db: Firestore,
  actorRole: AuditActorRole,
  input: AuditInput,
) {
  const { auth } = await import("@/lib/firebase/client");
  if (!auth.currentUser) {
    throw new Error("Sign in before completing this action.");
  }

  const data = {
    actorId: auth.currentUser.uid,
    actorRole,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId,
    ...(input.clubId ? { clubId: input.clubId } : {}),
    createdAt: serverTimestamp(),
  };

  return {
    data,
    reference: doc(collection(db, COLLECTIONS.auditLogs)),
  };
}

export async function createAuditedBatch(
  db: Firestore,
  actorRole: AuditActorRole,
  input: AuditInput,
) {
  const audit = await prepareClientAuditLog(db, actorRole, input);
  const batch = writeBatch(db);
  batch.set(audit.reference, audit.data);
  return batch;
}
