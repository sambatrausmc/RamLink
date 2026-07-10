import { StudentProfileClient } from "@/components/student/student-profile-client";
import { clubs, currentStudent, interests } from "@/lib/mock-data";

export default function ProfilePage() {
  return <StudentProfileClient fallbackStudent={currentStudent} clubs={clubs} interests={interests} />;
}