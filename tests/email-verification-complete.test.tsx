/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import VerificationCompletePage from "@/app/(public)/verification-complete/page";

describe("email verification completion page", () => {
  afterEach(() => cleanup());

  it("directs the user back to the original RamLink tab", () => {
    render(<VerificationCompletePage />);

    expect(
      screen.getByRole("heading", {
        name: "Return to your original RamLink tab",
      }),
    ).toBeTruthy();
    expect(screen.getByText(/I verified my email/)).toBeTruthy();
    expect(screen.getByText(/You may close this window afterward/)).toBeTruthy();
  });

  it("offers sign in when the original tab was closed", () => {
    render(<VerificationCompletePage />);

    expect(
      screen.getByRole("link", { name: "Continue to sign in" }).getAttribute(
        "href",
      ),
    ).toBe("/login");
  });
});
