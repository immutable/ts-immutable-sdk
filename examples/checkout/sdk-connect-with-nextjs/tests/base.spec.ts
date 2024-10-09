import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("home page", () => {
  test("has title, heading and link", async ({ page }) => {
    await expect(page).toHaveTitle("Checkout SDK - Connect with NextJS");
    await expect(page.getByRole("heading", { name: "Checkout SDK Connect" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Connect with Metamask" })).toBeVisible();
  });
});

test.describe("Connect with Metamask", () => {
  test("has heading, login button and initial account status set correctly", async ({ page }) => {
    await page.click("text=Connect with Metamask");
    await expect(page.getByRole("heading", { name: "Connect with Metamask" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Connect Metamask with Permissions" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Connect Metamask without Permissions" })).toBeVisible();
    await expect(page.getByText("(not fetched)")).toHaveCount(1);
    await expect(page.getByText("(not created)")).toHaveCount(1);
    await expect(page.getByText("(not validated)")).toHaveCount(1);
    await expect(page.getByText("(not connected)")).toHaveCount(3);
    await expect(page.getByRole("link", { name: "Return to Examples" })).toBeVisible();
  });
});

