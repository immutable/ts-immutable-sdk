import { test, expect } from '@playwright/test';

test('app home page has expected heading and buttons', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  
  // Check for title
  await expect(page.getByRole('heading', { name: 'Login with Passport PKCE' })).toBeVisible();
  
  // Check for login link button
  await expect(page.getByRole('link', { name: 'Login with Passport PKCE' })).toBeVisible();
  
  // Check for logout link button
  await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible();
});

test('login page has login button and table', async ({ page }) => {
  await page.goto('http://localhost:3000/login-with-passport-pkce');
  
  // Check for title
  await expect(page.getByRole('heading', { name: 'Login with Passport PKCE' })).toBeVisible();
  
  // Check for login button
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  
  // Check for table with expected headers
  await expect(page.getByRole('cell', { name: 'Attribute' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Value' })).toBeVisible();
  
  // Check for expected table rows
  await expect(page.getByRole('cell', { name: 'Is Logged In' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Account Address' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'User ID' })).toBeVisible();
}); 