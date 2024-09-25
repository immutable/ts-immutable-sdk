import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("home page", () => {
  test("has title, heading and link", async ({ page }) => {
    await expect(page).toHaveTitle("Checkout SDK - Wallet Balance with NextJS");
    await expect(page.getByRole("heading", { name: "Checkout SDK Wallet Balance" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Wallet Balance with MetaMask" })).toBeVisible();
  });
});
