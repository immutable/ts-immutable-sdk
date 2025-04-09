import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("home page", () => {
  test("has heading and buttons", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "User Information after Logging In with NextJS" })).toBeVisible();
    const buttonNames = [
      "Linked Addresses with Passport",
      "User Info with Passport",
      "Verify Tokens with NextJS",
      "Link External Wallet"
    ];

    for (const name of buttonNames) {
      await expect(page.locator(`text=${name}`).first()).toBeVisible();
    }
  });
});

test.describe("sub-pages navigation", () => {
  test("Check Linked Addresses with Passport", async ({ page }) => {
    await page.click("text=Linked Addresses with Passport");
    await expect(page.getByRole("heading", { name: "Linked Addresses with Passport" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Login|Logged In/ })).toBeVisible();
    await expect(page.getByRole("row", { name: /Is Logged In/ })).toBeVisible();
    await expect(page.getByRole("row", { name: /Account Address/ })).toBeVisible();
    await expect(page.getByRole("row", { name: /Linked Addresses/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "Return to Examples" })).toBeVisible();
  });

  test("Check User Info with Passport", async ({ page }) => {
    await page.click("text=User Info with Passport");
    await expect(page.getByRole("heading", { name: "User Info with Passport" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Login|Logged In/ })).toBeVisible();
    await expect(page.getByRole("row", { name: /Is Logged In/ })).toBeVisible();
    await expect(page.getByRole("row", { name: /Account Address/ })).toBeVisible();
    await expect(page.getByRole("row", { name: /User Profile/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "Return to Examples" })).toBeVisible();
  });

  test("Check Verify Tokens with NextJS", async ({ page }) => {
    await page.click("text=Verify Tokens with NextJS");
    await expect(page.getByRole("heading", { name: "Verify Tokens with NextJS" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Login|Logged In/ })).toBeVisible();
    await expect(page.getByRole("row", { name: /Is Logged In/ })).toBeVisible();
    await expect(page.getByRole("row", { name: /Account Address/ })).toBeVisible();
    await expect(page.getByRole("row", { name: /ID Token/ })).toBeVisible();
    await expect(page.getByRole("row", { name: /Access Token/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "Return to Examples" })).toBeVisible();
  });

  test("Check Link External Wallet", async ({ page }) => {
    await page.click("text=Link External Wallet");
    await expect(page.getByRole("heading", { name: "Link External Wallet" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Login with Passport" })).toBeVisible();
    await expect(page.getByRole("row", { name: /Is Logged In/ })).toBeVisible();
    await expect(page.getByRole("row", { name: /Account Address/ })).toBeVisible();
    await expect(page.getByRole("row", { name: /External Wallet/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "Return to Examples" })).toBeVisible();
  });
});