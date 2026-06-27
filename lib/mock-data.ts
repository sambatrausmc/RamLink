import type {
  Announcement,
  Club,
  ClubInquiry,
  EventItem,
  Interest,
  JoinRequest,
  NotificationItem,
  Report,
  Resource,
  StudentProfile,
} from "@/lib/types";
export const currentStudent: StudentProfile = {
  id: "student-jordan",
  displayName: "Jordan Ellis",
  email: "jordan.ellis@example.edu",
  major: "Computer Science",
  classYear: "Senior",
  interests: ["Technology", "Leadership", "Community Service"],
  joinedClubIds: ["cs-club", "sga"],
  savedClubIds: ["robotics", "business-leaders"],
  savedEventIds: ["event-hack-night", "event-sga-townhall"],
};
export const interests: Interest[] = [
  { id: "technology", name: "Technology", category: "Technology" },
  { id: "leadership", name: "Leadership", category: "Leadership" },
  { id: "service", name: "Community Service", category: "Community Service" },
  { id: "business", name: "Business", category: "Business" },
  { id: "health", name: "Health", category: "Health" },
  { id: "recreation", name: "Recreation", category: "Recreation" },
];
export const clubs: Club[] = [
  {
    id: "cs-club",
    name: "Computer Science Club",
    shortName: "CSC",
    category: "Technology",
    description:
      "A student organization for programming workshops, project nights, interview prep, and campus tech collaboration.",
    meetingSchedule: "Wednesdays at 5:00 PM",
    meetingLocation: "Whitman Hall, Room 210",
    contactEmail: "csclub@farmingdale.edu",
    tags: ["Programming", "Projects", "Careers"],
    memberCount: 84,
    nextEventId: "event-hack-night",
    isSuggested: true,
    membershipStatus: "approved",
  },
  {
    id: "business-leaders",
    name: "Business Leadership Association",
    shortName: "BLA",
    category: "Business",
    description:
      "Connects students with leadership workshops, resume support, guest speakers, and professional development events.",
    meetingSchedule: "Mondays at 4:30 PM",
    meetingLocation: "School of Business, Room 118",
    contactEmail: "businessleaders@farmingdale.edu",
    tags: ["Leadership", "Networking", "Careers"],
    memberCount: 62,
    nextEventId: "event-resume-lab",
    isSaved: true,
    membershipStatus: "notJoined",
  },
  {
    id: "robotics",
    name: "Robotics Club",
    shortName: "Robo",
    category: "Technology",
    description:
      "Builds robotics projects, supports competitions, and helps students learn hardware, sensors, and automation.",
    meetingSchedule: "Thursdays at 6:00 PM",
    meetingLocation: "Engineering Tech Lab",
    contactEmail: "robotics@farmingdale.edu",
    tags: ["Engineering", "Robotics", "Competitions"],
    memberCount: 41,
    nextEventId: "event-robotics-build",
    isSuggested: true,
    isSaved: true,
    membershipStatus: "pending",
  },
  {
    id: "sga",
    name: "Student Government Association",
    shortName: "SGA",
    category: "Leadership",
    description:
      "Represents student concerns, organizes campus initiatives, and connects students with school leadership.",
    meetingSchedule: "Tuesdays at 3:30 PM",
    meetingLocation: "Campus Center, Room 202",
    contactEmail: "sga@farmingdale.edu",
    tags: ["Leadership", "Campus", "Advocacy"],
    memberCount: 38,
    nextEventId: "event-sga-townhall",
    membershipStatus: "approved",
  },
  {
    id: "volunteer-service",
    name: "Volunteer Service Club",
    shortName: "VSC",
    category: "Community Service",
    description:
      "Coordinates volunteer opportunities, donation drives, and service events for students who want to give back.",
    meetingSchedule: "Fridays at 2:00 PM",
    meetingLocation: "Campus Center Lobby",
    contactEmail: "volunteerclub@farmingdale.edu",
    tags: ["Service", "Community", "Events"],
    memberCount: 57,
    isSuggested: true,
    membershipStatus: "notJoined",
  },
  {
    id: "nursing-association",
    name: "Nursing Student Association",
    shortName: "NSA",
    category: "Health",
    description:
      "Supports nursing students with clinical reminders, resource sharing, study events, and professional workshops.",
    meetingSchedule: "Every other Tuesday at 5:30 PM",
    meetingLocation: "Gleeson Hall, Room 114",
    contactEmail: "nursingstudents@farmingdale.edu",
    tags: ["Health", "Study", "Professional"],
    memberCount: 73,
    membershipStatus: "notJoined",
  },
];
export const events: EventItem[] = [
  {
    id: "event-hack-night",
    clubId: "cs-club",
    title: "Campus Hack Night",
    description: "Bring a laptop, join a team, and build a small project in one evening.",
    date: "2026-06-12",
    startTime: "5:00 PM",
    endTime: "8:00 PM",
    location: "Whitman Hall, Room 210",
    rsvpCount: 28,
    hasRsvped: true,
    isSaved: true,
  },
  {
    id: "event-resume-lab",
    clubId: "business-leaders",
    title: "Resume Review Lab",
    description: "Drop in for resume feedback and LinkedIn profile tips from peer mentors.",
    date: "2026-06-17",
    startTime: "4:30 PM",
    endTime: "6:00 PM",
    location: "School of Business, Room 118",
    rsvpCount: 19,
  },
  {
    id: "event-robotics-build",
    clubId: "robotics",
    title: "Robotics Build Session",
    description: "Hands-on session for assembling the club's summer robotics prototype.",
    date: "2026-06-20",
    startTime: "6:00 PM",
    endTime: "8:30 PM",
    location: "Engineering Tech Lab",
    rsvpCount: 16,
  },
  {
    id: "event-sga-townhall",
    clubId: "sga",
    title: "Student Town Hall",
    description: "Share campus concerns and hear updates from student representatives.",
    date: "2026-06-24",
    startTime: "3:30 PM",
    endTime: "5:00 PM",
    location: "Campus Center Auditorium",
    rsvpCount: 45,
    isSaved: true,
  },
];
export const announcements: Announcement[] = [
  {
    id: "announcement-cs-deadline",
    clubId: "cs-club",
    title: "Hack Night team signups close Monday",
    body: "Students can still attend without a team, but early signup helps officers prepare workstations.",
    createdAt: "2026-06-03",
    priority: "important",
  },
  {
    id: "announcement-sga-budget",
    clubId: "sga",
    title: "Club budget workshop added",
    body: "SGA is hosting a short workshop for officers who need help preparing club budget requests.",
    createdAt: "2026-06-02",
    priority: "normal",
  },
  {
    id: "announcement-vsc-drive",
    clubId: "volunteer-service",
    title: "Donation drive volunteers needed",
    body: "Volunteer shifts are open for next week's campus donation drive.",
    createdAt: "2026-06-01",
    priority: "normal",
  },
];
export const resources: Resource[] = [
  {
    id: "resource-cs-member-form",
    clubId: "cs-club",
    title: "Computer Science Club Member Form",
    description: "Required form for new members joining the mailing list and project groups.",
    type: "Form",
    url: "#",
    updatedAt: "2026-06-01",
  },
  {
    id: "resource-sga-budget-guide",
    clubId: "sga",
    title: "Club Budget Request Guide",
    description: "Explains how clubs should prepare funding requests for campus review.",
    type: "Guide",
    url: "#",
    updatedAt: "2026-05-29",
  },
  {
    id: "resource-robotics-waiver",
    clubId: "robotics",
    title: "Lab Safety Waiver",
    description: "Required for students participating in robotics build sessions.",
    type: "Waiver",
    url: "#",
    updatedAt: "2026-06-02",
  },
];
export const joinRequests: JoinRequest[] = [
  {
    id: "join-1",
    clubId: "robotics",
    studentId: "student-jordan",
    message: "I am interested in helping with the summer prototype and learning more about sensors.",
    status: "pending",
    createdAt: "2026-06-03",
  },
  {
    id: "join-2",
    clubId: "cs-club",
    studentId: "student-avery",
    message: "I want to join project nights and help with workshops.",
    status: "pending",
    createdAt: "2026-06-02",
  },
  {
    id: "join-3",
    clubId: "business-leaders",
    studentId: "student-taylor",
    message: "I would like to attend the resume lab and join the club.",
    status: "approved",
    createdAt: "2026-05-31",
  },
];
export const notifications: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Robotics Club request pending",
    body: "Your join request is waiting for officer review.",
    type: "joinRequest",
    status: "unread",
    createdAt: "2026-06-03",
    relatedHref: "/clubs/robotics",
  },
  {
    id: "notif-2",
    title: "Campus Hack Night is coming up",
    body: "Computer Science Club hosts Campus Hack Night on June 12.",
    type: "event",
    status: "unread",
    createdAt: "2026-06-03",
    relatedHref: "/events",
  },
  {
    id: "notif-3",
    title: "New SGA budget workshop",
    body: "A new club budget workshop was posted by SGA.",
    type: "announcement",
    status: "read",
    createdAt: "2026-06-02",
    relatedHref: "/clubs/sga",
  },
];
export const inquiries: ClubInquiry[] = [
  {
    id: "inquiry-1",
    clubId: "cs-club",
    studentId: "student-morgan",
    subject: "Can beginners attend Hack Night?",
    message: "I am new to coding. Is Hack Night beginner friendly?",
    status: "open",
    createdAt: "2026-06-03",
    replies: [
      {
        id: "reply-1",
        senderName: "CS Club Officer",
        body: "Yes. We will have beginner-friendly teams and mentors available.",
        createdAt: "2026-06-03",
      },
    ],
  },
  {
    id: "inquiry-2",
    clubId: "robotics",
    studentId: "student-jordan",
    subject: "Do I need lab experience?",
    message: "I want to join a build session but have not used the lab before.",
    status: "resolved",
    createdAt: "2026-06-01",
    replies: [
      {
        id: "reply-2",
        senderName: "Robotics Officer",
        body: "No experience needed. Please complete the safety waiver before attending.",
        createdAt: "2026-06-01",
      },
    ],
  },
];
export const reports: Report[] = [
  {
    id: "report-1",
    reporterName: "Student User",
    contentType: "Announcement",
    contentTitle: "Outdated meeting location",
    reason: "The announcement lists a room that is no longer available.",
    status: "new",
    createdAt: "2026-06-03",
  },
  {
    id: "report-2",
    reporterName: "Club Officer",
    contentType: "Resource",
    contentTitle: "Old waiver link",
    reason: "The linked waiver has been replaced by a newer form.",
    status: "reviewing",
    createdAt: "2026-06-02",
  },
];
export const studentDirectory = [
  currentStudent,
  {
    id: "student-avery",
    displayName: "Avery Collins",
    email: "avery.collins@example.edu",
    major: "Computer Science",
    classYear: "Senior",
    interests: ["Technology", "Business"],
    joinedClubIds: [],
    savedClubIds: [],
    savedEventIds: [],
  },
  {
    id: "student-taylor",
    displayName: "Taylor Brooks",
    email: "taylor.brooks@example.edu",
    major: "Business Management",
    classYear: "Senior",
    interests: ["Business", "Leadership"],
    joinedClubIds: ["business-leaders"],
    savedClubIds: [],
    savedEventIds: [],
  },
  {
    id: "student-morgan",
    displayName: "Morgan Lee",
    email: "morgan.lee@example.edu",
    major: "Computer Science",
    classYear: "Senior",
    interests: ["Technology"],
    joinedClubIds: [],
    savedClubIds: [],
    savedEventIds: [],
  },
];
export function getClubById(clubId: string) {
  return clubs.find((club) => club.id === clubId);
}
export function getEventsForClub(clubId: string) {
  return events.filter((event) => event.clubId === clubId);
}
export function getAnnouncementsForClub(clubId: string) {
  return announcements.filter((announcement) => announcement.clubId === clubId);
}
export function getResourcesForClub(clubId: string) {
  return resources.filter((resource) => resource.clubId === clubId);
}
export function getStudentById(studentId: string) {
  return studentDirectory.find((student) => student.id === studentId);
}
