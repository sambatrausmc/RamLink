import { sendEmailVerification, sendPasswordResetEmail, signOut } from "firebase/auth";

export async function requestPasswordReset(email: string) {
  const { auth } = await import("@/lib/firebase/client");
  await sendPasswordResetEmail(auth, email);
}

// Triggers an email verification link to the currently logged-in student
export async function sendCurrentUserVerification() {
  const { auth } = await import("@/lib/firebase/client");
  if (!auth.currentUser) throw new Error("Sign in before requesting verification.");
  await sendEmailVerification(auth.currentUser);
}

// Calls our secure backend endpoint to wipe database records and delete the Auth account
export async function deleteCurrentAccount() {
  const { auth } = await import("@/lib/firebase/client");
  const user = auth.currentUser;
  if (!user) throw new Error("Sign in before deleting an account.");

  const response = await fetch("/api/account", {
    method: "DELETE",
    headers: { Authorization: `Bearer ${await user.getIdToken()}` },
  });

  if (!response.ok) throw new Error("Account deletion failed.");
  await signOut(auth);
}
