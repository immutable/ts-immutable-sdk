import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("home page", () => {
  test("has title and heading", async ({ page }) => {
    await expect(page).toHaveTitle("Passport Identity Examples");
    await expect(page.getByRole("heading", { name: "Passport Identity Examples" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Login with NextJS" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Passport Methods" })).toBeVisible();
  });
});

test.describe("Login with NextJS", () => {
  test("has heading and correct buttons", async ({ page }) => {
    await page.click("text=Login with NextJS");
    await expect(page.getByRole("heading", { name: "Login with NextJS" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Login without Wallet" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Login with EtherJS" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Logout" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Logout in Silent Mode" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Return to Examples" })).toBeVisible();
  });
});

test.describe("Passport Methods", () => {
  test("has heading and correct buttons", async ({ page }) => {
    await page.click("text=Passport Methods");
    await expect(page.getByRole("heading", { name: "Passport Methods" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Get ID Token" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Get Access Token" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Get Linked Addresses" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Get User Info" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Return to Examples" })).toBeVisible();
  });
});