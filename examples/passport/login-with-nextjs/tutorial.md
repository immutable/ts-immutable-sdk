# Passport Login with Next.js

## Introduction

This example application demonstrates how to implement different authentication flows using Immutable's Passport SDK in a Next.js application. The app showcases various login methods and logout strategies, providing a comprehensive overview of Passport's authentication capabilities.

You can find the source code for this example on [GitHub](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/login-with-nextjs).

## SDK Integration Walkthrough

This example app covers the following features:

* Login with Passport (wallet connection)
* Login with EthersJS (third-party provider integration)
* Login with Identity only (without wallet connection)
* Logout with Redirect Mode
* Logout with Silent Mode

### Login with Passport

The Passport SDK provides a simple way to authenticate users with their crypto wallet. This feature establishes a connection to the user's wallet through Passport.

**[View on GitHub](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/login-with-nextjs/src/app/login-with-passport)**

This implementation:
- Connects to a user's wallet using Passport
- Requests account access
- Displays the connected wallet address

```tsx
// Import the Passport instance
import { passportInstance } from '../utils/setupDefault';

// In your component
const loginWithPassport = async () => {
  if (!passportInstance) return;
  try {
    // Connect to the EVM provider through Passport
    const provider = await passportInstance.connectEvm();
    
    // Request access to the user's accounts
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

The code above initiates a connection to the user's wallet using Passport's `connectEvm()` method, which returns a provider compatible with the EIP-1193 standard. Then, it requests access to the user's accounts using the `eth_requestAccounts` method, which prompts the user to approve the connection.

### Login with EthersJS

This feature demonstrates how to integrate the Passport SDK with the EthersJS library, allowing you to use EthersJS functions with Passport authentication.

**[View on GitHub](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/login-with-nextjs/src/app/login-with-etherjs)**

This implementation:
- Connects to Passport
- Creates an EthersJS provider using the Passport connection
- Uses EthersJS to request accounts

```tsx
import { ethers } from 'ethers';
import { BrowserProvider } from 'ethers';
import { passportInstance } from '../utils/setupDefault';

const loginWithEthersjs = async () => {
  if (!passportInstance) return;

  try {
    // Get the Passport provider
    const passportProvider = await passportInstance.connectEvm();
    
    // Create an EthersJS provider using the Passport provider
    const web3Provider = new BrowserProvider(passportProvider);
    
    // Request accounts using EthersJS
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
};
```

This approach is useful when you need to use EthersJS features like sending transactions or interacting with smart contracts while maintaining Passport authentication.

### Login with Identity Only

This feature demonstrates how to authenticate users with Passport without requiring a wallet connection, focusing solely on user identity.

**[View on GitHub](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/login-with-nextjs/src/app/login-with-identity-only)**

This implementation:
- Authenticates users without requiring a wallet
- Retrieves user profile information (email, subject ID)

```tsx
import { passportInstance } from '../utils/setupDefault';
import { passport } from '@imtbl/sdk';

const loginWithIdentity = async () => {
  if (!passportInstance) return;
  try {
    // Login with Passport without connecting a wallet
    const profile: passport.UserProfile | null = await passportInstance.login();
    
    if (profile) {
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
};
```

This method is ideal for applications that need to identify users but don't require wallet interactions or blockchain transactions.

### Logout with Redirect Mode

This feature demonstrates how to implement logout functionality with the redirect mode, which redirects users to a specified URI after logout.

**[View on GitHub](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/login-with-nextjs/src/app/logout-with-redirect-mode)**

This implementation:
- Configures Passport to use redirect mode for logout
- Logs out the user and redirects to a specified URI

```tsx
// In setupLogoutRedirect.ts
import { config, passport } from '@imtbl/sdk';

export const passportInstance = new passport.Passport({
  baseConfig: {
    environment: config.Environment.SANDBOX,
    publishableKey: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY || '<YOUR_PUBLISHABLE_KEY>',
  },
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID || '<YOUR_CLIENT_ID>',
  redirectUri: 'http://localhost:3000/redirect',
  logoutMode: 'redirect', // Specify redirect mode for logout
  logoutRedirectUri: 'http://localhost:3000/logout', // URI to redirect to after logout
  audience: 'platform_api',
  scope: 'openid offline_access email transact',
});

// In your component
const logout = async () => {
  if (!passportInstance || !isLoggedIn) return;
  try {
    // Logout will redirect to the specified logoutRedirectUri
    await passportInstance.logout();
    
    setIsLoggedIn(false);
    setAccountAddress(null);
  } catch (error) {
    console.error('Error disconnecting:', error);
  }
};
```

With redirect mode, users are redirected to the specified `logoutRedirectUri` after logout, which is useful for applications that need to maintain a specific flow or redirect users to a login page after logout.

### Logout with Silent Mode

This feature demonstrates how to implement logout functionality with the silent mode, which logs out the user without redirecting.

**[View on GitHub](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/login-with-nextjs/src/app/logout-with-silent-mode)**

This implementation:
- Configures Passport to use silent mode for logout
- Logs out the user without redirecting

```tsx
// In setupLogoutSilent.ts
import { config, passport } from '@imtbl/sdk';

export const passportInstance = new passport.Passport({
  baseConfig: {
    environment: config.Environment.SANDBOX,
    publishableKey: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY || '<YOUR_PUBLISHABLE_KEY>',
  },
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID || '<YOUR_CLIENT_ID>',
  redirectUri: 'http://localhost:3000/redirect',
  logoutMode: 'silent', // Specify silent mode for logout
  logoutRedirectUri: 'http://localhost:3000/silent-logout',
  audience: 'platform_api',
  scope: 'openid offline_access email transact',
});

// In your component
const logout = async () => {
  if (!passportInstance || !isLoggedIn) return;
  setIsLoggingOut(true);
  try {
    // Logout will not redirect; it happens silently
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

Silent mode is useful for applications that want to handle the logout flow within the application without redirecting the user away from the current view.

## Running the App

Follow these steps to run the example application locally:

### Prerequisites

1. You need to have Node.js and pnpm installed on your machine.
2. You need to set up your environment with Immutable Hub. Visit [Immutable Hub](https://hub.immutable.com/) to create an account and set up your application.

### Setup

1. Clone the repository from [GitHub](https://github.com/immutable/ts-immutable-sdk).
2. Navigate to the example directory:
   ```bash
   cd examples/passport/login-with-nextjs
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Copy the `.env.example` file to `.env` and fill in the required environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Required environment variables:
   - `NEXT_PUBLIC_PUBLISHABLE_KEY`: Your publishable API key from Immutable Hub
   - `NEXT_PUBLIC_CLIENT_ID`: Your client ID from Immutable Hub

5. Start the development server:
   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Summary

This example demonstrates multiple ways to implement authentication using the Immutable Passport SDK in a Next.js application:

- **Wallet-based authentication** using `connectEvm()` for direct Passport integration
- **EthersJS integration** for using Passport with the popular Ethereum library
- **Identity-only login** for applications that don't require wallet access
- **Two logout modes** (redirect and silent) for different user flow needs

By combining these features, developers can implement comprehensive authentication flows that match their application requirements while leveraging the security and convenience of Immutable's Passport SDK. 