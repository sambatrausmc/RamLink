import { StudentProfileClient } from "@/components/student/student-profile-client";
import { getClubs, getInterests } from "@/lib/firebase/public-data";
import { currentStudent } from "@/lib/mock-data";
export const dynamic = "force-dynamic";
export default async function ProfilePage() {
const [clubs, interests] = await Promise.all([getClubs(), getInterests()]);
return (
<StudentProfileClient
fallbackStudent={currentStudent}
clubs={clubs}
interests={interests}
/>
);
}