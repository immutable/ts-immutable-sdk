# Login with Next.js

## Introduction
This example app demonstrates how to integrate user authentication into a Next.js application using Immutable's Passport SDK. It showcases different login methods including wallet connection via Passport, integration with Ethers.js, and identity-only login without wallet connection.

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/login-with-nextjs)

## Features Overview
- Login with Passport (wallet connection)
- Login with Ethers.js
- Login with identity only (without wallet)

## SDK Integration Details

### Login with Passport
**Feature Name**: Login with Passport allows users to connect their wallets directly using the Passport SDK.

**Source Code**: [login-with-passport/page.tsx](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/login-with-nextjs/src/app/login-with-passport/page.tsx)

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

**Explanation**: This implementation uses `passportInstance.connectEvm()` to connect to the user's Ethereum wallet through Passport. When the user clicks the login button, it initiates the connection flow and requests access to their Ethereum accounts. Upon successful connection, it displays the connected account address and updates the login state.

### Login with Ethers.js
**Feature Name**: Login with Ethers.js demonstrates how to combine Passport with the popular Ethers.js library for Ethereum interactions.

**Source Code**: [login-with-etherjs/page.tsx](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/login-with-nextjs/src/app/login-with-etherjs/page.tsx)

**Implementation**:
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

**Explanation**: This implementation shows how to use the Passport's EVM provider with Ethers.js. It first obtains the provider from Passport via `connectEvm()`, then wraps it with Ethers.js's BrowserProvider. This allows developers to leverage Ethers.js features while using Passport for authentication and wallet connection.

### Login with Identity Only
**Feature Name**: Login with identity only enables users to authenticate with their Immutable identity without connecting a wallet.

**Source Code**: [login-with-identity-only/page.tsx](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/login-with-nextjs/src/app/login-with-identity-only/page.tsx)

**Implementation**:
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

**Explanation**: This implementation demonstrates how to authenticate users with just their Immutable identity using `passportInstance.login()`. This method returns a UserProfile object containing user information like email and a unique subject identifier (sub). This approach is useful for applications that need user authentication but don't require wallet functionality immediately.

## Running the App

### Prerequisites
- Node.js (v18 or later recommended)
- pnpm
- An account on [Immutable Hub](https://hub.immutable.com/) for obtaining the necessary API credentials

### Steps to Run Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/immutable/ts-immutable-sdk.git
   cd ts-immutable-sdk/examples/passport/login-with-nextjs
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in the required values:
     ```
     NEXT_PUBLIC_PUBLISHABLE_KEY=<Your publishable key from Immutable Hub>
     NEXT_PUBLIC_CLIENT_ID=<Your client ID from Immutable Hub>
     ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Summary
This example demonstrates three different methods of integrating Immutable Passport authentication into a Next.js application:
1. Direct wallet connection using Passport's native methods
2. Integration with Ethers.js for developers who prefer or need that library
3. Identity-only login for applications that need user authentication without wallet connection

These implementation patterns can be adapted for various authentication flows in web3 applications built with Next.js and the Immutable SDK. 