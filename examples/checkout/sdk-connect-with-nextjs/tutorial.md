# Connecting to MetaMask with Checkout SDK in Next.js

## Introduction
This example app demonstrates how to connect your Next.js application to MetaMask using the Immutable Checkout SDK. It showcases how to initialize the SDK, create a provider for MetaMask, and establish a wallet connection with or without requesting permissions.

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/checkout/sdk-connect-with-nextjs)

## Features Overview
- Get list of supported wallets
- Create a MetaMask provider using Checkout SDK
- Connect to MetaMask with permission requests
- Connect to MetaMask without permission requests
- Validate provider and connection status
- Get connection status

## SDK Integration Details

### **Get Wallet Allow List**: [Retrieve supported wallets](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/checkout/sdk-connect-with-nextjs/src/app/connect-with-metamask/page.tsx#L28-L31)
```typescript
// Get the list of default supported providers
const type = checkout.WalletFilterTypes.ALL;
const allowListRes = await checkoutSDK.getWalletAllowList({ type });
```
**Explanation**: This code retrieves a list of all wallets supported by the Checkout SDK. The `WalletFilterTypes.ALL` parameter ensures all available wallet providers are returned in the response.

### **Create MetaMask Provider**: [Initialize wallet provider](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/checkout/sdk-connect-with-nextjs/src/app/connect-with-metamask/page.tsx#L35-L38)
```typescript
// Create a provider given one of the default wallet provider names
const walletProviderName = checkout.WalletProviderName.METAMASK;
const providerRes = await checkoutSDK.createProvider({ walletProviderName });
```
**Explanation**: This code creates a provider specifically for MetaMask. The SDK handles the interaction with the browser extension and returns a provider object that can be used for subsequent operations.

### **Validate Provider**: [Check provider validity](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/checkout/sdk-connect-with-nextjs/src/app/connect-with-metamask/page.tsx#L43-L45)
```typescript
// Check if the provider if a BrowserProvider
const isProviderRes = checkout.Checkout.isWrappedBrowserProvider(providerRes.provider);
```
**Explanation**: This function validates that the provider returned by the SDK is a proper BrowserProvider that can be used for blockchain interactions. This validation is essential before attempting to connect to a network.

### **Connect with Permissions**: [Connect with wallet permissions](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/checkout/sdk-connect-with-nextjs/src/app/connect-with-metamask/page.tsx#L50-L55)
```typescript
// Get the current network information
// Pass through requestWalletPermissions to request the user's wallet permissions
const connectRes = await checkoutSDK.connect({ 
  provider: providerRes.provider,
  requestWalletPermissions: true,
});
```
**Explanation**: This code establishes a connection to the wallet while explicitly requesting permissions from the user. This approach is useful when your application needs specific permissions to interact with the user's wallet.

### **Connect without Permissions**: [Connect without additional permissions](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/checkout/sdk-connect-with-nextjs/src/app/connect-with-metamask/page.tsx#L59-L63)
```typescript
// Get the current network information
const connectRes = await checkoutSDK.connect({
  provider: providerRes.provider
});
```
**Explanation**: This code connects to the wallet without explicitly requesting permissions. This is suitable for applications that only need basic wallet interactions.

### **Check Connection Status**: [Verify connection status](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/checkout/sdk-connect-with-nextjs/src/app/connect-with-metamask/page.tsx#L67-L70)
```typescript
// Check if the provider if a BrowserProvider
const isConnectedRes = await checkoutSDK.checkIsWalletConnected({
  provider: providerRes.provider
});
```
**Explanation**: This function verifies if the wallet is connected and returns the connection status along with the wallet address. This is useful for displaying the user's wallet status in the UI.

## Running the App

### Prerequisites
- Node.js 18.x or higher
- PNPM package manager
- MetaMask browser extension installed
- [Immutable Hub](https://hub.immutable.com/) account for obtaining a publishable API key

### Setup Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/immutable/ts-immutable-sdk.git
   cd ts-immutable-sdk/examples/checkout/sdk-connect-with-nextjs
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Add your Immutable Hub publishable key to the `.env` file:
   ```
   NEXT_PUBLIC_PUBLISHABLE_KEY=your_publishable_key_here
   ```

5. Run the development server:
   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

## Summary
This example demonstrates how to integrate Immutable's Checkout SDK with a Next.js application to connect to MetaMask. The app showcases different connection methods (with and without permissions), provider validation, and retrieving wallet information. It provides a foundation for building more complex blockchain applications that require wallet connectivity.

Key takeaways:
- The Checkout SDK simplifies wallet connection in Next.js applications
- You can choose different connection approaches based on your permission requirements
- The SDK provides helpful utilities for validating connections and retrieving wallet information
- The integration works seamlessly with React's state management for displaying connection status 