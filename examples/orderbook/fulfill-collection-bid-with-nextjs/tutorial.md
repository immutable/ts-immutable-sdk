# Fulfill Collection Bid with Next.js

## Introduction
This example application demonstrates how to fulfill collection bids using the Immutable Orderbook SDK in a Next.js application. It showcases how to fulfill both ERC721 (complete) and ERC1155 (partial) collection bids using the Passport SDK for authentication and wallet connection.

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/orderbook/fulfill-collection-bid-with-nextjs)

## Features Overview
- Fulfill collection bids for ERC721 tokens
- Fulfill collection bids for ERC1155 tokens

## SDK Integration Details

### Fulfill Collection Bid for ERC721
**Feature Name**: Complete fulfillment of a collection bid for an ERC721 token.

**Source Code**: [Source Code](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/orderbook/fulfill-collection-bid-with-nextjs/src/app/fulfill-collection-bid-with-erc721/page.tsx)

**Implementation**:
```typescript
const fulfillERC721CollectionBid = async (
  collectionBidID: string,
  tokenID: string
) => {
  const { actions } = await orderbookSDK.fulfillOrder(
    collectionBidID,
    accountsState[0],
    takerEcosystemFeeRecipient != "" ? [{
      recipientAddress: takerEcosystemFeeRecipient, // Replace address with your own marketplace address
      amount: takerEcosystemFeeAmount, // Insert taker ecosystem/marketplace fee here
    }] : [],
    '1',
    tokenID,
  );

  for (const action of actions) {
    if (action.type === orderbook.ActionType.TRANSACTION && signer) {
      const builtTx = await action.buildTransaction();
      await (await signer.sendTransaction(builtTx)).wait(1);
    }
  }
}
```

**Explanation**:
This function fulfills a collection bid for an ERC721 token. The implementation follows these key steps:
1. Call the Orderbook SDK's `fulfillOrder` method with the collection bid ID, user's wallet address, optional taker ecosystem fees, the amount (which is always '1' for ERC721), and the specific token ID to fulfill.
2. The SDK returns a set of actions that need to be performed to complete the trade.
3. For each action that requires a blockchain transaction, it builds the transaction using the `buildTransaction` method and sends it using the wallet's signer.
4. The transaction is then awaited to ensure it completes successfully.

### Fulfill Collection Bid for ERC1155
**Feature Name**: Partial fulfillment of a collection bid for an ERC1155 token.

**Source Code**: [Source Code](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/orderbook/fulfill-collection-bid-with-nextjs/src/app/fulfill-collection-bid-with-erc1155/page.tsx)

**Implementation**:
```typescript
const fulfillERC1155CollectionBid = async (
  collectionBidID: string,
  amount: string,
  tokenId: string,
) => {
  const { actions } = await orderbookSDK.fulfillOrder(
    collectionBidID,
    accountsState[0],
    takerEcosystemFeeRecipient != "" ? [{
      recipientAddress: takerEcosystemFeeRecipient, // Replace address with your own marketplace address
      amount: takerEcosystemFeeAmount, // Insert taker ecosystem/marketplace fee here
    }] : [],
    amount,
    tokenId,
  );

  for (const action of actions) {
    if (action.type === orderbook.ActionType.TRANSACTION && signer) {
      const builtTx = await action.buildTransaction();
      await (await signer.sendTransaction(builtTx)).wait(1);
    }
  }
}
```

**Explanation**:
This function fulfills a collection bid for an ERC1155 token. The key difference from ERC721 is that ERC1155 tokens are fungible and can be partially fulfilled. The implementation follows these steps:
1. Call the Orderbook SDK's `fulfillOrder` method with the collection bid ID, user's wallet address, optional taker ecosystem fees, the amount of tokens to fulfill (which can be any quantity for ERC1155), and the specific token ID.
2. Similar to the ERC721 flow, the SDK returns a set of actions.
3. For transaction actions, it builds and sends the transaction using the wallet's signer, then waits for confirmation.
4. The user can specify how many units they want to fulfill, making this ideal for partial fulfillments of collection bids.

## Running the App

### Prerequisites
- Node.js (version 16 or higher)
- pnpm
- An [Immutable Hub account](https://hub.immutable.com) for environment setup

### Steps to Run Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/immutable/ts-immutable-sdk.git
   ```

2. Navigate to the example directory:
   ```bash
   cd ts-immutable-sdk/examples/orderbook/fulfill-collection-bid-with-nextjs
   ```

3. Install dependencies:
   ```bash
   pnpm install
   ```

4. Create a `.env.local` file in the root directory with your environment variables:
   ```
   NEXT_PUBLIC_PASSPORT_CLIENT_ID=your-passport-client-id
   NEXT_PUBLIC_ORDERBOOK_API_URL=your-orderbook-api-url
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

6. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Summary
This example demonstrates how to integrate the Immutable Orderbook SDK into a Next.js application to fulfill collection bids for both ERC721 and ERC1155 tokens. Key features include:

- Using Passport SDK for wallet authentication
- Fetching active collection bids from the Orderbook
- Fulfilling collection bids for ERC721 tokens (complete fulfillment)
- Fulfilling collection bids for ERC1155 tokens (partial fulfillment)
- Optional marketplace/ecosystem fees integration

By following this example, developers can understand how to implement collection bid fulfillment in their own applications, providing a seamless trading experience for users. 