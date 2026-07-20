import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { protectedApiRequest } from "@/lib/firebase/protected-api";
import type {
  ClubInquiry,
  InquiryStatus,
  JoinRequest,
  NotificationItem,
  NotificationStatus,
  RequestStatus,
} from "@/lib/types";

// Extended input shapes to capture optional club and student names
type JoinRequestInput = {
  userId: string;
  clubId: string;
  clubName?: string;
  studentName?: string;
  message: string;
};

type ClubInquiryInput = {
  userId: string;
  clubId: string;
  clubName?: string;
  studentName?: string;
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

// Normalizers ensure consistent student data formatting when reading from Firestore
function normalizeJoinRequest(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): JoinRequest {
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

function normalizeNotification(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): NotificationItem {
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

// Queries all join requests submitted by the active user
export async function getStudentJoinRequests(userId: string) {
  const db = await getDb();
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.joinRequests),
      where("studentId", "==", userId),
    ),
  );
  return snapshot.docs.map(normalizeJoinRequest);
}

// Queries all inbox notifications assigned to the active user
export async function getStudentNotifications(userId: string) {
  const db = await getDb();
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.notifications),
      where("userId", "==", userId),
    ),
  );
  return snapshot.docs.map(normalizeNotification);
}

export async function updateNotificationStatus(
  notificationId: string,
  status: NotificationStatus,
) {
  const db = await getDb();
  await updateDoc(doc(db, COLLECTIONS.notifications, notificationId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

// Toggles club bookmark IDs inside the student's user document
export async function toggleSavedClub(
  userId: string,
  clubId: string,
  currentlySaved: boolean,
) {
  const db = await getDb();
  await updateDoc(doc(db, COLLECTIONS.users, userId), {
    savedClubIds: currentlySaved ? arrayRemove(clubId) : arrayUnion(clubId),
    updatedAt: serverTimestamp(),
  });
  return !currentlySaved;
}

// Toggles event bookmark IDs inside the student's user document
export async function toggleSavedEvent(
  userId: string,
  eventId: string,
  currentlySaved: boolean,
) {
  const db = await getDb();
  await updateDoc(doc(db, COLLECTIONS.users, userId), {
    savedEventIds: currentlySaved ? arrayRemove(eventId) : arrayUnion(eventId),
    updatedAt: serverTimestamp(),
  });
  return !currentlySaved;
}

// Toggles event RSVP IDs inside the student's user document
export async function toggleEventRsvp(
  userId: string,
  eventId: string,
) {
  const db = await getDb();
  const userRef = doc(db, COLLECTIONS.users, userId);
  const eventRef = doc(db, COLLECTIONS.events, eventId);

  return runTransaction(db, async (transaction) => {
    const [userSnapshot, eventSnapshot] = await Promise.all([
      transaction.get(userRef),
      transaction.get(eventRef),
    ]);

    if (!userSnapshot.exists() || !eventSnapshot.exists()) {
      throw new Error("The student or event record was not found.");
    }

    const savedRsvps = Array.isArray(userSnapshot.data().rsvpedEventIds)
      ? userSnapshot.data().rsvpedEventIds
      : [];
    const currentlySaved = savedRsvps.includes(eventId);
    const nextRsvp = !currentlySaved;
    const countChange = nextRsvp ? 1 : -1;
    const currentCount = Number(eventSnapshot.data().rsvpCount ?? 0);

    transaction.update(userRef, {
      rsvpedEventIds: nextRsvp
        ? arrayUnion(eventId)
        : arrayRemove(eventId),
      rsvpMutation: {
        eventId,
        countChange,
      },
      updatedAt: serverTimestamp(),
    });

    transaction.update(eventRef, {
      rsvpCount: Math.max(0, currentCount + countChange),
      updatedAt: serverTimestamp(),
    });

    return nextRsvp;
  });
}

// Creates a join request in Firestore and triggers an immediate feedback notification
export async function createJoinRequest(
  input: JoinRequestInput,
): Promise<JoinRequest> {
  const request = await protectedApiRequest<{
    clubId: string;
    id: string;
    status: RequestStatus;
  }>("/api/student/join-requests", {
    method: "POST",
    body: JSON.stringify({ clubId: input.clubId, message: input.message }),
  });

  return {
    id: request.id,
    clubId: request.clubId,
    studentId: input.userId,
    message: input.message,
    status: request.status,
    createdAt: "Just now",
  } satisfies JoinRequest;
}

export async function cancelJoinRequest(requestId: string) {
  await protectedApiRequest<{ deleted: boolean }>(
    "/api/student/join-requests",
    {
      method: "DELETE",
      body: JSON.stringify({ requestId }),
    },
  );
}

// Creates a student inquiry thread and triggers an immediate feedback notification
export async function createClubInquiry(
  input: ClubInquiryInput,
): Promise<ClubInquiry> {
  const db = await getDb();
  const inquiry = {
    clubId: input.clubId,
    clubName: input.clubName ?? "",
    studentId: input.userId,
    studentName: input.studentName ?? "Student",
    subject: input.subject,
    message: input.message,
    status: "open" as InquiryStatus,
    createdAt: serverTimestamp(),
    replies: [],
  };

  const inquiryReference = doc(collection(db, COLLECTIONS.inquiries));
  const notificationReference = doc(collection(db, COLLECTIONS.notifications));
  const batch = writeBatch(db);

  batch.set(inquiryReference, inquiry);
  batch.set(notificationReference, {
    userId: input.userId,
    clubId: input.clubId,
    title: "Question sent",
    body: "Your question was sent to the official club inbox.",
    type: "inquiry",
    status: "unread",
    relatedHref: "/notifications",
    createdAt: serverTimestamp(),
  });
  await batch.commit();

  return {
    id: inquiryReference.id,
    clubId: inquiry.clubId,
    studentId: inquiry.studentId,
    subject: inquiry.subject,
    message: inquiry.message,
    status: readInquiryStatus(inquiry.status),
    createdAt: "Just now",
    replies: [],
  } satisfies ClubInquiry;
}
