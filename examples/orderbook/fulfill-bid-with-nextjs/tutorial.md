# Fulfill Bid with Next.js Tutorial

## Introduction
This example application demonstrates how to fulfill bids using the Immutable Orderbook SDK in a Next.js environment. It shows how to fulfill both ERC721 and ERC1155 token bids. The app connects to the Immutable Sandbox environment and integrates with Passport for wallet connection and authentication.

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/orderbook/fulfill-bid-with-nextjs)

## Features Overview
- Fulfill ERC721 token bids
- Fulfill ERC1155 token bids (with partial fulfillment support)
- Apply taker ecosystem fees during bid fulfillment

## SDK Integration Details

### Fulfill ERC721 Bid
**[Fulfill ERC721 Bid](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/orderbook/fulfill-bid-with-nextjs/src/app/fulfill-bid-with-erc721/page.tsx)**: Fulfill an existing bid for an ERC721 token.

**Implementation**:
```typescript
const fulfillERC721Bid = async (bidID: string) => {
  const { actions } = await orderbookSDK.fulfillOrder(
    bidID,
    accountsState[0],
    takerEcosystemFeeRecipient != "" ? [{
      recipientAddress: takerEcosystemFeeRecipient, // Replace address with your own marketplace address
      amount: takerEcosystemFeeAmount, // Insert taker ecosystem/marketplace fee here
    }] : [],
  );

  for (const action of actions) {
    if (action.type === orderbook.ActionType.TRANSACTION && signer) {
      const builtTx = await action.buildTransaction();
      await (await signer.sendTransaction(builtTx)).wait(1);
    }
  }
};
```

**Explanation**: The `fulfillERC721Bid` function uses the Orderbook SDK's `fulfillOrder` method to fulfill an existing bid. It takes the bid ID and the current user's address as parameters, along with any optional taker ecosystem fees. The function then executes any required actions, such as smart contract transactions, using the connected wallet's signer.

### Fulfill ERC1155 Bid
**[Fulfill ERC1155 Bid](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/orderbook/fulfill-bid-with-nextjs/src/app/fulfill-bid-with-erc1155/page.tsx)**: Fulfill an existing bid for an ERC1155 token, with support for partial fulfillment.

**Implementation**:
```typescript
const fulfillERC1155Bid = async (
  bidID: string,
  unitsToFill?: string, // Number of units to fill
) => {
  const { actions } = await orderbookSDK.fulfillOrder(
    bidID,
    accountsState[0],
    takerEcosystemFeeRecipient != "" ? [{
      recipientAddress: takerEcosystemFeeRecipient, // Replace address with your own marketplace address
      amount: takerEcosystemFeeAmount, // Insert taker ecosystem/marketplace fee here
    }] : [],
    unitsToFill,
  );

  for (const action of actions) {
    if (action.type === orderbook.ActionType.TRANSACTION && signer) {
      const builtTx = await action.buildTransaction();
      await (await signer.sendTransaction(builtTx)).wait(1);
    }
  }
};
```

**Explanation**: The `fulfillERC1155Bid` function is similar to the ERC721 version but includes support for partial fulfillment through the `unitsToFill` parameter. This allows sellers to fulfill only a portion of the bid for ERC1155 tokens, which can have multiple units. The function also supports taker ecosystem fees and executes the necessary transactions to complete the bid fulfillment.

## Running the App

### Prerequisites
- Node.js installed on your machine
- Valid client ID and publishable API key from [Immutable Hub](https://hub.immutable.com/)
- Existing bids in the system for ERC721 or ERC1155 tokens

### Steps to Run Locally
1. Install the dependencies:
   ```bash
   pnpm i
   ```

2. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

3. Replace the `NEXT_PUBLIC_PUBLISHABLE_KEY` and `NEXT_PUBLIC_CLIENT_ID` with your own values from the Immutable Hub.

4. Run the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser and you'll be navigated to the home screen.

### Fulfilling an ERC721 Bid
1. Click on the "Fulfill bid - Complete fulfillment with ERC721" button
2. Connect your Passport wallet
3. Filter bids based on the NFT Contract Address
4. Click on the "Submit" button to view available bids
5. Click on the "Fill Bid" button next to a bid you want to fulfill
6. Approve the settlement contract to transfer tokens on your behalf
7. Wait for the transaction to be confirmed

### Fulfilling an ERC1155 Bid
1. Click on the "Fulfill bid - Partial fulfillment with ERC1155" button
2. Connect your Passport wallet
3. Filter bids based on the NFT Contract Address
4. Provide the number of units you want to fulfill
5. Click on the "Submit" button to view available bids
6. Click on the "Fill Bid" button next to a bid you want to fulfill
7. Approve the settlement contract to transfer tokens on your behalf
8. Wait for the transaction to be confirmed

## Summary
This example demonstrates how to fulfill bids for both ERC721 and ERC1155 tokens using the Immutable Orderbook SDK. It shows how to connect to Passport for wallet authentication, query available bids, and execute the necessary transactions to fulfill bids. The application also supports taker ecosystem fees and partial fulfillment for ERC1155 tokens, providing a comprehensive example of the bid fulfillment process. 