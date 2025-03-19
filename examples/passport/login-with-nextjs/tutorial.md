# Login with NextJS Example

## Introduction
This example app demonstrates how to implement Immutable Passport authentication in a Next.js application. It showcases different authentication methods and logout flows using the Immutable Passport SDK, providing a comprehensive guide to integrate user authentication into your Next.js dApps.

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/login-with-nextjs)

## Features Overview
- Login with Passport (EVM wallet connection)
- Login with Identity only (without wallet)
- Login with EtherJS integration
- Logout with redirect mode
- Logout with silent mode
- Login callback handling

## SDK Integration Details

### Login with Passport (EVM wallet connection)
[Implementation in login-with-passport/page.tsx](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/login-with-nextjs/src/app/login-with-passport/page.tsx)

```typescript
const provider = await passportInstance.connectEvm();
const accounts = await provider.request({ method: 'eth_requestAccounts' });
```

**Explanation**: This implementation connects to the user's EVM wallet through Passport. The `connectEvm()` method returns a provider that can be used to interact with the blockchain. The `eth_requestAccounts` method prompts the user to connect their wallet and returns the connected accounts.

### Login with Identity only (without wallet)
[Implementation in login-with-identity-only/page.tsx](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/login-with-nextjs/src/app/login-with-identity-only/page.tsx)

```typescript
const profile: passport.UserProfile | null = await passportInstance.login();
```

**Explanation**: This implementation demonstrates how to authenticate a user with just their Immutable identity, without requiring wallet connection. The `login()` method returns the user's profile information including email and subject ID. This is useful for applications that need user authentication but don't require blockchain transactions.

### Login with EtherJS integration
[Implementation in login-with-etherjs/page.tsx](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/login-with-nextjs/src/app/login-with-etherjs/page.tsx)

```typescript
const passportProvider = await passportInstance.connectEvm();
const web3Provider = new BrowserProvider(passportProvider);
const accounts = await web3Provider.send('eth_requestAccounts', []);
```

**Explanation**: This implementation shows how to integrate Passport with the popular Ethers.js library. It connects to the EVM wallet through Passport and then wraps the provider with Ethers.js's BrowserProvider, enabling you to use all of Ethers.js's functionality with Passport.

### Logout with redirect mode
[Implementation in logout-with-redirect-mode/page.tsx](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/login-with-nextjs/src/app/logout-with-redirect-mode/page.tsx)

```typescript
await passportInstance.logout();
```

**Explanation**: This demonstrates how to implement a logout flow that redirects the user to a specified page after logout. The Passport instance is configured with `logoutMode: 'redirect'` and a `logoutRedirectUri`, causing the browser to navigate to the specified URI after successful logout.

### Logout with silent mode
[Implementation in logout-with-silent-mode/page.tsx](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/login-with-nextjs/src/app/logout-with-silent-mode/page.tsx)

```typescript
await passportInstance.logout();
```

**Explanation**: This shows how to implement a logout flow that doesn't redirect the user away from the current page. The Passport instance is configured with `logoutMode: 'silent'`, allowing the logout process to happen in the background without disrupting the user experience.

### Login callback handling
[Implementation in redirect/page.tsx](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/login-with-nextjs/src/app/redirect/page.tsx)

```typescript
passportInstance.loginCallback()
```

**Explanation**: This handles the OAuth2 redirect that occurs after a user authenticates with Immutable Passport. The `loginCallback()` method processes the authentication response and completes the login flow. This is essential for the authentication flow to work properly.

## Running the App

### Prerequisites
- Node.js (v16 or later)
<<<<<<< HEAD
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
=======
- pnpm
- Immutable Hub account for environment setup. [Create an account here](https://hub.immutable.com/)

### Setup Environment Variables
1. Create a `.env` file in the root directory based on `.env.example`
2. Add your Immutable Hub credentials:
   ```
   NEXT_PUBLIC_CLIENT_ID=<YOUR_CLIENT_ID>
   NEXT_PUBLIC_PUBLISHABLE_KEY=<YOUR_PUBLISHABLE_KEY>
   ```

### Steps to Run
1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Start the development server:
   ```bash
   pnpm dev
   ```
3. Open your browser and navigate to `http://localhost:3000`

## Summary
This example demonstrates various authentication flows using Immutable Passport in a Next.js application. You've learned how to implement login with EVM wallet connection, identity-only login, integration with Ethers.js, and different logout strategies. These patterns can be adapted to create a seamless authentication experience in your own dApps built on Immutable. 
>>>>>>> b01f22b4b (generate the tutorial/metadata content for all example apps)
