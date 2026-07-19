import { StudentDashboardClient } from "@/components/student/student-dashboard-client";
import { getAnnouncements, getClubs, getEvents } from "@/lib/firebase/public-data";

export default async function StudentDashboardPage() {
  const [clubs, events, announcements] = await Promise.all([getClubs(), getEvents(), getAnnouncements()]);
  
  return (
    <StudentDashboardClient
      clubs={clubs}
      events={events}
      announcements={announcements}
    />
  );
}
