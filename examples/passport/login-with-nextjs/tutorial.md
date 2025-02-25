# Passport Login with Next.js

This tutorial demonstrates various ways to implement login and logout flows with Immutable Passport in a Next.js application.

## Introduction

The Passport Login with Next.js example app showcases different authentication approaches using Immutable Passport. The app demonstrates multiple implementation patterns for integrating Passport authentication in a Next.js application, including:

- Standard Passport login flow
- Integration with EtherJS for Web3 functionality
- Identity-only login approach
- Two different logout modes: redirect and silent

This example serves as a reference implementation for developers looking to integrate Immutable Passport authentication into their Next.js applications.

## Prerequisites

To run this example, you'll need:

- Node.js (v18 or later)
- npm, yarn, or pnpm for package management
- An Immutable Developer Hub account
- A registered application with Client ID and Publishable Key from the Immutable Developer Hub
- Basic familiarity with Next.js and React

## Project Structure

```
login-with-nextjs/
├── src/
│   ├── app/
│   │   ├── login-with-passport/      # Standard Passport login implementation
│   │   ├── login-with-etherjs/       # EtherJS integration example
│   │   ├── login-with-identity-only/ # Identity-only login approach
│   │   ├── logout-with-redirect-mode/# Redirect mode logout implementation
│   │   ├── logout-with-silent-mode/  # Silent mode logout implementation
│   │   ├── redirect/                 # Redirect handler for authentication flow
│   │   ├── logout/                   # Logout redirect handler
│   │   ├── utils/                    # Setup utilities and configurations
│   │   │   ├── setupDefault.ts       # Default Passport configuration
│   │   │   ├── setupLogoutRedirect.ts# Redirect mode configuration
│   │   │   ├── setupLogoutSilent.ts  # Silent mode configuration
│   │   │   └── wrapper.tsx           # App wrapper component
│   │   ├── page.tsx                  # Main navigation page
│   │   └── layout.tsx                # App layout with providers
├── .env.example                      # Example environment variables
├── package.json                      # Project dependencies
└── tsconfig.json                     # TypeScript configuration
```

## Code Walkthrough

### SDK Integration Walkthrough

#### Initializing the Passport SDK

The Immutable Passport SDK is initialized in the utility files located in the `src/app/utils/` directory. The default configuration is set up in `setupDefault.ts`:

```typescript
import { config, passport } from '@imtbl/sdk';

export const passportInstance = new passport.Passport({
    baseConfig: {
      environment: config.Environment.SANDBOX, // or config.Environment.PRODUCTION
      publishableKey:
        process.env.NEXT_PUBLIC_PUBLISHABLE_KEY || '<YOUR_PUBLISHABLE_KEY>', // replace with your publishable API key from Hub
    },
    clientId: process.env.NEXT_PUBLIC_CLIENT_ID || '<YOUR_CLIENT_ID>', // replace with your client ID from Hub
    redirectUri: 'http://localhost:3000/redirect', // replace with one of your redirect URIs from Hub
    logoutRedirectUri: 'http://localhost:3000/logout', // replace with one of your logout URIs from Hub
    audience: 'platform_api',
    scope: 'openid offline_access email transact',
});
```

Key configuration parameters include:
- **environment**: Set to SANDBOX for testing or PRODUCTION for live applications
- **publishableKey**: Your API key from the Immutable Developer Hub
- **clientId**: Your client ID from the Immutable Developer Hub
- **redirectUri**: The URI where users will be redirected after authentication
- **logoutRedirectUri**: The URI where users will be redirected after logout
- **audience**: The API audience for authentication tokens
- **scope**: The permission scopes requested for the user

#### Standard Login with Passport

The standard Passport login implementation is found in `src/app/login-with-passport/page.tsx`. This approach directly uses the Passport instance to connect to an EVM provider:

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

This implementation:
1. Requests an EVM provider connection from the Passport instance
2. Uses the provider to request user accounts
3. Updates the application state with login status and account address

#### Integration with EtherJS

For applications requiring EtherJS functionality, the example in `src/app/login-with-etherjs/page.tsx` demonstrates how to integrate EtherJS with Passport:

```typescript
const loginWithEthersjs = async () => {
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
};
```

This approach:
1. Obtains an EVM provider from Passport
2. Wraps it with EtherJS's BrowserProvider for Web3 functionality
3. Uses the EtherJS provider to request accounts

#### Identity-Only Login

The Identity-only login approach provides a simplified authentication method for applications that only require user identity verification without wallet functionality. This implementation is found in the `src/app/login-with-identity-only/` directory and demonstrates how to authenticate users without requiring wallet access.

#### Logout Implementations

The example demonstrates two different logout modes:

##### Redirect Mode Logout

Found in `src/app/logout-with-redirect-mode/page.tsx`, this implementation redirects users to the specified logout URI after logging out:

```typescript
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

The redirect mode is configured in `setupLogoutRedirect.ts` with the `logoutMode: 'redirect'` option:

```typescript
export const passportInstance = new passport.Passport({
  // ...other config options
  logoutMode: 'redirect',
  logoutRedirectUri: 'http://localhost:3000/logout',
  // ...other config options
});
```

This mode ensures that users are properly redirected to a specific page after logout, which can be useful for applications that need to display post-logout information or instructions.

##### Silent Mode Logout

The silent mode logout implementation, found in `src/app/logout-with-silent-mode/page.tsx`, provides a logout experience without redirecting the user away from the application. This is configured in `setupLogoutSilent.ts`:

```typescript
export const passportInstance = new passport.Passport({
  // ...other config options
  logoutMode: 'silent',
  // ...other config options
});
```

Silent mode maintains a better user experience by keeping users within the application context, making it ideal for single-page applications where maintaining the user's flow is important.

### Environment Configuration

The application uses environment variables for configuration. Required variables are defined in `.env.example`:

```
NEXT_PUBLIC_CLIENT_ID="your-client-id"
NEXT_PUBLIC_PUBLISHABLE_KEY="your-publishable-key"
```

To run the application, you need to:
1. Copy `.env.example` to `.env.local`
2. Replace placeholder values with your actual Client ID and Publishable Key from the Immutable Developer Hub

## Running the App

Follow these steps to run the example locally:

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```
3. Create a `.env.local` file with your credentials:
   ```
   NEXT_PUBLIC_CLIENT_ID="your-client-id"
   NEXT_PUBLIC_PUBLISHABLE_KEY="your-publishable-key"
   ```
4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser
6. Navigate through the different examples using the buttons on the home page

## Summary

This example application demonstrates multiple approaches to integrating Immutable Passport authentication in a Next.js application:

- **Standard Passport Login**: Direct integration with Passport for basic authentication
- **EtherJS Integration**: Enhanced Web3 functionality using EtherJS with Passport
- **Identity-only Login**: Simplified authentication for applications that don't require wallet functionality
- **Multiple Logout Strategies**: Both redirect and silent modes for different user experience requirements

The example is structured to provide clear implementation patterns that developers can adapt for their own applications. By exploring these different approaches, you can select the authentication flow that best suits your application's needs, considering factors like user experience, security requirements, and integration complexity.

The modular organization of the codebase makes it easy to understand and extract specific components for use in your own projects, serving as both a reference implementation and a learning resource for Immutable Passport integration. 