import { createHash } from "node:crypto";
import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";

type RateLimitInput = {
  scope: string;
  subject: string;
  limit: number;
  windowSeconds: number;
  now?: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

function rateLimitId(scope: string, subject: string) {
  const digest = createHash("sha256").update(subject).digest("hex");
  return `${scope}_${digest}`;
}

function readTime(value: unknown) {
  if (value instanceof Date) return value.getTime();
  if (value && typeof value === "object" && "toMillis" in value) {
    return (value as { toMillis: () => number }).toMillis();
  }
  return 0;
}

export async function consumeRateLimit({
  scope,
  subject,
  limit,
  windowSeconds,
  now = Date.now(),
}: RateLimitInput): Promise<RateLimitResult> {
  const db = getAdminDb();
  const reference = db.collection(COLLECTIONS.rateLimits).doc(
    rateLimitId(scope, subject),
  );

  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);
    const data = snapshot.data() ?? {};
    const windowEndsAt = readTime(data.windowEndsAt);
    const count = typeof data.count === "number" ? data.count : 0;

    if (!snapshot.exists || windowEndsAt <= now) {
      const expiresAt = new Date(now + windowSeconds * 1000);
      transaction.set(reference, {
        count: 1,
        expiresAt,
        scope,
        updatedAt: new Date(now),
        windowEndsAt: expiresAt,
      });
      return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
    }

    const retryAfterSeconds = Math.max(1, Math.ceil((windowEndsAt - now) / 1000));
    if (count >= limit) {
      return { allowed: false, remaining: 0, retryAfterSeconds };
    }

    transaction.update(reference, { count: count + 1, updatedAt: new Date(now) });
    return {
      allowed: true,
      remaining: Math.max(0, limit - count - 1),
      retryAfterSeconds: 0,
    };
  });
}
