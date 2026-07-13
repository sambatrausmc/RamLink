import { RoleGate } from "@/components/auth/role-gate";
import { WorkspaceShell } from "@/components/layout/workspace-shell";

const clubNav = [
  { label: "Home", href: "/club/homepage" },
  { label: "Events", href: "/club/events" },
  { label: "Announcements", href: "/club/announcements" },
  { label: "Requests", href: "/club/join-requests" },
  { label: "Members", href: "/club/members" },
  { label: "Resources", href: "/club/resources" },
  { label: "Inbox", href: "/club/inbox" },
  { label: "Profile", href: "/club/profile" },
];

export default function ClubLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell roleLabel="Club Officer Mode" navItems={clubNav}>
      <RoleGate allowedRoles={["clubOfficer", "admin"]}>{children}</RoleGate>
    </WorkspaceShell>
  );
}
