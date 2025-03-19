# Wallet Balance with Next.js Tutorial

## Introduction
This example app demonstrates how to retrieve and display token balances using the Immutable Checkout SDK integrated with a Next.js application. The app showcases how to connect to MetaMask, view token balances, and retrieve token details such as name, symbol, and decimals.

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/checkout/sdk-wallet-balance-with-nextjs)

## Features Overview
- Token balance retrieval (both native and ERC-20 tokens)
- Getting all balances for a connected wallet
- Retrieving token information (name, symbol, decimals)
- Getting the list of supported tokens
- Connecting with MetaMask

## SDK Integration Details

### **Token Allow List**: [Retrieving the list of supported tokens](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/checkout/sdk-wallet-balance-with-nextjs/src/app/wallet-balance-with-metamask/page.tsx#L56-L60)
The application retrieves the list of supported tokens on the current network:

```typescript
const tokenType = await checkout.TokenFilterTypes.ALL;
const chainId = Number((await connectRes.provider.getNetwork()).chainId) as checkout.ChainId ?? checkout.ChainId.IMTBL_ZKEVM_TESTNET
const tokenAllowList = await checkoutSDK.getTokenAllowList({ type: tokenType, chainId });
```

This code retrieves all supported tokens for the connected chain, allowing the app to display them in a dropdown selector where users can view token details.

### **Retrieving All Balances**: [Getting all token balances for a wallet](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/checkout/sdk-wallet-balance-with-nextjs/src/app/wallet-balance-with-metamask/page.tsx#L76-L79)
Once connected to a wallet, the app can retrieve all balances at once:

```typescript
const chainId = Number((await connectedProvider.provider.getNetwork()).chainId) as checkout.ChainId ?? checkout.ChainId.IMTBL_ZKEVM_TESTNET
const allBalancesResponse = await checkoutSDK.getAllBalances({ provider: connectedProvider, walletAddress, chainId });
```

This returns an array of token balances that can be displayed in the UI. The app shows both the raw balance (in hex) and the formatted balance with the correct number of decimals.

### **Token Information Retrieval**: [Getting token details](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/checkout/sdk-wallet-balance-with-nextjs/src/app/wallet-balance-with-metamask/page.tsx#L92-L95)
The app demonstrates how to get detailed information about a specific token:

```typescript
const tokenAddress = "0xD61ffaece032CA6E0C469820707d677Feb4BEDD5";
const tokenInfo = await checkoutSDK.getTokenInfo({ provider: connectedProvider, tokenAddress });
```

This retrieves the token's name, symbol, decimals, and icon URL, which are essential for properly displaying token information.

### **Specific Token Balance**: [Getting balance of a particular token](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/checkout/sdk-wallet-balance-with-nextjs/src/app/wallet-balance-with-metamask/page.tsx#L105-L108)
The app shows how to get the balance for a specific token:

```typescript
const tokenAddress = '0xD61ffaece032CA6E0C469820707d677Feb4BEDD5'
const balanceResponse = await checkoutSDK.getBalance({ provider: connectedProvider, walletAddress, tokenAddress });
```

This returns the balance along with the token information for a specific ERC-20 token.

### **Native Token Balance**: [Getting the native token balance](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/checkout/sdk-wallet-balance-with-nextjs/src/app/wallet-balance-with-metamask/page.tsx#L118-L120)
The app also demonstrates how to retrieve the native token (ETH) balance:

```typescript
const balanceResponse = await checkoutSDK.getBalance({ provider: connectedProvider, walletAddress });
```

When no token address is provided, the SDK automatically returns the native token balance.

## Running the App

### Prerequisites
- Node.js v18 or later
- pnpm installed ([Installation guide](https://pnpm.io/installation))
- Setup an Immutable API key from [Immutable Hub](https://hub.immutable.com/)

### Steps to Run the App
1. Clone the repository:
   ```bash
   git clone https://github.com/immutable/ts-immutable-sdk.git
   cd ts-immutable-sdk/examples/checkout/sdk-wallet-balance-with-nextjs
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Copy the environment example file and add your API key:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file and add your publishable API key from Immutable Hub:
   ```
   NEXT_PUBLIC_PUBLISHABLE_KEY=your_publishable_key_here
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser
   
6. Click on "Wallet Balance with MetaMask" and then connect your MetaMask wallet

## Summary
This example demonstrates how the Immutable Checkout SDK makes it simple to retrieve and display token balances in a Next.js application. By using the SDK's methods for connecting to wallets, fetching token information, and retrieving balances, developers can quickly build interfaces that display users' token holdings on Immutable zkEVM chains.

Key takeaways include:
- Simple wallet connection with MetaMask
- Straightforward retrieval of both native and ERC-20 token balances
- Easy access to token metadata including name, symbol, and decimals
- Support for retrieving all balances at once or querying specific tokens 