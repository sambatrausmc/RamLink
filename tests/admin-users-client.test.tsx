/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AdminUsersClient } from "@/components/admin/admin-users-client";
import { updateManagedClubs, updateUserRole } from "@/lib/firebase/admin-workflows";
import { getClubs, getStudents } from "@/lib/firebase/public-data";
import { clubs, currentStudent } from "@/lib/mock-data";

vi.mock("@/lib/firebase/public-data", () => ({
  getClubs: vi.fn(),
  getStudents: vi.fn(),
}));

vi.mock("@/lib/firebase/admin-workflows", () => ({
  updateManagedClubs: vi.fn(),
  updateUserRole: vi.fn(),
}));

describe("admin user directory", () => {
  beforeEach(() => {
    vi.mocked(getClubs).mockResolvedValue(clubs);
    vi.mocked(getStudents).mockResolvedValue([
      {
        ...currentStudent,
        id: "admin-user",
        displayName: "Admin User",
        email: "admin@example.edu",
        role: "admin",
      },
      {
        ...currentStudent,
        id: "officer-user",
        displayName: "Club Officer",
        email: "officer@example.edu",
        role: "clubOfficer",
        managedClubIds: [clubs[0].id],
      },
    ]);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("initializes role and club selectors from loaded Firestore data", async () => {
    render(<AdminUsersClient />);

    expect(screen.getByText("Loading users...")).toBeTruthy();
    expect(await screen.findByDisplayValue("Admin")).toBeTruthy();
    expect(screen.getByDisplayValue("Club Officer")).toBeTruthy();
    expect(screen.getByDisplayValue(clubs[0].name)).toBeTruthy();
  });

  it("uses one role workflow when removing officer access", async () => {
    render(<AdminUsersClient />);
    const officerRole = await screen.findByDisplayValue("Club Officer");

    fireEvent.change(officerRole, { target: { value: "student" } });

    await waitFor(() => {
      expect(updateUserRole).toHaveBeenCalledWith("officer-user", "student");
    });
    expect(updateManagedClubs).not.toHaveBeenCalled();
    expect(screen.getByText("User role updated.")).toBeTruthy();
  });
});
