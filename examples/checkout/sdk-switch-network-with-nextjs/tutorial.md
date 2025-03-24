# Network Switching with Immutable SDK and MetaMask 

## Introduction
This example app demonstrates how to use the Immutable Checkout SDK to switch between different networks (Sepolia Testnet and Immutable zkEVM Testnet) with a connected MetaMask wallet in a Next.js application. This is a crucial feature for blockchain applications that need to operate across multiple networks or guide users to switch to the correct network for specific operations.

[View app on GitHub](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/checkout/sdk-switch-network-with-nextjs)

## Features Overview
- Switch network with MetaMask between Sepolia Testnet and Immutable zkEVM Testnet

## SDK Integration Details

### Switch Network with MetaMask
**Feature Name**: Network switching allows users to seamlessly switch between different blockchain networks directly from your application.

**Source Code**: [Source code file](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/checkout/sdk-switch-network-with-nextjs/src/app/switch-with-metamask/page.tsx)

**Implementation**:

1. First, connect to MetaMask:
```typescript
const connectWithMetamask = async () => {
  // Create a provider given one of the default wallet provider names
  const walletProviderName = checkout.WalletProviderName.METAMASK;
  const providerRes = await checkoutSDK.createProvider({
    walletProviderName,
  });

  // Connect and request wallet permissions
  const connectRes = await checkoutSDK.connect({
    provider: providerRes.provider,
    requestWalletPermissions: true,
  });

  setConnectedProvider(connectRes.provider);
}
```

2. Get the network information and supported networks:
```typescript
const updateNetworkInfo = async (provider: WrappedBrowserProvider) => {
  // Get the network details
  const info = await checkoutSDK.getNetworkInfo({ provider });
  setChainName(info.name);
  setChainId(info.chainId.toString());
  setNativeCurrency(info.nativeCurrency?.symbol || 'N/A');
  setIsConnected(true);
};

// Get the list of default supported networks
const type = checkout.NetworkFilterTypes.ALL;
const supportedNetworks = await checkoutSDK.getNetworkAllowList({ type });
setSupportedNetworks(supportedNetworks.networks.map(network => network.name));
```

3. Switch to Immutable zkEVM Testnet:
```typescript
const switchToImmutableZkEVMTestnet = async () => {
  // Switch to Immutable zkEVM Testnet and update the provider
  const chainId = checkout.ChainId.IMTBL_ZKEVM_TESTNET;
  const switchResponse = await checkoutSDK.switchNetwork({ 
    provider: connectedProvider, 
    chainId 
  });
  
  // Update the provider
  setConnectedProvider(switchResponse.provider);
  await updateNetworkInfo(switchResponse.provider);
};
```

4. Switch to Sepolia Testnet:
```typescript
const switchToSepoliaTestnet = async () => {
  const chainId = checkout.ChainId.SEPOLIA;
  const switchResponse = await checkoutSDK.switchNetwork({ 
    provider: connectedProvider, 
    chainId 
  });
  setConnectedProvider(switchResponse.provider);
  await updateNetworkInfo(switchResponse.provider);
}
```

**Explanation**:

The app provides a straightforward implementation of network switching:

1. Users first connect their MetaMask wallet using the Checkout SDK's `createProvider` and `connect` methods.
2. The app retrieves and displays the current network information using `getNetworkInfo` to show users which network they're currently on.
3. The app also fetches and displays a list of supported networks using `getNetworkAllowList`.
4. Two buttons are provided to switch between networks - one for Sepolia Testnet and one for Immutable zkEVM Testnet.
5. When a user clicks either button, the app uses the `switchNetwork` method with the appropriate `chainId` to initiate the network switch.
6. After switching, the UI updates to reflect the new network information.

This implementation demonstrates how to seamlessly integrate network switching in your dApp to ensure users are on the correct network for specific operations.

## Running the App

### Prerequisites
- Node.js (v18 or later)
- pnpm package manager
- MetaMask browser extension installed
- [Immutable Hub account](https://hub.immutable.com/) for environment setup

### Setup
1. Clone the repository and navigate to the example app directory:
```bash
git clone https://github.com/immutable/ts-immutable-sdk.git
cd ts-immutable-sdk/examples/checkout/sdk-switch-network-with-nextjs
```

2. Install dependencies:
```bash
pnpm install
```

3. Create an environment file:
```bash
cp .env.example .env
```

4. Add your publishable API key from Immutable Hub to the `.env` file:
```
NEXT_PUBLIC_PUBLISHABLE_KEY=your_publishable_key_here
```

### Running Locally
Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Summary
This example demonstrates how to implement network switching between Sepolia Testnet and Immutable zkEVM Testnet using the Immutable Checkout SDK. The implementation is straightforward, requiring just a few API calls to enable users to seamlessly switch networks directly from your application's UI. This functionality is essential for blockchain applications that need to guide users to the correct network for specific operations. 