export const COLLECTIONS = {
  users: "users",
  clubs: "clubs",
  events: "events",
  announcements: "announcements",
  resources: "resources",
  joinRequests: "joinRequests",
  inquiries: "inquiries",
  notifications: "notifications",
  reports: "reports",
  interests: "interests",
  rateLimits: "rateLimits",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
