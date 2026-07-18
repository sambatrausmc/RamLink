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

      await setDoc(doc(database, "users/officer-2"), {
        role: "clubOfficer",
        displayName: "Officer Two",
        joinedClubIds: [],
        managedClubIds: ["club-2"],
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

      await setDoc(doc(database, "joinRequests/student-1_club-1"), {
        clubId: "club-1",
        clubName: "Campus Club",
        studentId: "student-1",
        studentName: "Student One",
        message: "Please reconsider my request.",
        status: "rejected",
        createdAt: new Date("2026-07-01T12:00:00Z"),
        updatedAt: new Date("2026-07-01T12:00:00Z"),
      });

      await setDoc(doc(database, "inquiries/inquiry-1"), {
        clubId: "club-1",
        studentId: "student-1",
        status: "open",
        replies: [],
      });

      await setDoc(doc(database, "notifications/notification-1"), {
        userId: "student-1",
        title: "Request update",
        body: "Your request has been reviewed.",
        type: "join_request",
        status: "unread",
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

      await setDoc(doc(database, "announcements/announcement-1"), {
        clubId: "club-1",
        title: "Meeting reminder",
        body: "Meet in the student center.",
      });

      await setDoc(doc(database, "resources/resource-1"), {
        clubId: "club-1",
        title: "Club handbook",
        description: "Officer reference material.",
        type: "link",
        url: "https://example.com/handbook",
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

  it("requires deterministic IDs for new join requests", async () => {
    const studentDb = testEnvironment
      .authenticatedContext("student-1")
      .firestore();
    const requestData = {
      clubId: "club-2",
      clubName: "Second Campus Club",
      studentId: "student-1",
      studentName: "Student One",
      message: "I would like to join.",
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await assertFails(
      setDoc(doc(studentDb, "joinRequests/arbitrary-id"), requestData),
    );

    const requestRef = doc(studentDb, "joinRequests/student-1_club-2");
    await assertSucceeds(setDoc(requestRef, requestData));
    await assertFails(setDoc(requestRef, requestData));
  });

  it("allows rejected requests to reopen without bypassing approval", async () => {
    const studentDb = testEnvironment
      .authenticatedContext("student-1")
      .firestore();
    const requestRef = doc(studentDb, "joinRequests/student-1_club-1");

    await assertSucceeds(
      updateDoc(requestRef, {
        message: "I am submitting an updated request.",
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    );

    const officerDb = testEnvironment
      .authenticatedContext("officer-1")
      .firestore();
    await assertSucceeds(
      updateDoc(doc(officerDb, "joinRequests/student-1_club-1"), {
        status: "approved",
        updatedAt: serverTimestamp(),
      }),
    );

    await assertFails(
      updateDoc(requestRef, {
        message: "Reset approved request.",
        status: "pending",
        createdAt: serverTimestamp(),
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

  it("limits notification updates to the owner and valid statuses", async () => {
    const studentDb = testEnvironment
      .authenticatedContext("student-1")
      .firestore();
    const notificationRef = doc(
      studentDb,
      "notifications/notification-1",
    );

    await assertSucceeds(
      updateDoc(notificationRef, {
        status: "read",
        updatedAt: serverTimestamp(),
      }),
    );

    await assertFails(
      updateDoc(notificationRef, {
        status: "archived",
        updatedAt: serverTimestamp(),
      }),
    );

    const unrelatedDb = testEnvironment
      .authenticatedContext("unrelated-1")
      .firestore();
    await assertFails(
      updateDoc(doc(unrelatedDb, "notifications/notification-1"), {
        status: "unread",
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("limits content management to officers of the matching club", async () => {
    const officerDb = testEnvironment
      .authenticatedContext("officer-1")
      .firestore();
    const otherOfficerDb = testEnvironment
      .authenticatedContext("officer-2")
      .firestore();

    await assertSucceeds(
      updateDoc(doc(officerDb, "events/event-1"), {
        title: "Updated Campus Event",
        updatedAt: serverTimestamp(),
      }),
    );
    await assertFails(
      updateDoc(doc(otherOfficerDb, "events/event-1"), {
        title: "Unauthorized Update",
        updatedAt: serverTimestamp(),
      }),
    );

    await assertSucceeds(
      updateDoc(doc(officerDb, "announcements/announcement-1"), {
        body: "Meet in the library instead.",
        updatedAt: serverTimestamp(),
      }),
    );
    await assertFails(
      deleteDoc(doc(otherOfficerDb, "announcements/announcement-1")),
    );
    await assertSucceeds(
      deleteDoc(doc(officerDb, "resources/resource-1")),
    );
  });
});
