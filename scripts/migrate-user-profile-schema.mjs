import {
  adminDb,
  FieldValue,
} from "./provisioning/admin-client.mjs";

const PROFILE_ARRAY_FIELDS = [
  "interests",
  "joinedClubIds",
  "savedClubIds",
  "savedEventIds",
  "rsvpedEventIds",
  "managedClubIds",
];

const applyChanges = process.argv.includes("--apply");

function buildProfilePatch(profileId, data) {
  const patch = {};

  for (const field of PROFILE_ARRAY_FIELDS) {
    if (!Object.hasOwn(data, field)) {
      patch[field] = [];
      continue;
    }

    if (!Array.isArray(data[field])) {
      throw new Error(
        `Profile ${profileId} has an invalid ${field} field. No data was changed.`,
      );
    }
  }

  return patch;
}

async function migrateUserProfiles() {
  const snapshot = await adminDb.collection("users").get();
  const pendingUpdates = snapshot.docs.flatMap((profileSnapshot) => {
    const patch = buildProfilePatch(
      profileSnapshot.id,
      profileSnapshot.data(),
    );
    const missingFields = Object.keys(patch);

    return missingFields.length > 0
      ? [{ profileSnapshot, patch, missingFields }]
      : [];
  });

  console.log(`Checked ${snapshot.size} user profiles.`);

  if (pendingUpdates.length === 0) {
    console.log("All user profiles already match the current schema.");
    return;
  }

  for (const update of pendingUpdates) {
    console.log(
      `${applyChanges ? "Updating" : "Would update"} ${update.profileSnapshot.id}: ${update.missingFields.join(", ")}`,
    );
  }

  if (!applyChanges) {
    console.log(
      `Dry run complete. ${pendingUpdates.length} profile(s) require updates.`,
    );
    return;
  }

  for (let index = 0; index < pendingUpdates.length; index += 400) {
    const batch = adminDb.batch();
    const updates = pendingUpdates.slice(index, index + 400);

    for (const update of updates) {
      batch.update(update.profileSnapshot.ref, {
        ...update.patch,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();
  }

  console.log(`Updated ${pendingUpdates.length} user profile(s).`);
}

await migrateUserProfiles();
