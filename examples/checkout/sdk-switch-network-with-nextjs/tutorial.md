# Switch Network with Next.js

## Introduction
This example app demonstrates how to use the Immutable Checkout SDK to connect to a wallet provider (MetaMask) and switch between different blockchain networks. It showcases the network switching capabilities of the SDK in a simple Next.js application.

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/checkout/sdk-switch-network-with-nextjs)

## Features Overview
- Connect to a wallet using MetaMask
- Get network information
- Get supported networks list
- Switch between different blockchain networks (Sepolia, Immutable zkEVM Testnet)

## SDK Integration Details

### **Get Network Information**: [Get information about the currently connected network](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/checkout/sdk-switch-network-with-nextjs/src/app/switch-with-metamask/page.tsx#L20-L37)
#### Implementation
```typescript
// Get the network details
const info = await checkoutSDK.getNetworkInfo({ provider });
```
#### Explanation
The `getNetworkInfo` method is used to retrieve details about the currently connected network, including the chain name, chain ID, and native currency. This information is then displayed in the UI to give users visibility into which network they are currently connected to.

### **Create and Connect MetaMask Provider**: [Connect to MetaMask wallet with permissions](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/checkout/sdk-switch-network-with-nextjs/src/app/switch-with-metamask/page.tsx#L39-L62)
#### Implementation
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
```
#### Explanation
This code creates a MetaMask provider using the Checkout SDK and then connects to it with permission requests. The `requestWalletPermissions` flag ensures the user is prompted to grant the necessary permissions for the application to interact with their wallet.

### **Check Wallet Connection**: [Verify if the wallet is connected](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/checkout/sdk-switch-network-with-nextjs/src/app/switch-with-metamask/page.tsx#L64-L68)
#### Implementation
```typescript
// Check if the provider if a BrowserProvider
const isConnectedRes = await checkoutSDK.checkIsWalletConnected({
  provider: providerRes.provider,
});
```
#### Explanation
The `checkIsWalletConnected` method checks if the wallet is connected to the application. This is useful for determining whether to show the connection UI or the network switching UI.

### **Get Supported Networks**: [Retrieve all supported networks](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/checkout/sdk-switch-network-with-nextjs/src/app/switch-with-metamask/page.tsx#L70-L74)
#### Implementation
```typescript
// Get the list of default supported networks
const type = checkout.NetworkFilterTypes.ALL;
const supportedNetworks = await checkoutSDK.getNetworkAllowList({ type });
```
#### Explanation
This code retrieves a list of all networks supported by the Immutable SDK. The `NetworkFilterTypes.ALL` parameter ensures that all networks (both mainnet and testnet) are included in the results.

### **Switch Network**: [Change to a different blockchain network](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/checkout/sdk-switch-network-with-nextjs/src/app/switch-with-metamask/page.tsx#L82-L93)
#### Implementation
```typescript
// Switch to Immutable zkEVM Testnet and update the provider
const chainId = checkout.ChainId.IMTBL_ZKEVM_TESTNET;
const switchResponse = await checkoutSDK.switchNetwork({ provider: connectedProvider, chainId });

// Update the provider
setConnectedProvider(switchResponse.provider);
```
#### Explanation
The `switchNetwork` method is used to change the connected network to a different blockchain. In this example, it's switching to the Immutable zkEVM Testnet. After switching, it's important to update the provider reference as returned by the switchNetwork method.

## Running the App

### Prerequisites
- Node.js (v16 or later)
- pnpm installed
- MetaMask browser extension
- [Immutable Hub account](https://hub.immutable.com/) for environment setup

### Steps to Run Locally
1. Clone the repository
   ```bash
   git clone https://github.com/immutable/ts-immutable-sdk.git
   cd ts-immutable-sdk
   ```

2. Install dependencies
   ```bash
   pnpm install
   ```

3. Navigate to the example directory
   ```bash
   cd examples/checkout/sdk-switch-network-with-nextjs
   ```

4. Start the development server
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

6. Click "Connect MetaMask" to connect your wallet

7. After connecting, you can use the buttons to switch between Sepolia and Immutable zkEVM Testnet networks

## Summary
This example demonstrates how to integrate the Immutable Checkout SDK into a Next.js application to connect to MetaMask and switch between different blockchain networks. It shows how to get network information, check connection status, list supported networks, and switch between networks using the SDK's methods. This functionality is essential for dApps that need to ensure users are on the correct network for their application's functionality. 