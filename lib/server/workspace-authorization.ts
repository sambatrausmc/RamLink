import "server-only";

import { redirect } from "next/navigation";
import { getSafeNextPath, getWorkspaceHref } from "@/lib/auth-navigation";
import { getServerSession } from "@/lib/server/auth-session";
import type { UserRole } from "@/lib/types";

export async function requireWorkspaceRole(
  allowedRoles: UserRole[],
  requestedPath: string,
) {
  const safePath = getSafeNextPath(requestedPath) ?? "/dashboard";
  const session = await getServerSession();

  if (!session) {
    redirect(`/login?next=${encodeURIComponent(safePath)}`);
  }
  if (!allowedRoles.includes(session.role)) {
    redirect(getWorkspaceHref(session.role));
  }

  return session;
}
