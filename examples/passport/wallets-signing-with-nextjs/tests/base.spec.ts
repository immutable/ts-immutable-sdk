import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("home page", () => {
  test("has title, heading and link", async ({ page }) => {
    await expect(page).toHaveTitle("Passport Message Signing");

    await expect(page.getByRole("heading", { name: "Passport Message Signing Examples" })).toBeVisible();

    await expect(page.getByRole("link", { name: "Sign message with EIP-712" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign message with ERC-191" })).toBeVisible();
  });
});

test.describe("sign message with EIP-712", () => {
  test("has heading, login button and initial account status set correctly", async ({ page }) => {
    await page.click("text=Sign message with EIP-712");

    await expect(page.getByRole("heading", { name: "Passport Sign EIP-712 Message" })).toBeVisible();

    await expect(page.getByRole("button", { name: "Passport Login" })).toBeVisible();
    await expect(page.getByText("Connected Account:")).toBeVisible();
    await expect(page.getByRole("link", { name: "Return to Examples" })).toBeVisible();
  });
});

test.describe("sign message with ERC-191", () => {
  test("has heading, login button and initial account status set correctly", async ({ page }) => {
    await page.click("text=Sign message with ERC-191");

    await expect(page.getByRole("heading", { name: "Passport Sign ERC-191 Message" })).toBeVisible();

    await expect(page.getByRole("button", { name: "Passport Login" })).toBeVisible();
    await expect(page.getByText("Connected Account:")).toBeVisible();
    await expect(page.getByRole("link", { name: "Return to Examples" })).toBeVisible();
  });
});

