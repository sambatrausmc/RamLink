import {
  createUserWithEmailAndPassword,
  reload,
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

function getVerificationActionSettings() {
  return {
    url: new URL("/verify-email", window.location.origin).toString(),
    handleCodeInApp: false,
  };
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
  await sendEmailVerification(
    credential.user,
    getVerificationActionSettings(),
  );
  return credential.user;
}

export async function resendCurrentUserVerification() {
  const auth = await getAuthClient();
  if (!auth.currentUser) {
    throw new Error("Sign in before requesting another verification email.");
  }
  await sendEmailVerification(
    auth.currentUser,
    getVerificationActionSettings(),
  );
}

export async function reloadCurrentUser() {
  const auth = await getAuthClient();
  if (!auth.currentUser) {
    return null;
  }
  await reload(auth.currentUser);
  return auth.currentUser;
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
