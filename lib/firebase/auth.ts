import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
// Import our new helper!
import { createStudentProfileFromUser } from "@/lib/firebase/user-profile";

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
  // 1. Create the base Firebase Authentication user
  const credential = await createUserWithEmailAndPassword(auth, input.email, input.password);
  
  // 2. Attach the display name to the Auth object
  await updateProfile(credential.user, {
    displayName: input.displayName,
  });
  
  // 3. Generate their fully-fleshed out Firestore profile document!
  await createStudentProfileFromUser(credential.user, {
    displayName: input.displayName,
    email: input.email,
  });
  
  return credential.user;
}

export async function loginWithEmailAndPassword(input: LoginInput) {
  const credential = await signInWithEmailAndPassword(auth, input.email, input.password);
  return credential.user;
}

export async function logoutCurrentUser() {
  await signOut(auth);
}
