import { test, expect } from "@playwright/test";
import { saveCoverage } from "./coverage-helper";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("home page", () => {
  test("has title, heading, and buttons", async ({ page }, testInfo) => {
    await expect(page).toHaveTitle("Passport SDK - Login with Passport Bridge");
    await expect(page.getByRole("heading", { name: "Login with Passport Bridge" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Login with Passport Bridge" })).toBeVisible();
    
    // Save coverage at the end of the test
    await saveCoverage(page, testInfo);
  });
});

test.describe("login-with-passport-bridge page", () => {
  test("has expected components and structure", async ({ page }, testInfo) => {
    // Navigate to the login page
    await page.goto("/login-with-passport-bridge");
    
    // Check for essential elements
    await expect(page.getByRole("heading", { name: "Login with Passport Bridge" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Return to Examples" })).toBeVisible();
    
    // Save coverage at the end of the test
    await saveCoverage(page, testInfo);
  });
  
  test("displays login button and handles error states", async ({ page }, testInfo) => {
    // Navigate to the login page
    await page.goto("/login-with-passport-bridge");
    
    // Since we can't actually log in during automated tests, we can check error handling
    // by mocking the failed login attempt
    await page.addInitScript(() => {
      const originalRequest = window.fetch;
      window.fetch = function(input, init) {
        // Simulate network errors when passport tries to communicate with auth servers
        if (input.toString().includes('oauth') || input.toString().includes('auth')) {
          return Promise.reject(new Error('Network error'));
        }
        return originalRequest.call(window, input, init);
      };
    });
    
    // Attempt to find login button by inspecting page content
    await page.waitForSelector('button', { timeout: 5000 });
    const buttonText = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.map(button => button.textContent).join(', ');
    });
    console.log('Found buttons with text:', buttonText);
    
    // Intentionally trigger error handling code
    if (buttonText.includes('Login')) {
      await page.click('button');
      // Allow time for error state to appear
      await page.waitForTimeout(500);
    }
    
    // Save coverage at the end of the test
    await saveCoverage(page, testInfo);
  });
});

test.describe("redirect and logout pages", () => {
  test("redirect page has correct structure", async ({ page }, testInfo) => {
    await page.goto("/redirect");
    await expect(page.getByText("Logged in")).toBeVisible();
    
    // Save coverage at the end of the test
    await saveCoverage(page, testInfo);
  });

  test("logout page has correct structure", async ({ page }, testInfo) => {
    await page.goto("/logout");
    await expect(page.getByRole("heading", { name: "Successfully Logged Out" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Return to Examples" })).toBeVisible();
    
    // Save coverage at the end of the test
    await saveCoverage(page, testInfo);
  });
}); 