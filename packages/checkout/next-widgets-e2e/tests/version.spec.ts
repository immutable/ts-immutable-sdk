import { test, expect } from "@playwright/test";
import fs from 'fs';
import path from 'path';
import { interceptWidgets } from "./utils/intercept-widgets";

const useLocalBundle = true;

test.beforeEach(async ({ page }) => {
  if (useLocalBundle) {
    await interceptWidgets(page);
  }

  await page.goto("/version");
});

// test.beforeEach(async ({ page }) => {
//   await page.goto("/");
// });

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





// https://cdn.jsdelivr.net/npm/@imtbl/sdk@1.54.0-alpha.1/dist/browser/checkout/widgets-esm.js