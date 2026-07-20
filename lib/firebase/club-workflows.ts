import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { createAuditedBatch } from "@/lib/firebase/audit-logs";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type {
  Club,
  ClubInquiry,
  InquiryStatus,
  RequestStatus,
  ResourceType,
} from "@/lib/types";

// Input type definitions for creating new club content
export type CreateClubEventInput = {
  clubId: string;
  clubName: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
};

export type CreateAnnouncementInput = {
  clubId: string;
  clubName: string;
  title: string;
  body: string;
  priority: "normal" | "important";
};

export type CreateResourceInput = {
  clubId: string;
  title: string;
  description: string;
  type: ResourceType;
  url: string;
};

export type UpdateClubEventInput = Omit<
  CreateClubEventInput,
  "clubId" | "clubName"
>;

export type UpdateAnnouncementInput = Pick<
  CreateAnnouncementInput,
  "title" | "body" | "priority"
>;

export type UpdateResourceInput = Omit<CreateResourceInput, "clubId">;

// Restricts club updates to specific editable profile fields
export type UpdateClubProfileInput = Pick<
  Club,
  | "name"
  | "shortName"
  | "category"
  | "description"
  | "meetingSchedule"
  | "meetingLocation"
  | "contactEmail"
  | "tags"
>;

// Dynamically loads the Firebase client database instance
async function getDb() {
  const { db } = await import("@/lib/firebase/client");
  return db;
}

// Generates a clean date string for fallback timestamps
function todayLabel() {
  return new Date().toLocaleDateString();
}

// Validates resource type strings, defaulting to "Link" if unrecognized
export function parseResourceType(value: string): ResourceType {
  if (
    value === "Form" ||
    value === "Waiver" ||
    value === "Guide" ||
    value === "Document"
  ) {
    return value;
  }
  return "Link";
}

// Formats a standardized reply object for club inquiry threads
export function buildOfficerReply(
  existingReplies: ClubInquiry["replies"],
  body: string,
  senderName = "Club Officer",
) {
  return {
    id: `reply-${existingReplies.length + 1}`,
    senderName,
    body: body.trim(),
    createdAt: todayLabel(),
  };
}

