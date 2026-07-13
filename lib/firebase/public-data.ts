import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type {
  Announcement,
  Club,
  ClubCategory,
  ClubInquiry,
  EventItem,
  Interest,
  InquiryStatus,
  JoinRequest,
  NotificationItem,
  NotificationStatus,
  Report,
  ReportStatus,
  RequestStatus,
  Resource,
  ResourceType,
  StudentProfile,
  UserRole,
} from "@/lib/types";

// Default fallback ID used when testing officer workflows
export const DEFAULT_MANAGED_CLUB_ID = "cs-club";

const categories: ClubCategory[] = [
  "Academic",
  "Business",
  "Community Service",
  "Culture",
  "Health",
  "Leadership",
  "Recreation",
  "Technology",
];

const resourceTypes: ResourceType[] = ["Form", "Waiver", "Guide", "Link", "Document"];

// Dynamically import the Firebase client db to avoid server-side rendering issues
async function getDb() {
  const { db } = await import("@/lib/firebase/client");
  return db;
}

// Helper utility functions to guarantee clean data types even if Firestore data is missing
function readString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function readNumber(value: unknown, fallback = 0) {
  return typeof value === "number" ? value : fallback;
}

function readBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function readStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function readDate(value: unknown, fallback = "Just now") {
  if (typeof value === "string") {
    return value;
  }
  if (value && typeof value === "object" && "toDate" in value) {
    const timestamp = value as { toDate?: () => Date };
    if (typeof timestamp.toDate === "function") {
      return timestamp.toDate().toLocaleDateString();
    }
  }
  return fallback;
}

function readCategory(value: unknown): ClubCategory {
  return categories.includes(value as ClubCategory) ? (value as ClubCategory) : "Academic";
}

function readResourceType(value: unknown): ResourceType {
  return resourceTypes.includes(value as ResourceType) ? (value as ResourceType) : "Link";
}

function readRequestStatus(value: unknown): RequestStatus {
  return value === "approved" || value === "rejected" ? value : "pending";
}

function readInquiryStatus(value: unknown): InquiryStatus {
  return value === "resolved" ? "resolved" : "open";
}

function readNotificationStatus(value: unknown): NotificationStatus {
  return value === "read" ? "read" : "unread";
}

function readReportStatus(value: unknown): ReportStatus {
  if (value === "reviewing" || value === "dismissed" || value === "removed") {
    return value;
  }
  return "new";
}

function readUserRole(value: unknown): UserRole {
  if (value === "clubOfficer" || value === "admin") {
    return value;
  }
  return "student";
}

// Normalizer functions convert raw Firestore document snapshots into structured app objects
function normalizeClub(snapshot: QueryDocumentSnapshot<DocumentData>): Club {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    name: readString(data.name, "Untitled Club"),
    shortName: readString(data.shortName, "CLB"),
    category: readCategory(data.category),
    description: readString(data.description),
    meetingSchedule: readString(data.meetingSchedule, "Schedule TBD"),
    meetingLocation: readString(data.meetingLocation, "Location TBD"),
    contactEmail: readString(data.contactEmail),
    tags: readStringArray(data.tags),
    memberCount: readNumber(data.memberCount),
    nextEventId: readString(data.nextEventId) || undefined,
    isSuggested: readBoolean(data.isSuggested),
    isSaved: readBoolean(data.isSaved),
    membershipStatus: readString(data.membershipStatus, "notJoined") as Club["membershipStatus"],
  };
}

function normalizeEvent(snapshot: QueryDocumentSnapshot<DocumentData>): EventItem {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    clubId: readString(data.clubId),
    clubName: readString(data.clubName) || undefined,
    title: readString(data.title, "Untitled Event"),
    description: readString(data.description),
    date: readString(data.date),
    startTime: readString(data.startTime),
    endTime: readString(data.endTime),
    location: readString(data.location, "Location TBD"),
    rsvpCount: readNumber(data.rsvpCount),
    isSaved: readBoolean(data.isSaved),
    hasRsvped: readBoolean(data.hasRsvped),
  };
}

function normalizeAnnouncement(snapshot: QueryDocumentSnapshot<DocumentData>): Announcement {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    clubId: readString(data.clubId),
    clubName: readString(data.clubName) || undefined,
    title: readString(data.title, "Untitled Announcement"),
    body: readString(data.body),
    createdAt: readDate(data.createdAt),
    priority: data.priority === "important" ? "important" : "normal",
  };
}

function normalizeResource(snapshot: QueryDocumentSnapshot<DocumentData>): Resource {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    clubId: readString(data.clubId),
    title: readString(data.title, "Untitled Resource"),
    description: readString(data.description),
    type: readResourceType(data.type),
    url: readString(data.url, "#"),
    updatedAt: readDate(data.updatedAt),
  };
}

function normalizeInterest(snapshot: QueryDocumentSnapshot<DocumentData>): Interest {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    name: readString(data.name, "Interest"),
    category: readCategory(data.category),
  };
}

