export type UserRole = "student" | "clubOfficer" | "admin";

export type ClubCategory =
  | "Academic"
  | "Business"
  | "Community Service"
  | "Culture"
  | "Health"
  | "Leadership"
  | "Recreation"
  | "Technology";

export type RequestStatus = "pending" | "approved" | "rejected";
export type NotificationStatus = "read" | "unread";
export type InquiryStatus = "open" | "resolved";
export type ReportStatus = "new" | "reviewing" | "dismissed" | "removed";
export type ResourceType = "Form" | "Waiver" | "Guide" | "Link" | "Document";

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
};

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
  nextEventId?: string;
  isSuggested?: boolean;
  isSaved?: boolean;
  membershipStatus?: RequestStatus | "notJoined";
};

export type EventItem = {
  id: string;
  clubId: string;
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

export type Announcement = {
  id: string;
  clubId: string;
  title: string;
  body: string;
  createdAt: string;
  priority: "normal" | "important";
};

export type Resource = {
  id: string;
  clubId: string;
  title: string;
  description: string;
  type: ResourceType;
  url: string;
  updatedAt: string;
};

export type JoinRequest = {
  id: string;
  clubId: string;
  studentId: string;
  message: string;
  status: RequestStatus;
  createdAt: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  type: "event" | "joinRequest" | "announcement" | "inquiry" | "resource";
  status: NotificationStatus;
  createdAt: string;
  relatedHref: string;
};

export type ClubInquiry = {
  id: string;
  clubId: string;
  studentId: string;
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

export type Report = {
  id: string;
  reporterName: string;
  contentType: "Announcement" | "Event" | "Resource" | "Club Profile";
  contentTitle: string;
  reason: string;
  status: ReportStatus;
  createdAt: string;
};

export type Interest = {
  id: string;
  name: string;
  category: ClubCategory;
};