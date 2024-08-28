import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("home page", () => {
  test("has title, heading and link", async ({ page }) => {
    await expect(page).toHaveTitle("Checkout SDK - Connect with NextJS");
    await expect(page.getByRole("heading", { name: "Checkout SDK - Connect" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Connect with Metamask" })).toBeVisible();
  });
});

test.describe("connect wallet with metamask", () => {
  test("has heading, connect button and initial provider status set correctly", async ({ page }) => {
    await page.click("text=Connect with Metamask");

    await expect(page.getByRole("heading", { name: "Connect with MetaMask" })).toBeVisible();

    await expect(page.getByRole("button", { name: "Connect with Metamask" })).toBeVisible();
    await expect(page.getByText("Connected Provider:")).toBeVisible();
    await expect(page.getByRole("link", { name: "Return to Examples" })).toBeVisible();
  });
});
