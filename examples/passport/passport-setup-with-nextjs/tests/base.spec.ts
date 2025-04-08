import { test, expect } from '@playwright/test';

test('Home page loads with setup options', async ({ page }) => {
  await page.goto('/');
  
  // Check page title
  await expect(page.locator('h1')).toContainText('Immutable Passport Setup Options');
  
  // Check if all setup cards are present
  await expect(page.locator('.setup-card')).toHaveCount(6);
  
  // Check if specific setup options are available
  await expect(page.getByText('Standard Configuration')).toBeVisible();
  await expect(page.getByText('Disabled Popup Overlays')).toBeVisible();
  await expect(page.getByText('Minimal Scopes')).toBeVisible();
  await expect(page.getByText('All Scopes')).toBeVisible();
  await expect(page.getByText('Silent Logout')).toBeVisible();
  await expect(page.getByText('Production Environment')).toBeVisible();
});

test('Can navigate to standard config setup page', async ({ page }) => {
  await page.goto('/');
  
  // Click on standard setup link
  await page.getByText('Try Standard Setup').click();
  
  // Check if redirected to setup page
  await expect(page).toHaveURL(/.*\/passport-setup\?config=standard/);
  
  // Check if correct title is shown
  await expect(page.locator('h1')).toContainText('Testing standard Configuration');
  
  // Check if login button is present
  await expect(page.getByText('Login with Passport')).toBeVisible();
});

test('Passport setup page shows configuration details', async ({ page }) => {
  // Test a few different configurations
  const configs = ['standard', 'no-overlays', 'minimal-scopes', 'silent-logout'];
  
  for (const config of configs) {
    await page.goto(`/passport-setup?config=${config}`);
    
    // Check if title reflects the configuration
    await expect(page.locator('h1')).toContainText(`Testing ${config.replace('-', ' ')} Configuration`);
    
    // Check if configuration details section exists
    await expect(page.getByText('Configuration Details')).toBeVisible();
    
    // Check if configuration type is displayed correctly
    await expect(page.locator('.card')).toContainText(`Configuration: ${config}`);
  }
}); 