/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => ({
    profile: null,
    refreshProfile: vi.fn(),
    user: null,
  }),
}));

vi.mock("@/lib/firebase/student-actions", () => ({
  toggleEventRsvp: vi.fn(),
  toggleSavedEvent: vi.fn(),
}));

import { EventBrowserClient } from "@/components/public/event-browser-client";
import { clubs, events } from "@/lib/mock-data";

describe("public event browser filters", () => {
  afterEach(() => cleanup());

  it("filters events by club category and clears the selection", () => {
    render(<EventBrowserClient events={events} clubs={clubs} />);

    fireEvent.change(screen.getByLabelText("Filter by club category"), {
      target: { value: "Business" },
    });

    expect(
      screen.getByRole("heading", { name: "Resume Review Lab" }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("heading", { name: "Campus Hack Night" }),
    ).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));

    expect(
      screen.getByRole("heading", { name: "Campus Hack Night" }),
    ).toBeTruthy();
  });
});
