import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("home page", () => {
  test("has title, heading and link", async ({ page }) => {
    await expect(page).toHaveTitle("Passport Connect Examples");
    await expect(page.getByRole("heading", { name: "Passport Connect Examples" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Connect with EtherJS" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Connect with EIP-1193" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Connect with Wagmi" })).toBeVisible();
  });
});

test.describe("connect wallet with etherjs", () => {
  test("has heading, login button and initial account status set correctly", async ({ page }) => {
    await page.click("text=Connect with EtherJS");
    await expect(page.getByRole("heading", { name: "Passport Connect with EtherJS" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Passport Login" })).toBeVisible();
    await expect(page.getByText("Connected Account")).toBeVisible();
    await expect(page.getByText("(not connected)")).toBeVisible();
    await expect(page.getByRole("link", { name: "Return to Examples" })).toBeVisible();
  });
});

test.describe("connect wallet with eip1193", () => {
  test("has heading, login button and initial account status set correctly", async ({ page }) => {
    await page.click("text=Connect with EIP-1193");
    await expect(page.getByRole("heading", { name: "Passport Connect with EIP-1193" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Passport Login" })).toBeVisible();
    await expect(page.getByText("Connected Account")).toBeVisible();
    await expect(page.getByText("(not connected)")).toBeVisible();
    await expect(page.getByRole("link", { name: "Return to Examples" })).toBeVisible();
  });
});

test.describe("connect wallet with wagmi", () => {
  test("has heading and login button set correctly", async ({ page }) => {
    await page.click("text=Connect with Wagmi");
    await expect(page.getByRole("heading", { name: "Passport Connect with Wagmi" })).toBeVisible();
    await expect(page.getByText("Connect with:")).toBeVisible();
    await expect(page.getByRole("button", { name: "Immutable Passport" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Return to Examples" })).toBeVisible();
  });
});
