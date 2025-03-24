# Connect with MetaMask using the Checkout SDK

## Introduction
This example app demonstrates how to connect a MetaMask wallet to your application using Immutable's Checkout SDK. It shows two different connection approaches: connecting with permissions and connecting without permissions. This app serves as a practical guide for implementing wallet connections, a fundamental step in blockchain application development.

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/checkout/sdk-connect-with-nextjs)

## Features Overview
- Connect to MetaMask wallet with wallet permissions
- Connect to MetaMask wallet without wallet permissions
- Retrieve the list of supported wallets
- Check if a provider is valid
- Verify wallet connection status

## SDK Integration Details

### Connect with MetaMask
**Feature Name**: Connect a wallet to the application using MetaMask.

**Source Code**: [source code file](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/checkout/sdk-connect-with-nextjs/src/app/connect-with-metamask/page.tsx)

**Implementation**:

1. Getting the list of supported wallets:
```typescript
// Get the list of default supported providers
const type = checkout.WalletFilterTypes.ALL;
const allowListRes = await checkoutSDK.getWalletAllowList({ type });
```

2. Creating a MetaMask provider:
```typescript
// Create a provider given one of the default wallet provider names
const walletProviderName = checkout.WalletProviderName.METAMASK;
const providerRes = await checkoutSDK.createProvider({ walletProviderName });
```

3. Validating the provider:
```typescript
// Check if the provider is a BrowserProvider
const isProviderRes = checkout.Checkout.isWrappedBrowserProvider(providerRes.provider);
```

4. Connecting to the wallet with permissions:
```typescript
// Connect with permissions
const connectRes = await checkoutSDK.connect({ 
  provider: providerRes.provider,
  requestWalletPermissions: true,
});
```

5. Connecting to the wallet without permissions:
```typescript
// Connect without permissions
const connectRes = await checkoutSDK.connect({
  provider: providerRes.provider
});
```

6. Checking connection status:
```typescript
// Check if the provider is connected
const isConnectedRes = await checkoutSDK.checkIsWalletConnected({
  provider: providerRes.provider
});
```

**Explanation**:
The app first retrieves a list of supported wallet providers using the `getWalletAllowList` method. It then creates a MetaMask provider using the `createProvider` method with the MetaMask wallet provider name. 

Before attempting to connect, it validates the provider using `isWrappedBrowserProvider`. The connection to the wallet is made through the `connect` method, which can be called with or without requesting permissions. The difference is that when requesting permissions, the wallet will explicitly prompt the user for permission to interact with their wallet.

Finally, the app verifies if the wallet is connected using the `checkIsWalletConnected` method, which returns the connection status and wallet address.

## Running the App

### Prerequisites
- Node.js and pnpm installed on your machine
- MetaMask browser extension installed
- [Set up your environment variables in Immutable Hub](https://hub.immutable.com)

### Steps to Run Locally

1. Clone the repository:
```bash
git clone https://github.com/immutable/ts-immutable-sdk.git
cd ts-immutable-sdk
```

2. Install dependencies:
```bash
pnpm install
```

3. Navigate to the example app:
```bash
cd examples/checkout/sdk-connect-with-nextjs
```

4. Create your environment file:
```bash
cp .env.example .env
```

5. Edit the `.env` file and add your publishable API key from Immutable Hub:
```
NEXT_PUBLIC_PUBLISHABLE_KEY=your-publishable-key
```

6. Start the development server:
```bash
pnpm dev
```

7. Open your browser and navigate to http://localhost:3000 to see the application.

## Summary
This example demonstrates how to implement wallet connection functionality using Immutable's Checkout SDK. By following this guide, developers can easily integrate MetaMask wallet connectivity into their applications, with options for requesting different permission levels. The app showcases a straightforward implementation that can be extended to build more complex blockchain applications. 