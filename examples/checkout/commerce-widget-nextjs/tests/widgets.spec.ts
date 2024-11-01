import { test, expect } from "@playwright/test";
import { interceptWidgets } from "./utils/intercept-widgets";
import { CheckoutVersionConfig, interceptCheckoutVersionConfig } from "./utils/intercept-checkout-config";

const USE_REMOTE_WIDGETS = process.env.USE_REMOTE_WIDGETS === 'true';

const INTERCEPT_CHECKOUT_VERSION_CONFIG = process.env.INTERCEPT_CHECKOUT_VERSION_CONFIG;



test.beforeEach(async ({ page }) => {

  if (!USE_REMOTE_WIDGETS) {
    await interceptWidgets(page, '*');
  }

  if (INTERCEPT_CHECKOUT_VERSION_CONFIG) {
    const checkoutWidgetsVersion: CheckoutVersionConfig = {
      compatibleVersionMarkers: [INTERCEPT_CHECKOUT_VERSION_CONFIG]
    };
    await interceptCheckoutVersionConfig(page, checkoutWidgetsVersion);
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
