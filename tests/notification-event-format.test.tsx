/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  updateNotificationStatus: vi.fn(),
}));

vi.mock("@/lib/firebase/student-actions", () => ({
  updateNotificationStatus: mocks.updateNotificationStatus,
}));

import { NotificationItem } from "@/components/cards/notification-item";
import {
  formatEventDate,
  formatEventTime,
  toEventDateInputValue,
} from "@/lib/event-format";
import { notifications } from "@/lib/mock-data";

describe("notification and event display behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.updateNotificationStatus.mockResolvedValue(undefined);
  });

  afterEach(() => cleanup());

  it("marks an unread notification as read when opened", async () => {
    const notification = notifications.find(
      (item) => item.status === "unread",
    );
    expect(notification).toBeDefined();

    render(<NotificationItem notification={notification!} />);
    const link = screen.getByRole("link", { name: new RegExp(notification!.title) });
    link.addEventListener("click", (event) => event.preventDefault());
    fireEvent.click(link);

    await waitFor(() => {
      expect(mocks.updateNotificationStatus).toHaveBeenCalledWith(
        notification!.id,
        "read",
      );
    });
    expect(screen.getByText("read")).toBeTruthy();
  });

  it("normalizes stored event dates for display and form controls", () => {
    expect(formatEventDate("2026-07-18T12:30:00.000Z")).toBe("Jul 18, 2026");
    expect(toEventDateInputValue("2026-07-18T12:30:00.000Z")).toBe(
      "2026-07-18",
    );
    expect(formatEventDate("not-a-date")).toBe("Date TBD");
  });

  it("formats 24-hour times without changing existing labels", () => {
    expect(formatEventTime("17:30")).toBe("5:30 PM");
    expect(formatEventTime("09:05")).toBe("9:05 AM");
    expect(formatEventTime("Next Day")).toBe("Next Day");
  });
});
