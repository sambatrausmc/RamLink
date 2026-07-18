// Define the three strict access levels in RamLink
export type UserRole = "student" | "clubOfficer" | "admin";

// Define all official categories a club can belong to
export type ClubCategory =
  | "Academic"
  | "Business"
  | "Community Service"
  | "Culture"
  | "Health"
  | "Leadership"
  | "Recreation"
  | "Technology";

// Status trackers for various student and officer actions
export type RequestStatus = "pending" | "approved" | "rejected";
export type NotificationStatus = "read" | "unread";
export type InquiryStatus = "open" | "resolved";
export type ReportStatus = "new" | "reviewing" | "dismissed" | "removed";
export type ClubStatus = "pending" | "active" | "suspended" | "archived";
export type ResourceType = "Form" | "Waiver" | "Guide" | "Link" | "Document";

// The complete profile structure for a signed-in student
export type StudentProfile = {
  id: string;
  role?: UserRole;
  displayName: string;
  email: string;
  major: string;
  classYear: string;
  interests: string[];
  joinedClubIds: string[];
  savedClubIds: string[];
  savedEventIds: string[];
  rsvpedEventIds?: string[];
  managedClubIds?: string[];
};

// The structure for an official student organization
export type Club = {
  id: string;
  name: string;
  shortName: string;
  category: ClubCategory;
  description: string;
  meetingSchedule: string;
  meetingLocation: string;
  contactEmail: string;
  tags: string[];
  memberCount: number;
  status?: ClubStatus;
  nextEventId?: string;
  isSuggested?: boolean;
  isSaved?: boolean;
  membershipStatus?: RequestStatus | "notJoined";
};

// Campus activities hosted by clubs
export type EventItem = {
  id: string;
  clubId: string;
  clubName?: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  rsvpCount: number;
  isSaved?: boolean;
  hasRsvped?: boolean;
};

// Official broadcasts sent out by club officers
export type Announcement = {
  id: string;
  clubId: string;
  clubName?: string;
  title: string;
  body: string;
  createdAt: string;
  priority: "normal" | "important";
};

// Downloadable links or documents provided by clubs
export type Resource = {
  id: string;
  clubId: string;
  title: string;
  description: string;
  type: ResourceType;
  url: string;
  updatedAt: string;
};

// Student applications to join a club
export type JoinRequest = {
  id: string;
  clubId: string;
  clubName?: string;
  studentId: string;
  studentName?: string;
  message: string;
  status: RequestStatus;
  createdAt: string;
};

// System alerts sent to a student's inbox
export type NotificationItem = {
  id: string;
  userId?: string;
  title: string;
  body: string;
  type: "event" | "joinRequest" | "announcement" | "inquiry" | "resource";
  status: NotificationStatus;
  createdAt: string;
  relatedHref: string;
};

// Official Q&A threads between a student and club officers
export type ClubInquiry = {
  id: string;
  clubId: string;
  clubName?: string;
  studentId: string;
  studentName?: string;
  subject: string;
  message: string;
  status: InquiryStatus;
  createdAt: string;
  replies: {
    id: string;
    senderName: string;
    body: string;
    createdAt: string;
  }[];
};

// Content moderation flags submitted to administrators
export type Report = {
  id: string;
  reporterName: string;
  contentType: "Announcement" | "Event" | "Resource" | "Club Profile";
  contentTitle: string;
  reason: string;
  status: ReportStatus;
  createdAt: string;
};

// Categories used for student discovery recommendations
export type Interest = {
  id: string;
  name: string;
  category: ClubCategory;
};
