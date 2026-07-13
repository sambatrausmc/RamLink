import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { Club, ClubInquiry, InquiryStatus, RequestStatus, ResourceType } from "@/lib/types";

// Input types for creating new club content
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

// Allows updating only specific club profile fields
export type UpdateClubProfileInput = Pick<
  Club,
  "name" | "shortName" | "category" | "description" | "meetingSchedule" | "meetingLocation" | "contactEmail" | "tags"
>;

async function getDb() {
  const { db } = await import("@/lib/firebase/client");
  return db;
}

function todayLabel() {
  return new Date().toLocaleDateString();
}

// Safely validates resource strings
export function parseResourceType(value: string): ResourceType {
  if (value === "Form" || value === "Waiver" || value === "Guide" || value === "Document") {
    return value;
  }
  return "Link";
}

// Formats a new officer reply with a sequential ID and timestamp
export function buildOfficerReply(
  existingReplies: ClubInquiry["replies"],
  body: string,
  senderName = "Club Officer"
) {
  return {
    id: `reply-${existingReplies.length + 1}`,
    senderName,
    body: body.trim(),
    createdAt: todayLabel(),
  };
}

// WORKFLOW WRITES: These functions push new documents to Firestore with server timestamps
export async function createClubEvent(input: CreateClubEventInput) {
  const db = await getDb();
  await addDoc(collection(db, COLLECTIONS.events), {
    ...input,
    rsvpCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function createClubAnnouncement(input: CreateAnnouncementInput) {
  const db = await getDb();
  await addDoc(collection(db, COLLECTIONS.announcements), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function createClubResource(input: CreateResourceInput) {
  const db = await getDb();
  await addDoc(collection(db, COLLECTIONS.resources), {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

export async function updateClubProfile(clubId: string, input: UpdateClubProfileInput) {
  const db = await getDb();
  await updateDoc(doc(db, COLLECTIONS.clubs, clubId), {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

// Officers can approve or reject student join requests
export async function updateJoinRequestStatus(requestId: string, status: RequestStatus) {
  const db = await getDb();
  await updateDoc(doc(db, COLLECTIONS.joinRequests, requestId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

// Appends an officer reply to an existing student inquiry thread
export async function replyToInquiry(inquiryId: string, body: string) {
  const db = await getDb();
  const inquiryRef = doc(db, COLLECTIONS.inquiries, inquiryId);
  const snapshot = await getDoc(inquiryRef);
  
  const existingReplies =
    snapshot.exists() && Array.isArray(snapshot.data().replies) ? snapshot.data().replies : [];
  const reply = buildOfficerReply(existingReplies, body);

  await updateDoc(inquiryRef, {
    replies: [...existingReplies, reply],
    updatedAt: serverTimestamp(),
    status: "open" satisfies InquiryStatus,
  });
  
  return reply;
}

// Marks an inquiry thread as completely resolved
export async function resolveInquiry(inquiryId: string) {
  const db = await getDb();
  await updateDoc(doc(db, COLLECTIONS.inquiries, inquiryId), {
    status: "resolved" satisfies InquiryStatus,
    updatedAt: serverTimestamp(),
  });
}