function normalizeStudent(snapshot: QueryDocumentSnapshot<DocumentData>): StudentProfile {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    role: readUserRole(data.role),
    displayName: readString(data.displayName, "Student"),
    email: readString(data.email),
    major: readString(data.major),
    classYear: readString(data.classYear),
    interests: readStringArray(data.interests),
    joinedClubIds: readStringArray(data.joinedClubIds),
    savedClubIds: readStringArray(data.savedClubIds),
    savedEventIds: readStringArray(data.savedEventIds),
    rsvpedEventIds: readStringArray(data.rsvpedEventIds),
    managedClubIds: readStringArray(data.managedClubIds),
  };
}

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
    createdAt: readDate(data.createdAt),
  };
}

function normalizeInquiry(snapshot: QueryDocumentSnapshot<DocumentData>): ClubInquiry {
  const data = snapshot.data();
  const replies = Array.isArray(data.replies)
    ? data.replies.map((reply, index) => ({
        id: readString(reply?.id, `reply-${index + 1}`),
        senderName: readString(reply?.senderName, "Club Officer"),
        body: readString(reply?.body),
        createdAt: readDate(reply?.createdAt),
      }))
    : [];
  return {
    id: snapshot.id,
    clubId: readString(data.clubId),
    clubName: readString(data.clubName) || undefined,
    studentId: readString(data.studentId),
    studentName: readString(data.studentName) || undefined,
    subject: readString(data.subject, "Club inquiry"),
    message: readString(data.message),
    status: readInquiryStatus(data.status),
    createdAt: readDate(data.createdAt),
    replies,
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
    createdAt: readDate(data.createdAt),
    relatedHref: readString(data.relatedHref, "/dashboard"),
  };
}

function normalizeReport(snapshot: QueryDocumentSnapshot<DocumentData>): Report {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    reporterName: readString(data.reporterName, "RamLink user"),
    contentType:
      data.contentType === "Event" ||
      data.contentType === "Resource" ||
      data.contentType === "Club Profile"
        ? data.contentType
        : "Announcement",
    contentTitle: readString(data.contentTitle, "Reported content"),
    reason: readString(data.reason),
    status: readReportStatus(data.status),
    createdAt: readDate(data.createdAt),
  };
}

// Generic collection fetcher that applies the appropriate normalizer
async function getCollection<T>(name: string, normalize: (snapshot: QueryDocumentSnapshot<DocumentData>) => T) {
  const db = await getDb();
  const snapshot = await getDocs(collection(db, name));
  return snapshot.docs.map(normalize);
}

// PUBLIC FETCHERS: These functions are called by Next.js server components and client pages
export async function getClubs() {
  return getCollection(COLLECTIONS.clubs, normalizeClub);
}

export async function getClubByIdFromFirestore(clubId: string) {
  const db = await getDb();
  const snapshot = await getDoc(doc(db, COLLECTIONS.clubs, clubId));
  return snapshot.exists() ? normalizeClub(snapshot as QueryDocumentSnapshot<DocumentData>) : null;
}

export async function getInterests() {
  return getCollection(COLLECTIONS.interests, normalizeInterest);
}

export async function getEvents() {
  return getCollection(COLLECTIONS.events, normalizeEvent);
}

export async function getEventsForClub(clubId: string) {
  const db = await getDb();
  const snapshot = await getDocs(query(collection(db, COLLECTIONS.events), where("clubId", "==", clubId)));
  return snapshot.docs.map(normalizeEvent);
}

export async function getAnnouncements() {
  return getCollection(COLLECTIONS.announcements, normalizeAnnouncement);
}

export async function getAnnouncementsForClub(clubId: string) {
  const db = await getDb();
  const snapshot = await getDocs(query(collection(db, COLLECTIONS.announcements), where("clubId", "==", clubId)));
  return snapshot.docs.map(normalizeAnnouncement);
}

export async function getResourcesForClub(clubId: string) {
  const db = await getDb();
  const snapshot = await getDocs(query(collection(db, COLLECTIONS.resources), where("clubId", "==", clubId)));
  return snapshot.docs.map(normalizeResource);
}

export async function getStudents() {
  return getCollection(COLLECTIONS.users, normalizeStudent);
}

export async function getMembersForClub(clubId: string) {
  const students = await getStudents();
  return students.filter((student) => student.joinedClubIds.includes(clubId));
}

export async function getNotificationsForUser(userId: string) {
  const db = await getDb();
  const snapshot = await getDocs(query(collection(db, COLLECTIONS.notifications), where("userId", "==", userId)));
  return snapshot.docs.map(normalizeNotification);
}

export async function getJoinRequestsForClub(clubId: string) {
  const db = await getDb();
  const snapshot = await getDocs(query(collection(db, COLLECTIONS.joinRequests), where("clubId", "==", clubId)));
  return snapshot.docs.map(normalizeJoinRequest);
}

export async function getInquiriesForClub(clubId: string) {
  const db = await getDb();
  const snapshot = await getDocs(query(collection(db, COLLECTIONS.inquiries), where("clubId", "==", clubId)));
  return snapshot.docs.map(normalizeInquiry);
}

export async function getReports() {
  return getCollection(COLLECTIONS.reports, normalizeReport);
}
