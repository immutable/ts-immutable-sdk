# Fulfill Listing Example with Next.js

## Introduction
This example app demonstrates how to fulfill active NFT listings (both ERC721 and ERC1155) using the Immutable Orderbook SDK with Next.js. This allows users to purchase NFTs from existing marketplace listings. The app showcases how to fetch active listings and process purchases for complete fulfillment of ERC721 listings and partial fulfillment of ERC1155 listings.

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/orderbook/fulfill-listing-with-nextjs)

## Features Overview
- **Fulfill listings for ERC721 tokens**: Complete purchase of ERC721 NFTs from active listings
- **Fulfill listings for ERC1155 tokens**: Partial or complete purchase of ERC1155 NFTs with specified quantity

## SDK Integration Details

### Fulfill Listings for ERC721 Tokens
**Feature Name**: Fulfill listings for ERC721 tokens allows users to purchase ERC721 NFTs from active listings in the marketplace.

**Source Code**: [Source code file](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/orderbook/fulfill-listing-with-nextjs/src/app/fulfill-listing-with-erc721/page.tsx)

**Implementation**:
```typescript
const fulfillERC721Listing = async (listingID: string) => {
  const { actions } = await orderbookSDK.fulfillOrder(
    listingID,
    accountsState[0],
    takerEcosystemFeeRecipient != "" ? [{
      recipientAddress: takerEcosystemFeeRecipient, // Replace address with your own marketplace address
      amount: takerEcosystemFeeAmount, // Insert taker ecosystem/marketplace fee here
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

**Explanation**: 
The code fulfills an ERC721 listing by:
1. Calling the `fulfillOrder` method on the orderbookSDK with the listing ID and the buyer's address
2. Optionally adding taker ecosystem fees (marketplace fees) if specified
3. Processing the returned actions by building and sending the transaction using the Passport provider's signer
4. Since ERC721 tokens are non-fungible and unique, they can only be purchased in their entirety (there's no partial fulfillment)

### Fulfill Listings for ERC1155 Tokens
**Feature Name**: Fulfill listings for ERC1155 tokens allows users to purchase ERC1155 NFTs from active listings, with the ability to specify the quantity to purchase.

**Source Code**: [Source code file](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/orderbook/fulfill-listing-with-nextjs/src/app/fulfill-listing-with-erc1155/page.tsx)

**Implementation**:
```typescript
const fulfillERC1155Listing = async (
  listingID: string,
  unitsToFill?: string, // Number of units to fill
) => {
  const { actions } = await orderbookSDK.fulfillOrder(
    listingID,
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

**Explanation**: 
The code fulfills an ERC1155 listing by:
1. Calling the `fulfillOrder` method on the orderbookSDK with the listing ID and the buyer's address
2. Optionally adding taker ecosystem fees (marketplace fees) if specified
3. Including an optional `unitsToFill` parameter that specifies how many units of the ERC1155 token to purchase
4. Processing the returned actions by building and sending the transaction using the Passport provider's signer
5. Unlike ERC721 tokens, ERC1155 tokens can be partially fulfilled because they are semi-fungible tokens that can have multiple instances

## Running the App

### Prerequisites
- Node.js 18+
- A modern web browser
- [Immutable Hub](https://hub.immutable.com/) account for environment setup
- Client ID and Publishable API key from Immutable Hub

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

3. Create a `.env` file in the project root or copy from the example:
   ```bash
   cp .env.example .env
   ```

4. Add your Immutable Hub credentials to the `.env` file:
   ```
   NEXT_PUBLIC_CLIENT_ID=your_client_id
   NEXT_PUBLIC_PUBLISHABLE_KEY=your_publishable_key
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
This example demonstrates how to implement the fulfillment of NFT listings using Immutable's Orderbook SDK in a Next.js application. The app shows how to:

1. Connect to users' wallets using Immutable Passport for authentication
2. Fetch and display active NFT listings from the marketplace
3. Process the purchase of ERC721 tokens (complete fulfillment only)
4. Process the purchase of ERC1155 tokens (complete or partial fulfillment)
5. Include optional taker ecosystem fees (marketplace fees) in the transaction

These components provide the fundamental building blocks for creating a marketplace where users can purchase NFTs from sellers' listings. 