<div class="display-none">

# Wallet Balance with MetaMask - Next.js Example

This example application demonstrates how to use the Immutable Checkout SDK to connect to a MetaMask wallet and retrieve token balances. The app showcases how to fetch token information, check individual token balances, and list all token balances for a connected wallet.

</div>

<div class="button-component">

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/checkout/sdk-wallet-balance-with-nextjs)

</div>

## Features Overview

- Fetching the list of supported tokens (token allow list)
- Retrieving all token balances for a connected wallet
- Getting specific token information by token address
- Checking balance of a specific token
- Retrieving native token balance

## SDK Integration Details

### Fetching Supported Tokens (Token Allow List)
**Feature Name**: Retrieving the list of supported tokens to display in the UI.

**Source Code**: [Source code file](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/checkout/sdk-wallet-balance-with-nextjs/src/app/wallet-balance-with-metamask/page.tsx)

**Implementation**:
```typescript
// Get the list of supported tokens
const tokenType = await checkout.TokenFilterTypes.ALL;
const chainId = Number((await connectRes.provider.getNetwork()).chainId) as checkout.ChainId ?? checkout.ChainId.IMTBL_ZKEVM_TESTNET
const tokenAllowList = await checkoutSDK.getTokenAllowList({ type: tokenType, chainId });
```

**Explanation**: This code retrieves all supported tokens on the current chain. The `TokenFilterTypes.ALL` parameter indicates that all types of tokens should be included in the results. The chainId is determined from the connected provider's network, with a fallback to the Immutable zkEVM Testnet if not available.

### Retrieving All Token Balances
**Feature Name**: Fetching all token balances for a connected wallet address.

**Source Code**: [Source code file](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/checkout/sdk-wallet-balance-with-nextjs/src/app/wallet-balance-with-metamask/page.tsx)

**Implementation**:
```typescript
// Get all token balances of the wallet
const chainId = Number((await connectedProvider.provider.getNetwork()).chainId) as checkout.ChainId ?? checkout.ChainId.IMTBL_ZKEVM_TESTNET
const allBalancesResponse = await checkoutSDK.getAllBalances({ provider: connectedProvider, walletAddress, chainId });
```

**Explanation**: This code gets all token balances for the connected wallet address on the current chain. It uses the `getAllBalances` method from the Checkout SDK, which requires a provider, wallet address, and chain ID. The response includes both the raw balance value and a formatted balance value for each token.

### Getting Token Information
**Feature Name**: Retrieving detailed information about a specific token.

**Source Code**: [Source code file](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/checkout/sdk-wallet-balance-with-nextjs/src/app/wallet-balance-with-metamask/page.tsx)

**Implementation**:
```typescript
// Get the details of a particular token
const tokenAddress = "0xD61ffaece032CA6E0C469820707d677Feb4BEDD5";
const tokenInfo = await checkoutSDK.getTokenInfo({ provider: connectedProvider, tokenAddress });
```

**Explanation**: This code fetches detailed information about a specific token using its contract address. The `getTokenInfo` method returns token details including name, symbol, decimals, and icon URL if available.

### Checking Specific Token Balance
**Feature Name**: Retrieving the balance of a specific token for a connected wallet.

**Source Code**: [Source code file](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/checkout/sdk-wallet-balance-with-nextjs/src/app/wallet-balance-with-metamask/page.tsx)

**Implementation**:
```typescript
// Get the balance of a particular token
const tokenAddress = '0xD61ffaece032CA6E0C469820707d677Feb4BEDD5'
const balanceResponse = await checkoutSDK.getBalance({ provider: connectedProvider, walletAddress, tokenAddress });
```

**Explanation**: This code checks the balance of a specific ERC20 token using its contract address. The method requires the provider, wallet address, and token address. The response includes both the raw balance and a formatted balance that accounts for the token's decimal places.

### Retrieving Native Token Balance
**Feature Name**: Checking the native token (e.g., ETH) balance for a connected wallet.

**Source Code**: [Source code file](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/checkout/sdk-wallet-balance-with-nextjs/src/app/wallet-balance-with-metamask/page.tsx)

**Implementation**:
```typescript
// Get the balance of the native token
const balanceResponse = await checkoutSDK.getBalance({ provider: connectedProvider, walletAddress });
```

**Explanation**: This code retrieves the balance of the native token (such as ETH) for the connected wallet. Note that no token address is provided, which tells the SDK to fetch the native token balance. As with the ERC20 token balance, both raw and formatted balances are returned.

## Running the App

### Prerequisites
- Node.js and pnpm installed
- MetaMask browser extension
- An Immutable Hub account for environment setup ([Immutable Hub](https://hub.immutable.com/))

### Steps to Run Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/immutable/ts-immutable-sdk.git
   cd ts-immutable-sdk/examples/checkout/sdk-wallet-balance-with-nextjs
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create a `.env` file by copying the example:
   ```bash
   cp .env.example .env
   ```

4. Add your Immutable publishable key to the `.env` file:
   ```
   NEXT_PUBLIC_PUBLISHABLE_KEY=your_publishable_key_from_hub
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser with MetaMask installed

7. Click on "Wallet Balance with MetaMask" and then "Connect MetaMask" to interact with the app

## Summary

This example demonstrates how to use the Immutable Checkout SDK to interact with a user's wallet and retrieve token balances. Key functionality includes connecting to MetaMask, fetching supported tokens, retrieving token information, and checking token balances.

The application showcases proper error handling and provides a clean UI for displaying token details and balances, making it a great starting point for developers who need to implement wallet balance functionality in their applications. 