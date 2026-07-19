import type { UserRole } from "@/lib/types";

export function getWorkspaceHref(role?: UserRole) {
  if (role === "admin") return "/admin/homepage";
  if (role === "clubOfficer") return "/club/homepage";
  return "/dashboard";
}

export function getProfileHref(role?: UserRole) {
  if (role === "admin") return "/admin/users";
  if (role === "clubOfficer") return "/club/profile";
  return "/profile";
}

export function getSafeNextPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }
  if (value.includes("\\")) {
    return null;
  }

  try {
    const parsedUrl = new URL(value, "https://ramlink.local");
    if (parsedUrl.origin !== "https://ramlink.local") {
      return null;
    }
    return `${parsedUrl.pathname}${parsedUrl.search}`;
  } catch {
    return null;
  }
}

export function isProtectedWorkspacePath(pathname: string) {
  const studentPaths = [
    "/account",
    "/dashboard",
    "/notifications",
    "/profile",
    "/report",
    "/saved",
  ];

  return (
    studentPaths.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    ) ||
    pathname === "/club" ||
    pathname.startsWith("/club/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/")
  );
}
