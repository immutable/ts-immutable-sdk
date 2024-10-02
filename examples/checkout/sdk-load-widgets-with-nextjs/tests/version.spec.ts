import { test, expect } from "@playwright/test";
import { interceptWidgets } from "./utils/intercept-widgets";

const useLocalBundle = process.env.USE_LOCAL_BUNDLE === 'true';

test.beforeEach(async ({ page }) => {
  if (useLocalBundle) {
    await interceptWidgets(page);
  }

  await page.goto("/version");
});

test.describe("widget loading", () => {
  test("basic check", async ({ page }) => {
    const versionText = page.getByText('Version');
    await expect(versionText).toBeVisible();
  });

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



