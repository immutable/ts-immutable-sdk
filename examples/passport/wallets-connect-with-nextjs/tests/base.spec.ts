import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("home page", () => {
  test("has title, heading and link", async ({ page }) => {
    await expect(page).toHaveTitle("Immutable Passport Example");

    await expect(page.getByRole("heading", { name: "Passport Wallet Examples" })).toBeVisible();

    await expect(page.getByRole("link", { name: "Connect Wallet with EtherJS" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Connect Wallet ith EIP1193" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Connect Wallet with Wagmi" })).toBeVisible();
  });
});

test.describe("connect wallet with etherjs", () => {
  test("has heading, login button and initial account status set correctly", async ({ page }) => {
    await page.click("text=Connect Wallet with EtherJS");

    await expect(page.getByRole("heading", { name: "Passport Wallet - Connect with EtherJS" })).toBeVisible();

    await expect(page.getByRole("button", { name: "Passport Login" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Return to Examples" })).toBeVisible();
  });
});
