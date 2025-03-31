# Manual Testing Guide: Login with Passport PKCE

This document provides detailed steps for manually testing the PKCE authentication flow in the login-with-passport-pkce-with-nextjs example.

## Prerequisites

Before beginning testing, ensure you have:

1. Set up proper environment variables in `.env`:
   ```
   NEXT_PUBLIC_CLIENT_ID=your-client-id
   NEXT_PUBLIC_PUBLISHABLE_KEY=your-publishable-key
   ```

2. Registered the following redirect URLs in the Immutable Hub console:
   - `http://localhost:3000/redirect` (for login)
   - `http://localhost:3000/logout` (for logout)

3. Built and started the application:
   ```bash
   pnpm install
   pnpm build
   pnpm dev
   ```

## Test Scenarios

### 1. Basic Navigation Test

1. **Action**: Navigate to `http://localhost:3000`
2. **Expected**: The home page loads with the title "Immutable Passport SDK: Login with PKCE"
3. **Verification**:
   - Page title is displayed correctly
   - "Login with Passport PKCE" button is visible
   - PKCE information is displayed at the bottom

### 2. Login Page Navigation Test

1. **Action**: Click "Login with Passport PKCE" button on the home page
2. **Expected**: Navigation to the login page at `/login-with-passport-pkce`
3. **Verification**:
   - Page title is "Login with Passport PKCE Authentication"
   - PKCE description is displayed
   - "Login with Passport" button is visible
   - "Return to Home" link is displayed

### 3. PKCE Authentication Flow Test

1. **Action**: Click "Login with Passport" on the PKCE login page
2. **Expected**: Redirection to the Immutable Passport login page
3. **Action**: Complete the login process with your Immutable credentials
4. **Expected**: Redirection back to the redirect page at `/redirect`
5. **Verification** (temporary redirect page):
   - Page displays "Redirecting..." message
   - After a short delay, you should be redirected to the PKCE login page

6. **Verification** (after redirection to login page):
   - "Successfully logged in with PKCE flow" heading is displayed
   - User information table is visible with email, nickname, and sub fields
   - "Logout" button is displayed

### 4. Error Handling Test

1. **Action**: Manually navigate to `http://localhost:3000/redirect` without going through the login flow
2. **Expected**: Error handling for missing authorization code
3. **Verification**:
   - "Authentication Error" message is displayed
   - Error details indicate missing or invalid code
   - "Return to Home" link is visible

### 5. Logout Flow Test

1. **Prerequisite**: Must be logged in from Test 3
2. **Action**: Click the "Logout" button on the PKCE login page
3. **Expected**: Redirection to the logout page
4. **Verification**:
   - "You have been logged out" message is displayed
   - "Go to Home" button is visible
   - "Return to Home" link is visible

5. **Action**: Click "Go to Home" button
6. **Expected**: Redirection to the home page
7. **Verification**: 
   - Home page is displayed correctly
   - You are fully logged out (verify by navigating to the login page again)

### 6. Session Persistence Test

1. **Prerequisite**: Complete login flow from Test 3
2. **Action**: Refresh the page after successful login
3. **Expected**: Login session is maintained
4. **Verification**:
   - User information is still displayed after refresh
   - No new login is required

## Browser Console Verification

Throughout all tests, monitor the browser console (F12 > Console) for:

1. No unexpected errors or warnings
2. Proper flow of authentication events
3. Successful API responses

## PKCE-Specific Verification

Since PKCE is a security measure that happens behind the scenes, the following indicate proper PKCE implementation:

1. The URL during the OAuth redirect contains a `code_challenge` parameter
2. The authentication flow completes successfully
3. If you inspect network traffic, the token exchange request includes a `code_verifier` parameter

## Troubleshooting

If you encounter issues during testing:

1. **Authentication Errors**: Verify client ID and redirect URIs in your Hub console
2. **CORS Issues**: Check that redirect URIs are properly registered
3. **Token Exchange Failures**: Could indicate PKCE verification issues - check browser storage
4. **Redirection Loops**: Indicate issues with redirect handling 