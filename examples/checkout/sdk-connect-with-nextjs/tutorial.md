<div class="display-none">

# Checkout SDK Connect with NextJS

</div>

This tutorial demonstrates how to integrate the Immutable Checkout SDK into a Next.js application to connect with MetaMask wallets. The example shows how to retrieve a list of supported wallets, create a provider for MetaMask, connect to the wallet (with or without permissions), and check connection status.

<div class="button-component">

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/checkout/sdk-connect-with-nextjs) <span class="button-component-arrow">→</span>

</div>

## Features Overview

- Retrieving a list of supported wallet providers
- Creating a MetaMask provider
- Connecting to MetaMask (with or without permissions)
- Checking wallet connection status
- Displaying wallet connection information

## SDK Integration Details

### Retrieving Supported Wallet Providers

**Feature Name**: Get a list of all supported wallet providers.

**Source Code**: [source code file](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/checkout/sdk-connect-with-nextjs/src/app/connect-with-metamask/page.tsx)

**Implementation**:
```typescript
const type = checkout.WalletFilterTypes.ALL;
const allowListRes = await checkoutSDK.getWalletAllowList({ type });
```

**Explanation**: This code uses the Checkout SDK to fetch a list of all supported wallet providers. The `WalletFilterTypes.ALL` parameter specifies that all wallet types should be returned, rather than filtering for a specific type. The result is an array of wallet information that includes the provider name and other relevant details.

### Creating a MetaMask Provider

**Feature Name**: Create a provider for connecting to MetaMask.

**Source Code**: [source code file](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/checkout/sdk-connect-with-nextjs/src/app/connect-with-metamask/page.tsx)

**Implementation**:
```typescript
const walletProviderName = checkout.WalletProviderName.METAMASK;
const providerRes = await checkoutSDK.createProvider({ walletProviderName });
```

**Explanation**: This code creates a provider specifically for MetaMask by using the `createProvider` method and specifying `WalletProviderName.METAMASK`. The provider returned can be used for connecting to the wallet and performing wallet-related operations.

### Connecting to MetaMask

**Feature Name**: Connect to MetaMask wallet with or without permissions.

**Source Code**: [source code file](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/checkout/sdk-connect-with-nextjs/src/app/connect-with-metamask/page.tsx)

**Implementation**:
```typescript
// With permissions
const connectRes = await checkoutSDK.connect({ 
  provider: providerRes.provider,
  requestWalletPermissions: true,
});

// Without permissions
const connectRes = await checkoutSDK.connect({
  provider: providerRes.provider
});
```

**Explanation**: These code snippets demonstrate two ways to connect to the MetaMask wallet. The first method uses `requestWalletPermissions: true` to explicitly request user permissions, which shows a MetaMask popup asking for permission to view accounts. The second method connects without requesting explicit permissions, which may use cached permissions if they exist.

### Checking Connection Status

**Feature Name**: Check if a wallet is connected and get the wallet address.

**Source Code**: [source code file](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/checkout/sdk-connect-with-nextjs/src/app/connect-with-metamask/page.tsx)

**Implementation**:
```typescript
const isConnectedRes = await checkoutSDK.checkIsWalletConnected({
  provider: providerRes.provider
});
```

**Explanation**: This code checks if the wallet is currently connected using the `checkIsWalletConnected` method. The result includes an `isConnected` boolean flag and the connected wallet's address if a connection exists.

## Running the App

### Prerequisites

- Node.js (v18 or later)
- PNPM package manager
- MetaMask extension installed in your browser
- An Immutable Hub account for API key setup ([Immutable Hub](https://hub.immutable.com/))

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

3. Create a `.env` file based on the `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Add your Immutable publishable API key to the `.env` file:
   ```
   NEXT_PUBLIC_PUBLISHABLE_KEY=your_publishable_key
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

6. Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to see the app.

## Summary

This example demonstrates how to integrate Immutable's Checkout SDK with a Next.js application to connect with MetaMask wallets. It showcases essential wallet connection features including retrieving supported wallets, creating providers, establishing connections with or without explicit permissions, and checking connection status. These fundamentals are critical for any dApp that needs to interact with user wallets. 