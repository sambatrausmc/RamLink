import fs from "node:fs";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

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

      await setDoc(doc(database, "users/member-1"), {
        role: "student",
        displayName: "Managed Club Member",
        joinedClubIds: ["club-1"],
      });

      await setDoc(doc(database, "users/unrelated-1"), {
        role: "student",
        displayName: "Unrelated Student",
        joinedClubIds: ["club-2"],
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

      await setDoc(doc(database, "events/event-1"), {
        clubId: "club-1",
        title: "Campus Event",
        rsvpCount: 0,
      });

      await setDoc(doc(database, "events/event-2"), {
        clubId: "club-1",
        title: "Second Campus Event",
        rsvpCount: 0,
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

  it("requires RSVP profile and event count updates to stay together", async () => {
    const studentDb = testEnvironment
      .authenticatedContext("student-1")
      .firestore();

    const batch = writeBatch(studentDb);
    batch.update(doc(studentDb, "users/student-1"), {
      rsvpedEventIds: arrayUnion("event-1"),
      rsvpMutation: { eventId: "event-1", countChange: 1 },
      updatedAt: serverTimestamp(),
    });
    batch.update(doc(studentDb, "events/event-1"), {
      rsvpCount: 1,
      updatedAt: serverTimestamp(),
    });
    await assertSucceeds(batch.commit());

    await assertFails(
      updateDoc(doc(studentDb, "users/student-1"), {
        rsvpedEventIds: arrayRemove("event-1"),
        rsvpMutation: { eventId: "event-1", countChange: -1 },
        updatedAt: serverTimestamp(),
      }),
    );

    await assertFails(
      updateDoc(doc(studentDb, "events/event-1"), { rsvpCount: 2 }),
    );

    const mismatchedBatch = writeBatch(studentDb);
    mismatchedBatch.update(doc(studentDb, "users/student-1"), {
      rsvpedEventIds: arrayUnion("event-2"),
      rsvpMutation: { eventId: "event-2", countChange: 1 },
      updatedAt: serverTimestamp(),
    });
    mismatchedBatch.update(doc(studentDb, "events/event-1"), {
      rsvpCount: 2,
      updatedAt: serverTimestamp(),
    });
    await assertFails(mismatchedBatch.commit());

    const removalBatch = writeBatch(studentDb);
    removalBatch.update(doc(studentDb, "users/student-1"), {
      rsvpedEventIds: arrayRemove("event-1"),
      rsvpMutation: { eventId: "event-1", countChange: -1 },
      updatedAt: serverTimestamp(),
    });
    removalBatch.update(doc(studentDb, "events/event-1"), {
      rsvpCount: 0,
      updatedAt: serverTimestamp(),
    });
    await assertSucceeds(removalBatch.commit());

    const [studentSnapshot, eventSnapshot] = await Promise.all([
      getDoc(doc(studentDb, "users/student-1")),
      getDoc(doc(studentDb, "events/event-1")),
    ]);
    expect(studentSnapshot.data()?.rsvpedEventIds).toEqual([]);
    expect(eventSnapshot.data()?.rsvpCount).toBe(0);
  });

  it("allows a student to cancel only their own pending request", async () => {
    const studentDb = testEnvironment
      .authenticatedContext("student-1")
      .firestore();
    const unrelatedDb = testEnvironment
      .authenticatedContext("unrelated-1")
      .firestore();

    await assertFails(
      deleteDoc(doc(unrelatedDb, "joinRequests/request-1")),
    );

    await assertSucceeds(
      deleteDoc(doc(studentDb, "joinRequests/request-1")),
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

  it("limits officers to users in their managed clubs", async () => {
    const officerDb = testEnvironment
      .authenticatedContext("officer-1")
      .firestore();

    const memberQuery = query(
      collection(officerDb, "users"),
      where("joinedClubIds", "array-contains", "club-1"),
    );
    const snapshot = await assertSucceeds(getDocs(memberQuery));
    expect(snapshot.docs.map((member) => member.id)).toEqual(["member-1"]);

    await assertFails(getDoc(doc(officerDb, "users/unrelated-1")));
    await assertFails(getDocs(collection(officerDb, "users")));
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
