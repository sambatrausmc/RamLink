import { expect, test } from "@playwright/test";

const studentEmail = process.env.E2E_STUDENT_EMAIL;
const studentPassword = process.env.E2E_STUDENT_PASSWORD;

test("protected student pages require authentication", async ({ page }) => {
  for (const path of ["/account", "/report"]) {
    await page.goto(path);
    await expect(page).toHaveURL(
      new RegExp(`/login\\?next=${encodeURIComponent(path)}`),
    );
    await expect(
      page.getByRole("heading", { name: "Continue to RamLink" }),
    ).toBeVisible();
  }
});

test("student can sign in and open protected pages", async ({ page }) => {
  // Automatically skips if test credentials are not provided in the environment
  test.skip(
    !studentEmail || !studentPassword,
    "Set E2E student credentials to run this test.",
  );

  await page.goto("/login");
  await page.getByLabel("School email").fill(studentEmail!);
  await page.getByLabel("Password").fill(studentPassword!);
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto("/homepage");
  await expect(
    page.getByRole("link", { name: /Dashboard/ }).first(),
  ).toBeVisible();
  await page.goto("/clubs");
  await expect(
    page.getByRole("link", { name: /Dashboard/ }).first(),
  ).toBeVisible();
  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", { name: /Student Dashboard/ }),
  ).toBeVisible();
  await page.goto("/account");
  await expect(
    page.getByRole("heading", { name: "Account Settings" }),
  ).toBeVisible();
  await page.goto("/report");
  await expect(
    page.getByRole("heading", { name: "Report Content" }),
  ).toBeVisible();
});
