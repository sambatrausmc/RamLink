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
    // Loop through every single club in our mock data array one by one...
    for (const club of data.clubs) {
      // ...and add it as a brand new document inside the 'clubs' collection in Firestore!
      await db.collection('clubs').add(club);
      console.log(`Added club: ${club.name}`);
    }

    // Do the exact same thing for our events array...
    for (const event of data.events) {
      // ...adding them to the 'events' collection.
      await db.collection('events').add(event);
      console.log(`Added event: ${event.title}`);
    }

    console.log("Database successfully seeded!");
  } catch (error) {
    // If Firebase gets mad (bad internet, wrong keys, etc.), catch it and print the error so we can fix it.
    console.error("Error seeding database:", error);
  }
}

// Actually run the function we just built!
seedDatabase();
