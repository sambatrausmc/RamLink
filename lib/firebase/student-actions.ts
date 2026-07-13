import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { ClubInquiry, InquiryStatus, JoinRequest, NotificationItem, NotificationStatus, RequestStatus } from "@/lib/types";

type JoinRequestInput = {
  userId: string;
  clubId: string;
  message: string;
};

type ClubInquiryInput = {
  userId: string;
  clubId: string;
  subject: string;
  message: string;
};

async function getDb() {
  const { db } = await import("@/lib/firebase/client");
  return db;
}

function readRequestStatus(value: unknown): RequestStatus {
  return value === "approved" || value === "rejected" ? value : "pending";
}

function readInquiryStatus(value: unknown): InquiryStatus {
  return value === "resolved" ? value : "open";
}

function readNotificationStatus(value: unknown): NotificationStatus {
  return value === "read" ? "read" : "unread";
}

function readString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function readCreatedAt(value: unknown) {
  if (typeof value === "string") {
    return value;
  }
  if (value && typeof value === "object" && "toDate" in value) {
    const timestamp = value as { toDate?: () => Date };
    if (typeof timestamp.toDate === "function") {
      return timestamp.toDate().toLocaleDateString();
    }
  }
  return "Just now";
}

// Normalizers ensure consistent student data formatting
function normalizeJoinRequest(snapshot: QueryDocumentSnapshot<DocumentData>): JoinRequest {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    clubId: readString(data.clubId),
    clubName: readString(data.clubName) || undefined,
    studentId: readString(data.studentId),
    studentName: readString(data.studentName) || undefined,
    message: readString(data.message),
    status: readRequestStatus(data.status),
    createdAt: readCreatedAt(data.createdAt),
  };
}

function normalizeNotification(snapshot: QueryDocumentSnapshot<DocumentData>): NotificationItem {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    userId: readString(data.userId) || undefined,
    title: readString(data.title, "Notification"),
    body: readString(data.body),
    type:
      data.type === "joinRequest" ||
      data.type === "announcement" ||
      data.type === "inquiry" ||
      data.type === "resource"
        ? data.type
        : "event",
    status: readNotificationStatus(data.status),
    createdAt: readCreatedAt(data.createdAt),
    relatedHref: readString(data.relatedHref, "/dashboard"),
  };
}

// STUDENT READS: Query Firestore for items belonging specifically to the logged-in user ID
export async function getStudentJoinRequests(userId: string) {
  const db = await getDb();
  const snapshot = await getDocs(query(collection(db, COLLECTIONS.joinRequests), where("studentId", "==", userId)));
  return snapshot.docs.map(normalizeJoinRequest);
}

export async function getStudentNotifications(userId: string) {
  const db = await getDb();
  const snapshot = await getDocs(query(collection(db, COLLECTIONS.notifications), where("userId", "==", userId)));
  return snapshot.docs.map(normalizeNotification);
}

// STUDENT TOGGLES: Atomically add or remove IDs from the user's saved arrays in Firestore
export async function toggleSavedClub(userId: string, clubId: string, currentlySaved: boolean) {
  const db = await getDb();
  await updateDoc(doc(db, COLLECTIONS.users, userId), {
    savedClubIds: currentlySaved ? arrayRemove(clubId) : arrayUnion(clubId),
    updatedAt: serverTimestamp(),
  });
  return !currentlySaved;
}

export async function toggleSavedEvent(userId: string, eventId: string, currentlySaved: boolean) {
  const db = await getDb();
  await updateDoc(doc(db, COLLECTIONS.users, userId), {
    savedEventIds: currentlySaved ? arrayRemove(eventId) : arrayUnion(eventId),
    updatedAt: serverTimestamp(),
  });
  return !currentlySaved;
}

export async function toggleEventRsvp(userId: string, eventId: string, currentlyRsvped: boolean) {
  const db = await getDb();
  await updateDoc(doc(db, COLLECTIONS.users, userId), {
    rsvpedEventIds: currentlyRsvped ? arrayRemove(eventId) : arrayUnion(eventId),
    updatedAt: serverTimestamp(),
  });
  return !currentlyRsvped;
}

// STUDENT CREATES: Sending a join request also fires an automatic inbox notification
export async function createJoinRequest(input: JoinRequestInput): Promise<JoinRequest> {
  const db = await getDb();
  const request = {
    clubId: input.clubId,
    studentId: input.userId,
    message: input.message,
    status: "pending" as RequestStatus,
    createdAt: serverTimestamp(),
  };
  const documentReference = await addDoc(collection(db, COLLECTIONS.joinRequests), request);
  
  // Automatically generate a notification for the student
  await addDoc(collection(db, COLLECTIONS.notifications), {
    userId: input.userId,
    title: "Join request sent",
    body: "Your membership request was sent to the club officers.",
    type: "joinRequest",
    status: "unread",
    relatedHref: "/dashboard",
    createdAt: serverTimestamp(),
  });

  return {
    id: documentReference.id,
    clubId: request.clubId,
    studentId: request.studentId,
    message: request.message,
    status: request.status,
    createdAt: "Just now",
  } satisfies JoinRequest;
}

// STUDENT INQUIRY: Sending a question creates an inquiry thread and fires an inbox notification
export async function createClubInquiry(input: ClubInquiryInput): Promise<ClubInquiry> {
  const db = await getDb();
  const inquiry = {
    clubId: input.clubId,
    studentId: input.userId,
    subject: input.subject,
    message: input.message,
    status: "open" as InquiryStatus,
    createdAt: serverTimestamp(),
    replies: [],
  };
  const documentReference = await addDoc(collection(db, COLLECTIONS.inquiries), inquiry);
  
  await addDoc(collection(db, COLLECTIONS.notifications), {
    userId: input.userId,
    title: "Question sent",
    body: "Your question was sent to the official club inbox.",
    type: "inquiry",
    status: "unread",
    relatedHref: "/notifications",
    createdAt: serverTimestamp(),
  });

  return {
    id: documentReference.id,
    clubId: inquiry.clubId,
    studentId: inquiry.studentId,
    subject: inquiry.subject,
    message: inquiry.message,
    status: readInquiryStatus(inquiry.status),
    createdAt: "Just now",
    replies: [],
  } satisfies ClubInquiry;
}
