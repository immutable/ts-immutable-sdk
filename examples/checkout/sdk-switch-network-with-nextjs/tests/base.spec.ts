import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("home page", () => {
  test("has title, heading and link", async ({ page }) => {
    await expect(page).toHaveTitle("Checkout SDK - Switching Networks with NextJS");
    await expect(page.getByRole("heading", { name: "Checkout SDK Connect and Switch Networks" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Switch Network with MetaMask" })).toBeVisible();
  });
});
