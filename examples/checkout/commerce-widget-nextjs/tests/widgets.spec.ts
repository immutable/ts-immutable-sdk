import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/widgets");
});

test.describe("widget loading", () => {
  test("loads widgets into root", async ({ page }) => {
    // Wait for the widget-root element to be visible
    await page.waitForSelector('#widget-root');

    // Check if the widget-root element contains child elements
    const widgetRoot = page.locator('#widget-root');
    await expect(widgetRoot).not.toBeEmpty();

    const connectWidget = page.getByTestId('connect-wallet');
    await expect(connectWidget).toBeVisible();
  });
});
