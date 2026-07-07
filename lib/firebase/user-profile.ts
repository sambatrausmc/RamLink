import type { User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { StudentProfile } from "@/lib/types";

export type FirebaseStudentProfile = StudentProfile & {
  role: "student";
  rsvpedEventIds: string[];
};

export type StudentProfileEditInput = {
  displayName: string;
  major: string;
  classYear: string;
  interests: string[];
};

type RawProfileData = Record<string, unknown>;

// 1. DATA CLEANUP HELPERS
// These prevent the app from crashing if Firebase returns weird or missing data.
function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

// Ensure every profile exactly matches the structure the frontend expects.
function normalizeStudentProfile(userId: string, data: RawProfileData): FirebaseStudentProfile {
  return {
    id: userId,
    displayName: stringValue(data.displayName, "Student User"),
    email: stringValue(data.email),
    role: "student",
    major: stringValue(data.major),
    classYear: stringValue(data.classYear),
    interests: stringArray(data.interests),
    joinedClubIds: stringArray(data.joinedClubIds),
    savedClubIds: stringArray(data.savedClubIds),
    savedEventIds: stringArray(data.savedEventIds),
    rsvpedEventIds: stringArray(data.rsvpedEventIds),
  };
}

// 2. CREATE A NEW PROFILE
// This gets called right after a student registers.
export async function createStudentProfileFromUser(
  user: User,
  overrides: Partial<Pick<FirebaseStudentProfile, "displayName" | "email">> = {}
) {
  const profileRef = doc(db, COLLECTIONS.users, user.uid);
  const profile = normalizeStudentProfile(user.uid, {
    displayName: overrides.displayName ?? user.displayName ?? "Student User",
    email: overrides.email ?? user.email ?? "",
    role: "student",
    major: "",
    classYear: "",
    interests: [],
    joinedClubIds: [],
    savedClubIds: [],
    savedEventIds: [],
    rsvpedEventIds: [],
  });

  await setDoc(
    profileRef,
    {
      ...profile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true } // Merge ensures we don't accidentally wipe existing data
  );

  return profile;
}

// 3. FETCH AN EXISTING PROFILE
export async function getStudentProfile(user: User) {
  const profileRef = doc(db, COLLECTIONS.users, user.uid);
  const profileSnapshot = await getDoc(profileRef);

  // If they somehow authenticated but don't have a profile doc, make one right now!
  if (!profileSnapshot.exists()) {
    return createStudentProfileFromUser(user);
  }

  return normalizeStudentProfile(user.uid, {
    ...profileSnapshot.data(),
    email: user.email ?? profileSnapshot.data()?.email,
  });
}

// 4. UPDATE A PROFILE
export async function updateStudentProfile(userId: string, input: StudentProfileEditInput) {
  const profileRef = doc(db, COLLECTIONS.users, userId);
  await updateDoc(profileRef, {
    displayName: input.displayName,
    major: input.major,
    classYear: input.classYear,
    interests: input.interests,
    updatedAt: serverTimestamp(),
  });

  const updatedProfile = await getDoc(profileRef);
  return normalizeStudentProfile(userId, updatedProfile.data() ?? input);
}
