# Wallet Balance with Next.js

## Introduction
This example app demonstrates how to use the Immutable Checkout SDK to connect a MetaMask wallet and retrieve token balances. It showcases the wallet connection process and various methods to fetch token balances from a connected wallet.

[View app on GitHub](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/checkout/sdk-wallet-balance-with-nextjs)

## Features Overview
- Wallet Balance with MetaMask: Connect a MetaMask wallet and retrieve various token balances

## SDK Integration Details

### Wallet Balance with MetaMask
**Feature Name**: Retrieve token balances from a connected MetaMask wallet

**Source Code**: [page.tsx](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/checkout/sdk-wallet-balance-with-nextjs/src/app/wallet-balance-with-metamask/page.tsx)

**Implementation**:

1. **Connecting with MetaMask**:
```typescript
const connectWithMetamask = async () => {
  // Create a provider given one of the default wallet provider names
  const walletProviderName = checkout.WalletProviderName.METAMASK;
  const providerRes = await checkoutSDK.createProvider({ walletProviderName });
  
  // Check if the provider if a BrowserProvider
  const isProviderRes = checkout.Checkout.isWrappedBrowserProvider(providerRes.provider);

  // Get the current network information
  // Pass through requestWalletPermissions to request the user's wallet permissions
  const connectRes = await checkoutSDK.connect({ 
    provider: providerRes.provider,
    requestWalletPermissions: true,
  });

  // Check if the provider if a BrowserProvider
  const isConnectedRes = await checkoutSDK.checkIsWalletConnected({
    provider: providerRes.provider
  });
  setWalletAddress(isConnectedRes.walletAddress);
}
```

2. **Getting Token Allow List**:
```typescript
// Get the list of supported tokens
const tokenType = await checkout.TokenFilterTypes.ALL;
const chainId = Number((await connectRes.provider.getNetwork()).chainId) as checkout.ChainId ?? checkout.ChainId.IMTBL_ZKEVM_TESTNET
const tokenAllowList = await checkoutSDK.getTokenAllowList({ type: tokenType, chainId });
```

3. **Getting All Balances**:
```typescript
// Get all token balances of the wallet
const chainId = Number((await connectedProvider.provider.getNetwork()).chainId) as checkout.ChainId ?? checkout.ChainId.IMTBL_ZKEVM_TESTNET
const allBalancesResponse = await checkoutSDK.getAllBalances({ provider: connectedProvider, walletAddress, chainId });
```

4. **Getting Token Information**:
```typescript
// Get the details of a particular token
const tokenAddress = "0xD61ffaece032CA6E0C469820707d677Feb4BEDD5";
const tokenInfo = await checkoutSDK.getTokenInfo({ provider: connectedProvider, tokenAddress });
```

5. **Getting Balance of a Specific Token**:
```typescript
// Get the balance of a particular token
const tokenAddress = '0xD61ffaece032CA6E0C469820707d677Feb4BEDD5'
const balanceResponse = await checkoutSDK.getBalance({ provider: connectedProvider, walletAddress, tokenAddress });
```

6. **Getting Native Token Balance**:
```typescript
// Get the balance of the native token
const balanceResponse = await checkoutSDK.getBalance({ provider: connectedProvider, walletAddress });
```

**Explanation**:

This implementation showcases how to use the Immutable Checkout SDK to connect to a MetaMask wallet and retrieve various token balances:

1. First, it creates a provider specifically for MetaMask using `checkoutSDK.createProvider()`
2. Then, it connects to the wallet using `checkoutSDK.connect()` with the provider
3. It retrieves the wallet address using `checkoutSDK.checkIsWalletConnected()`
4. The app demonstrates several key balance-related functionalities:
   - Getting a list of supported tokens using `getTokenAllowList()`
   - Retrieving all token balances for a wallet using `getAllBalances()`
   - Getting detailed information about a specific token using `getTokenInfo()`
   - Retrieving the balance of a specific token using `getBalance()` with a token address
   - Getting the native token balance using `getBalance()` without a token address

The app displays all this information in a user-friendly interface, allowing users to select from the list of supported tokens and view their balances.

## Running the App

### Prerequisites
- Node.js (v16 or later)
- pnpm
- MetaMask browser extension installed
- [Immutable Hub account](https://hub.immutable.com/) for environment setup

### Steps to Run the App Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/immutable/ts-immutable-sdk.git
   cd ts-immutable-sdk/examples/checkout/sdk-wallet-balance-with-nextjs
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create a `.env` file based on the provided `.env.example`:
   ```
   # Add any required environment variables
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

5. Open your browser and navigate to http://localhost:3000

6. Click on the "Wallet Balance with MetaMask" button on the homepage

7. Click "Connect MetaMask" and follow the MetaMask prompts to connect your wallet

8. After connecting, you can view your token balances and explore the supported tokens

## Summary

This example app demonstrates how to use the Immutable Checkout SDK to connect to a MetaMask wallet and retrieve various token balances. It shows how to:

- Connect to MetaMask using the Checkout SDK
- Retrieve a list of supported tokens
- Get all token balances for a wallet
- Get detailed information about specific tokens
- Retrieve balances for specific tokens and the native token

Developers can use this example as a reference for implementing wallet balance functionality in their own applications built with the Immutable Checkout SDK. 