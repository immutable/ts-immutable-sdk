<div class="display-none">

# Gas Estimation with Checkout SDK and Next.js

This example app demonstrates how to use the Immutable Checkout SDK to estimate gas fees for different types of transactions such as swaps and bridging to Layer 2.

</div>

<div class="button-component">

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/checkout/sdk-gas-estimation-with-nextjs) <span class="button-component-arrow">→</span>

</div>

## Features Overview

- Gas estimation for swap transactions
- Gas estimation for bridge to Layer 2 transactions

## SDK Integration Details

### Gas Estimation for Transactions
**Feature Name**: Using the Checkout SDK to estimate gas fees for swap and bridge transactions.

**Source Code**: [Source code file](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/checkout/sdk-gas-estimation-with-nextjs/src/app/gas-estimation-with-metamask/page.tsx)

**Implementation**:
```typescript
// Get gas estimate for Swap type of transaction
const swapEstimate = await checkoutSDK.gasEstimate({ gasEstimateType: checkout.GasEstimateType.SWAP });
// Get gas estimate for Bridge type of transaction
const bridgeEstimate = await checkoutSDK.gasEstimate({ gasEstimateType: checkout.GasEstimateType.BRIDGE_TO_L2 });
```

**Explanation**: 
The code demonstrates how to use the Checkout SDK's `gasEstimate` method to calculate estimated gas fees for different transaction types. The example shows two types of gas estimations:

1. **Swap Gas Estimation**: Calculates the estimated fees for a token swap transaction, providing total fees and token information.

2. **Bridge to L2 Gas Estimation**: Provides detailed breakdown of fees for bridging assets to Layer 2, including source chain gas, approval fee, bridge fee, IMTBL fee, and total fees.

The app displays these estimates in a table format after connecting to MetaMask, allowing users to see the estimated costs before initiating actual transactions.

## Running the App

### Prerequisites
- Node.js (version 16 or higher)
- MetaMask browser extension installed
- A [Publishable API Key from Immutable Hub](https://hub.immutable.com/)

### Setup and Run
1. Clone the repository:
   ```bash
   git clone https://github.com/immutable/ts-immutable-sdk.git
   ```

2. Navigate to the example app directory:
   ```bash
   cd ts-immutable-sdk/examples/checkout/sdk-gas-estimation-with-nextjs
   ```

3. Install dependencies:
   ```bash
   pnpm install
   ```

4. Create a `.env.local` file based on the `.env.example` file:
   ```
   NEXT_PUBLIC_PUBLISHABLE_KEY=your_publishable_key_from_hub
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

7. Click the "Gas Estimation with MetaMask" button on the homepage.

8. Click "Connect MetaMask" to connect your wallet and view the gas estimates.

## Summary

This example app demonstrates how to integrate the Immutable Checkout SDK's gas estimation functionality in a Next.js application. By using the `gasEstimate` method, developers can provide users with estimated gas fees for different transaction types, allowing for better transparency and user experience. 

The app shows how to estimate gas for both swap transactions and bridge transactions to Layer 2, and how to display these estimates in a user-friendly way. This functionality is particularly useful for applications that need to provide users with cost estimates before they commit to transactions on the blockchain. 