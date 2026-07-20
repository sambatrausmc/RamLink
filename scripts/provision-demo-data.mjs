import fs from "node:fs";
import { adminDb, FieldValue } from "./provisioning/admin-client.mjs";

const dataDirectory = new URL("./provisioning/data/", import.meta.url);
const dryRun = process.argv.includes("--dry-run");

function readJson(filename) {
  return JSON.parse(fs.readFileSync(new URL(filename, dataDirectory), "utf8"));
}

const catalog = readJson("catalog.json");

const records = {
  interests: catalog.interests,
  clubs: catalog.clubs,
  events: readJson("events.json"),
  announcements: readJson("announcements.json"),
  resources: readJson("resources.json"),
};

function validateRecords() {
  const clubIds = new Set(records.clubs.map(({ id }) => id));

  for (const [collectionName, entries] of Object.entries(records)) {
    const ids = entries.map(({ id }) => id);
    if (ids.some((id) => !id) || new Set(ids).size !== ids.length) {
      throw new Error(`${collectionName} contains an empty or duplicate ID.`);
    }
  }

  for (const collectionName of ["events", "announcements", "resources"]) {
    for (const entry of records[collectionName]) {
      if (!clubIds.has(entry.clubId)) {
        throw new Error(
          `${collectionName}/${entry.id} references an unknown club.`,
        );
      }
    }
  }
}

function addTimestamps(collectionName, data) {
  if (collectionName === "interests") {
    return data;
  }
  const timestamps = { updatedAt: FieldValue.serverTimestamp() };
  if (collectionName !== "resources") {
    timestamps.createdAt = FieldValue.serverTimestamp();
  }
  return { ...data, ...timestamps };
}

async function provisionDemoData() {
  validateRecords();

  if (dryRun) {
    for (const [name, entries] of Object.entries(records)) {
      console.log(`${name}: ${entries.length} records validated`);
    }
    return;
  }

  const batch = adminDb.batch();

  for (const [collectionName, entries] of Object.entries(records)) {
    for (const entry of entries) {
      const { id, ...data } = entry;
      const reference = adminDb.collection(collectionName).doc(id);
      batch.set(reference, addTimestamps(collectionName, data));
    }
  }

  await batch.commit();
  console.log("RamLink demonstration data was provisioned successfully.");
}

provisionDemoData().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});