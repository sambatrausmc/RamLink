import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import {
  apiResponse,
  authenticateProtectedRequest,
  enforceProtectedRateLimit,
} from "@/lib/server/protected-api";

function readText(value: unknown, maximumLength: number) {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text && text.length <= maximumLength ? text : null;
}

export async function POST(request: Request) {
  const authentication = await authenticateProtectedRequest(request);
  if (!authentication.ok) return authentication.response;
  const rateLimit = await enforceProtectedRateLimit(
    request,
    authentication.token.uid,
    { scope: "club-inquiry-create", uidLimit: 10, ipLimit: 30, windowSeconds: 3600 },
  );
  if (rateLimit) return rateLimit;

  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  const clubId = readText(body?.clubId, 120);
  const subject = readText(body?.subject, 160);
  const message = readText(body?.message, 2000);
  if (!clubId || !subject || !message) {
    return apiResponse({ error: "Enter a valid subject and question." }, 400);
  }

  const uid = authentication.token.uid;
  const db = getAdminDb();
  const profileReference = db.collection(COLLECTIONS.users).doc(uid);
  const clubReference = db.collection(COLLECTIONS.clubs).doc(clubId);
  const inquiryReference = db.collection(COLLECTIONS.inquiries).doc();
  const notificationReference = db.collection(COLLECTIONS.notifications).doc();

  try {
    await db.runTransaction(async (transaction) => {
      const [profileSnapshot, clubSnapshot] = await Promise.all([
        transaction.get(profileReference),
        transaction.get(clubReference),
      ]);
      const profile = profileSnapshot.data() ?? {};
      const club = clubSnapshot.data() ?? {};
      const studentName = readText(profile.displayName, 100);
      const clubName = readText(club.name, 160);
      if (!profileSnapshot.exists || profile.role !== "student" || !studentName) {
        throw new Error("student-profile");
      }
      if (!clubSnapshot.exists || club.status !== "active" || !clubName) {
        throw new Error("active-club");
      }

      transaction.set(inquiryReference, {
        clubId,
        clubName,
        studentId: uid,
        studentName,
        subject,
        message,
        status: "open",
        createdAt: FieldValue.serverTimestamp(),
        replies: [],
      });
      transaction.set(notificationReference, {
        userId: uid,
        clubId,
        title: "Question sent",
        body: "Your question was sent to the official club inbox.",
        type: "inquiry",
        status: "unread",
        relatedHref: "/notifications",
        createdAt: FieldValue.serverTimestamp(),
      });
    });
    return apiResponse({ id: inquiryReference.id, clubId, status: "open" }, 201);
  } catch (error) {
    if (error instanceof Error && error.message === "student-profile") {
      return apiResponse({ error: "A student profile is required." }, 403);
    }
    if (error instanceof Error && error.message === "active-club") {
      return apiResponse({ error: "The club is not available." }, 404);
    }
    return apiResponse({ error: "Unable to send the question." }, 500);
  }
}
