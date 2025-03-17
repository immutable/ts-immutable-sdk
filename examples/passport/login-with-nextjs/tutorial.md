# Login with Next.js Example

This example demonstrates how to implement various authentication flows using Immutable Passport in a Next.js application. It showcases different login methods and logout strategies, providing developers with a comprehensive understanding of Passport integration.

## Features Overview

- Login with Passport using Web3 wallet
- Login with EtherJS integration
- Identity-only authentication
- Redirect mode logout flow
- Silent mode logout flow
- Real-time authentication state management
- Account address display

## SDK Integration Details

### Login with Passport

**File**: `src/app/login-with-passport/page.tsx`

**Feature**: Web3 Wallet Authentication

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
    }
  } catch (error) {
    console.error('Error connecting to Passport:', error);
    setIsLoggedIn(false);
  }
};
```

**Explanation**: This implementation demonstrates how to connect to a user's Web3 wallet using Passport. It requests account access and updates the UI state based on the authentication result.

### Passport Configuration

**File**: `src/app/utils/setupDefault.ts`

**Feature**: Passport Instance Configuration

**Implementation**:
```typescript
export const passportInstance = new passport.Passport({
    baseConfig: {
      environment: config.Environment.SANDBOX,
      publishableKey: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY,
    },
    clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
    redirectUri: 'http://localhost:3000/redirect',
    logoutRedirectUri: 'http://localhost:3000/logout',
    audience: 'platform_api',
    scope: 'openid offline_access email transact',
});
```

**Explanation**: This setup configures the Passport instance with necessary parameters including environment settings, API keys, redirect URIs, and required scopes.

## Running the App

### Prerequisites

1. Set up your project on [Immutable Hub](https://hub.immutable.com)
2. Obtain your Client ID and Publishable Key
3. Node.js 16 or higher
4. pnpm package manager

### Environment Setup

1. Clone the repository
2. Navigate to the example directory:
   ```bash
   cd examples/passport/login-with-nextjs
   ```
3. Copy `.env.example` to `.env` and fill in your credentials:
   ```
   NEXT_PUBLIC_CLIENT_ID=your_client_id
   NEXT_PUBLIC_PUBLISHABLE_KEY=your_publishable_key
   ```

### Installation

```bash
pnpm install
```

### Running the Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

## Summary

This example demonstrates various authentication patterns using Immutable Passport in a Next.js application. It showcases different login methods and logout strategies, providing a comprehensive reference for implementing Passport authentication in your own applications.

Key takeaways:
- Multiple authentication methods can be implemented using Passport
- Different logout strategies can be employed based on your needs
- Real-time state management is crucial for a good user experience
- Proper error handling ensures a robust authentication flow 