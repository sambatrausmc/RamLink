import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { verifyAppCheckRequest } from "@/lib/server/app-check";
import { consumeRateLimit } from "@/lib/server/rate-limit";
import { getRequestId, logServerEvent } from "@/lib/server/logger";
import { hasVerifiedFarmingdaleClaims } from "@/lib/server/session-cookie";

const maximumNotificationRecipients = 450;

type AnnouncementInput = {
  clubId: string;
  title: string;
  body: string;
  priority: "normal" | "important";
};

function announcementResponse(
  requestId: string,
  body: object,
  status = 200,
  headers: Record<string, string> = {},
) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Request-Id": requestId,
      ...headers,
    },
  });
}

function readText(value: unknown, maximumLength: number) {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text && text.length <= maximumLength ? text : null;
}

function readInput(value: unknown): AnnouncementInput | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const clubId = readText(record.clubId, 120);
  const title = readText(record.title, 160);
  const body = readText(record.body, 2000);
  const priority = record.priority;

  if (
    !clubId ||
    !title ||
    !body ||
    (priority !== "normal" && priority !== "important")
  ) {
    return null;
  }

  return { clubId, title, body, priority };
}

function readStringList(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  if (!(await verifyAppCheckRequest(request))) {
    return announcementResponse(
      requestId,
      { error: "Invalid application token." },
      401,
    );
  }

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return announcementResponse(
      requestId,
      { error: "Authentication required." },
      401,
    );
  }

  const input = readInput(await request.json().catch(() => null));
  if (!input) {
    return announcementResponse(
      requestId,
      { error: "Enter a valid title and announcement." },
      400,
    );
  }

  let decodedToken;
  try {
    decodedToken = await getAdminAuth().verifyIdToken(
      authorization.slice("Bearer ".length),
      true,
    );
  } catch {
    return announcementResponse(
      requestId,
      { error: "Invalid authentication token." },
      401,
    );
  }

  if (!hasVerifiedFarmingdaleClaims(decodedToken)) {
    return announcementResponse(
      requestId,
      { error: "A verified Farmingdale account is required." },
      403,
    );
  }

  try {
    const rateLimit = await consumeRateLimit({
      scope: "announcement-create",
      subject: decodedToken.uid,
      limit: 20,
      windowSeconds: 60 * 60,
    });
    if (!rateLimit.allowed) {
      return announcementResponse(
        requestId,
        { error: "Too many announcements. Try again later." },
        429,
        { "Retry-After": String(rateLimit.retryAfterSeconds) },
      );
    }

    const db = getAdminDb();
    const profileSnapshot = await db
      .collection(COLLECTIONS.users)
      .doc(decodedToken.uid)
      .get();
    const profile = profileSnapshot.data() ?? {};
    const role = profile.role;
    const managesClub = readStringList(profile.managedClubIds).includes(
      input.clubId,
    );
    if (role !== "admin" && (role !== "clubOfficer" || !managesClub)) {
      return announcementResponse(
        requestId,
        { error: "You do not manage this club." },
        403,
      );
    }

    const clubSnapshot = await db
      .collection(COLLECTIONS.clubs)
      .doc(input.clubId)
      .get();
    const clubName = readText(clubSnapshot.data()?.name, 160);
    if (!clubSnapshot.exists || !clubName) {
      return announcementResponse(
        requestId,
        { error: "The managed club was not found." },
        404,
      );
    }

    const members = await db
      .collection(COLLECTIONS.users)
      .where("joinedClubIds", "array-contains", input.clubId)
      .limit(maximumNotificationRecipients)
      .get();
    const announcementReference = db
      .collection(COLLECTIONS.announcements)
      .doc();
    const auditReference = db.collection(COLLECTIONS.auditLogs).doc();
    const batch = db.batch();

    batch.set(announcementReference, {
      ...input,
      clubName,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    batch.set(auditReference, {
      actorId: decodedToken.uid,
      actorRole: role,
      action: "officer.announcement_created",
      targetType: "announcement",
      targetId: announcementReference.id,
      clubId: input.clubId,
      createdAt: FieldValue.serverTimestamp(),
    });
    members.docs.forEach((member) => {
      batch.set(db.collection(COLLECTIONS.notifications).doc(), {
        userId: member.id,
        clubId: input.clubId,
        title: input.title,
        body: `${clubName} posted a new announcement.`,
        type: "announcement",
        status: "unread",
        relatedHref: `/clubs/${input.clubId}`,
        createdAt: FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();
    logServerEvent("info", "announcement_created", requestId, {
      actorId: decodedToken.uid,
      clubId: input.clubId,
      notifiedMembers: members.size,
    });
    return announcementResponse(
      requestId,
      {
        id: announcementReference.id,
        notifiedMembers: members.size,
      },
      201,
    );
  } catch {
    logServerEvent("error", "announcement_create_failed", requestId);
    return announcementResponse(
      requestId,
      { error: "Unable to publish the announcement." },
      500,
    );
  }
}
