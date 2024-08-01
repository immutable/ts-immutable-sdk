import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("home page", () => {
  test("has title and heading", async ({ page }) => {
    await expect(page).toHaveTitle("Passport Identity Examples");
    await expect(page.getByRole("heading", { name: "Passport Identity Examples" })).toBeVisible();
  });
});