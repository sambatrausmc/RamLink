import { addDoc, arrayRemove, arrayUnion, collection, doc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { ClubInquiry, JoinRequest, RequestStatus } from "@/lib/types";

type TimestampLike = {
  toDate: () => Date;
};

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

function isTimestampLike(value: unknown): value is TimestampLike {
  return typeof value === "object" && value != null && "toDate" in value && typeof (value as TimestampLike).toDate === "function";
}

function formatDate(value: unknown) {
  if (isTimestampLike(value)) {
    return value.toDate().toLocaleDateString();
  }
  return typeof value === "string" ? value : "Just now";
}

function normalizeRequestStatus(value: unknown): RequestStatus {
  return value === "approved" || value === "rejected" ? value : "pending";
}

// ACTION: Save/Unsave a Club
export async function toggleSavedClub(userId: string, clubId: string, shouldSave: boolean) {
  await updateDoc(doc(db, COLLECTIONS.users, userId), {
    savedClubIds: shouldSave ? arrayUnion(clubId) : arrayRemove(clubId),
    updatedAt: serverTimestamp(),
  });
}

// ACTION: Save/Unsave an Event
export async function toggleSavedEvent(userId: string, eventId: string, shouldSave: boolean) {
  await updateDoc(doc(db, COLLECTIONS.users, userId), {
    savedEventIds: shouldSave ? arrayUnion(eventId) : arrayRemove(eventId),
    updatedAt: serverTimestamp(),
  });
}

// ACTION: RSVP to an Event
export async function toggleEventRsvp(userId: string, eventId: string, shouldRsvp: boolean) {
  await updateDoc(doc(db, COLLECTIONS.users, userId), {
    rsvpedEventIds: shouldRsvp ? arrayUnion(eventId) : arrayRemove(eventId),
    updatedAt: serverTimestamp(),
  });
}

// ACTION: Submit a Join Request
export async function createJoinRequest(input: JoinRequestInput): Promise<JoinRequest> {
  const requestData = {
    clubId: input.clubId,
    studentId: input.userId,
    message: input.message,
    status: "pending" as const,
    createdAt: serverTimestamp(),
  };
  const requestRef = await addDoc(collection(db, COLLECTIONS.joinRequests), requestData);
  return {
    id: requestRef.id,
    clubId: input.clubId,
    studentId: input.userId,
    message: input.message,
    status: "pending",
    createdAt: "Just now",
  };
}

// ACTION: Send an Inquiry to a Club
export async function createClubInquiry(input: ClubInquiryInput): Promise<ClubInquiry> {
  const inquiryData = {
    clubId: input.clubId,
    studentId: input.userId,
    subject: input.subject,
    message: input.message,
    status: "open" as const,
    replies: [],
    createdAt: serverTimestamp(),
  };
  const inquiryRef = await addDoc(collection(db, COLLECTIONS.inquiries), inquiryData);
  return {
    id: inquiryRef.id,
    clubId: input.clubId,
    studentId: input.userId,
    subject: input.subject,
    message: input.message,
    status: "open",
    createdAt: "Just now",
    replies: [],
  };
}

// FETCH: Get all Join Requests for the logged-in student
export async function getStudentJoinRequests(userId: string): Promise<JoinRequest[]> {
  const requestsQuery = query(collection(db, COLLECTIONS.joinRequests), where("studentId", "==", userId));
  const requestSnapshot = await getDocs(requestsQuery);
  
  return requestSnapshot.docs.map((requestDoc) => {
    const data = requestDoc.data();
    return {
      id: requestDoc.id,
      clubId: typeof data.clubId === "string" ? data.clubId : "",
      studentId: typeof data.studentId === "string" ? data.studentId : userId,
      message: typeof data.message === "string" ? data.message : "",
      status: normalizeRequestStatus(data.status),
      createdAt: formatDate(data.createdAt),
    };
  });
}
