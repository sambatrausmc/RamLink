import fs from "node:fs";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

const emulatorAddress = process.env.FIRESTORE_EMULATOR_HOST;
const [host = "127.0.0.1", portText = "8080"] =
  emulatorAddress?.split(":") ?? [];

describe.skipIf(!emulatorAddress)("Firestore workflow authorization", () => {
  let testEnvironment: RulesTestEnvironment;

  beforeAll(async () => {
    testEnvironment = await initializeTestEnvironment({
      projectId: "demo-ramlink",
      firestore: {
        host,
        port: Number(portText),
        rules: fs.readFileSync("firestore.rules", "utf8"),
      },
    });
  });

  beforeEach(async () => {
    await testEnvironment.clearFirestore();
    await testEnvironment.withSecurityRulesDisabled(async (context) => {
      const database = context.firestore();
      await setDoc(doc(database, "users/student-1"), {
        role: "student",
        displayName: "Student One",
        joinedClubIds: [],
        savedClubIds: [],
        savedEventIds: [],
        rsvpedEventIds: [],
      });
      await setDoc(doc(database, "users/officer-1"), {
        role: "clubOfficer",
        displayName: "Officer One",
        joinedClubIds: [],
        managedClubIds: ["club-1"],
      });
      await setDoc(doc(database, "joinRequests/request-1"), {
        clubId: "club-1",
        studentId: "student-1",
        status: "pending",
      });
      await setDoc(doc(database, "inquiries/inquiry-1"), {
        clubId: "club-1",
        studentId: "student-1",
        status: "open",
        replies: [],
      });
    });
  });

  afterAll(async () => {
    await testEnvironment.cleanup();
  });

  it("allows profile edits but blocks self-approved memberships", async () => {
    const studentDb = testEnvironment
      .authenticatedContext("student-1")
      .firestore();
    const studentRef = doc(studentDb, "users/student-1");

    await assertSucceeds(
      updateDoc(studentRef, {
        displayName: "Updated Student",
        updatedAt: serverTimestamp(),
      }),
    );
    await assertFails(
      updateDoc(studentRef, {
        joinedClubIds: ["club-1"],
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("allows officers to change status without changing request ownership", async () => {
    const officerDb = testEnvironment
      .authenticatedContext("officer-1")
      .firestore();
    const requestRef = doc(officerDb, "joinRequests/request-1");

    await assertSucceeds(
      updateDoc(requestRef, {
        status: "approved",
        updatedAt: serverTimestamp(),
      }),
    );
    await assertFails(
      updateDoc(requestRef, {
        studentId: "student-2",
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("allows inquiry replies without allowing inquiry reassignment", async () => {
    const officerDb = testEnvironment
      .authenticatedContext("officer-1")
      .firestore();
    const inquiryRef = doc(officerDb, "inquiries/inquiry-1");

    await assertSucceeds(
      updateDoc(inquiryRef, {
        replies: [
          {
            id: "reply-1",
            senderName: "Club Officer",
            body: "Welcome to the club.",
            createdAt: "Just now",
          },
        ],
        status: "open",
        updatedAt: serverTimestamp(),
      }),
    );
    await assertFails(
      updateDoc(inquiryRef, {
        clubId: "club-2",
        updatedAt: serverTimestamp(),
      }),
    );
  });
});
