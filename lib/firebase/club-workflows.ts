import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
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
  await addDoc(collection(db, COLLECTIONS.events), {
    ...input,
    rsvpCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// Posts a new announcement and automatically notifies all existing club members
export async function createClubAnnouncement(input: CreateAnnouncementInput) {
  const db = await getDb();
  await addDoc(collection(db, COLLECTIONS.announcements), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Query all users whose joinedClubIds array contains this club
  const members = await getDocs(
    query(
      collection(db, COLLECTIONS.users),
      where("joinedClubIds", "array-contains", input.clubId),
    ),
  );

  // Batch create an unread notification for every member
  const batch = writeBatch(db);
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
}

// Uploads a new club resource link or document reference
export async function createClubResource(input: CreateResourceInput) {
  const db = await getDb();
  await addDoc(collection(db, COLLECTIONS.resources), {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

// Updates basic club profile information
export async function updateClubProfile(
  clubId: string,
  input: UpdateClubProfileInput,
) {
  const db = await getDb();
  await updateDoc(doc(db, COLLECTIONS.clubs, clubId), {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

// ATOMIC MEMBERSHIP TRANSACTION: Updates request status, user profile, club member count, and notifications simultaneously
export async function updateJoinRequestStatus(
  requestId: string,
  status: RequestStatus,
) {
  const db = await getDb();
  const requestRef = doc(db, COLLECTIONS.joinRequests, requestId);
  const requestSnapshot = await getDoc(requestRef);
  
  if (!requestSnapshot.exists()) {
    throw new Error("Join request not found.");
  }

  const request = requestSnapshot.data();
  const studentId = String(request.studentId ?? "");
  const clubId = String(request.clubId ?? "");
  const previousStatus = request.status as RequestStatus;

  const batch = writeBatch(db);
  
  // 1. Update the status on the join request itself
  batch.update(requestRef, { status, updatedAt: serverTimestamp() });

  // 2. If newly approved, add club to student's joined array and increment club member count
  if (status === "approved" && previousStatus !== "approved") {
    batch.update(doc(db, COLLECTIONS.users, studentId), {
      joinedClubIds: arrayUnion(clubId),
      updatedAt: serverTimestamp(),
    });
    batch.update(doc(db, COLLECTIONS.clubs, clubId), {
      memberCount: increment(1),
    });
  } 
  // 3. If revoking an approved membership, remove from array and decrement count
  else if (status !== "approved" && previousStatus === "approved") {
    batch.update(doc(db, COLLECTIONS.users, studentId), {
      joinedClubIds: arrayRemove(clubId),
      updatedAt: serverTimestamp(),
    });
    batch.update(doc(db, COLLECTIONS.clubs, clubId), {
      memberCount: increment(-1),
    });
  }

  // 4. Send an unread system notification to the student
  batch.set(doc(collection(db, COLLECTIONS.notifications)), {
    userId: studentId,
    clubId,
    title: status === "approved" ? "Club request approved" : "Club request updated",
    body:
      status === "approved"
        ? "Your club membership request was approved."
        : "Your club membership request was not approved.",
    type: "joinRequest",
    status: "unread",
    relatedHref: "/dashboard",
    createdAt: serverTimestamp(),
  });

  // Execute all updates atomically
  await batch.commit();
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
