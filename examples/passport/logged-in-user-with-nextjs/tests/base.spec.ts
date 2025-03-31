import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("page rendering", () => {
  test("home page loads", async ({ page }) => {
    // Just verify page loads without errors
    await expect(page).toHaveURL(/\/$/);
  });

  test("link external wallet page loads", async ({ page }) => {
    // Navigate to the link external wallet page
    await page.goto("/link-external-wallet");
    await expect(page).toHaveURL(/link-external-wallet$/);
  });
  
  test("linked addresses page loads", async ({ page }) => {
    // Navigate to the linked addresses page
    await page.goto("/linked-addresses-with-passport");
    await expect(page).toHaveURL(/linked-addresses-with-passport$/);
  });

  test("user info page loads", async ({ page }) => {
    // Navigate to the user info page
    await page.goto("/user-info-with-passport");
    await expect(page).toHaveURL(/user-info-with-passport$/);
  });

  test("verify tokens page loads", async ({ page }) => {
    // Navigate to the verify tokens page
    await page.goto("/verify-tokens-with-nextjs");
    await expect(page).toHaveURL(/verify-tokens-with-nextjs$/);
  });
});