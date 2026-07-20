import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import {
  apiResponse,
  authenticateProtectedRequest,
  enforceProtectedRateLimit,
} from "@/lib/server/protected-api";

const contentTypes = ["Announcement", "Event", "Resource", "Club Profile"];

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
    { scope: "content-report-create", uidLimit: 5, ipLimit: 20, windowSeconds: 3600 },
  );
  if (rateLimit) return rateLimit;

  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  const contentType = readText(body?.contentType, 40);
  const contentTitle = readText(body?.contentTitle, 160);
  const reason = readText(body?.reason, 2000);
  if (!contentType || !contentTypes.includes(contentType) || !contentTitle || !reason) {
    return apiResponse({ error: "Enter valid report details." }, 400);
  }

  try {
    const db = getAdminDb();
    const profile = await db
      .collection(COLLECTIONS.users)
      .doc(authentication.token.uid)
      .get();
    const reporterName = readText(profile.data()?.displayName, 100);
    if (!profile.exists || !reporterName) {
      return apiResponse({ error: "A user profile is required." }, 403);
    }

    const reference = db.collection(COLLECTIONS.reports).doc();
    await reference.set({
      reporterId: authentication.token.uid,
      reporterName,
      contentType,
      contentTitle,
      reason,
      status: "new",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return apiResponse({ id: reference.id }, 201);
  } catch {
    return apiResponse({ error: "Unable to submit this report." }, 500);
  }
}
