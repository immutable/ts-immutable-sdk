<div class="display-none">

# Login with Next.js

</div>

This example demonstrates various login and logout implementations using the Immutable Passport SDK in a Next.js application. It showcases different authentication methods including login with EthersJS, identity-only login, and various logout strategies, along with authentication event handling.

<div class="button-component">

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/login-with-nextjs) <span class="button-component-arrow">→</span>

</div>

## Features Overview
- Login with EthersJS integration
- Identity-only login (without wallet connection)
- Standard logout functionality
- Logout with redirect mode
- Silent logout implementation
- Authentication event handling

## SDK Integration Details

### Login with EthersJS
**Feature Name**: Login with EthersJS allows users to connect their wallet and authenticate using EthersJS provider.

**Source Code**: [login-with-etherjs/page.tsx](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/login-with-nextjs/src/app/login-with-etherjs/page.tsx)

**Implementation**:
```typescript
const passportProvider = await passportInstance.connectEvm();
const web3Provider = new BrowserProvider(passportProvider);
const accounts = await web3Provider.send('eth_requestAccounts', []);
```

**Explanation**: This implementation uses EthersJS's BrowserProvider to interact with the Passport provider. It requests user accounts and manages the connection state, displaying the connected account address when successful.

### Identity-only Login
**Feature Name**: Login without wallet connection, focusing on user identity authentication.

**Source Code**: [login-with-identity-only/page.tsx](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/login-with-nextjs/src/app/login-with-identity-only/page.tsx)

**Implementation**:
```typescript
const profile: passport.UserProfile | null = await passportInstance.login();
```

**Explanation**: This implementation demonstrates how to authenticate users without requiring a wallet connection. It retrieves the user's profile information including email and subject ID.

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


### Silent Logout
**Feature Name**: Logout implementation that silently signs out the user without redirects.

**Source Code**: [logout-with-silent-mode/page.tsx](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/login-with-nextjs/src/app/logout-with-silent-mode/page.tsx)

**Implementation**:
```typescript
await passportInstance.logout();
```

**Explanation**: This implementation shows how to implement a silent logout that disconnects the user without redirecting to another page, providing a seamless user experience.

### Authentication Event Handling
**Feature Name**: Handling authentication-related events such as account changes.

**Source Code**: [auth-event-handling/page.tsx](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/login-with-nextjs/src/app/auth-event-handling/page.tsx)

**Implementation**:
```typescript
provider.on(ProviderEvent.ACCOUNTS_CHANGED, handleAccountsChanged);

const handleAccountsChanged = (accounts: string[]) => {
  setAccountsState(accounts);
  if (accounts.length === 0) {
    setIsLoggedIn(false);
    setAddress('');
    setChainId('');
  } else {
    setAddress(accounts[0]);
  }
};
```

**Explanation**: This implementation shows how to listen for and handle authentication events, specifically the `ACCOUNTS_CHANGED` event. It updates the application state when accounts are changed or disconnected, maintaining synchronization between the wallet state and the application.

## Running the App

### Prerequisites
- Node.js 16 or higher
- pnpm package manager
- [Immutable Developer Hub](https://hub.immutable.com/) account for environment setup

### Local Setup Steps
1. Clone the repository:
```bash
git clone https://github.com/immutable/ts-immutable-sdk.git
```

2. Navigate to the example directory:
```bash
cd examples/passport/login-with-nextjs
```

3. Install dependencies:
```bash
pnpm install
```

4. Copy the `.env.example` file to `.env` and update with your Passport client credentials from the [Immutable Developer Hub](https://hub.immutable.com/).

5. Start the development server:
```bash
pnpm dev
```

6. Open your browser and navigate to `http://localhost:3000`

## Summary
This example demonstrates various authentication patterns using the Immutable Passport SDK in a Next.js application. It showcases different login methods including EthersJS integration and identity-only authentication, various logout strategies (redirect and silent modes), and proper handling of authentication events. Developers can use this example as a reference for implementing comprehensive Passport authentication in their own Next.js applications. 