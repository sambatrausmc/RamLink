import { StudentDashboardClient } from "@/components/student/student-dashboard-client";
import { announcements, clubs, currentStudent, events, joinRequests, notifications } from "@/lib/mock-data";

export default function StudentDashboardPage() {
  return (
    <StudentDashboardClient
      fallbackStudent={currentStudent}
      clubs={clubs}
      events={events}
      announcements={announcements}
      joinRequests={joinRequests}
      notifications={notifications}
    />
  );
}