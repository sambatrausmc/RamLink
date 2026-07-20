import { getIdToken } from "firebase/auth";
import { getAppCheckRequestHeaders } from "@/lib/firebase/app-check";

type ErrorPayload = { error?: unknown };

export async function protectedApiRequest<T>(
  path: string,
  init: Omit<RequestInit, "headers"> & {
    headers?: Record<string, string>;
  } = {},
) {
  const { auth, ensureAuthPersistence } = await import("@/lib/firebase/client");
  await ensureAuthPersistence();
  if (!auth.currentUser) {
    throw new Error("Sign in before completing this action.");
  }

  const [idToken, appCheckHeaders] = await Promise.all([
    getIdToken(auth.currentUser),
    getAppCheckRequestHeaders(),
  ]);
  const response = await fetch(path, {
    ...init,
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
      ...appCheckHeaders,
      ...init.headers,
    },
  });
  const payload = (await response.json().catch(() => ({}))) as T & ErrorPayload;
  if (!response.ok) {
    const message =
      typeof payload.error === "string"
        ? payload.error
        : "Unable to complete this action right now.";
    throw new Error(message);
  }
  return payload;
}
