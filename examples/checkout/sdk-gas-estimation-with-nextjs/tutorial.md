# Gas Estimation with Next.js

## Introduction
This example app demonstrates how to use the Immutable Checkout SDK to estimate gas fees for different types of transactions (swap and bridge to L2) on the Immutable zkEVM network. The app uses Next.js and MetaMask for wallet connectivity, providing users with a practical implementation of gas estimation capabilities offered by the Checkout SDK.

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/checkout/sdk-gas-estimation-with-nextjs)

## Features Overview
- Gas estimation for swap transactions
- Gas estimation for bridge to L2 transactions

## SDK Integration Details

### Gas Estimation for Transactions
**Feature Name**: Gas Estimation with MetaMask

**Source Code**: [source code file](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/checkout/sdk-gas-estimation-with-nextjs/src/app/gas-estimation-with-metamask/page.tsx)

**Implementation**:
```typescript
// Get gas estimate for Swap type of transaction
const swapEstimate = await checkoutSDK.gasEstimate({ gasEstimateType: checkout.GasEstimateType.SWAP });

// Get gas estimate for Bridge type of transaction
const bridgeEstimate = await checkoutSDK.gasEstimate({ gasEstimateType: checkout.GasEstimateType.BRIDGE_TO_L2 });
```

**Explanation**:
The application demonstrates how to estimate gas fees for different transaction types using the Checkout SDK:

1. First, the app connects to MetaMask using the Checkout SDK's provider and connect methods.
2. Then it uses the `gasEstimate()` method with different `gasEstimateType` parameters to get gas estimates for:
   - Swap transactions: This returns information about the estimated gas fees for token swaps.
   - Bridge to L2 transactions: This returns detailed information about various fees associated with bridging assets to Layer 2.
3. The estimates include detailed breakdowns of different fee components and the token in which fees will be paid.
4. The app displays these estimates in a user-friendly table format, converting hexadecimal values to decimal for better readability.

This functionality is particularly useful for dApps that want to provide users with accurate gas fee estimates before they commit to transactions, improving the user experience by setting proper expectations about transaction costs.

## Running the App

### Prerequisites
- Node.js and pnpm installed on your machine
- A MetaMask wallet with testnet funds
- An Immutable Hub account to get your publishable API key. Visit [Immutable Hub](https://hub.immutable.com) to set up your account.

### Steps to Run Locally

1. Clone the repository:
```bash
git clone https://github.com/immutable/ts-immutable-sdk.git
cd ts-immutable-sdk/examples/checkout/sdk-gas-estimation-with-nextjs
```

2. Create a `.env.local` file in the root directory with your publishable key:
```
NEXT_PUBLIC_PUBLISHABLE_KEY=your_publishable_key_from_hub
```

3. Install dependencies:
```bash
pnpm install
```

4. Start the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

6. Click on "Gas Estimation with MetaMask" link.

7. Connect your MetaMask wallet when prompted.

8. View the gas estimates for both Swap and Bridge to L2 transactions displayed in the table.

## Summary
This example demonstrates how to integrate the Immutable Checkout SDK's gas estimation functionality into a Next.js application. By implementing this feature, developers can provide users with transparent and accurate gas fee estimates before they execute transactions on the Immutable zkEVM network. This improves the user experience by setting clear expectations about transaction costs and helps users make informed decisions. 