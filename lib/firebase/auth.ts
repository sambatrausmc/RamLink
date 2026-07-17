import {
createUserWithEmailAndPassword,
sendPasswordResetEmail,
signInWithEmailAndPassword,
signOut,
updateProfile,
} from "firebase/auth";
import { createStudentProfile } from "@/lib/firebase/user-profile";
export type RegisterStudentInput = {
displayName: string;
email: string;
password: string;
};
export type LoginInput = {
email: string;
password: string;
};
async function getAuthClient() {
const { auth } = await import("@/lib/firebase/client");
return auth;
}


export async function registerStudentAccount(input: RegisterStudentInput) {
// Firebase Auth creates the login account. Firestore stores the student profile data.
const auth = await getAuthClient();
const credential = await createUserWithEmailAndPassword(
auth,
input.email,
input.password,
);
await updateProfile(credential.user, {
displayName: input.displayName,
});
await createStudentProfile(credential.user.uid, {
displayName: input.displayName,

    email: input.email,
  });
  return credential.user;
}

export async function loginWithEmailAndPassword(input: LoginInput) {
  const auth = await getAuthClient();
  const credential = await signInWithEmailAndPassword(auth, input.email, input.password);
  return credential.user;
}

export async function logoutCurrentUser() {
  const auth = await getAuthClient();
  await signOut(auth);
}