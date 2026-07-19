import { RoleGate } from "@/components/auth/role-gate";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { requireWorkspaceRole } from "@/lib/server/workspace-authorization";

// Includes the new Account Settings route in the student navigation sidebar
const studentNav = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Explore", href: "/clubs" },
  { label: "Events", href: "/events" },
  { label: "Saved", href: "/saved" },
  { label: "Notifications", href: "/notifications" },
  { label: "Report", href: "/report" },
  { label: "Profile", href: "/profile" },
  { label: "Account", href: "/account" },
];

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  await requireWorkspaceRole(
    ["student", "clubOfficer", "admin"],
    "/dashboard",
  );

  return (
    <WorkspaceShell roleLabel="Student Mode" navItems={studentNav}>
      <RoleGate allowedRoles={["student", "clubOfficer", "admin"]}>{children}</RoleGate>
    </WorkspaceShell>
  );
}
