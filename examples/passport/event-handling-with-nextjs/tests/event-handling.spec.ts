import { test, expect } from '@playwright/test';

test.describe('Event Handling', () => {
  test('should navigate to event handling page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/.*\/event-handling/);
  });

  test('should display event handling UI elements', async ({ page }) => {
    await page.goto('/event-handling');
    
    // Check for heading
    await expect(page.getByRole('heading', { name: 'Passport SDK - Event Handling Example' })).toBeVisible();
    
    // Check for status text
    await expect(page.getByText('Status: Logged Out')).toBeVisible();
    
    // Check for buttons
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
    
    // Check for event log
    await expect(page.getByText('Event Log:')).toBeVisible();
    await expect(page.locator('.event-log')).toBeVisible();
  });
}); 