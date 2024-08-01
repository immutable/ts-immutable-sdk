import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("home page", () => {
  test("has title, heading and link", async ({ page }) => {
    await expect(page).toHaveTitle("Passport Send Transaction Examples");
    await expect(page.getByRole("heading", { name: "Send Transaction" })).toBeVisible();
  });
});


