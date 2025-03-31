import { test, expect } from "@playwright/test";
import { saveCoverage } from "./coverage-helper";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("home page", () => {
  test("has title, heading, and buttons", async ({ page }, testInfo) => {
    await expect(page).toHaveTitle("Passport SDK - Event Handling with NextJS");
    await expect(page.getByRole("heading", { name: "Event Handling with NextJS" })).toBeVisible();
    await expect(page.getByText("This example demonstrates how to handle events in the Immutable Passport SDK.")).toBeVisible();
    await expect(page.getByText("Event Handling Example")).toBeVisible();
    await expect(page.getByText("Logout Example")).toBeVisible();
    
    await saveCoverage(page, testInfo);
  });
});

test.describe("sub-pages navigation", () => {
  test("navigates to Event Handling page", async ({ page }, testInfo) => {
    await page.getByText("Event Handling Example").click();
    await expect(page).toHaveURL(/.*\/event-handling/);
    await expect(page.getByRole("heading", { name: "Event Handling Example" })).toBeVisible();
    
    await saveCoverage(page, testInfo);
  });

  test("navigates to Logout page", async ({ page }, testInfo) => {
    await page.getByText("Logout Example").click();
    await expect(page).toHaveURL(/.*\/logout/);
    await expect(page.getByRole("heading", { name: "Successfully Logged Out" })).toBeVisible();
    
    await saveCoverage(page, testInfo);
  });
});

// Add more thorough tests for the event handling page
test.describe("event handling page functionality", () => {
  test("shows proper UI elements", async ({ page }, testInfo) => {
    await page.goto("/event-handling");
    
    // Check key UI elements
    await expect(page.getByRole("heading", { name: "Event Handling Example" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Connection Status" })).toBeVisible();
    // Connection status is dynamically rendered, so we don't check for specific text
    await expect(page.getByText("Connect Wallet")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Event Log" })).toBeVisible();
    
    await saveCoverage(page, testInfo);
  });
});