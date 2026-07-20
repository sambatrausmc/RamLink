import { getIdToken, type User } from "firebase/auth";
import { CSRF_HEADER_NAME } from "@/lib/auth-session-contract";
import { getAppCheckRequestHeaders } from "@/lib/firebase/app-check";

type SessionResponse = {
  authenticated: boolean;
  uid?: string;
};

async function getCsrfToken() {
  const response = await fetch("/api/auth/csrf", {
    cache: "no-store",
    credentials: "same-origin",
  });
  if (!response.ok) {
    throw new Error("Unable to prepare the secure session request.");
  }

  const body = (await response.json()) as { csrfToken?: unknown };
  if (typeof body.csrfToken !== "string") {
    throw new Error("The secure session request was incomplete.");
  }
  return body.csrfToken;
}

export async function readServerSession() {
  const appCheckHeaders = await getAppCheckRequestHeaders();
  const response = await fetch("/api/auth/session", {
    cache: "no-store",
    credentials: "same-origin",
    headers: appCheckHeaders,
  });
  if (response.status === 401) {
    return null;
  }
  if (!response.ok) {
    throw new Error("Unable to verify the server session.");
  }
  return (await response.json()) as SessionResponse;
}

export async function createServerSession(user: User) {
  const [csrfToken, idToken, appCheckHeaders] = await Promise.all([
    getCsrfToken(),
    getIdToken(user, true),
    getAppCheckRequestHeaders(),
  ]);
  const response = await fetch("/api/auth/session", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "content-type": "application/json",
      ...appCheckHeaders,
      [CSRF_HEADER_NAME]: csrfToken,
    },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    throw new Error("Sign in again to create a secure RamLink session.");
  }
}

export async function clearServerSession() {
  const [csrfToken, appCheckHeaders] = await Promise.all([
    getCsrfToken(),
    getAppCheckRequestHeaders(),
  ]);
  const response = await fetch("/api/auth/session", {
    method: "DELETE",
    credentials: "same-origin",
    headers: { ...appCheckHeaders, [CSRF_HEADER_NAME]: csrfToken },
  });

  if (!response.ok) {
    throw new Error("Unable to clear the secure RamLink session.");
  }
}
