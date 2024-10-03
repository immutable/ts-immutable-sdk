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

test.describe("switch network with metamask", () => {
  test("has heading, login button and initial account status set correctly", async ({ page }) => {
    await page.click("text=Switch Network with MetaMask");
    await expect(page.getByRole("heading", { name: "Switch Network" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Connect MetaMask" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Switch to Sepolia Testnet" })).toBeVisible();
    await expect(page.getByRole("button", { name: " Switch to Immutable zkEVM Testnet" })).toBeVisible();
    await expect(page.getByText("(not connected)")).toHaveCount(5);
    await expect(page.getByRole("link", { name: "Return to Examples" })).toBeVisible();
  });
});
