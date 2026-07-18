import { getApp, getApps, initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeFirebaseAppCheck } from "@/lib/firebase/app-check";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);
initializeFirebaseAppCheck(firebaseApp);

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

let persistenceReady: Promise<void> | null = null;

export function ensureAuthPersistence() {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (!persistenceReady) {
    persistenceReady = setPersistence(auth, browserLocalPersistence).catch(
      () => undefined,
    );
  }

  return persistenceReady;
}
