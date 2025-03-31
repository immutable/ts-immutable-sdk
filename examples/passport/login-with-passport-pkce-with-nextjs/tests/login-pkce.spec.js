import { test, expect } from '@playwright/test';

// Basic test to verify page loads
test('should load the login page', async ({ page }) => {
  await page.goto('/');
  
  // Verify page title
  await expect(page.locator('h1').first()).toContainText('Immutable Passport SDK: Login with PKCE');
  
  // Verify login button exists
  const loginButton = page.getByText('Login with Passport PKCE');
  await expect(loginButton).toBeVisible();
});

// Test navigation to PKCE page
test('should navigate to PKCE login page', async ({ page }) => {
  await page.goto('/');
  
  // Click on the login button
  await page.getByText('Login with Passport PKCE').click();
  
  // Verify we're on the PKCE login page
  await expect(page.locator('h1').first()).toContainText('Login with Passport PKCE Authentication');
  
  // Verify login button exists on PKCE page - using role selector to be more specific
  const loginButton = page.getByRole('button', { name: 'Login with Passport' });
  await expect(loginButton).toBeVisible();
});

// Test redirect page rendering - allowing for either Redirecting or Authentication Error state
test('should render redirect page correctly', async ({ page }) => {
  await page.goto('/redirect');
  
  // The redirect page can be in one of two states:
  // 1. "Redirecting..." (when actively processing a valid auth code)
  // 2. "Authentication Error" (when there's no valid auth code in the URL)
  // We'll accept either case as valid for the test
  
  // Get the heading text
  const headingText = await page.locator('h1').first().textContent();
  
  // Check if it matches either expected state
  expect(
    headingText === 'Redirecting...' || 
    headingText === 'Authentication Error'
  ).toBeTruthy();
  
  // If it's an error state, verify error message is shown
  if (headingText === 'Authentication Error') {
    await expect(page.locator('p').first()).toBeVisible();
  }
  // If it's redirecting, verify proper message
  else if (headingText === 'Redirecting...') {
    await expect(page.getByText('You are being redirected after authentication')).toBeVisible();
  }
});

// Test logout page rendering
test('should render logout page correctly', async ({ page }) => {
  await page.goto('/logout');
  
  // Verify logout page title
  await expect(page.locator('h1').first()).toContainText('You have been logged out');
  
  // Verify proper message is displayed
  await expect(page.getByText('Your session has been terminated')).toBeVisible();
  
  // Verify navigation button exists
  const homeButton = page.getByText('Go to Home');
  await expect(homeButton).toBeVisible();
});

// Test main page content
test('should display proper PKCE information on the home page', async ({ page }) => {
  await page.goto('/');
  
  // Verify the page contains information about PKCE - using more specific selectors
  await expect(page.locator('p').last()).toContainText('PKCE (Proof Key for Code Exchange)');
  await expect(page.locator('p').last()).toContainText('additional security for public clients');
});

// Test UI components on login page
test('should display proper UI components on the PKCE login page', async ({ page }) => {
  await page.goto('/login-with-passport-pkce');
  
  // Verify heading exists
  await expect(page.locator('h1').first()).toContainText('Login with Passport PKCE Authentication');
  
  // Verify PKCE description exists
  await expect(page.getByText('demonstrates the PKCE (Proof Key for Code Exchange) login flow')).toBeVisible();
  
  // Verify login button exists and is correctly styled - using role selector to be more specific
  const loginButton = page.getByRole('button', { name: 'Login with Passport' });
  await expect(loginButton).toBeVisible();
  
  // Verify return link exists
  const returnLink = page.getByText('Return to Home');
  await expect(returnLink).toBeVisible();
}); 