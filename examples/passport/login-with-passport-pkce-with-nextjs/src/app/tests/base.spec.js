import { test, expect } from '@playwright/test';

// Basic test to verify page loads
test('should load the login page', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Verify page title
  await expect(page.locator('h1').first()).toContainText('Immutable Passport SDK: Login with PKCE');
  
  // Verify login button exists
  const loginButton = page.getByText('Login with Passport PKCE');
  await expect(loginButton).toBeVisible();
});

// Test navigation to PKCE page
test('should navigate to PKCE login page', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Click on the login button
  await page.getByText('Login with Passport PKCE').click();
  
  // Verify we're on the PKCE login page
  await expect(page.locator('h1').first()).toContainText('Login with Passport PKCE Authentication');
  
  // Verify login button exists on PKCE page
  const loginButton = page.getByText('Login with Passport');
  await expect(loginButton).toBeVisible();
}); 