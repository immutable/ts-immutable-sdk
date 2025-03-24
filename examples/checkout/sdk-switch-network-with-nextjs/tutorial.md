<div class="display-none">

# Switch Network with MetaMask using Next.js

This example demonstrates how to use the Immutable Checkout SDK to connect to MetaMask and switch between different blockchain networks. The app allows users to connect their MetaMask wallet and switch between Sepolia Testnet and Immutable zkEVM Testnet.

</div>

<div class="button-component">

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/checkout/sdk-switch-network-with-nextjs) <span class="button-component-arrow">→</span>

</div>

## Features Overview

- **Connect to MetaMask**: Establish a connection with the MetaMask wallet
- **Switch Networks**: Switch between Ethereum networks (Sepolia and Immutable zkEVM Testnet)
- **Network Information**: Display current network details (chain name, chain ID, native currency)
- **Supported Networks**: Retrieve and display a list of supported networks

## SDK Integration Details

### Connect to MetaMask

**Feature Name**: Connect to MetaMask wallet using the Checkout SDK.

**Source Code**: [switch-with-metamask/page.tsx](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/checkout/sdk-switch-network-with-nextjs/src/app/switch-with-metamask/page.tsx)

**Implementation**:

```typescript
// Create a provider given one of the default wallet provider names
const walletProviderName = checkout.WalletProviderName.METAMASK;
const providerRes = await checkoutSDK.createProvider({
  walletProviderName,
});

// Get the current network information
// Pass through requestWalletPermissions to request the user's wallet permissions
const connectRes = await checkoutSDK.connect({
  provider: providerRes.provider,
  requestWalletPermissions: true,
});

// Check if the provider if a BrowserProvider
const isConnectedRes = await checkoutSDK.checkIsWalletConnected({
  provider: providerRes.provider,
});
```

**Explanation**: The implementation first creates a provider for MetaMask using `createProvider()` with the METAMASK wallet provider name. Then it connects to the provider with `connect()`, requesting wallet permissions. Finally, it checks if the wallet is connected using `checkIsWalletConnected()`.

### Switch Networks

**Feature Name**: Switch between different blockchain networks using the Checkout SDK.

**Source Code**: [switch-with-metamask/page.tsx](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/checkout/sdk-switch-network-with-nextjs/src/app/switch-with-metamask/page.tsx)

**Implementation**:

```typescript
// Switch to Immutable zkEVM Testnet and update the provider
const chainId = checkout.ChainId.IMTBL_ZKEVM_TESTNET;
const switchResponse = await checkoutSDK.switchNetwork({ 
  provider: connectedProvider, 
  chainId 
});

// Update the provider
setConnectedProvider(switchResponse.provider);
```

**Explanation**: The implementation uses `switchNetwork()` to change the connected wallet's network to the specified chain ID. In this example, buttons are provided to switch between Sepolia Testnet and Immutable zkEVM Testnet. After switching, the provider is updated with the new network connection.

### Get Network Information

**Feature Name**: Retrieve and display information about the currently connected network.

**Source Code**: [switch-with-metamask/page.tsx](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/checkout/sdk-switch-network-with-nextjs/src/app/switch-with-metamask/page.tsx)

**Implementation**:

```typescript
// Get the network details
const info = await checkoutSDK.getNetworkInfo({ provider });
```

**Explanation**: The app uses `getNetworkInfo()` to retrieve details about the currently connected network, including the network name, chain ID, and native currency symbol. This information is then displayed in a table to provide users with visibility into which network they're currently connected to.

### Get Supported Networks

**Feature Name**: Retrieve a list of supported networks from the Checkout SDK.

**Source Code**: [switch-with-metamask/page.tsx](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/checkout/sdk-switch-network-with-nextjs/src/app/switch-with-metamask/page.tsx)

**Implementation**:

```typescript
// Get the list of default supported networks
const type = checkout.NetworkFilterTypes.ALL;
const supportedNetworks = await checkoutSDK.getNetworkAllowList({ type });
```

**Explanation**: The implementation uses `getNetworkAllowList()` with the `ALL` filter type to retrieve a list of all supported networks. This list is then displayed to the user, providing information about which networks they can switch to using the SDK.

## Running the App

### Prerequisites

- Node.js 18 or later
- [Immutable Hub account](https://hub.immutable.com/) for environment setup
- MetaMask browser extension installed

### Steps to Run Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/immutable/ts-immutable-sdk.git
   ```

2. Navigate to the example app directory:
   ```bash
   cd ts-immutable-sdk/examples/checkout/sdk-switch-network-with-nextjs
   ```

3. Install dependencies:
   ```bash
   pnpm install
   ```

4. Create a `.env` file based on the provided `.env.example`:
   ```bash
   cp .env.example .env
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

6. Open your browser and navigate to http://localhost:3000

## Summary

This example app demonstrates the network switching capabilities of the Immutable Checkout SDK with MetaMask integration. It shows how to connect to a wallet provider, switch between different blockchain networks, retrieve network information, and display a list of supported networks. This functionality is essential for dApps that need to ensure users are on the correct blockchain network before interacting with smart contracts.

Key takeaways for developers:
- How to connect to MetaMask using the Checkout SDK
- How to programmatically switch networks
- How to retrieve and display network information
- How to handle the user experience around network switching 