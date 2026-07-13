"use client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { updateUserRole } from "@/lib/firebase/admin-workflows";
import type { StudentProfile, UserRole } from "@/lib/types";

type AdminUserListProps = {
  users: StudentProfile[];
};

export function AdminUserList({ users }: AdminUserListProps) {
  const [roles, setRoles] = useState(() => new Map(users.map((user) => [user.id, user.role ?? "student"])));
  const [feedback, setFeedback] = useState("");

  async function handleRoleChange(userId: string, role: UserRole) {
    setFeedback("");
    try {
      await updateUserRole(userId, role);
      setRoles((current) => new Map(current).set(userId, role));
      setFeedback("User role updated.");
    } catch {
      setFeedback("Unable to update user role right now.");
    }
  }

  return (
    <Card>
      <CardContent>
        {feedback ? <p className="mb-4 text-sm font-medium text-brand-forest">{feedback}</p> : null}
        <div className="divide-y divide-brand-surface">
          {users.map((user) => (
            <div key={user.id} className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-display font-semibold text-brand-ink">{user.displayName}</p>
                <p className="text-sm text-brand-muted">{user.email}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="green">Verified</Badge>
                <Badge tone="slate">{user.major || "No major set"}</Badge>
                <select
                  className="h-9 rounded-[10px] border border-brand-mist bg-white px-3 text-sm text-brand-ink"
                  value={roles.get(user.id)}
                  onChange={(event) => handleRoleChange(user.id, event.target.value as UserRole)}
                >
                  <option value="student">Student</option>
                  <option value="clubOfficer">Club Officer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
