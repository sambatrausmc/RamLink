import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import {
  apiResponse,
  authenticateProtectedRequest,
  enforceProtectedRateLimit,
} from "@/lib/server/protected-api";

class RequestError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

function readText(value: unknown, maximumLength: number) {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text && text.length <= maximumLength ? text : null;
}

async function authorize(request: Request, scope: string) {
  const authentication = await authenticateProtectedRequest(request);
  if (!authentication.ok) return authentication;
  const rateLimit = await enforceProtectedRateLimit(
    request,
    authentication.token.uid,
    { scope, uidLimit: 10, ipLimit: 30, windowSeconds: 60 * 60 },
  );
  return rateLimit
    ? { ok: false as const, response: rateLimit }
    : authentication;
}

export async function POST(request: Request) {
  const authorization = await authorize(request, "join-request-create");
  if (!authorization.ok) return authorization.response;

  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  const clubId = readText(body?.clubId, 120);
  const message = readText(body?.message, 1000);
  if (!clubId || !message) {
    return apiResponse({ error: "Enter a valid join request note." }, 400);
  }

  const uid = authorization.token.uid;
  const db = getAdminDb();
  const profileReference = db.collection(COLLECTIONS.users).doc(uid);
  const clubReference = db.collection(COLLECTIONS.clubs).doc(clubId);
  const requestReference = db
    .collection(COLLECTIONS.joinRequests)
    .doc(`${uid}_${clubId}`);
  const notificationReference = db.collection(COLLECTIONS.notifications).doc();

  try {
    await db.runTransaction(async (transaction) => {
      const [profileSnapshot, clubSnapshot, requestSnapshot] =
        await Promise.all([
          transaction.get(profileReference),
          transaction.get(clubReference),
          transaction.get(requestReference),
        ]);
      const profile = profileSnapshot.data() ?? {};
      const club = clubSnapshot.data() ?? {};
      const studentName = readText(profile.displayName, 100);
      const clubName = readText(club.name, 160);

      if (!profileSnapshot.exists || profile.role !== "student" || !studentName) {
        throw new RequestError("A student profile is required.", 403);
      }
      if (!clubSnapshot.exists || club.status !== "active" || !clubName) {
        throw new RequestError("This club is not accepting requests.", 404);
      }
      if (
        requestSnapshot.exists &&
        ["pending", "approved"].includes(requestSnapshot.data()?.status)
      ) {
        throw new RequestError(
          "An active join request already exists for this club.",
          409,
        );
      }

      transaction.set(requestReference, {
        clubId,
        clubName,
        studentId: uid,
        studentName,
        message,
        status: "pending",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      transaction.set(notificationReference, {
        userId: uid,
        clubId,
        title: "Join request sent",
        body: "Your membership request was sent to the club officers.",
        type: "joinRequest",
        status: "unread",
        relatedHref: "/dashboard",
        createdAt: FieldValue.serverTimestamp(),
      });
    });

    return apiResponse(
      { id: requestReference.id, clubId, status: "pending" },
      201,
    );
  } catch (error) {
    if (error instanceof RequestError) {
      return apiResponse({ error: error.message }, error.status);
    }
    return apiResponse({ error: "Unable to send the join request." }, 500);
  }
}

export async function DELETE(request: Request) {
  const authorization = await authorize(request, "join-request-cancel");
  if (!authorization.ok) return authorization.response;
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  const requestId = readText(body?.requestId, 260);
  if (!requestId) {
    return apiResponse({ error: "A join request is required." }, 400);
  }

  const db = getAdminDb();
  const reference = db.collection(COLLECTIONS.joinRequests).doc(requestId);
  try {
    await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(reference);
      const data = snapshot.data() ?? {};
      if (!snapshot.exists) throw new RequestError("Join request not found.", 404);
      if (
        data.studentId !== authorization.token.uid ||
        data.status !== "pending"
      ) {
        throw new RequestError("Only your pending request can be cancelled.", 403);
      }
      transaction.delete(reference);
    });
    return apiResponse({ deleted: true });
  } catch (error) {
    if (error instanceof RequestError) {
      return apiResponse({ error: error.message }, error.status);
    }
    return apiResponse({ error: "Unable to cancel the join request." }, 500);
  }
}
