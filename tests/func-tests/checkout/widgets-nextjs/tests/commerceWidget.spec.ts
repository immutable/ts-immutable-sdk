import { test, expect } from "@playwright/test";
import { interceptWidgets } from "./utils/interceptWidgets";
import {
  CheckoutVersionConfig,
  interceptCheckoutVersionConfig,
} from "./utils/interceptCheckoutConfig";

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

    const connectWidget = page.getByTestId("bridge-view");
    await expect(connectWidget).toBeVisible();

    const closeButton = page.getByTestId("close-button");
    await expect(closeButton).toBeVisible();
    await closeButton.click();

    await expect(widgetRoot).toBeEmpty();
  });
});

test.describe("widget mounting - wallet flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/commerce-wallet");
  });

  test("should render connect widget and handle close", async ({ page }) => {
    await page.waitForSelector("#widget-root");

    const widgetRoot = page.locator("#widget-root");
    await expect(widgetRoot).not.toBeEmpty();

    const walletWidget = page.getByTestId("wallet-balances");
    await expect(walletWidget).toBeVisible();

    const closeButton = page.getByTestId("close-button");
    await expect(closeButton).toBeVisible();
    await closeButton.click();
  });
});

/**
 * Add Funds is disabled in Sandbox, it  will render a handover screen with error text.
 */
test.describe("widget mounting - add funds flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/commerce-add-funds");
  });

  test("should render add funds widget", async ({ page }) => {
    await page.waitForSelector("#widget-root");
    const widgetRoot = page.locator("#widget-root");
    await expect(widgetRoot).not.toBeEmpty();

    const closeButton = page.getByTestId("handover-secondary-button");
    await expect(closeButton).toBeVisible();

    // Add Funds events are not currently supported in Commerce
    // await closeButton.click();

    // await expect(widgetRoot).toBeEmpty();
  });
});



// Without inputs Sale will render a handover screen with error text.
test.describe("widget mounting - sale flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/commerce-sale");
  });

  test("should render sale widget and handle close", async ({ page }) => {
    await page.waitForSelector("#widget-root");
    const widgetRoot = page.locator("#widget-root");
    await expect(widgetRoot).not.toBeEmpty();

    const closeButton = page.getByTestId("handover-secondary-button");
    await expect(closeButton).toBeVisible();
    await closeButton.click();

    await expect(widgetRoot).toBeEmpty();
  });
});

test.describe("widget mounting - swap flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/commerce-swap");
  });

  test("should render sale widget and handle close", async ({ page }) => {
    await page.waitForSelector("#widget-root");
    const widgetRoot = page.locator("#widget-root");
    await expect(widgetRoot).not.toBeEmpty();


    // If the user has insufficient IMX, they will be shown a bottom sheet with a cancel button.
    const notEnoughGasBottomSheet = page.getByTestId("not-enough-gas-bottom-sheet");
    await expect(notEnoughGasBottomSheet).toBeVisible();
    if (await notEnoughGasBottomSheet.isVisible()) {
      const notEnoughGasCancelButton = page.getByTestId("not-enough-gas-cancel-button");
      await notEnoughGasCancelButton.click();
    }

    const swapButton = page.getByTestId("swap-button");
    await expect(swapButton).toBeVisible();

    const closeButton = page.getByTestId("close-button");
    await expect(closeButton).toBeVisible();
    await closeButton.click();

    await expect(widgetRoot).toBeEmpty();
  });
});

test.describe("widget mounting - onramp flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/commerce-onramp");
  });

  test("should render onramp widget", async ({ page }) => {
    await page.waitForSelector("#widget-root");
    const widgetRoot = page.locator("#widget-root");
    await expect(widgetRoot).not.toBeEmpty();

    const transakLoadingOverlay = page.getByTestId("LoadingOverlayContent__loopingText__text--Taking you to Transak__animatingSpan");
    await expect(transakLoadingOverlay).toBeVisible();

  });
});