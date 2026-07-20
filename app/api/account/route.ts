import { NextResponse } from "next/server";
import type { DocumentReference, Firestore } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { verifyAppCheckRequest } from "@/lib/server/app-check";

// List of Firestore collections and fields where the user owns records
const ownedRecords = [
  { collection: COLLECTIONS.notifications, field: "userId" },
  { collection: COLLECTIONS.joinRequests, field: "studentId" },
  { collection: COLLECTIONS.inquiries, field: "studentId" },
  { collection: COLLECTIONS.reports, field: "reporterId" },
] as const;

const deletionBatchSize = 400;

function readStringIds(value: unknown) {
  return Array.isArray(value)
    ? [...new Set(value.filter((item): item is string => typeof item === "string"))]
    : [];
}

function readCount(value: unknown) {
  const count = typeof value === "number" ? value : 0;
  return Math.max(0, count - 1);
}

async function getOwnedRecordReferences(db: Firestore, uid: string) {
  const snapshots = await Promise.all(
    ownedRecords.map(({ collection, field }) =>
      db.collection(collection).where(field, "==", uid).get(),
    ),
  );

  return snapshots.flatMap((snapshot) =>
    snapshot.docs.map((record) => record.ref),
  );
}

async function reconcileProfileReferences(db: Firestore, uid: string) {
  const profileRef = db.collection(COLLECTIONS.users).doc(uid);

  await db.runTransaction(async (transaction) => {
    const profileSnapshot = await transaction.get(profileRef);
    if (!profileSnapshot.exists) {
      return;
    }

    const profile = profileSnapshot.data() ?? {};
    const clubRefs = readStringIds(profile.joinedClubIds).map((clubId) =>
      db.collection(COLLECTIONS.clubs).doc(clubId),
    );
    const eventRefs = readStringIds(profile.rsvpedEventIds).map((eventId) =>
      db.collection(COLLECTIONS.events).doc(eventId),
    );
    const relatedRefs = [...clubRefs, ...eventRefs];
    const relatedSnapshots = relatedRefs.length
      ? await transaction.getAll(...relatedRefs)
      : [];

    relatedSnapshots.slice(0, clubRefs.length).forEach((snapshot) => {
      if (snapshot.exists) {
        transaction.update(snapshot.ref, {
          memberCount: readCount(snapshot.data()?.memberCount),
        });
      }
    });

    relatedSnapshots.slice(clubRefs.length).forEach((snapshot) => {
      if (snapshot.exists) {
        transaction.update(snapshot.ref, {
          rsvpCount: readCount(snapshot.data()?.rsvpCount),
        });
      }
    });

    transaction.delete(profileRef);
  });
}

async function deleteOwnedRecords(
  db: Firestore,
  references: DocumentReference[],
) {
  for (let index = 0; index < references.length; index += deletionBatchSize) {
    const batch = db.batch();
    references
      .slice(index, index + deletionBatchSize)
      .forEach((reference) => batch.delete(reference));
    await batch.commit();
  }
}

function isMissingAuthUser(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "auth/user-not-found"
  );
}

export async function DELETE(request: Request) {
  if (!(await verifyAppCheckRequest(request))) {
    return NextResponse.json(
      { error: "Invalid application token." },
      { status: 401 },
    );
  }

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const token = authorization.slice("Bearer ".length);
  let decodedToken;

  try {
    decodedToken = await getAdminAuth().verifyIdToken(token);
  } catch {
    return NextResponse.json({ error: "Invalid authentication token." }, { status: 401 });
  }

  const currentTime = Math.floor(Date.now() / 1000);
  if (
    typeof decodedToken.auth_time !== "number" ||
    currentTime - decodedToken.auth_time > 5 * 60
  ) {
    return NextResponse.json(
      { error: "Recent authentication is required." },
      { status: 409 },
    );
  }

  try {
    const { uid } = decodedToken;
    const db = getAdminDb();
    const ownedReferences = await getOwnedRecordReferences(db, uid);

    // Profile deletion and count changes are atomic, so retries cannot double-decrement.
    await reconcileProfileReferences(db, uid);
    await deleteOwnedRecords(db, ownedReferences);

    try {
      await getAdminAuth().deleteUser(uid);
    } catch (error) {
      if (!isMissingAuthUser(error)) {
        throw error;
      }
    }

    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete this account." }, { status: 500 });
  }
}
