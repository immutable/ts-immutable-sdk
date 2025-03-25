# Login with Next.js Tutorial

## Introduction

This example application demonstrates different ways to implement authentication with Immutable Passport in a Next.js application. The app showcases multiple authentication approaches:

1. Login with Passport (standard EVM connection)
2. Login with EtherJS (using Passport provider with EtherJS)
3. Login with Identity Only (without wallet connection)
4. Logout with Redirect Mode (redirects to a logout page)
5. Logout with Silent Mode (logs out without page redirection)

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
login-with-nextjs/
├── .env.example        # Example environment variables
├── package.json        # Project dependencies and scripts
├── src/
│   ├── app/
│   │   ├── globals.css                 # Global styles
│   │   ├── layout.tsx                  # Root layout component
│   │   ├── page.tsx                    # Home page with navigation
│   │   ├── login-with-passport/        # Standard Passport login
│   │   ├── login-with-etherjs/         # Login using EtherJS
│   │   ├── login-with-identity-only/   # Login without wallet
│   │   ├── logout-with-redirect-mode/  # Logout with redirect
│   │   ├── logout-with-silent-mode/    # Logout without redirect
│   │   ├── redirect/                   # OAuth redirect handler
│   │   ├── logout/                     # Logout redirect page
│   │   ├── silent-logout/              # Silent logout handler
│   │   └── utils/
│   │       ├── setupDefault.ts         # Default Passport setup
│   │       ├── setupLogoutRedirect.ts  # Redirect logout setup
│   │       ├── setupLogoutSilent.ts    # Silent logout setup
│   │       └── wrapper.tsx             # App wrapper component
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

### Feature 1: Login with Passport

The `src/app/login-with-passport/page.tsx` component demonstrates the standard way to login with Passport:

```typescript
const loginWithPassport = async () => {
  if (!passportInstance) return;
  try {
    const provider = await passportInstance.connectEvm();
    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    if (accounts) {
      setIsLoggedIn(true);
      setAccountAddress(accounts[0] || null);
    } else {
      setIsLoggedIn(false);
    }
  } catch (error) {
    console.error('Error connecting to Passport:', error);
    setIsLoggedIn(false);
  }
};
```

This approach:
1. Calls `connectEvm()` to get a provider
2. Requests accounts using the provider
3. Updates the UI state based on the login result

### Feature 2: Login with EtherJS

The `src/app/login-with-etherjs/page.tsx` component shows how to use Passport with EtherJS:

```typescript
const loginWithEthersjs = useCallback(async () => {
  if (!passportInstance) return;

  try {
    const passportProvider = await passportInstance.connectEvm();
    const web3Provider = new BrowserProvider(passportProvider);
    const accounts = await web3Provider.send('eth_requestAccounts', []);
    if (accounts && accounts.length > 0) {
      setIsLoggedIn(true);
      setAccountAddress(accounts[0] || null);
    } else {
      setIsLoggedIn(false);
    }
  } catch (error) {
    console.error('Error connecting to Passport with Ethers.js:', error);
    setIsLoggedIn(false);
  }
}, []);
```

This approach:
1. Gets the Passport provider
2. Wraps it with EtherJS's BrowserProvider
3. Uses EtherJS to request accounts
4. Updates the UI state based on the login result

### Feature 3: Login with Identity Only

The `src/app/login-with-identity-only/page.tsx` component demonstrates how to login without connecting a wallet:

```typescript
const loginWithIdentiy = useCallback(async () => {
  if (!passportInstance) return;
  try {
    const profile: passport.UserProfile | null = await passportInstance.login();
    if (profile) {
      console.log(profile.email);
      console.log(profile.sub);
      setIsLoggedIn(true);
      setEmail(profile.email || 'No Email');
      setSub(profile.sub || 'No Subject');
    } else {
      setIsLoggedIn(false);
    }
  } catch (error) {
    console.error('Error connecting to Passport', error);
    setIsLoggedIn(false);
  }
}, []);
```

This approach:
1. Calls `login()` instead of `connectEvm()`
2. Receives a UserProfile object with user information
3. Updates the UI with the user's email and subject identifier

### Feature 4: Logout with Redirect Mode

The `src/app/logout-with-redirect-mode/page.tsx` component shows how to implement logout with redirection:

```typescript
// In setupLogoutRedirect.ts
export const passportInstance = new passport.Passport({
  // ... other config
  logoutMode: 'redirect',
  logoutRedirectUri: 'http://localhost:3000/logout',
  // ... other config
});

// In the component
const logout = async () => {
  if (!passportInstance || !isLoggedIn) return;
  try {
    await passportInstance.logout();
    setIsLoggedIn(false);
    setAccountAddress(null);
  } catch (error) {
    console.error('Error disconnecting:', error);
  }
};
```

This approach:
1. Configures Passport with `logoutMode: 'redirect'`
2. Specifies a `logoutRedirectUri` where the user will be redirected after logout
3. Calls `logout()` to initiate the logout process
4. Updates the UI state

### Feature 5: Logout with Silent Mode

The `src/app/logout-with-silent-mode/page.tsx` component demonstrates how to implement silent logout:

```typescript
// In setupLogoutSilent.ts
export const passportInstance = new passport.Passport({
  // ... other config
  logoutMode: 'silent',
  logoutRedirectUri: 'http://localhost:3000/silent-logout',
  // ... other config
});

// In the component
const logout = async () => {
  if (!passportInstance || !isLoggedIn) return;
  setIsLoggingOut(true);
  try {
    await passportInstance.logout();
    setIsLoggedIn(false);
    setAccountAddress(null);
  } catch (error) {
    console.error('Error disconnecting:', error);
  } finally {
    setIsLoggingOut(false);
  }
};
```

This approach:
1. Configures Passport with `logoutMode: 'silent'`
2. Specifies a `logoutRedirectUri` for the silent logout process
3. Calls `logout()` to initiate the logout process
4. Updates the UI state without redirecting the user

The silent logout process is handled in `src/app/silent-logout/page.tsx`:

```typescript
export default function SilentLogout() {
  useEffect(() => {
    (async () => {
      try {
        await passportInstance.logoutSilentCallback(SILENT_LOGOUT_INITIATOR_URL);
      } catch (error) {
        console.error('Silent logout error:', error);
      }
    })();
  }, []);

  return (
    <div>
      <p>Logging out...</p>
    </div>
  );
}
```

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

This example application demonstrates multiple ways to implement authentication with Immutable Passport in a Next.js application. The key features include:

1. Standard login with Passport's EVM connection
2. Integration with EtherJS for more advanced blockchain interactions
3. Identity-only login without wallet connection
4. Two logout modes: redirect and silent
5. Proper handling of OAuth redirects and callbacks

By following this tutorial, you can implement similar authentication flows in your own Next.js applications using Immutable Passport, choosing the approach that best fits your application's needs. 