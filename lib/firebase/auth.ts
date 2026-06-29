import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";

// Quick TypeScript types so we know exactly what data the forms are passing us
export type RegisterStudentInput = {
  displayName: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export async function registerStudentAccount(input: RegisterStudentInput) {
  // 1. Tell Firebase Auth to actually create the user account with their email and password
  const credential = await createUserWithEmailAndPassword(auth, input.email, input.password);
  
  // 2. Attach their full name to their new Auth profile so it's not blank
  await updateProfile(credential.user, {
    displayName: input.displayName,
  });
  
  // 3. Create a matching database document in Firestore for this user.
  // We use their unique Firebase Auth UID as the document ID so they are permanently linked!
  await setDoc(doc(db, COLLECTIONS.users, credential.user.uid), {
    displayName: input.displayName,
    email: input.email,
    role: "student", // Hardcoding student role by default for now
    major: "",
    classYear: "",
    interests: [],
    joinedClubIds: [],
    savedClubIds: [],
    savedEventIds: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  
  return credential.user;
}

export async function loginWithEmailAndPassword(input: LoginInput) {
  // Simple pass-through to Firebase to verify credentials and log them in
  const credential = await signInWithEmailAndPassword(auth, input.email, input.password);
  return credential.user;
}

export async function logoutCurrentUser() {
  // Nuke the current session
  await signOut(auth);
}