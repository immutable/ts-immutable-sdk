import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("home page", () => {
  test("has title, heading, and buttons", async ({ page }) => {
    await expect(page).toHaveTitle("Passport SDK - Login with NextJS");
    await expect(page.getByRole("heading", { name: "Login with NextJS" })).toBeVisible();
        const buttonNames = [
      "Login with Passport",
      "Login with EtherJS",
      "Login with Identity only",
      "Logout with Redirect Mode",
      "Logout with Silent Mode"
    ];
    
    for (const name of buttonNames) {
      await expect(page.locator(`text=${name}`).first()).toBeVisible();
    }
  });
});

test.describe("sub-pages navigation", () => {
  test("Check Login with Passport", async ({ page }) => {
    await page.click("text=Login with Passport");
    await expect(page.getByRole("heading", { name: "Login with Passport" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Login/ })).toBeVisible();
    await expect(page.locator("table").getByRole("row").locator("text=Is Logged In")).toBeVisible();
    await expect(page.locator("table").getByRole("row").locator("text=Account Address")).toBeVisible();
    await expect(page.getByRole("link", { name: "Return to Examples" })).toBeVisible();
  });

  test("Check Login with EtherJS", async ({ page }) => {
    await page.click("text=Login with EtherJS");
    await expect(page.getByRole("heading", { name: "Login with EtherJS" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Login/ })).toBeVisible();
    await expect(page.locator("table").getByRole("row").locator("text=Is Logged In")).toBeVisible();
    await expect(page.locator("table").getByRole("row").locator("text=Account Address")).toBeVisible();
    await expect(page.getByRole("link", { name: "Return to Examples" })).toBeVisible();
  });

  test("Check Login with Identity Only", async ({ page }) => {
    await page.click("text=Login with Identity only");
    await expect(page.getByRole("heading", { name: "Login with Identity Only" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Login/ })).toBeVisible();
    await expect(page.locator("table").getByRole("row").locator("b", { hasText: "Email" })).toBeVisible();
    await expect(page.locator("table").getByRole("row").locator("b", { hasText: "Subject (sub)" })).toBeVisible();
    await expect(page.locator("table").getByRole("row").locator("b", { hasText: "Is Logged In" })).toBeVisible();
    
    await expect(page.getByRole("link", { name: "Return to Examples" })).toBeVisible();
  });

  test("Check Redirect Logout", async ({ page }) => {
    // Redirect Mode
    await page.click("text=Logout with Redirect Mode");
    await expect(page.getByRole("heading", { name: "Logout with Redirect Mode" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Login|Logout/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "Return to Examples" })).toBeVisible();
  });
  test("Check Silent Logout", async ({ page }) => {
    // Silent Mode
    await page.click("text=Logout with Silent Mode");
    await expect(page.getByRole("heading", { name: "Logout with Silent Mode" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Login|Logout/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "Return to Examples" })).toBeVisible();
    });
});