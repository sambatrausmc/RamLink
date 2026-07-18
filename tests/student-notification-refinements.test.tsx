/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const refreshProfile = vi.fn();

  return {
    authState: {
      loading: false,
      profile: null,
      refreshProfile,
      user: { uid: "student-1" },
    },
    getStudentJoinRequests: vi.fn(),
    getStudentNotifications: vi.fn(),
    refreshProfile,
    toggleEventRsvp: vi.fn(),
    toggleSavedEvent: vi.fn(),
    updateNotificationStatus: vi.fn(),
  };
});

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => mocks.authState,
}));

vi.mock("@/lib/firebase/student-actions", () => ({
  getStudentJoinRequests: mocks.getStudentJoinRequests,
  getStudentNotifications: mocks.getStudentNotifications,
  toggleEventRsvp: mocks.toggleEventRsvp,
  toggleSavedEvent: mocks.toggleSavedEvent,
  updateNotificationStatus: mocks.updateNotificationStatus,
}));

import { NotificationsClient } from "@/components/student/notifications-client";
import { StudentDashboardClient } from "@/components/student/student-dashboard-client";
import {
  announcements,
  clubs,
  currentStudent,
  events,
  joinRequests,
  notifications,
} from "@/lib/mock-data";
import type { NotificationItem } from "@/lib/types";

const liveNotifications: NotificationItem[] = [
  {
    id: "live-unread",
    userId: "student-1",
    title: "Live unread update",
    body: "This notification came from the signed-in account.",
    type: "announcement",
    status: "unread",
    createdAt: "2026-07-18",
    relatedHref: "/notifications",
  },
  {
    id: "live-read",
    userId: "student-1",
    title: "Live read update",
    body: "This notification has already been reviewed.",
    type: "event",
    status: "read",
    createdAt: "2026-07-17",
    relatedHref: "/events",
  },
];

describe("student notification refinements", () => {
  beforeEach(() => {
    mocks.getStudentJoinRequests.mockReset();
    mocks.getStudentNotifications.mockReset();
    mocks.updateNotificationStatus.mockReset();
    mocks.getStudentJoinRequests.mockResolvedValue([]);
    mocks.getStudentNotifications.mockResolvedValue(liveNotifications);
    mocks.updateNotificationStatus.mockResolvedValue(undefined);
  });

  afterEach(() => cleanup());

  it("filters unread notifications and removes an item after it is read", async () => {
    render(<NotificationsClient fallbackNotifications={notifications} />);

    await screen.findByText("Live unread update");
    fireEvent.click(screen.getByRole("button", { name: "Unread" }));

    expect(screen.queryByText("Live read update")).toBeNull();

    const notificationLink = screen.getByRole("link", {
      name: /Live unread update/,
    });
    notificationLink.addEventListener("click", (event) => event.preventDefault());
    fireEvent.click(notificationLink);

    await waitFor(() => {
      expect(mocks.updateNotificationStatus).toHaveBeenCalledWith(
        "live-unread",
        "read",
      );
      expect(screen.getByText("No unread notifications")).toBeTruthy();
    });
  });

  it("loads signed-in notification data on the student dashboard", async () => {
    render(
      <StudentDashboardClient
        fallbackStudent={currentStudent}
        clubs={clubs}
        events={events}
        announcements={announcements}
        joinRequests={joinRequests}
        notifications={notifications}
      />,
    );

    await screen.findByText("Live unread update");

    expect(mocks.getStudentJoinRequests).toHaveBeenCalledWith("student-1");
    expect(mocks.getStudentNotifications).toHaveBeenCalledWith("student-1");
    expect(screen.queryByText("Robotics Club request pending")).toBeNull();
  });
});
