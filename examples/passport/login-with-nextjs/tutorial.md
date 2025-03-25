<div class="display-none">

# Login with NextJS

</div>

This example demonstrates various login and logout implementations using Immutable Passport with Next.js. The app showcases different authentication methods and logout strategies including standard login, login with ethers.js, identity-only login, and different logout modes.

<div class="button-component">

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/login-with-nextjs) <span class="button-component-arrow">→</span>

</div>

## Features Overview

- Login with Passport (EVM wallet connection)
- Login with ethers.js integration
- Login with identity only (without wallet)
- Standard logout functionality
- Logout with redirect mode
- Logout with silent mode

## SDK Integration Details

### Login with Passport
**Feature Name**: Standard login with Passport connecting an EVM wallet
**Source Code**: [Source code file](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/login-with-nextjs/src/app/login-with-passport/page.tsx)
**Implementation**:
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
**Explanation**: This implementation creates a connection to the user's EVM wallet through Passport. The `connectEvm()` method returns a provider that follows the EIP-1193 interface, which can then be used to request account access with `eth_requestAccounts`. Once connected, the user's wallet address is stored in the application state.

### Login with ethers.js
**Feature Name**: Login integration with ethers.js library
**Source Code**: [Source code file](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/login-with-nextjs/src/app/login-with-etherjs/page.tsx)
**Implementation**:
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
**Explanation**: This implementation demonstrates how to integrate Passport with ethers.js. It gets the Passport provider and wraps it in an ethers.js BrowserProvider, allowing developers to leverage ethers.js functionality with Passport authentication.

### Login with Identity Only
**Feature Name**: Login with Passport identity without connecting a wallet
**Source Code**: [Source code file](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/login-with-nextjs/src/app/login-with-identity-only/page.tsx)
**Implementation**:
```typescript
const loginWithIdentiy = async () => {
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
};
```
**Explanation**: This approach allows users to authenticate with Passport without connecting a wallet. The `login()` method returns a UserProfile object containing user information like email and subject identifier (sub), enabling user identification without requiring wallet interaction.

### Logout
**Feature Name**: Standard logout functionality
**Source Code**: [Source code file](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/login-with-nextjs/src/app/logout-with-redirect-mode/page.tsx)
**Implementation**:
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
**Explanation**: The standard logout implementation disconnects the user from Passport using the `logout()` method. This ends the user's session and clears any authentication state.

### Logout with Redirect Mode
**Feature Name**: Logout with redirect to a specific page
**Source Code**: [Source code file](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/login-with-nextjs/src/app/utils/setupLogoutRedirect.ts)
**Implementation**:
```typescript
export const passportInstance = new passport.Passport({
    baseConfig: {
      environment: config.Environment.SANDBOX,
      publishableKey:
        process.env.NEXT_PUBLIC_PUBLISHABLE_KEY || '<YOUR_PUBLISHABLE_KEY>',
    },
    clientId: process.env.NEXT_PUBLIC_CLIENT_ID || '<YOUR_CLIENT_ID>',
    redirectUri: 'http://localhost:3000/redirect',
    logoutMode: 'redirect', 
    logoutRedirectUri: 'http://localhost:3000/logout',
    audience: 'platform_api',
    scope: 'openid offline_access email transact',
  });
```
**Explanation**: This configuration sets up Passport to use 'redirect' mode for logout. When `logout()` is called, the user will be redirected to the specified `logoutRedirectUri` after being logged out.

### Logout with Silent Mode
**Feature Name**: Logout without page redirection
**Source Code**: [Source code file](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/login-with-nextjs/src/app/utils/setupLogoutSilent.ts)
**Implementation**:
```typescript
export const passportInstance = new passport.Passport({
    baseConfig: {
      environment: config.Environment.SANDBOX,
      publishableKey:
        process.env.NEXT_PUBLIC_PUBLISHABLE_KEY || '<YOUR_PUBLISHABLE_KEY>',
    },
    clientId: process.env.NEXT_PUBLIC_CLIENT_ID || '<YOUR_CLIENT_ID>',
    redirectUri: 'http://localhost:3000/redirect',
    logoutMode: 'silent',
    logoutRedirectUri: 'http://localhost:3000/silent-logout',
    audience: 'platform_api',
    scope: 'openid offline_access email transact',
  });
```
**Explanation**: This configuration sets up Passport to use 'silent' mode for logout. When `logout()` is called, the user remains on the current page while the logout process happens in the background, providing a smoother user experience.

## Running the App

### Prerequisites
1. Node.js installed on your machine
2. [Immutable Hub account](https://hub.immutable.com/) for environment setup
3. A registered application in Immutable Hub with client ID and publishable key

### Setup and Run
1. Clone the repository
2. Navigate to the example directory:
   ```bash
   cd examples/passport/login-with-nextjs
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Create a `.env.local` file in the root directory with your credentials:
   ```
   NEXT_PUBLIC_CLIENT_ID=<YOUR_CLIENT_ID>
   NEXT_PUBLIC_PUBLISHABLE_KEY=<YOUR_PUBLISHABLE_KEY>
   ```
5. Start the development server:
   ```bash
   pnpm dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Summary

This example demonstrates various ways to implement authentication with Immutable Passport in a Next.js application. It showcases:
- Different login methods: standard Passport login, ethers.js integration, and identity-only login
- Multiple logout strategies: standard logout, redirect mode, and silent mode
- How to set up Passport SDK with different configurations

By exploring these examples, developers can choose the authentication approach that best suits their application's needs while maintaining a smooth user experience. 