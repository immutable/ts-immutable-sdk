<div class="display-none">

# Wallet Balance with NextJS

</div>

This example app demonstrates how to integrate the Immutable Checkout SDK with a NextJS application to retrieve wallet balances. It showcases how to connect to MetaMask, fetch token balances, and display token information.

<div class="button-component">

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/checkout/sdk-wallet-balance-with-nextjs) <span class="button-component-arrow">→</span>

</div>

## Features Overview

- **MetaMask Wallet Connection**: Connect to a MetaMask wallet and retrieve the wallet address
- **Token Allow List**: Fetch the list of supported tokens on the network
- **Token Information**: Retrieve detailed information about specific tokens
- **Wallet Balances**: Display wallet balances for multiple tokens including:
  - All token balances for a wallet
  - Native token balance
  - Specific token balance

## SDK Integration Details

### MetaMask Wallet Connection

Connects to the user's MetaMask wallet and retrieves their address.

```typescript title="Connect MetaMask" manualLink="https://github.com/immutable/ts-immutable-sdk/blob/main/examples/checkout/sdk-wallet-balance-with-nextjs/src/app/wallet-balance-with-metamask/page.tsx"
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

  setConnectedProvider(connectRes.provider);

  // Check if the provider if a BrowserProvider
  const isConnectedRes = await checkoutSDK.checkIsWalletConnected({
    provider: providerRes.provider
  });
  setWalletAddress(isConnectedRes.walletAddress);
}
```

This code establishes a connection with MetaMask. First, it creates a provider using the `createProvider` method with the MetaMask wallet provider name. It then verifies the provider is a valid BrowserProvider, connects to it with `requestWalletPermissions` set to true, and retrieves the wallet address. The connection status and wallet address are stored in state variables.

### Token Allow List

Fetches the list of tokens supported by the Checkout SDK on the currently connected network.

```typescript title="Get Token Allow List" manualLink="https://github.com/immutable/ts-immutable-sdk/blob/main/examples/checkout/sdk-wallet-balance-with-nextjs/src/app/wallet-balance-with-metamask/page.tsx"
// Get the list of supported tokens
const tokenType = await checkout.TokenFilterTypes.ALL;
const chainId = Number((await connectRes.provider.getNetwork()).chainId) as checkout.ChainId ?? checkout.ChainId.IMTBL_ZKEVM_TESTNET
const tokenAllowList = await checkoutSDK.getTokenAllowList({ type: tokenType, chainId });
```

This code retrieves a list of all supported tokens on the connected network. It first gets the current chain ID from the provider, then calls `getTokenAllowList` with parameters specifying to include all token types. The resulting list is stored in a state variable and displayed in a dropdown menu for user selection.

### Token Information

Retrieves detailed information (name, symbol, decimals, etc.) for a specific token contract address.

```typescript title="Get Token Info" manualLink="https://github.com/immutable/ts-immutable-sdk/blob/main/examples/checkout/sdk-wallet-balance-with-nextjs/src/app/wallet-balance-with-metamask/page.tsx"
// Get the details of a particular token
const tokenAddress = "0xD61ffaece032CA6E0C469820707d677Feb4BEDD5";
const tokenInfo = await checkoutSDK.getTokenInfo({ provider: connectedProvider, tokenAddress });
```

This code fetches detailed information about a specific token using its address. The `getTokenInfo` method returns data such as the token's name, symbol, decimals, and icon URL. This information is displayed in the UI to give users details about the specific token.

### Get All Balances

Retrieves the balances for all supported tokens held by the connected wallet.

```typescript title="Get All Balances" manualLink="https://github.com/immutable/ts-immutable-sdk/blob/main/examples/checkout/sdk-wallet-balance-with-nextjs/src/app/wallet-balance-with-metamask/page.tsx"
// Get all token balances of the wallet
const chainId = Number((await connectedProvider.provider.getNetwork()).chainId) as checkout.ChainId ?? checkout.ChainId.IMTBL_ZKEVM_TESTNET
const allBalancesResponse = await checkoutSDK.getAllBalances({ provider: connectedProvider, walletAddress, chainId });
```

This code retrieves the balances of all tokens for the connected wallet. It first gets the current chain ID, then uses the `getAllBalances` method which returns an array of token balances. Each balance includes the token information, the balance as a BigNumber, and a formatted balance string. The results are displayed in a table.

### Get Token Balance

Retrieves the balance for a single, specific token held by the connected wallet.

```typescript title="Get Specific Token Balance" manualLink="https://github.com/immutable/ts-immutable-sdk/blob/main/examples/checkout/sdk-wallet-balance-with-nextjs/src/app/wallet-balance-with-metamask/page.tsx"
// Get the balance of a particular token
const tokenAddress = '0xD61ffaece032CA6E0C469820707d677Feb4BEDD5'
const balanceResponse = await checkoutSDK.getBalance({ provider: connectedProvider, walletAddress, tokenAddress });
```

This code fetches the balance of a specific token for the connected wallet. The `getBalance` method takes the provider, wallet address, and token address as parameters and returns the token information along with the balance. The result is displayed in a dedicated table.

### Get Native Token Balance

Retrieves the balance of the network's native token (e.g., ETH, IMX) for the connected wallet.

```typescript title="Get Native Token Balance" manualLink="https://github.com/immutable/ts-immutable-sdk/blob/main/examples/checkout/sdk-wallet-balance-with-nextjs/src/app/wallet-balance-with-metamask/page.tsx"
// Get the balance of the native token
const balanceResponse = await checkoutSDK.getBalance({ provider: connectedProvider, walletAddress });
```

This code retrieves the balance of the native token (e.g., ETH or IMX) for the connected wallet. Notice that the `getBalance` method is called without a token address, which defaults to fetching the native token balance. The result is displayed in its own table section.

## Running the App

### Prerequisites
- Node.js installed on your machine
- MetaMask extension installed in your browser
- An account on [Immutable Hub](https://hub.immutable.com/) to get your API key

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

3. Create a `.env` file based on the provided `.env.example` and add your publishable API key:
   ```bash
   cp .env.example .env
   ```
   Then edit the `.env` file to add your publishable API key from Immutable Hub:
   ```
   NEXT_PUBLIC_PUBLISHABLE_KEY=your_publishable_key_here
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

5. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

6. Click on "Wallet Balance with MetaMask" and then "Connect MetaMask" to see your wallet balances

## Summary

This example app demonstrates how to use the Immutable Checkout SDK to connect to a MetaMask wallet and retrieve various token balances. It shows how to get a list of supported tokens, fetch token details, and display wallet balances, including all tokens, specific tokens, and the native token.

Key takeaways:
- The Checkout SDK provides simple methods to connect to popular wallets like MetaMask
- You can easily retrieve token information and balances with a few SDK calls
- The SDK handles the complexity of formatting token balances with proper decimals
- NextJS provides a robust framework for building user interfaces with these SDK features 