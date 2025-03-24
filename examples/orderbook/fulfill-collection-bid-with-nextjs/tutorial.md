<div class="display-none">

# Fulfill Collection Bid with Next.js

This example app demonstrates how to fulfill collection bids for both ERC721 and ERC1155 tokens using the Immutable Orderbook SDK with Next.js. The app shows how sellers can view active collection bids and fulfill them with specific tokens they own.

</div>

<div class="button-component">

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/orderbook/fulfill-collection-bid-with-nextjs)

</div>

## Features Overview

- **Fulfill Collection Bid for ERC721**: Demonstrates how to fulfill a collection bid for an ERC721 token by specifying a token ID.
- **Fulfill Collection Bid for ERC1155**: Shows how to fulfill a collection bid for an ERC1155 token by specifying a token ID and the amount of units to fulfill.

## SDK Integration Details

### Feature: Fulfill Collection Bid for ERC721

**Feature Name**: Allow sellers to fulfill ERC721 collection bids by providing a specific token ID that matches the collection.

**Source Code**: [Source code file](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/orderbook/fulfill-collection-bid-with-nextjs/src/app/fulfill-collection-bid-with-erc721/page.tsx)

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

The code above fulfills an ERC721 collection bid by:

1. Calling the `fulfillOrder` method from the Orderbook SDK with the collection bid ID, the seller's wallet address, any taker ecosystem fees (marketplace fees), the amount (always '1' for ERC721), and the token ID to fulfill.
2. The method returns a set of actions that need to be executed.
3. For each transaction action, the code builds the transaction and sends it using the signer obtained through Passport.
4. The transaction is confirmed by waiting for 1 block confirmation.

### Feature: Fulfill Collection Bid for ERC1155

**Feature Name**: Allow sellers to fulfill ERC1155 collection bids by providing a specific token ID and amount of units.

**Source Code**: [Source code file](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/orderbook/fulfill-collection-bid-with-nextjs/src/app/fulfill-collection-bid-with-erc1155/page.tsx)

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

The code for fulfilling an ERC1155 collection bid is similar to the ERC721 version but with a key difference:

1. It accepts an additional `amount` parameter which specifies how many units of the token to fulfill.
2. The implementation calls the same `fulfillOrder` method but passes the specified amount instead of always using '1'.
3. This allows partial fulfillment of ERC1155 collection bids, where the seller can choose to sell only some of the requested units.
4. Like with ERC721, the resulting actions are processed and the transactions are submitted and confirmed.

## Running the App

### Prerequisites

1. Node.js and pnpm installed on your system
2. Immutable Hub Account — [Set up your environment on Immutable Hub](https://hub.immutable.com/)
3. Configure your publishable key, client ID, and redirect URIs in the Hub Developer Dashboard

### Step-by-step Instructions

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

4. Set up environment variables by creating a `.env.local` file with:
   ```
   NEXT_PUBLIC_PUBLISHABLE_KEY=your_publishable_key
   NEXT_PUBLIC_CLIENT_ID=your_client_id
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

6. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

7. To view the ERC721 collection bid fulfillment example, go to:
   ```
   http://localhost:3000/fulfill-collection-bid-with-erc721
   ```

8. To view the ERC1155 collection bid fulfillment example, go to:
   ```
   http://localhost:3000/fulfill-collection-bid-with-erc1155
   ```

## Summary

This example demonstrates how to fulfill collection bids for both ERC721 and ERC1155 tokens using the Immutable Orderbook SDK. Collection bids enable buyers to place bids for any token within a collection, and sellers can fulfill these bids with specific tokens they own.

Key takeaways:
- Collection bids allow buyers to bid on collections rather than specific tokens
- Fulfilling a collection bid requires specifying the exact token ID to sell
- For ERC1155 tokens, sellers can specify the quantity to fulfill
- The Orderbook SDK handles generating the necessary blockchain transactions
- Passport integration provides a seamless wallet connection experience 