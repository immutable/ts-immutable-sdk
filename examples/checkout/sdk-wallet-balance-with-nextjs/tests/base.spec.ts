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

test.describe("Wallet Balance with MetaMask", () => {
  test("has heading, login button and initial account status set correctly", async ({ page }) => {
    await page.click("text=Wallet Balance with MetaMask");
    await expect(page.getByRole("heading", { name: "Wallet Balance with MetaMask" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Connect MetaMask" })).toBeVisible();
    await expect(page.getByText("(not connected)")).toHaveCount(3);
    await expect(page.getByRole("link", { name: "Return to Examples" })).toBeVisible();
  });
});
