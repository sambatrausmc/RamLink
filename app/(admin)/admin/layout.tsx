import { RoleGate } from "@/components/auth/role-gate";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { requireWorkspaceRole } from "@/lib/server/workspace-authorization";

const adminNav = [
  { label: "Home", href: "/admin/homepage" },
  { label: "Clubs", href: "/admin/clubs" },
  { label: "Reports", href: "/admin/reports" },
  { label: "Users", href: "/admin/users" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireWorkspaceRole(["admin"], "/admin/homepage");

  return (
    <WorkspaceShell roleLabel="Admin Mode" navItems={adminNav}>
      <RoleGate allowedRoles={["admin"]}>{children}</RoleGate>
    </WorkspaceShell>
  );
}
