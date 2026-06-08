import { WorkspaceShell } from "@/components/layout/workspace-shell";

const studentNav = [
  { label: "Explore", href: "/clubs" },
  { label: "Events", href: "/events" },
  { label: "Saved", href: "/saved" },
  { label: "Notifications", href: "/notifications" },
  { label: "Profile", href: "/profile" },
];
export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell roleLabel="Student Mode" navItems={studentNav}>
      {children}
    </WorkspaceShell>
  );
}
