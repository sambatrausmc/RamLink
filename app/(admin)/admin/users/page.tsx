export const dynamic = "force-dynamic";
import { AdminUserList } from "@/components/admin/admin-user-list";
import { PageHeader } from "@/components/common/page-header";
import { getStudents } from "@/lib/firebase/public-data";

export default async function AdminUsersPage() {
  const users = await getStudents();
  
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Users"
        title="User Directory"
        description="Admin view for verified accounts and role assignments."
      />
      <AdminUserList users={users} />
    </div>
  );
}
