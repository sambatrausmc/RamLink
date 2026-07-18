import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
  signOut,
} from "firebase/auth";

// Triggers an email verification link to the currently logged-in student
export async function sendCurrentUserVerification() {
  const { auth } = await import("@/lib/firebase/client");
  if (!auth.currentUser) throw new Error("Sign in before requesting verification.");
  await sendEmailVerification(auth.currentUser);
}

// Calls our secure backend endpoint to wipe database records and delete the Auth account
export async function deleteCurrentAccount(password: string) {
  const { auth } = await import("@/lib/firebase/client");
  const user = auth.currentUser;
  if (!user) throw new Error("Sign in before deleting an account.");
  if (!user.email) throw new Error("This account does not have an email address.");
  if (!password) throw new Error("Enter your current password.");

  const credential = EmailAuthProvider.credential(user.email, password);
  await reauthenticateWithCredential(user, credential);
  const idToken = await user.getIdToken(true);

  const response = await fetch("/api/account", {
    method: "DELETE",
    headers: { Authorization: `Bearer ${idToken}` },
  });

  if (!response.ok) {
    const result = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(result?.error ?? "Account deletion failed.");
  }

  await signOut(auth);
}
