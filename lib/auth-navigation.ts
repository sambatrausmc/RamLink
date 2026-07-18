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
