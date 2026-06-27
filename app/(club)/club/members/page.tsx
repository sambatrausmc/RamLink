import { MemberSearchList } from "@/components/club/member-search-list";
import { PageHeader } from "@/components/common/page-header";
import { clubs, studentDirectory } from "@/lib/mock-data";

export default function MembersPage() {
  const club = clubs.find((item) => item.id === "cs-club");
  const members = studentDirectory.filter((student) =>
    student.joinedClubIds.includes("cs-club"),
  );
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Members"
        title={`${club?.name ?? "Club"} members`}
        description="Officer-only view of approved members for this club."
      />
      {/* The page keeps the mock data lookup while the client component handles searching. */}
      <MemberSearchList members={members} />
    </div>
  );
}