// Creates a new campus event and sets initial RSVP counters
export async function createClubEvent(input: CreateClubEventInput) {
  const db = await getDb();
  const eventRef = doc(collection(db, COLLECTIONS.events));
  const batch = await createAuditedBatch(db, "clubOfficer", {
    action: "officer.event_created",
    targetType: "event",
    targetId: eventRef.id,
    clubId: input.clubId,
  });
  batch.set(eventRef, {
    ...input,
    rsvpCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
  return eventRef.id;
}

export async function updateClubEvent(
  eventId: string,
  clubId: string,
  input: UpdateClubEventInput,
) {
  const db = await getDb();
  const batch = await createAuditedBatch(db, "clubOfficer", {
    action: "officer.event_updated",
    targetType: "event",
    targetId: eventId,
    clubId,
  });
  batch.update(doc(db, COLLECTIONS.events, eventId), {
    ...input,
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
}

export async function deleteClubEvent(eventId: string, clubId: string) {
  const db = await getDb();
  const batch = await createAuditedBatch(db, "clubOfficer", {
    action: "officer.event_deleted",
    targetType: "event",
    targetId: eventId,
    clubId,
  });
  batch.delete(doc(db, COLLECTIONS.events, eventId));
  await batch.commit();
}

// Posts a new announcement and automatically notifies all existing club members
export async function createClubAnnouncement(input: CreateAnnouncementInput) {
  const db = await getDb();
  const members = await getDocs(
    query(
      collection(db, COLLECTIONS.users),
      where("joinedClubIds", "array-contains", input.clubId),
    ),
  );

  const announcementRef = doc(collection(db, COLLECTIONS.announcements));
  const batch = await createAuditedBatch(db, "clubOfficer", {
    action: "officer.announcement_created",
    targetType: "announcement",
    targetId: announcementRef.id,
    clubId: input.clubId,
  });
  batch.set(announcementRef, {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  members.forEach((member) => {
    batch.set(doc(collection(db, COLLECTIONS.notifications)), {
      userId: member.id,
      clubId: input.clubId,
      title: input.title,
      body: `${input.clubName} posted a new announcement.`,
      type: "announcement",
      status: "unread",
      relatedHref: `/clubs/${input.clubId}`,
      createdAt: serverTimestamp(),
    });
  });
  await batch.commit();
  return announcementRef.id;
}

export async function updateClubAnnouncement(
  announcementId: string,
  clubId: string,
  input: UpdateAnnouncementInput,
) {
  const db = await getDb();
  const batch = await createAuditedBatch(db, "clubOfficer", {
    action: "officer.announcement_updated",
    targetType: "announcement",
    targetId: announcementId,
    clubId,
  });
  batch.update(doc(db, COLLECTIONS.announcements, announcementId), {
    ...input,
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
}

export async function deleteClubAnnouncement(
  announcementId: string,
  clubId: string,
) {
  const db = await getDb();
  const batch = await createAuditedBatch(db, "clubOfficer", {
    action: "officer.announcement_deleted",
    targetType: "announcement",
    targetId: announcementId,
    clubId,
  });
  batch.delete(doc(db, COLLECTIONS.announcements, announcementId));
  await batch.commit();
}

// Uploads a new club resource link or document reference
export async function createClubResource(input: CreateResourceInput) {
  const db = await getDb();
  const resourceRef = doc(collection(db, COLLECTIONS.resources));
  const batch = await createAuditedBatch(db, "clubOfficer", {
    action: "officer.resource_created",
    targetType: "resource",
    targetId: resourceRef.id,
    clubId: input.clubId,
  });
  batch.set(resourceRef, {
    ...input,
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
  return resourceRef.id;
}

export async function updateClubResource(
  resourceId: string,
  clubId: string,
  input: UpdateResourceInput,
) {
  const db = await getDb();
  const batch = await createAuditedBatch(db, "clubOfficer", {
    action: "officer.resource_updated",
    targetType: "resource",
    targetId: resourceId,
    clubId,
  });
  batch.update(doc(db, COLLECTIONS.resources, resourceId), {
    ...input,
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
}

export async function deleteClubResource(resourceId: string, clubId: string) {
  const db = await getDb();
  const batch = await createAuditedBatch(db, "clubOfficer", {
    action: "officer.resource_deleted",
    targetType: "resource",
    targetId: resourceId,
    clubId,
  });
  batch.delete(doc(db, COLLECTIONS.resources, resourceId));
  await batch.commit();
}

// Updates basic club profile information
export async function updateClubProfile(
  clubId: string,
  input: UpdateClubProfileInput,
) {
  const db = await getDb();
  const batch = await createAuditedBatch(db, "clubOfficer", {
    action: "officer.club_profile_updated",
    targetType: "club",
    targetId: clubId,
    clubId,
  });
  batch.update(doc(db, COLLECTIONS.clubs, clubId), {
    ...input,
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
}

// ATOMIC MEMBERSHIP TRANSACTION: Updates request status, user profile, club member count, and notifications simultaneously
export async function updateJoinRequestStatus(
  requestId: string,
  status: RequestStatus,
) {
  const db = await getDb();
  const requestRef = doc(db, COLLECTIONS.joinRequests, requestId);
  const notificationRef = doc(collection(db, COLLECTIONS.notifications));

  await runTransaction(db, async (transaction) => {
    const requestSnapshot = await transaction.get(requestRef);
    if (!requestSnapshot.exists()) {
      throw new Error("Join request not found.");
    }

    const request = requestSnapshot.data();
    const studentId = String(request.studentId ?? "");
    const clubId = String(request.clubId ?? "");
    const previousStatus = request.status as RequestStatus;

    if (!studentId || !clubId) {
      throw new Error("Join request is missing membership information.");
    }

    transaction.update(requestRef, {
      status,
      updatedAt: serverTimestamp(),
    });

    if (status === "approved" && previousStatus !== "approved") {
      transaction.update(doc(db, COLLECTIONS.users, studentId), {
        joinedClubIds: arrayUnion(clubId),
        updatedAt: serverTimestamp(),
      });
      transaction.update(doc(db, COLLECTIONS.clubs, clubId), {
        memberCount: increment(1),
      });
    } else if (status !== "approved" && previousStatus === "approved") {
      transaction.update(doc(db, COLLECTIONS.users, studentId), {
        joinedClubIds: arrayRemove(clubId),
        updatedAt: serverTimestamp(),
      });
      transaction.update(doc(db, COLLECTIONS.clubs, clubId), {
        memberCount: increment(-1),
      });
    }

    transaction.set(notificationRef, {
      userId: studentId,
      clubId,
      title:
        status === "approved"
          ? "Club request approved"
          : "Club request updated",
      body:
        status === "approved"
          ? "Your club membership request was approved."
          : "Your club membership request was not approved.",
      type: "joinRequest",
      status: "unread",
      relatedHref: "/dashboard",
      createdAt: serverTimestamp(),
    });
  });
}

// Appends an officer reply to a student inquiry and fires a notification
export async function replyToInquiry(inquiryId: string, body: string) {
  const db = await getDb();
  const inquiryRef = doc(db, COLLECTIONS.inquiries, inquiryId);
  const snapshot = await getDoc(inquiryRef);

  if (!snapshot.exists()) {
    throw new Error("Inquiry not found.");
  }

  const inquiry = snapshot.data();
  const existingReplies = Array.isArray(inquiry.replies) ? inquiry.replies : [];
  const reply = buildOfficerReply(existingReplies, body);

  const batch = writeBatch(db);
  // Append reply and ensure inquiry status remains open
  batch.update(inquiryRef, {
    replies: [...existingReplies, reply],
    updatedAt: serverTimestamp(),
    status: "open" satisfies InquiryStatus,
  });

  // Notify the student who asked the question
  batch.set(doc(collection(db, COLLECTIONS.notifications)), {
    userId: inquiry.studentId,
    clubId: inquiry.clubId,
    title: "Club replied to your question",
    body: reply.body,
    type: "inquiry",
    status: "unread",
    relatedHref: "/notifications",
    createdAt: serverTimestamp(),
  });

  await batch.commit();
  return reply;
}

// Marks an inquiry as resolved
export async function resolveInquiry(inquiryId: string) {
  const db = await getDb();
  await updateDoc(doc(db, COLLECTIONS.inquiries, inquiryId), {
    status: "resolved" satisfies InquiryStatus,
    updatedAt: serverTimestamp(),
  });
}
