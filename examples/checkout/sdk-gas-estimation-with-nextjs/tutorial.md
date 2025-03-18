# Gas Estimation with Checkout SDK

## Introduction
This example app demonstrates how to use the Immutable Checkout SDK to estimate gas fees for different transaction types. It shows how to connect to MetaMask and use the SDK's gas estimation features to display estimated costs for swap and bridge-to-L2 transactions in a user-friendly Next.js application.

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/checkout/sdk-gas-estimation-with-nextjs)

## Features Overview
- Gas estimation for Swap transactions
- Gas estimation for Bridge-to-L2 transactions
- MetaMask wallet connection

## SDK Integration Details

### **Gas Estimation**: [Estimating gas fees for different transaction types](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/checkout/sdk-gas-estimation-with-nextjs/src/app/gas-estimation-with-metamask/page.tsx#L31-L36)
#### Implementation
```typescript
// Get gas estimate for Swap type of transaction
const swapEstimate = await checkoutSDK.gasEstimate({ gasEstimateType: checkout.GasEstimateType.SWAP });
// Get gas estimate for Bridge type of transaction
const bridgeEstimate = await checkoutSDK.gasEstimate({ gasEstimateType: checkout.GasEstimateType.BRIDGE_TO_L2 });
```

#### Explanation
The Checkout SDK provides a `gasEstimate` method that allows you to estimate gas fees for different transaction types. In this example, the app estimates fees for both Swap and Bridge-to-L2 transactions by specifying the transaction type using the `GasEstimateType` enum. The results provide detailed fee breakdowns including total fees, approval fees, bridge fees, and more, all denominated in the appropriate token.

### **Wallet Connection**: [Connecting to MetaMask wallet](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/checkout/sdk-gas-estimation-with-nextjs/src/app/gas-estimation-with-metamask/page.tsx#L21-L31)
#### Implementation
```typescript
// Create a provider given one of the default wallet provider names
const walletProviderName = checkout.WalletProviderName.METAMASK;
const providerRes = await checkoutSDK.createProvider({
  walletProviderName,
});

// Pass through requestWalletPermissions to request the user's wallet permissions
await checkoutSDK.connect({
  provider: providerRes.provider,
  requestWalletPermissions: true,
});
```

#### Explanation
The app demonstrates connecting to MetaMask by first creating a provider using the `createProvider` method with the `METAMASK` wallet provider name. It then establishes a connection using the `connect` method, requesting wallet permissions from the user. This process is required before interacting with the wallet and performing gas estimations.

### **Displaying Gas Estimates**: [Rendering fee details in a user-friendly format](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/checkout/sdk-gas-estimation-with-nextjs/src/app/gas-estimation-with-metamask/page.tsx#L69-L96)
#### Implementation
```typescript
<Table.Row>
  <Table.Cell><b>Swap Gas Estimate</b></Table.Cell>
  <Table.Cell>
    {swapGasEstimate ? (
      <>
        <div><b>Total Fees:</b> {swapGasEstimate.fees.totalFees ? hexToDecimal(toBeHex(swapGasEstimate.fees.totalFees)) : 'N/A'}</div>
        <div><b>Token:</b> {swapGasEstimate.fees.token?.name} ({swapGasEstimate.fees.token?.symbol})</div>
      </>
    ) : ' (not estimated)'}
  </Table.Cell>
</Table.Row>
<Table.Row>
  <Table.Cell><b>Bridge to L2 Gas Estimate</b></Table.Cell>
  <Table.Cell>
    {bridgeGasEstimate ? (
      <>
        <div><b>Source Chain Gas:</b> {hexToDecimal(toBeHex(bridgeGasEstimate.fees.sourceChainGas))}</div>
        <div><b>Approval Fee:</b> {hexToDecimal(toBeHex(bridgeGasEstimate.fees.approvalFee))}</div>
        <div><b>Bridge Fee:</b> {hexToDecimal(toBeHex(bridgeGasEstimate.fees.bridgeFee))}</div>
        <div><b>IMTBL Fee:</b> {hexToDecimal(toBeHex(bridgeGasEstimate.fees.imtblFee))}</div>
        <div><b>Total Fees:</b> {hexToDecimal(toBeHex(bridgeGasEstimate.fees.totalFees))}</div>
        <div><b>Token:</b> {bridgeGasEstimate.token?.name} ({bridgeGasEstimate.token?.symbol})</div>
      </>
    ) : ' (not estimated)'}
  </Table.Cell>
</Table.Row>
```

#### Explanation
The app presents the gas estimation results in a well-structured table, formatting the numeric values and providing a clear breakdown of the different fee components. The implementation uses a utility function `hexToDecimal` to convert hexadecimal values to decimal format for better readability. The display adapts to show different information based on the type of transaction estimated.

## Running the App

### Prerequisites
- Node.js 16 or higher
- pnpm
- [Immutable Hub account](https://hub.immutable.com/) for environment setup

### Steps to Run Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/immutable/ts-immutable-sdk.git
   cd ts-immutable-sdk
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Navigate to the example app directory:
   ```bash
   cd examples/checkout/sdk-gas-estimation-with-nextjs
   ```

4. Copy the environment file and configure it (if required):
   ```bash
   cp .env.example .env
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

6. Open your browser and navigate to http://localhost:3000

## Summary
This example demonstrates how to use the Immutable Checkout SDK's gas estimation capabilities to provide users with transparent fee information before completing transactions. The app shows how to estimate fees for both Swap and Bridge-to-L2 transaction types and presents the information in a user-friendly format. This functionality is crucial for improving user experience by allowing users to understand transaction costs before proceeding.

Key takeaways include:
- How to connect to MetaMask using the Checkout SDK
- How to request gas estimates for different transaction types
- How to parse and display gas estimation data in a user interface 