<div class="display-none">

# Login with Next.js

</div>

This example app demonstrates different methods to implement user authentication using Immutable Passport in a Next.js application. It showcases three different login approaches: standard Passport login, login with EtherJS integration, and identity-only login without wallet connection.

<div class="button-component">

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/login-with-nextjs) <span class="button-component-arrow">→</span>

</div>

## Features Overview

- **Login with Passport**: Basic wallet connection using Passport's `connectEvm` method.
- **Login with EtherJS**: Integration with EtherJS library for wallet connection.
- **Login with Identity Only**: Authentication without wallet connection, retrieving only user profile information.

## SDK Integration Details

### Login with Passport

**Feature Name**: Standard Passport wallet connection for authentication.

**Source Code**: [Source code file](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/login-with-nextjs/src/app/login-with-passport/page.tsx)

**Implementation**:

```typescript
const loginWithPassport = async () => {
  if (!passportInstance) return;
  try {
    // Connect to user's wallet
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

**Explanation**: This implementation uses Passport's `connectEvm` method to establish a connection to the user's wallet. It then requests access to the user's accounts using the `eth_requestAccounts` method on the provider. If successful, it stores the connected account address and updates the login state.

### Login with EtherJS

**Feature Name**: Integration with EtherJS for enhanced wallet interaction.

**Source Code**: [Source code file](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/login-with-nextjs/src/app/login-with-etherjs/page.tsx)

**Implementation**:

```typescript
const loginWithEthersjs = async () => {
  if (!passportInstance) return;
  try {
    // Get the Passport provider
    const passportProvider = await passportInstance.connectEvm();
    // Wrap with EtherJS provider
    const web3Provider = new BrowserProvider(passportProvider);
    // Request accounts
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

**Explanation**: This approach demonstrates how to integrate EtherJS with Passport. It first obtains the Passport provider via `connectEvm()`, then wraps it with EtherJS's `BrowserProvider` to enable using EtherJS functionality with Passport's authentication. This allows developers to leverage EtherJS methods while maintaining Passport's authentication flow.

### Login with Identity Only

**Feature Name**: Authentication without wallet connection, focusing on user identity.

**Source Code**: [Source code file](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/login-with-nextjs/src/app/login-with-identity-only/page.tsx)

**Implementation**:

```typescript
const loginWithIdentiy = async () => {
  if (!passportInstance) return;
  try {
    // Login without connecting wallet
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

**Explanation**: This method demonstrates how to authenticate users without requiring a wallet connection. It uses Passport's `login()` method which returns a user profile with identity information like email and subject ID (sub). This approach is useful for applications that need user authentication but don't require wallet functionality immediately.

## Running the App

### Prerequisites

1. Node.js (v16 or higher)
2. pnpm package manager
3. Immutable Hub account for API keys - [Set up on Immutable Hub](https://hub.immutable.com/)

### Setup and Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/immutable/ts-immutable-sdk.git
   cd ts-immutable-sdk/examples/passport/login-with-nextjs
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create a `.env.local` file based on `.env.example` and add your Immutable Passport credentials:
   ```
   NEXT_PUBLIC_CLIENT_ID=<YOUR_CLIENT_ID>
   NEXT_PUBLIC_PUBLISHABLE_KEY=<YOUR_PUBLISHABLE_KEY>
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Summary

This example demonstrates three different approaches to implementing authentication with Immutable Passport in a Next.js application:

1. Standard Passport login that connects to the user's wallet
2. Integration with EtherJS for enhanced wallet interaction
3. Identity-only login that retrieves user profile information without wallet connection

Each approach has its own use cases, allowing developers to choose the best authentication method for their specific application needs. This flexibility makes Immutable Passport adaptable to different user experience requirements. 