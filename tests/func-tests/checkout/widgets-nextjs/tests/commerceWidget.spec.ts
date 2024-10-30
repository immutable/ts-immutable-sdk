import { test, expect } from "@playwright/test";
import { interceptWidgets } from "./utils/intercept-widgets";
import {
  CheckoutVersionConfig,
  interceptCheckoutVersionConfig,
} from "./utils/intercept-checkout-config";

const USE_REMOTE_WIDGETS = process.env.USE_REMOTE_WIDGETS === "true";

const INTERCEPT_CHECKOUT_VERSION_CONFIG =
  process.env.INTERCEPT_CHECKOUT_VERSION_CONFIG;

test.describe.configure({ mode: 'parallel' });

test.beforeEach(async ({ page }) => {
  if (!USE_REMOTE_WIDGETS) {
    await interceptWidgets(page);
  }

  if (INTERCEPT_CHECKOUT_VERSION_CONFIG) {
    const checkoutWidgetsVersion: CheckoutVersionConfig = {
      compatibleVersionMarkers: [INTERCEPT_CHECKOUT_VERSION_CONFIG],
    };
    await interceptCheckoutVersionConfig(page, checkoutWidgetsVersion);
  }
});

test.describe("widget mounting - connect flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/commerce-connect");
  });

  test("should render connect widget and handle close", async ({ page }) => {
    await page.waitForSelector("#widget-root");

    const widgetRoot = page.locator("#widget-root");
    await expect(widgetRoot).not.toBeEmpty();

    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId("error-view")).toHaveCount(0);

    const connectWidget = page.getByTestId("connect-wallet");
    await expect(connectWidget).toBeVisible();

    const closeButton = page.getByTestId("close-button");
    await expect(closeButton).toBeVisible();
    await closeButton.click();

    await expect(widgetRoot).toBeEmpty();
  });
});

test.describe("widget mounting - bridge flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/commerce-bridge");
  });

  test("should render bridge widget and handle close", async ({ page }) => {
    await page.waitForSelector("#widget-root");

    const widgetRoot = page.locator("#widget-root");
    await expect(widgetRoot).not.toBeEmpty();

    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId("error-view")).toHaveCount(0);

    const connectWidget = page.getByTestId("bridge-view");
    await expect(connectWidget).toBeVisible();

    const closeButton = page.getByTestId("close-button");
    await expect(closeButton).toBeVisible();
    await closeButton.click();

    await expect(widgetRoot).toBeEmpty();
  });
});

/**
 * Flows behind ConnectLoader require a mocked Provider to get past the ConnectWidget.
 * Until then, WALLET, SWAP, SALE, ONRAMP won't be testable.
 */
test.describe("widget mounting - wallet flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/commerce-wallet");
  });

  test("should render connect widget", async ({ page }) => {
    await page.waitForSelector("#widget-root");

    const widgetRoot = page.locator("#widget-root");
    await expect(widgetRoot).not.toBeEmpty();

    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId("error-view")).toHaveCount(0);

    const connectWidget = page.getByTestId("connect-wallet");
    await expect(connectWidget).toBeVisible();
  });
});

/**
 * Add Funds is disabled in Sandbox, we can only validate it doesn't show an error screen.
 */
test.describe("widget mounting - add funds flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/commerce-add-funds");
  });

  test("should render add funds widget", async ({ page }) => {
    await page.waitForSelector("#widget-root");
    const widgetRoot = page.locator("#widget-root");
    await expect(widgetRoot).not.toBeEmpty();

    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId("error-view")).toHaveCount(0);
  });
});
