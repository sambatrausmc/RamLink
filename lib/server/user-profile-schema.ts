import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";

const PROFILE_ARRAY_FIELDS = [
  "interests",
  "joinedClubIds",
  "savedClubIds",
  "savedEventIds",
  "rsvpedEventIds",
  "managedClubIds",
] as const;

export type ProfileSchemaStatus = "current" | "missing" | "updated";

export async function reconcileUserProfileSchema(
  uid: string,
): Promise<ProfileSchemaStatus> {
  const database = getAdminDb();
  const profileReference = database.collection("users").doc(uid);

  return database.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(profileReference);
    if (!snapshot.exists) {
      return "missing";
    }

    const data = snapshot.data() ?? {};
    const patch: Record<string, string[]> = {};

    for (const field of PROFILE_ARRAY_FIELDS) {
      if (!Object.hasOwn(data, field)) {
        patch[field] = [];
        continue;
      }

      if (!Array.isArray(data[field])) {
        throw new Error(`The ${field} profile field must be an array.`);
      }
    }

    if (Object.keys(patch).length === 0) {
      return "current";
    }

    transaction.update(profileReference, {
      ...patch,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return "updated";
  });
}
