# Fulfill Collection Bid with Next.js

## Introduction
This example app demonstrates how to fulfill collection bids using the Immutable Orderbook SDK in a Next.js application. It showcases how sellers can fulfill collection bids (offers to buy any token in a collection) with both ERC721 and ERC1155 tokens. This example demonstrates the practical implementation of the fulfillment process, including authentication with Passport and interaction with Immutable's orderbook system.

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/orderbook/fulfill-collection-bid-with-nextjs)

## Features Overview
- **Fetch Collection Bids**: Retrieve and display active collection bids for a specific contract address
- **ERC721 Collection Bid Fulfillment**: Complete fulfillment of collection bids with ERC721 tokens
- **ERC1155 Collection Bid Fulfillment**: Partial fulfillment of collection bids with ERC1155 tokens
- **Ecosystem Fee Integration**: Support for adding custom ecosystem fees to fulfillment transactions

## SDK Integration Details

### Fetch Collection Bids
[Fetching active collection bids](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/orderbook/fulfill-collection-bid-with-nextjs/src/app/fulfill-collection-bid-with-erc721/page.tsx#L151-L180) for a specific contract address allows sellers to see what offers are available.

```typescript
const getCollectionBids = async (
  client: orderbook.Orderbook,
  buyItemContractAddress?: string
): Promise<orderbook.CollectionBid[]> => {
  try {
    setLoadingState(true);
    setLoadingText("Fetching collection bids");
    resetMsgState();

    // Get the collection bids from the orderbook
    const listResponse = await client.listCollectionBids({
      sellItemContractAddress: buyItemContractAddress,
      status: OrderStatusName.ACTIVE,
    });

    setSuccessMessageState("Collection bids fetched successfully");
    setLoadingState(false);
    return listResponse.result;
  } catch (error) {
    console.error(error);
    setErrorMessageState(JSON.stringify(error));
    setLoadingState(false);
    return [];
  }
};
```

### ERC721 Collection Bid Fulfillment
[Fulfilling a collection bid with an ERC721 token](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/orderbook/fulfill-collection-bid-with-nextjs/src/app/fulfill-collection-bid-with-erc721/page.tsx#L212-L247) allows sellers to sell a specific token from their collection.

```typescript
const fulfillERC721CollectionBid = async (
  collectionBidID: string,
  tokenID: string
) => {
  if (signer) {
    try {
      setLoadingState(true);
      setLoadingText("Fulfilling Collection Bid");
      resetMsgState();

      await orderbookSDK.fulfillCollectionBid({
        collectionBidId: collectionBidID,
        tokenId: tokenID,
        signer,
        takerFees: takerEcosystemFeeRecipient && takerEcosystemFeeAmount
          ? [{
            recipientAddress: takerEcosystemFeeRecipient,
            amount: takerEcosystemFeeAmount
          }]
          : undefined
      });

      setSuccessMessageState("Collection bid fulfilled successfully");
      await refreshCollectionBids();
    } catch (error) {
      console.error(error);
      setErrorMessageState(JSON.stringify(error));
    } finally {
      setLoadingState(false);
    }
  }
};
```

### ERC1155 Collection Bid Fulfillment
[Fulfilling a collection bid with an ERC1155 token](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/orderbook/fulfill-collection-bid-with-nextjs/src/app/fulfill-collection-bid-with-erc1155/page.tsx#L234-L276) allows sellers to partially fulfill a bid by selling a specific quantity of fungible tokens.

```typescript
const fulfillERC1155CollectionBid = async (
  collectionBidID: string,
  amount: string,
  tokenId: string,
) => {
  if (signer) {
    try {
      setLoadingState(true);
      setLoadingText("Fulfilling Collection Bid");
      resetMsgState();

      // Fulfill the collection bid
      await orderbookSDK.fulfillCollectionBid({
        collectionBidId: collectionBidID,
        tokenId: tokenId,
        tokenAmount: amount,
        signer,
        takerFees: takerEcosystemFeeRecipient && takerEcosystemFeeAmount
          ? [{
            recipientAddress: takerEcosystemFeeRecipient,
            amount: takerEcosystemFeeAmount
          }]
          : undefined
      });

      setSuccessMessageState("Collection bid fulfilled successfully");
      await refreshCollectionBids();
    } catch (error) {
      console.error(error);
      setErrorMessageState(JSON.stringify(error));
    } finally {
      setLoadingState(false);
    }
  }
};
```

### Collection Bid Utility Functions
[Helper functions](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/orderbook/fulfill-collection-bid-with-nextjs/src/app/utils/collectionBid.ts) for calculating total units and remaining units in a collection bid.

```typescript
export function unitsTotal(collectionBid: orderbook.CollectionBid): string {
  return collectionBid.buy[0].amount;
}

export function unitsRemaining(collectionBid: orderbook.CollectionBid): string {
  const totalUnits = unitsTotal(collectionBid);
  const hasUnitsSold = collectionBid.fillStatus.denominator !== "0";
  const unitsSold = hasUnitsSold
    ? (BigInt(totalUnits) * BigInt(collectionBid.fillStatus.numerator)) /
      BigInt(collectionBid.fillStatus.denominator)
    : BigInt(0);
  return (BigInt(totalUnits) - unitsSold).toString();
}
```

## Running the App

### Prerequisites
- Node.js (v18 or higher)
- pnpm installed globally
- Immutable Passport account for authentication - [Set up on Immutable Hub](https://hub.immutable.com/)
- A wallet with testnet tokens and NFTs on Immutable's testnet
- Collection bids already created on the testnet (you can use the [Create Collection Bid example](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/orderbook/create-collection-bid-with-nextjs))

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

4. Start the development server:
   ```bash
   pnpm dev
   ```

5. Open your browser to http://localhost:3000
   
6. Connect with Passport on the application
   
7. Enter a contract address to find active collection bids
   
8. Choose to fulfill a bid either with ERC721 (complete fulfillment) or ERC1155 (partial fulfillment)
   
9. Complete the transaction by providing the token ID (and quantity for ERC1155) and confirming in your wallet

## Summary
This example demonstrates how to implement collection bid fulfillment functionality using the Immutable Orderbook SDK. It showcases two main scenarios: fulfilling collection bids with ERC721 tokens (complete fulfillment) and with ERC1155 tokens (partial fulfillment). The app demonstrates the integration of Passport for authentication and wallet connection, retrieving active collection bids, and executing fulfillment transactions with optional ecosystem fees. Developers can use this example as a reference to implement collection bid fulfillment in their own applications. 