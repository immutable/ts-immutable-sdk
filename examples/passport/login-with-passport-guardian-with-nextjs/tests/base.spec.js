import { test, expect } from '@playwright/test';
import { saveCoverage } from './coverage-helper';

test('homepage has correct title', async ({ page }, testInfo) => {
  await page.goto('/');
  
  // Check that the page has the correct title
  await expect(page).toHaveTitle(/Passport SDK - Login with Passport Guardian/);
  
  // Check that the main heading is present - use a more specific selector
  await expect(page.getByRole('heading', { name: 'Passport SDK Examples', exact: true })).toBeVisible();
  
  // Check that the feature description is present
  await expect(page.getByText(/This example demonstrates/)).toBeVisible();
  
  // Check that the login link is present
  await expect(page.getByRole('link', { name: /Login with Passport Guardian/ })).toBeVisible();
  
  // Save coverage at the end of the test
  await saveCoverage(page, testInfo);
});

test('login page renders correctly', async ({ page }, testInfo) => {
  await page.goto('/login-with-passport-guardian');
  
  // Check that the login page has the correct heading - use a more specific selector
  await expect(page.getByRole('heading', { name: 'Login with Passport Guardian', exact: true })).toBeVisible();
  
  // Check that the placeholder button is present
  await expect(page.getByRole('button', { name: /Login with Guardian/ })).toBeVisible();
  
  // Save coverage at the end of the test
  await saveCoverage(page, testInfo);
});

test('logout page renders correctly', async ({ page }, testInfo) => {
  await page.goto('/logout');
  
  // Check that the logout page has the correct heading - use a more specific selector
  await expect(page.getByRole('heading', { name: 'Logged Out', exact: true })).toBeVisible();
  
  // Check that the return home button is present
  await expect(page.getByRole('button', { name: /Return Home/ })).toBeVisible();
  
  // Save coverage at the end of the test
  await saveCoverage(page, testInfo);
});

test('redirect page renders correctly', async ({ page }, testInfo) => {
  await page.goto('/redirect');
  
  // Just check that the page loads without errors
  await expect(page).toHaveURL('/redirect');
  
  // Save coverage at the end of the test
  await saveCoverage(page, testInfo);
}); 