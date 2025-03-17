# Login with Passport in Next.js

## Introduction
This example app demonstrates how to integrate Immutable Passport authentication into a Next.js application. It showcases various methods for authenticating users and managing the login/logout flow using the Immutable Passport SDK. This example is valuable for developers who want to implement user authentication in their web3 gaming applications built with Next.js.

[View this example on GitHub](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/login-with-nextjs)

## Features Overview
- User authentication with Passport (wallet connection)
- Identity-only authentication (without wallet)
- Integration with ethers.js for wallet functionality
- Logout implementation with redirect mode
- Logout implementation with silent mode
- Display of authenticated user information

## SDK Integration Details

### Passport Authentication with Wallet Connection
**Link**: [login-with-passport/page.tsx](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/login-with-nextjs/src/app/login-with-passport/page.tsx)  
**Feature Name**: EVM Provider Connection & Authentication  
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
**Explanation**: This code initializes the Passport SDK and connects to the user's Ethereum wallet. The `connectEvm()` method returns a provider that follows the EIP-1193 interface. When `eth_requestAccounts` is called, it prompts the user to connect their wallet and returns the wallet addresses upon successful connection. The component then updates its state to reflect the user's login status and wallet address.

### Identity-Only Authentication
**Link**: [login-with-identity-only/page.tsx](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/login-with-nextjs/src/app/login-with-identity-only/page.tsx)  
**Feature Name**: User Profile Authentication  
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
**Explanation**: This implementation demonstrates how to authenticate a user without requiring a wallet connection. The `login()` method initiates the authentication process and returns the user's profile information upon successful login. This is useful for applications that need user identity but don't require wallet functionality immediately.

### Logout Implementation (Redirect Mode)
**Link**: [logout-with-redirect-mode/page.tsx](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/login-with-nextjs/src/app/logout-with-redirect-mode/page.tsx)  
**Feature Name**: Passport Logout with Redirect  
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
**Explanation**: This code demonstrates how to log out a user with the redirect mode. When the user clicks the logout button, the `logout()` method is called, which redirects the user to the Passport logout page before returning them to the specified logout redirect URI. This is set up in the Passport instance configuration with the `logoutRedirectUri` parameter.

## Running the App

### Prerequisites
- Node.js (v16 or later)
- pnpm package manager
- [Immutable Hub account](https://hub.immutable.com) for obtaining your API keys

### Setup and Configuration
1. Clone the repository:
```bash
git clone https://github.com/immutable/ts-immutable-sdk.git
cd ts-immutable-sdk/examples/passport/login-with-nextjs
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env` file by copying the `.env.example` file:
```bash
cp .env.example .env
```

4. Configure your environment variables in the `.env` file:
```
NEXT_PUBLIC_PUBLISHABLE_KEY=your_publishable_key_from_hub
```

### Running the App
```bash
pnpm dev
```

Once the app is running, open [http://localhost:3000](http://localhost:3000) in your browser to see the examples.

## Summary
This example demonstrates different methods of authentication using the Immutable Passport SDK in a Next.js application. It shows how to connect users with their wallets, authenticate users without requiring a wallet connection, and implement various logout strategies. By exploring this example, developers can understand how to implement robust authentication flows in their web3 gaming applications. 