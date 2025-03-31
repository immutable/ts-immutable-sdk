import { test, expect } from '@playwright/test';

test.describe('Link External Wallet Example', () => {
  test('Home page loads correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check if the title is present
    await expect(page.locator('h1')).toContainText('Link External Wallet Example');
    
    // Check if the link to the feature page exists - use a more specific selector
    await expect(page.getByRole('button', { name: 'Link External Wallet Example' })).toBeVisible();
  });

  test('Link External Wallet page loads correctly', async ({ page }) => {
    await page.goto('/link-external-wallet');
    
    // Check if the title is present
    await expect(page.locator('h1')).toContainText('Link External Wallet');
    
    // Check if the Back to Home button exists
    await expect(page.getByText('Back to Home')).toBeVisible();
  });

  test('Redirect page loads correctly', async ({ page }) => {
    await page.goto('/redirect');
    
    // Check if the page loads without errors
    // Just verify that the page rendered something and didn't crash
    await expect(page).toHaveURL('/redirect');
  });

  test('Logout page works correctly', async ({ page }) => {
    await page.goto('/logout');
    
    // Check if the user is successfully logged out
    await expect(page.locator('h1')).toContainText('Logged Out Successfully');
    
    // Check if the return to home button exists
    await expect(page.getByText('Return to Home')).toBeVisible();
  });
}); 