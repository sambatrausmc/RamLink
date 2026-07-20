import { expect, test, type Page } from "@playwright/test";

const officerEmail = process.env.E2E_OFFICER_EMAIL;
const officerPassword = process.env.E2E_OFFICER_PASSWORD;
const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;

async function signIn(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("School email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
}

test("club officer opens only authorized workspaces", async ({ page }) => {
  test.skip(
    !officerEmail || !officerPassword,
    "Set E2E officer credentials to run this test.",
  );

  await signIn(page, officerEmail!, officerPassword!);
  await expect(page).toHaveURL(/\/club\/homepage$/);
  await expect(page.getByRole("heading", { name: /homepage/i })).toBeVisible();

  await page.goto("/admin/homepage");
  await expect(page).toHaveURL(/\/club\/homepage$/);
  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", { name: /Student Dashboard/ }),
  ).toBeVisible();
});

test("administrator opens the admin workspace", async ({ page }) => {
  test.skip(
    !adminEmail || !adminPassword,
    "Set E2E administrator credentials to run this test.",
  );

  await signIn(page, adminEmail!, adminPassword!);
  await expect(page).toHaveURL(/\/admin\/homepage$/);
  await expect(
    page.getByRole("heading", { name: "RamLink Admin Homepage" }),
  ).toBeVisible();
  await page.goto("/admin/users");
  await expect(
    page.getByRole("heading", { name: /User/ }),
  ).toBeVisible();
});
