# Logged-in User with Next.js Tutorial

## Introduction

This example application demonstrates how to access user information after a successful login with Immutable Passport in a Next.js application. The app showcases three key features:

1. Retrieving user profile information
2. Getting linked addresses
3. Accessing and verifying tokens (ID token and access token)

This tutorial will walk you through the implementation details and show you how to integrate Immutable Passport authentication into your Next.js applications.

## Prerequisites

Before you begin, make sure you have the following:

- Node.js (v18 or later)
- pnpm package manager
- An Immutable Hub account with:
  - A registered application
  - A publishable API key
  - A client ID
  - Configured redirect URIs

## Project Structure

The project follows a standard Next.js application structure:

```
logged-in-user-with-nextjs/
├── .env.example        # Example environment variables
├── package.json        # Project dependencies and scripts
├── src/
│   ├── app/
│   │   ├── globals.css                     # Global styles
│   │   ├── layout.tsx                      # Root layout component
│   │   ├── page.tsx                        # Home page with navigation
│   │   ├── linked-addresses-with-passport/ # Linked addresses feature
│   │   ├── user-info-with-passport/        # User info feature
│   │   ├── verify-tokens-with-nextjs/      # Token verification feature
│   │   ├── redirect/                       # OAuth redirect handler
│   │   └── utils/
│   │       ├── setupDefault.ts             # Passport SDK initialization
│   │       └── wrapper.tsx                 # App wrapper component
```

## Code Walkthrough

### SDK Integration Walkthrough

#### Initializing the Passport SDK

The Passport SDK is initialized in the `src/app/utils/setupDefault.ts` file:

```typescript
import { config, passport } from '@imtbl/sdk';

export const passportInstance = new passport.Passport({
  baseConfig: {
    environment: config.Environment.SANDBOX,
    publishableKey: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY || '<YOUR_PUBLISHABLE_KEY>',
  },
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID || '<YOUR_CLIENT_ID>',
  redirectUri: 'http://localhost:3000/redirect',
  logoutRedirectUri: 'http://localhost:3000/logout',
  audience: 'platform_api',
  scope: 'openid offline_access email transact',
});
```

This code creates a new instance of the Passport SDK with the following configuration:
- Environment: SANDBOX (for testing) or PRODUCTION (for live applications)
- Publishable Key: Your API key from Immutable Hub
- Client ID: Your application's client ID from Immutable Hub
- Redirect URI: The URL where users will be redirected after login
- Logout Redirect URI: The URL where users will be redirected after logout
- Audience: The API audience (platform_api)
- Scope: The requested permissions (openid, offline_access, email, transact)

#### Handling OAuth Redirects

After a user logs in with Passport, they are redirected to the specified redirect URI. The `src/app/redirect/page.tsx` component handles this redirect:

```typescript
'use client';

import { useEffect } from 'react';
import { passportInstance } from '../utils/setupDefault';

export default function Redirect() {
  useEffect(() => {
    if (passportInstance) {
      passportInstance.loginCallback()
        .then(() => {
          console.log('Login callback successful');
          if (window.opener) {
            window.opener.postMessage('authComplete', window.origin);
            window.close();
          }
        })
        .catch((error) => {
          console.error('Error in login callback:', error);
        });
    }
  }, []); 
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Logged in</h1>
    </div>
  );
}
```

The `loginCallback()` method processes the authentication response and stores the necessary tokens. If the login is successful, it sends a message to the opener window and closes the popup.

### Feature 1: User Information

The `src/app/user-info-with-passport/page.tsx` component demonstrates how to retrieve user profile information:

```typescript
// Login with Passport
const loginWithPassport = async () => {
  if (!passportInstance) return;
  try {
    const provider = await passportInstance.connectEvm();
    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    
    // Get user information
    const userProfileData = await passportInstance.getUserInfo();
    
    if (accounts) {
      setIsLoggedIn(true);
      setAccountAddress(accounts[0] || null);
      setUserProfile(userProfileData || null);
    } else {
      setIsLoggedIn(false);
    }
  } catch (error) {
    console.error('Error connecting to Passport:', error);
    setIsLoggedIn(false);
  }
};
```

The `getUserInfo()` method returns the user's profile information, including:
- Email (if available)
- Nickname (if available)
- Sub (subject identifier)

### Feature 2: Linked Addresses

The `src/app/linked-addresses-with-passport/page.tsx` component shows how to retrieve a user's linked addresses:

```typescript
// Login with Passport
const loginWithPassport = async () => {
  if (!passportInstance) return;
  try {
    const provider = await passportInstance.connectEvm();
    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    if (accounts) {
      setIsLoggedIn(true);
      setAccountAddress(accounts[0] || null);
      
      // Get linked addresses
      const addresses = await passportInstance.getLinkedAddresses();
      
      setLinkedAddresses(addresses || []);
    } else {
      setIsLoggedIn(false);
    }
  } catch (error) {
    console.error('Error connecting to Passport:', error);
    setIsLoggedIn(false);
  }
};
```

The `getLinkedAddresses()` method returns an array of blockchain addresses that are linked to the user's Passport account.

### Feature 3: Token Verification

The `src/app/verify-tokens-with-nextjs/page.tsx` component demonstrates how to retrieve and display authentication tokens:

```typescript
// Login with Passport
const loginWithPassport = async () => {
  if (!passportInstance) return;
  try {
    const provider = await passportInstance.connectEvm();
    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    
    // Get ID token
    const idToken = await passportInstance.getIdToken();
    
    // Get access token
    const accessToken = await passportInstance.getAccessToken();
    
    if (accounts) {
      setIsLoggedIn(true);
      setAccountAddress(accounts[0] || null);
      setIdToken(idToken || null);
      setAccessToken(accessToken || null);
    } else {
      setIsLoggedIn(false);
    }
  } catch (error) {
    console.error('Error connecting to Passport:', error);
    setIsLoggedIn(false);
  }
};
```

The application retrieves two types of tokens:
- ID Token: Contains user identity information
- Access Token: Used to access protected resources

## Running the App

To run the example app locally:

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Copy `.env.example` to `.env` and fill in your Immutable Hub credentials:
   ```
   NEXT_PUBLIC_PUBLISHABLE_KEY=your_publishable_key
   NEXT_PUBLIC_CLIENT_ID=your_client_id
   ```
4. Start the development server:
   ```bash
   pnpm dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Summary

This example application demonstrates how to integrate Immutable Passport authentication into a Next.js application and access user information after login. The key features include:

1. Initializing the Passport SDK with your application credentials
2. Handling OAuth redirects after login
3. Retrieving user profile information
4. Getting linked blockchain addresses
5. Accessing and verifying authentication tokens

By following this tutorial, you can implement similar authentication flows in your own Next.js applications using Immutable Passport. 