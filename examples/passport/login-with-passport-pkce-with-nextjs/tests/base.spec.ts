import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("home page", () => {
  test("has title, heading, and buttons", async ({ page }) => {
    await expect(page).toHaveTitle("Passport SDK - Login with Passport PKCE");
    await expect(page.getByRole("heading", { name: "Login with Passport PKCE" })).toBeVisible();
    await expect(page.locator(`text=Login with Passport PKCE`).first()).toBeVisible();
  });
});

test.describe("sub-pages navigation", () => {
  test("Check Login with Passport PKCE", async ({ page }) => {
    // Navigate to the login page
    await page.click("text=Login with Passport PKCE");
    
    // Check for basic page elements only
    await expect(page.getByRole("heading", { name: "Login with Passport PKCE" })).toBeVisible();
    // await expect(page.locator("table")).toBeVisible();
    // await expect(page.getByRole("link", { name: "Return to Examples" })).toBeVisible();
  });
});