import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { StudentProfile, UserRole } from "@/lib/types";

type CreateStudentProfileInput = {
  displayName: string;
  email: string;
};

export type UpdateStudentProfileInput = Pick
  StudentProfile,
  "displayName" | "major" | "classYear" | "interests"
>;

async function getDb() {
  const { db } = await import("@/lib/firebase/client");
  return db;
}

function readString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function readStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function readRole(value: unknown): UserRole {
  return value === "clubOfficer" || value === "admin" ? value : "student";
}

function normalizeStudentProfile(id: string, data: DocumentData): StudentProfile {
  return {
    id,
    role: readRole(data.role),
    displayName: readString(data.displayName, "Student"),
    email: readString(data.email),
    major: readString(data.major),
    classYear: readString(data.classYear),
    interests: readStringArray(data.interests),
    joinedClubIds: readStringArray(data.joinedClubIds),
    savedClubIds: readStringArray(data.savedClubIds),
    savedEventIds: readStringArray(data.savedEventIds),
    rsvpedEventIds: readStringArray(data.rsvpedEventIds),
  };
}

function buildNewStudentProfile(uid: string, input: CreateStudentProfileInput): StudentProfile {
  return {
    id: uid,
    role: "student",
    displayName: input.displayName,
    email: input.email,
    major: "",
    classYear: "",
    interests: [],
    joinedClubIds: [],
    savedClubIds: [],
    savedEventIds: [],
    rsvpedEventIds: [],
  };
}

export async function createStudentProfile(uid: string, input: CreateStudentProfileInput) {
  // The user document ID matches the Firebase Auth UID so pages can load the right student.
  const db = await getDb();
  await setDoc(doc(db, COLLECTIONS.users, uid), {
    ...buildNewStudentProfile(uid, input),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getStudentProfile(uid: string) {
  const db = await getDb();
  const snapshot = await getDoc(doc(db, COLLECTIONS.users, uid));
  if (!snapshot.exists()) {
    return null;
  }
  return normalizeStudentProfile(snapshot.id, snapshot.data());
}

export async function updateStudentProfile(uid: string, input: UpdateStudentProfileInput) {
  const db = await getDb();
  await updateDoc(doc(db, COLLECTIONS.users, uid), {
    ...input,
    updatedAt: serverTimestamp(),
  });
  const updatedProfile = await getStudentProfile(uid);
  if (!updatedProfile) {
    throw new Error("Student profile was not found after update.");
  }
  return updatedProfile;
} 