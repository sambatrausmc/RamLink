import { sendPasswordResetEmail } from "firebase/auth";

// Triggers a password recovery email to the provided student address
export async function requestPasswordReset(email: string) {
  const { auth } = await import("@/lib/firebase/client");
  await sendPasswordResetEmail(auth, email);
}
