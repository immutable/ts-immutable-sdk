# Fulfill Listing with NextJS

## Introduction
This example application demonstrates how to fulfill NFT listings using Immutable's Orderbook SDK. The app showcases fulfilling both ERC721 (complete fulfillment) and ERC1155 (partial fulfillment) listings using a NextJS and React frontend. This is a crucial functionality for any marketplace that allows users to purchase NFTs listed by others.

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/orderbook/fulfill-listing-with-nextjs)

## Features Overview
- **Fetch active listings** - Display available NFT listings that can be fulfilled
- **Complete ERC721 fulfillment** - Purchase a whole ERC721 NFT from a listing
- **Partial ERC1155 fulfillment** - Purchase a specific quantity of an ERC1155 NFT from a listing
- **Taker ecosystem fees** - Add marketplace fees to be collected when fulfilling listings

## SDK Integration Details

### Fetch Active Listings
[Implementation](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/orderbook/fulfill-listing-with-nextjs/src/app/fulfill-listing-with-erc721/page.tsx#L149-L165)

```typescript
const getListings = async (
  client: orderbook.Orderbook,
  sellItemContractAddress?: string,
  buyItemType?: "NATIVE" | "ERC20",
): Promise<orderbook.Listing[]> => {
  let params: orderbook.ListListingsParams = {
    pageSize: 50,
    sortBy: "created_at",
    status: OrderStatusName.ACTIVE,
    sellItemContractAddress,
    buyItemType,
  };
  const listings = await client.listListings(params);
  return listings.result;
};
```

The app fetches active listings using the Orderbook SDK's `listListings` function. It filters listings based on contract address and whether they're selling for native currency or ERC20 tokens. The resulting listings are then filtered to only show ERC721 or ERC1155 listings, depending on the page.

### Complete ERC721 Fulfillment
[Implementation](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/orderbook/fulfill-listing-with-nextjs/src/app/fulfill-listing-with-erc721/page.tsx#L203-L218)

```typescript
const fulfillERC721Listing = async (listingID: string) => {
  const { actions } = await orderbookSDK.fulfillOrder(
    listingID,
    accountsState[0],
    takerEcosystemFeeRecipient != "" ? [{
      recipientAddress: takerEcosystemFeeRecipient,
      amount: takerEcosystemFeeAmount,
    }] : [],
  );

  for (const action of actions) {
    if (action.type === orderbook.ActionType.TRANSACTION) {
      const builtTx = await action.buildTransaction();
      await signer?.sendTransaction(builtTx);
    }
  }
};
```

The app fulfills ERC721 listings by calling the `fulfillOrder` method from the Orderbook SDK, providing the listing ID and the fulfiller's wallet address. It also allows adding optional taker ecosystem fees for the marketplace. The resulting actions are then executed by building and sending transactions.

### Partial ERC1155 Fulfillment
[Implementation](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/orderbook/fulfill-listing-with-nextjs/src/app/fulfill-listing-with-erc1155/page.tsx#L219-L239)

```typescript
const fulfillERC1155Listing = async (
  listingID: string,
  unitsToFill?: string, // Number of units to fill
) => {
  const { actions } = await orderbookSDK.fulfillOrder(
    listingID,
    accountsState[0],
    takerEcosystemFeeRecipient != "" ? [{
      recipientAddress: takerEcosystemFeeRecipient,
      amount: takerEcosystemFeeAmount,
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

For ERC1155 tokens, the app allows for partial fulfillment by specifying the number of units to purchase. This is done by passing an additional `unitsToFill` parameter to the `fulfillOrder` method. The app also calculates and displays the total units and remaining units for each ERC1155 listing.

## Running the App

### Prerequisites
- Node.js and pnpm installed
- A [Immutable Hub](https://hub.immutable.com/) account with API credentials
- A wallet with funds on the Immutable zkEVM testnet

### Setup Instructions
1. Clone the repository
2. Navigate to the example directory:
   ```
   cd examples/orderbook/fulfill-listing-with-nextjs
   ```
3. Install dependencies:
   ```
   pnpm install
   ```
4. Create a `.env` file based on `.env.example` and add your credentials:
   ```
   NEXT_PUBLIC_PUBLISHABLE_KEY=<your-publishable-key>
   NEXT_PUBLIC_CLIENT_ID=<your-client-id>
   ```
5. Start the development server:
   ```
   pnpm dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Summary
This example demonstrates how to build a marketplace that allows users to purchase NFTs from listings created by other users. It showcases two important fulfillment scenarios: complete fulfillment of ERC721 tokens and partial fulfillment of ERC1155 tokens. The integration with Passport provides a seamless wallet connection experience, while the Orderbook SDK handles the complex logic of fulfilling orders on the blockchain.

By using this example as a reference, developers can implement purchase functionality in their own marketplaces built on Immutable's infrastructure. 