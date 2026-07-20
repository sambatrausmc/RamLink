import {
  createUserWithEmailAndPassword,
  getIdToken,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { requireFarmingdaleEmail } from "@/lib/auth-email-policy";
import {
  requireAuthEmailCooldown,
  startAuthEmailCooldown,
} from "@/lib/auth-action-cooldown";
import {
  clearServerSession,
  createServerSession,
} from "@/lib/firebase/server-session";
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
  startAuthEmailCooldown("verification");
  return credential.user;
}

export async function resendCurrentUserVerification() {
  requireAuthEmailCooldown("verification");
  const auth = await getAuthClient();
  if (!auth.currentUser?.email) {
    throw new Error("Sign in before requesting another verification email.");
  }
  requireFarmingdaleEmail(auth.currentUser.email);
  await sendEmailVerification(
    auth.currentUser,
    getVerificationActionSettings(),
  );
  startAuthEmailCooldown("verification");
}

export async function reloadCurrentUser() {
  const auth = await getAuthClient();
  if (!auth.currentUser) {
    return null;
  }
  await reload(auth.currentUser);
  if (auth.currentUser.emailVerified) {
    await getIdToken(auth.currentUser, true);
    await createServerSession(auth.currentUser);
  }
  return auth.currentUser;
}
export async function loginWithEmailAndPassword(input: LoginInput) {
  const email = requireFarmingdaleEmail(input.email);
  const auth = await getAuthClient();
  const credential = await signInWithEmailAndPassword(
    auth,
    email,
    input.password,
  );
  if (credential.user.emailVerified) {
    await createServerSession(credential.user);
  }
  return credential.user;
}
export async function logoutCurrentUser() {
  const auth = await getAuthClient();
  await clearServerSession();
  await signOut(auth);
}
export async function resetPasswordForEmail(email: string) {
  requireAuthEmailCooldown("password-reset");
  const auth = await getAuthClient();
  await sendPasswordResetEmail(auth, requireFarmingdaleEmail(email));
  startAuthEmailCooldown("password-reset");
}
