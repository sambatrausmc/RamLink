import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { requireFarmingdaleEmail } from "@/lib/auth-email-policy";
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
  const { auth, ensureAuthPersistence } = await import("@/lib/firebase/client");
  await ensureAuthPersistence();
  return auth;
}

export async function registerStudentAccount(input: RegisterStudentInput) {
  const email = requireFarmingdaleEmail(input.email);
  const displayName = input.displayName.trim();
  const auth = await getAuthClient();
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    input.password,
  );
  await updateProfile(credential.user, {
    displayName,
  });
  await sendEmailVerification(credential.user, {
    url: new URL("/verify-email", window.location.origin).toString(),
    handleCodeInApp: false,
  });
  return credential.user;
}
export async function loginWithEmailAndPassword(input: LoginInput) {
  const auth = await getAuthClient();
  const credential = await signInWithEmailAndPassword(
    auth,
    input.email,
    input.password,
  );
  return credential.user;
}
export async function logoutCurrentUser() {
  const auth = await getAuthClient();
  await signOut(auth);
}
export async function resetPasswordForEmail(email: string) {
  const auth = await getAuthClient();
  await sendPasswordResetEmail(auth, email);
}
