import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("home page", () => {
  test("has title, heading, and buttons", async ({ page }) => {
    await expect(page).toHaveTitle("Passport SDK - Passport Setup with NextJS");

    const buttonNames = [
      "Default configuration",
      "Popup overlays disabled",
      "Minimal scopes (openid, offline_access)",
      "All scopes (email, transact, etc)",
      "Silent logout mode",
      "Generic popup overlay disabled",
      "Blocked popup overlay disabled"
    ];
    for (const name of buttonNames) {
      await expect(page.locator(`text=${name}`).first()).toBeVisible();
    }
  });
});

test.describe("sub-pages navigation", () => {
  test("Check Default configuration page renders", async ({ page }) => {
    await page.click("text=Default configuration");
    await expect(page.getByRole("heading", { name: "Default configuration" })).toBeVisible();
  });

  test("Check Popup overlays disabled page renders", async ({ page }) => {
    await page.click("text=Popup overlays disabled");
    await expect(page.getByRole("heading", { name: "Popup overlays disabled" })).toBeVisible();
  });

  test("Check Minimal scopes page renders", async ({ page }) => {
    await page.click("text=Minimal scopes (openid, offline_access)");
    await expect(page.getByRole("heading", { name: "Minimal scopes (openid, offline_access)" })).toBeVisible();
  });

  test("Check All scopes page renders", async ({ page }) => {
    await page.click("text=All scopes (email, transact, etc)");
    await expect(page.getByRole("heading", { name: "All scopes (email, transact, etc)" })).toBeVisible();
  });

  test("Check Silent logout mode page renders", async ({ page }) => {
    await page.click("text=Silent logout mode");
    await expect(page.getByRole("heading", { name: "Silent logout mode" })).toBeVisible();
  });
  
  test("Check Generic popup overlay disabled page renders", async ({ page }) => {
    await page.click("text=Generic popup overlay disabled");
    await expect(page.getByRole("heading", { name: "Generic popup overlay disabled" })).toBeVisible();
  });

  test("Check Blocked popup overlay disabled page renders", async ({ page }) => {
    await page.click("text=Blocked popup overlay disabled");
    await expect(page.getByRole("heading", { name: "Blocked popup overlay disabled" })).toBeVisible();
  });
});
