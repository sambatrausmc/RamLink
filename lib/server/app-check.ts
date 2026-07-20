import { APP_CHECK_HEADER_NAME } from "@/lib/app-check-contract";
import { getAdminAppCheck } from "@/lib/firebase/admin";

export function isAppCheckEnforced() {
  return process.env.FIREBASE_APP_CHECK_ENFORCED === "true";
}

export async function verifyAppCheckRequest(request: Request) {
  if (!isAppCheckEnforced()) return true;

  const token = request.headers.get(APP_CHECK_HEADER_NAME);
  if (!token) return false;

  try {
    await getAdminAppCheck().verifyToken(token);
    return true;
  } catch {
    return false;
  }
}
