"use client";
import { useEffect, useState } from "react";
import { AdminUserList } from "@/components/admin/admin-user-list";
import { PageHeader } from "@/components/common/page-header";
import { getStudents } from "@/lib/firebase/public-data";
import { getClubs } from "@/lib/firebase/public-data";
import type { Club, StudentProfile } from "@/lib/types";

export function AdminUsersClient() {
  const [users, setUsers] = useState<StudentProfile[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load all users and clubs to populate role and assignment selectors
  useEffect(() => {
    Promise.all([getStudents(), getClubs()])
      .then(([nextUsers, nextClubs]) => {
        setUsers(nextUsers);
        setClubs(nextClubs);
      })
      .catch(() => setError("Unable to load users."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Users"
        title="User Directory"
        description="Admin view for verified accounts and role assignments."
      />
      {loading ? (
        <p className="text-sm text-brand-muted">Loading users...</p>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {!loading && !error ? (
        <AdminUserList users={users} clubs={clubs} />
      ) : null}
    </div>
  );
}
