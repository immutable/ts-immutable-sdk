<div class="display-none">

# Wallet Balance with MetaMask using Next.js

</div>

This example app demonstrates how to display wallet token balances using the Immutable Checkout SDK with a Next.js application. The app shows how to fetch wallet balances for native tokens, specific ERC-20 tokens, as well as retrieve token information like name, symbol, and decimals.

<div class="button-component">

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/checkout/sdk-wallet-balance-with-nextjs) <span class="button-component-arrow">→</span>

</div>

#### Features Overview
- Retrieving wallet balance of connected MetaMask account
- Fetching all token balances for a user's wallet
- Getting token information (name, symbol, decimals)
- Fetching balance for a specific token
- Fetching native token balance

#### SDK Integration Details

**Feature Name**: Wallet Balance with MetaMask
**Source Code**: [source code file](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/checkout/sdk-wallet-balance-with-nextjs/src/app/wallet-balance-with-metamask/page.tsx)
**Implementation**:

1. **Getting Token Allow List**:
```typescript
const tokenType = await checkout.TokenFilterTypes.ALL;
const chainId = Number((await connectRes.provider.getNetwork()).chainId) as checkout.ChainId ?? checkout.ChainId.IMTBL_ZKEVM_TESTNET
const tokenAllowList = await checkoutSDK.getTokenAllowList({ type: tokenType, chainId });
```

2. **Getting All Token Balances**:
```typescript
const chainId = Number((await connectedProvider.provider.getNetwork()).chainId) as checkout.ChainId ?? checkout.ChainId.IMTBL_ZKEVM_TESTNET
const allBalancesResponse = await checkoutSDK.getAllBalances({ provider: connectedProvider, walletAddress, chainId });
```

3. **Getting Token Information**:
```typescript
const tokenAddress = "0xD61ffaece032CA6E0C469820707d677Feb4BEDD5";
const tokenInfo = await checkoutSDK.getTokenInfo({ provider: connectedProvider, tokenAddress });
```

4. **Getting Specific Token Balance**:
```typescript
const tokenAddress = '0xD61ffaece032CA6E0C469820707d677Feb4BEDD5'
const balanceResponse = await checkoutSDK.getBalance({ provider: connectedProvider, walletAddress, tokenAddress });
```

5. **Getting Native Token Balance**:
```typescript
const balanceResponse = await checkoutSDK.getBalance({ provider: connectedProvider, walletAddress });
```

**Explanation**:

This example app first connects to MetaMask, then demonstrates several ways to retrieve token balances:

1. The `getTokenAllowList` method returns a list of supported tokens on the current chain, including their name, symbol, address, and decimals.
2. `getAllBalances` retrieves balances for all tokens in the user's wallet on the specified chain.
3. `getTokenInfo` fetches detailed information for a specific token using its address.
4. `getBalance` can be used to get the balance of a specific token by providing its address.
5. When no token address is provided to `getBalance`, it returns the native token balance.

The app displays all these balances in a user-friendly table format, showing both the raw hex values and the formatted balances.

#### Running the App

Prerequisites:
- Node.js installed
- MetaMask browser extension
- [Immutable Hub](https://hub.immutable.com/) account for environment setup

Steps to run the app locally:

1. Clone the repository
2. Navigate to the example directory:
   ```bash
   cd examples/checkout/sdk-wallet-balance-with-nextjs
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Copy `.env.example` to `.env` and add your Immutable Hub publishable key:
   ```
   NEXT_PUBLIC_PUBLISHABLE_KEY=<your-publishable-key>
   ```
5. Start the development server:
   ```bash
   pnpm dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) in your browser
7. Click the "Connect MetaMask" button to connect your wallet and view your token balances

#### Summary

This example demonstrates how the Immutable Checkout SDK can be used to fetch wallet balances for both native and ERC-20 tokens. It shows developers how to retrieve token information, display formatted balances, and work with multiple tokens. This functionality is essential for any dApp that needs to display a user's token holdings or verify balances before transactions. 