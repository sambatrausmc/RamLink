import { StudentProfileClient } from "@/components/student/student-profile-client";
import { getClubs, getInterests } from "@/lib/firebase/public-data";
export const dynamic = "force-dynamic";
export default async function ProfilePage() {
  const [clubs, interests] = await Promise.all([getClubs(), getInterests()]);
  return (
    <StudentProfileClient
      clubs={clubs}
      interests={interests}
    />
  );
}
