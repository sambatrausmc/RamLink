import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";

// List of Firestore collections and fields where the user owns records
const ownedRecords = [
  { collection: COLLECTIONS.notifications, field: "userId" },
  { collection: COLLECTIONS.joinRequests, field: "studentId" },
  { collection: COLLECTIONS.inquiries, field: "studentId" },
  { collection: COLLECTIONS.reports, field: "reporterId" },
] as const;

export async function DELETE(request: Request) {
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

    // Query all related records across collections simultaneously
    const ownedSnapshots = await Promise.all(
      ownedRecords.map(({ collection, field }) =>
        db.collection(collection).where(field, "==", uid).get(),
      ),
    );

    const batch = db.batch();
    batch.delete(db.collection(COLLECTIONS.users).doc(uid));
    ownedSnapshots.forEach((snapshot) => {
      snapshot.docs.forEach((record) => batch.delete(record.ref));
    });

    // Execute the database deletion and remove user from Auth
    await batch.commit();
    await getAdminAuth().deleteUser(uid);

    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete this account." }, { status: 500 });
  }
}
