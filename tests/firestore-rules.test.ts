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
  increment,
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

  function verifiedContext(uid: string) {
    return testEnvironment.authenticatedContext(uid, {
      email: `${uid}@farmingdale.edu`,
      email_verified: true,
    });
  }

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
      const seededAt = new Date("2026-07-01T12:00:00Z");

      await setDoc(doc(database, "users/student-1"), {
        id: "student-1",
        role: "student",
        displayName: "Student One",
        email: "student-1@farmingdale.edu",
        major: "Computer Programming",
        classYear: "Senior",
        interests: ["Technology"],
        joinedClubIds: [],
        savedClubIds: [],
        savedEventIds: [],
        rsvpedEventIds: [],
        managedClubIds: [],
        createdAt: seededAt,
        updatedAt: seededAt,
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

      await setDoc(doc(database, "users/admin-1"), {
        role: "admin",
        displayName: "Admin One",
        joinedClubIds: [],
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
        clubName: "Campus Club",
        studentId: "student-1",
        studentName: "Student One",
        subject: "Membership question",
        message: "When does the club meet?",
        status: "open",
        createdAt: seededAt,
        replies: [],
      });

      await setDoc(doc(database, "notifications/notification-1"), {
        userId: "student-1",
        title: "Request update",
        body: "Your request has been reviewed.",
        type: "joinRequest",
        status: "unread",
        relatedHref: "/dashboard",
        createdAt: seededAt,
      });

      await setDoc(doc(database, "events/event-1"), {
        clubId: "club-1",
        clubName: "Campus Club",
        title: "Campus Event",
        description: "A campus event for club members.",
        date: "2026-08-18",
        startTime: "5:30 PM",
        endTime: "7:00 PM",
        location: "Campus Center",
        rsvpCount: 0,
        updatedAt: seededAt,
      });

      await setDoc(doc(database, "events/event-2"), {
        clubId: "club-1",
        clubName: "Campus Club",
        title: "Second Campus Event",
        description: "Another campus event for club members.",
        date: "2026-08-25",
        startTime: "5:30 PM",
        endTime: "7:00 PM",
        location: "Campus Center",
        rsvpCount: 0,
        updatedAt: seededAt,
      });

      await setDoc(doc(database, "clubs/club-1"), {
        name: "Campus Club",
        shortName: "CC",
        category: "Technology",
        description: "A student organization.",
        meetingSchedule: "Tuesdays at 5:30 PM",
        meetingLocation: "Campus Center",
        contactEmail: "club@farmingdale.edu",
        tags: ["Technology"],
        status: "active",
        memberCount: 1,
        updatedAt: seededAt,
      });

      await setDoc(doc(database, "clubs/club-2"), {
        name: "Second Campus Club",
        shortName: "SCC",
        category: "Leadership",
        description: "A second student organization.",
        meetingSchedule: "Wednesdays at 4:00 PM",
        meetingLocation: "Campus Center",
        contactEmail: "second-club@farmingdale.edu",
        tags: ["Leadership"],
        status: "active",
        memberCount: 0,
        updatedAt: seededAt,
      });

      await setDoc(doc(database, "announcements/announcement-1"), {
        clubId: "club-1",
        clubName: "Campus Club",
        title: "Meeting reminder",
        body: "Meet in the student center.",
        priority: "normal",
        updatedAt: seededAt,
      });

      await setDoc(doc(database, "resources/resource-1"), {
        clubId: "club-1",
        title: "Club handbook",
        description: "Officer reference material.",
        type: "Link",
        url: "https://example.com/handbook",
        updatedAt: seededAt,
      });
    });
  });

  afterAll(async () => {
    await testEnvironment.cleanup();
  });

  it("allows profile edits but blocks self-approved memberships", async () => {
    const studentDb = verifiedContext("student-1").firestore();
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

    await assertFails(
      updateDoc(studentRef, {
        displayName: "",
        updatedAt: serverTimestamp(),
      }),
    );

    await assertFails(
      updateDoc(studentRef, {
        interests: Array.from({ length: 21 }, (_, index) => `Interest ${index}`),
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("allows only verified Farmingdale users to create their own student profile", async () => {
    const studentDb = verifiedContext("new-student").firestore();
    const profile = {
      id: "new-student",
      role: "student",
      displayName: "New Student",
      email: "new-student@farmingdale.edu",
      major: "",
      classYear: "",
      interests: [],
      joinedClubIds: [],
      savedClubIds: [],
      savedEventIds: [],
      rsvpedEventIds: [],
      managedClubIds: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await assertSucceeds(
      setDoc(doc(studentDb, "users/new-student"), profile),
    );
    await assertFails(
      setDoc(doc(studentDb, "users/another-student"), {
        ...profile,
        id: "another-student",
      }),
    );

    const forgedDb = verifiedContext("forged-user").firestore();
    await assertFails(
      setDoc(doc(forgedDb, "users/forged-user"), {
        ...profile,
        id: "forged-user",
        email: "forged-user@farmingdale.edu",
        role: "admin",
      }),
    );
  });

  it("blocks unverified and non-Farmingdale accounts from protected data", async () => {
    const unverifiedDb = testEnvironment
      .authenticatedContext("student-1", {
        email: "student-1@farmingdale.edu",
        email_verified: false,
      })
      .firestore();
    const wrongDomainDb = testEnvironment
      .authenticatedContext("student-1", {
        email: "student-1@example.com",
        email_verified: true,
      })
      .firestore();

    await assertFails(getDoc(doc(unverifiedDb, "users/student-1")));
    await assertFails(getDoc(doc(wrongDomainDb, "users/student-1")));
    await assertSucceeds(getDoc(doc(unverifiedDb, "clubs/club-1")));
    await assertSucceeds(getDoc(doc(wrongDomainDb, "events/event-1")));
  });

  it("keeps discovery collections public for signed-out visitors", async () => {
    const publicDb = testEnvironment.unauthenticatedContext().firestore();

    await assertSucceeds(getDoc(doc(publicDb, "clubs/club-1")));
    await assertSucceeds(getDoc(doc(publicDb, "events/event-1")));
    await assertSucceeds(
      getDoc(doc(publicDb, "announcements/announcement-1")),
    );
    await assertSucceeds(getDoc(doc(publicDb, "resources/resource-1")));
  });

  it("requires RSVP profile and event count updates to stay together", async () => {
    const studentDb = verifiedContext("student-1").firestore();

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
    const studentDb = verifiedContext("student-1").firestore();
    const unrelatedDb = verifiedContext("unrelated-1").firestore();

    await assertFails(
      deleteDoc(doc(unrelatedDb, "joinRequests/request-1")),
    );

    await assertSucceeds(
      deleteDoc(doc(studentDb, "joinRequests/request-1")),
    );
  });

  it("requires deterministic IDs for new join requests", async () => {
    const studentDb = verifiedContext("student-1").firestore();
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
    await assertFails(
      setDoc(doc(studentDb, "joinRequests/student-1_club-1"), {
        ...requestData,
        clubId: "club-1",
        message: "x".repeat(1001),
      }),
    );
  });

  it("allows rejected requests to reopen without bypassing approval", async () => {
    const studentDb = verifiedContext("student-1").firestore();
    const requestRef = doc(studentDb, "joinRequests/student-1_club-1");

    await assertSucceeds(
      updateDoc(requestRef, {
        message: "I am submitting an updated request.",
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    );

    const officerDb = verifiedContext("officer-1").firestore();
    await assertFails(
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

  it("allows rejection but blocks standalone membership approval", async () => {
    const officerDb = verifiedContext("officer-1").firestore();
    const requestRef = doc(officerDb, "joinRequests/request-1");

    await assertSucceeds(
      updateDoc(requestRef, {
        status: "rejected",
        updatedAt: serverTimestamp(),
      }),
    );

    await assertFails(
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

  it("allows managed membership approval as one synchronized batch", async () => {
    const officerDb = verifiedContext("officer-1").firestore();
    const mutation = {
      requestId: "request-1",
      studentId: "student-1",
      clubId: "club-1",
      countChange: 1,
    };
    const batch = writeBatch(officerDb);

    batch.update(doc(officerDb, "joinRequests/request-1"), {
      status: "approved",
      updatedAt: serverTimestamp(),
    });
    batch.update(doc(officerDb, "users/student-1"), {
      joinedClubIds: arrayUnion("club-1"),
      membershipMutation: mutation,
      updatedAt: serverTimestamp(),
    });
    batch.update(doc(officerDb, "clubs/club-1"), {
      memberCount: increment(1),
      membershipMutation: mutation,
      updatedAt: serverTimestamp(),
    });

    await assertSucceeds(batch.commit());

    const [studentSnapshot, clubSnapshot] = await Promise.all([
      getDoc(doc(officerDb, "users/student-1")),
      getDoc(doc(officerDb, "clubs/club-1")),
    ]);
    expect(studentSnapshot.data()?.joinedClubIds).toContain("club-1");
    expect(clubSnapshot.data()?.memberCount).toBe(2);
  });

  it("blocks standalone officer membership and count changes", async () => {
    const officerDb = verifiedContext("officer-1").firestore();

    await assertFails(
      updateDoc(doc(officerDb, "users/student-1"), {
        joinedClubIds: arrayUnion("club-1"),
        updatedAt: serverTimestamp(),
      }),
    );
    await assertFails(
      updateDoc(doc(officerDb, "clubs/club-1"), {
        memberCount: increment(1),
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("limits officers to users in their managed clubs", async () => {
    const officerDb = verifiedContext("officer-1").firestore();

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
    const officerDb = verifiedContext("officer-1").firestore();
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

  it("validates student inquiry and notification payloads", async () => {
    const studentDb = verifiedContext("student-1").firestore();

    await assertSucceeds(
      setDoc(doc(studentDb, "inquiries/student-inquiry"), {
        clubId: "club-1",
        clubName: "Campus Club",
        studentId: "student-1",
        studentName: "Student One",
        subject: "Meeting question",
        message: "May I attend the next meeting?",
        status: "open",
        createdAt: serverTimestamp(),
        replies: [],
      }),
    );
    await assertFails(
      setDoc(doc(studentDb, "inquiries/forged-inquiry"), {
        clubId: "club-1",
        clubName: "Campus Club",
        studentId: "student-1",
        studentName: "Student One",
        subject: "Meeting question",
        message: "May I attend the next meeting?",
        status: "resolved",
        createdAt: serverTimestamp(),
        replies: [],
        internalNote: "Unexpected field",
      }),
    );
    await assertFails(
      setDoc(doc(studentDb, "notifications/invalid-notification"), {
        userId: "student-1",
        title: "Invalid notification",
        body: "This payload uses an unsupported type.",
        type: "system",
        status: "unread",
        relatedHref: "/dashboard",
        createdAt: serverTimestamp(),
      }),
    );
  });

  it("limits notification updates to the owner and valid statuses", async () => {
    const studentDb = verifiedContext("student-1").firestore();
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

    const unrelatedDb = verifiedContext("unrelated-1").firestore();
    await assertFails(
      updateDoc(doc(unrelatedDb, "notifications/notification-1"), {
        status: "unread",
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("limits content management to officers of the matching club", async () => {
    const officerDb = verifiedContext("officer-1").firestore();
    const otherOfficerDb = verifiedContext("officer-2").firestore();

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

  it("rejects malformed club content and protected counter changes", async () => {
    const officerDb = verifiedContext("officer-1").firestore();
    const eventRef = doc(officerDb, "events/event-1");

    await assertFails(
      updateDoc(eventRef, {
        rsvpCount: 500,
        updatedAt: serverTimestamp(),
      }),
    );
    await assertFails(
      updateDoc(eventRef, {
        internalNote: "This field is not part of the event schema.",
        updatedAt: serverTimestamp(),
      }),
    );
    await assertFails(
      setDoc(doc(officerDb, "resources/invalid-resource"), {
        clubId: "club-1",
        title: "Invalid resource",
        description: "Invalid type value.",
        type: "Executable",
        url: "https://example.com/resource",
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("allows an officer audit and managed announcement deletion together", async () => {
    const officerDb = verifiedContext("officer-1").firestore();
    const batch = writeBatch(officerDb);

    batch.set(doc(officerDb, "auditLogs/officer-announcement-delete"), {
      actorId: "officer-1",
      actorRole: "clubOfficer",
      action: "officer.announcement_deleted",
      targetType: "announcement",
      targetId: "announcement-1",
      clubId: "club-1",
      createdAt: serverTimestamp(),
    });
    batch.delete(doc(officerDb, "announcements/announcement-1"));

    await assertSucceeds(batch.commit());
  });

  it("reserves club lifecycle changes for administrators", async () => {
    const officerDb = verifiedContext("officer-1").firestore();
    const adminDb = verifiedContext("admin-1").firestore();
    const clubRef = doc(officerDb, "clubs/club-1");

    await assertSucceeds(
      updateDoc(clubRef, {
        description: "Updated by the club officer.",
        updatedAt: serverTimestamp(),
      }),
    );
    await assertFails(updateDoc(clubRef, { status: "suspended" }));
    await assertFails(updateDoc(clubRef, { memberCount: 50 }));
    await assertSucceeds(
      updateDoc(doc(adminDb, "clubs/club-1"), {
        status: "suspended",
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("accepts only authenticated reports owned by the reporter", async () => {
    const studentDb = verifiedContext("student-1").firestore();
    const anonymousDb = testEnvironment.unauthenticatedContext().firestore();
    const validReport = {
      reporterId: "student-1",
      reporterName: "Student One",
      contentType: "Event",
      contentTitle: "Campus Event",
      reason: "The location is incorrect.",
      status: "new",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await assertSucceeds(
      setDoc(doc(studentDb, "reports/report-1"), validReport),
    );
    await assertFails(
      setDoc(doc(studentDb, "reports/report-2"), {
        ...validReport,
        reporterId: "another-user",
      }),
    );
    await assertFails(
      setDoc(doc(studentDb, "reports/report-3"), {
        ...validReport,
        status: "removed",
      }),
    );
    await assertFails(
      setDoc(doc(studentDb, "reports/report-4"), {
        ...validReport,
        internalNote: "Unexpected field",
      }),
    );
    await assertFails(
      setDoc(doc(anonymousDb, "reports/report-5"), validReport),
    );

    await assertFails(getDoc(doc(studentDb, "reports/report-1")));
    const adminDb = verifiedContext("admin-1").firestore();
    await assertSucceeds(getDoc(doc(adminDb, "reports/report-1")));
  });

  it("keeps server rate-limit records inaccessible to clients", async () => {
    const studentDb = verifiedContext("student-1").firestore();
    const adminDb = verifiedContext("admin-1").firestore();

    await assertFails(getDoc(doc(studentDb, "rateLimits/session-record")));
    await assertFails(
      setDoc(doc(adminDb, "rateLimits/session-record"), { count: 1 }),
    );
  });

  it("creates immutable audit records that only administrators can read", async () => {
    const adminDb = verifiedContext("admin-1").firestore();
    const studentDb = verifiedContext("student-1").firestore();
    const auditRef = doc(adminDb, "auditLogs/audit-1");
    const auditData = {
      actorId: "admin-1",
      actorRole: "admin",
      action: "admin.user_role_updated",
      targetType: "user",
      targetId: "student-1",
      createdAt: serverTimestamp(),
    };

    await assertSucceeds(setDoc(auditRef, auditData));
    await assertSucceeds(getDoc(auditRef));
    await assertFails(getDoc(doc(studentDb, "auditLogs/audit-1")));
    await assertFails(updateDoc(auditRef, { targetId: "student-2" }));
    await assertFails(deleteDoc(auditRef));

    await assertFails(
      setDoc(doc(studentDb, "auditLogs/audit-2"), {
        ...auditData,
        actorId: "student-1",
        actorRole: "student",
      }),
    );
    await assertFails(
      setDoc(doc(adminDb, "auditLogs/audit-3"), {
        ...auditData,
        actorId: "another-admin",
      }),
    );
  });
});
