import { StudentDashboardClient } from "@/components/student/student-dashboard-client";
import { getAnnouncements, getClubs, getEvents } from "@/lib/firebase/public-data";
import { currentStudent } from "@/lib/mock-data";

export default async function StudentDashboardPage() {
  const [clubs, events, announcements] = await Promise.all([getClubs(), getEvents(), getAnnouncements()]);
  
  return (
    <StudentDashboardClient
      fallbackStudent={currentStudent}
      clubs={clubs}
      events={events}
      announcements={announcements}
      joinRequests={[]}
      notifications={[]}
    />
  );
}
