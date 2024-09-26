import { test, expect } from "@playwright/test";
import fs from 'fs';
import path from 'path';

const useLocalBundle = true;

test.beforeEach(async ({ page }) => {
  if (useLocalBundle) {
  await page.route('**/@imtbl/sdk@*/dist/browser/checkout/**', async route => {
    const url = new URL(route.request().url());
    const fileName = path.basename(url.pathname);
    let filePath = path.join(__dirname, 'public/lib/js', fileName);

    // Special case for widgets-esm.js
    if (fileName === 'widgets-esm.js') {
      filePath = path.join(__dirname, 'public/lib/js', 'index.js');
    }

    console.log('Attempting to read file:', filePath);

    try {
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        console.log('File content length:', fileContent.length);

        // Fulfill the request with your local file content
        await route.fulfill({
          status: 200,
          contentType: 'application/javascript',
          body: fileContent
        });
        console.log('Request fulfilled with local file:', fileName);
      } else {
        console.error('File does not exist:', filePath);
        await route.continue(); // Continue with the original request if file doesn't exist
      }
    } catch (error) {
      console.error('Error reading file:', error);
      await route.continue(); // Continue with the original request if there's an error
    }
  });
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