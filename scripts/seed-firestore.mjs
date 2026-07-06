import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

// 1. WHERE ARE THE KEYS?
// We look inside your .env.local file to find the file path to that secret JSON key you downloaded.
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

// If you forgot to add the path to .env.local, we stop the script right here so it doesn't crash terribly.
if (!serviceAccountPath) {
  console.error("Error: GOOGLE_APPLICATION_CREDENTIALS is not set in your environment variables.");
  process.exit(1);
}

// 2. READ THE SECRET KEY FILE
// We go to your Documents folder (or wherever you put it) and read that downloaded JSON file into memory.
const serviceAccount = JSON.parse(fs.readFileSync(path.resolve(serviceAccountPath), 'utf8'));

// 3. LOG INTO FIREBASE AS AN ADMIN
// This uses your secret key to give us "God mode." We bypass all normal security rules so we can write data directly.
initializeApp({
  credential: cert(serviceAccount)
});

// Grab a reference to our database so we can start talking to it.
const db = getFirestore();

// 4. LOAD UP OUR MOCK DATA
// We look inside our own seed-data folder and read the ramlink-seed.json file we just made.
const seedDataPath = new URL('./seed-data/ramlink-seed.json', import.meta.url);
const data = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));

// 5. THE MAIN EVENT: PUSHING THE DATA!
async function seedDatabase() {
  console.log("Starting database seed...");

  try {
    // Seed Clubs
    for (const club of data.clubs) {
      // Use the clubId from the JSON as the exact document ID
      await db.collection('clubs').doc(club.clubId).set(club);
      console.log(`Added/Updated club: ${club.name}`);
    }

    // Seed Events
    for (const event of data.events) {
      // Create a deterministic ID based on the event title and date
      const eventId = `${event.title.toLowerCase().replace(/\s+/g, '-')}-${event.date.split('T')[0]}`;
      await db.collection('events').doc(eventId).set(event);
      console.log(`Added/Updated event: ${event.title}`);
    }

    console.log("Database successfully seeded!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Actually run the function we just built!
seedDatabase();
