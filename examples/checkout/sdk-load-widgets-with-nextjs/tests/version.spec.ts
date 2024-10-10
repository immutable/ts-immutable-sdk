import { test, expect } from "@playwright/test";
import { interceptWidgets } from "./utils/intercept-widgets";

const useLocalBundle = process.env.USE_LOCAL_BUNDLE === 'true';

// Only intercept a specific version of the widgets jsdelivr bundle (i.e 1.55.0, or latest)
const interceptWidgetsVersion = process.env.INTERCEPT_WIDGETS_VERSION;

test.beforeEach(async ({ page }) => {
  if (useLocalBundle) {
    await interceptWidgets(page, interceptWidgetsVersion);
  }

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
