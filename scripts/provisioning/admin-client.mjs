import fs from "node:fs";
import path from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

export const TARGET_PROJECT_ID = "csc325-firebase-app";

const confirmation = process.argv
  .find((argument) => argument.startsWith("--confirm-project="))
  ?.split("=")[1];

if (confirmation !== TARGET_PROJECT_ID) {
  throw new Error(
    `Run this command with --confirm-project=${TARGET_PROJECT_ID}.`,
  );
}

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!serviceAccountPath) {
  throw new Error(
    "GOOGLE_APPLICATION_CREDENTIALS must point to a service-account JSON file outside the repository.",
  );
}

const resolvedCredentialPath = path.resolve(serviceAccountPath);

if (!fs.existsSync(resolvedCredentialPath)) {
  throw new Error("The configured service-account JSON file was not found.");
}

const serviceAccount = JSON.parse(
  fs.readFileSync(resolvedCredentialPath, "utf8"),
);

if (serviceAccount.project_id !== TARGET_PROJECT_ID) {
  throw new Error(`The service account must belong to ${TARGET_PROJECT_ID}.`);
}

const app =
  getApps().find((candidate) => candidate.name === "ramlink-provisioning") ??
  initializeApp(
    {
      credential: cert(serviceAccount),
      projectId: TARGET_PROJECT_ID,
    },
    "ramlink-provisioning",
  );

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
export { FieldValue };

export function requireEnvironment(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required in .env.local.`);
  }
  return value;
}