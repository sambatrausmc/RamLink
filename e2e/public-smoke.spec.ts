import { expect, test } from "@playwright/test";

test("homepage presents the RamLink student experience", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/homepage$/);
  await expect(page.getByRole("heading", { name: /Find your place/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Explore Clubs" }).first()).toBeVisible();
});

test("public account routes are available", async ({ page }) => {
  await page.goto("/register");
  await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Continue to RamLink" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Forgot password?" })).toBeVisible();
  await page.goto("/forgot-password");
  await expect(page.getByRole("heading", { name: "Reset your password" })).toBeVisible();
});

test("about page explains the product", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByText("Discover campus groups")).toBeVisible();
  await expect(page.getByText("Follow events")).toBeVisible();
  await expect(page.getByText("Join communities")).toBeVisible();
});
