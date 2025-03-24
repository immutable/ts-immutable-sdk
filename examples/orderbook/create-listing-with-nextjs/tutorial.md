# Create Listing with NextJS Tutorial

## Introduction
This application demonstrates how to create listings for NFTs using the Immutable Orderbook SDK with NextJS. It showcases the process of creating on-chain orders for both ERC721 and ERC1155 tokens in exchange for native tokens or ERC20 tokens. This example app integrates Immutable Passport for user authentication and wallet connectivity.

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/orderbook/create-listing-with-nextjs)

## Features Overview
- Creating listings for ERC721 tokens
- Creating listings for ERC1155 tokens

## SDK Integration Details

### Creating Listings for ERC721 Tokens
**Feature Name**: Create a listing to sell an ERC721 token for native currency or ERC20 tokens.

**Source Code**: [source code file](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/orderbook/create-listing-with-nextjs/src/app/create-listing-with-erc721/page.tsx)

**Implementation**:
```typescript
// prepare ERC721 listing
const prepareERC721Listing = async (): Promise<orderbook.PrepareListingResponse> => {
  // build the sell item
  const sell: ERC721Item = {
    contractAddress: sellItemContractAddress,
    tokenId: sellItemTokenID,
    type: "ERC721",
  };

  // build the buy item
  const buy =
    buyItemType === "Native"
      ? ({
          amount: buyItemAmount,
          type: "NATIVE",
        } as NativeItem)
      : ({
          amount: buyItemAmount,
          type: "ERC20",
          contractAddress: buyItemContractAddress,
        } as ERC20Item);

  // build the prepare listing parameters
  const prepareListingParams: PrepareListingParams = {
    makerAddress: accountsState[0],
    buy,
    sell,
  };

  // invoke the orderbook SDK to prepare the listing
  return await orderbookSDK.prepareListing(prepareListingParams);
};
```

**Explanation**: 
This code snippet demonstrates how to prepare a listing for an ERC721 token. The process involves:
1. Defining the ERC721 NFT to sell by providing its contract address and token ID
2. Configuring what the seller wants to receive in return - either native ETH/IMX or an ERC20 token
3. Preparing the listing by calling the Orderbook SDK's `prepareListing` method with the maker's address and the defined buy/sell parameters
4. This returns a prepared listing response that includes necessary approval actions and order components

The full process then involves:
```typescript
// Prepare the listing
const preparedListing = await prepareERC721Listing();

// Sign and submit approval transaction
await signAndSubmitApproval(browserProvider, preparedListing);

// Sign the listing
const orderSignature = await signListing(browserProvider, preparedListing);

// Create the listing
const listingID = await createListing(
  orderbookSDK,
  preparedListing,
  orderSignature,
  makerEcosystemFeeRecipient != "" ? {
    recipientAddress: makerEcosystemFeeRecipient,
    amount: makerEcosystemFeeAmount,
  } : undefined
);
```

### Creating Listings for ERC1155 Tokens
**Feature Name**: Create a listing to sell ERC1155 tokens for native currency or ERC20 tokens.

**Source Code**: [source code file](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/orderbook/create-listing-with-nextjs/src/app/create-listing-with-erc1155/page.tsx)

**Implementation**:
```typescript
// prepare ERC1155 listing
const prepareERC1155Listing = async (): Promise<orderbook.PrepareListingResponse> => {
  // build the sell item
  const sell: ERC1155Item = {
    contractAddress: sellItemContractAddress,
    tokenId: sellItemTokenID,
    amount: sellItemQty,
    type: "ERC1155",
  };

  // build the buy item
  const buy =
    buyItemType === "Native"
      ? ({
          amount: buyItemAmount,
          type: "NATIVE",
        } as NativeItem)
      : ({
          amount: buyItemAmount,
          type: "ERC20",
          contractAddress: buyItemContractAddress,
        } as ERC20Item);

  // build the prepare listing parameters
  const prepareListingParams: PrepareListingParams = {
    makerAddress: accountsState[0],
    buy,
    sell,
  };

  // invoke the orderbook SDK to prepare the listing
  return await orderbookSDK.prepareListing(prepareListingParams);
};
```

**Explanation**: 
This code demonstrates creating a listing for ERC1155 tokens, which differs from ERC721 in that it supports semi-fungible tokens with quantities. The process involves:
1. Defining the ERC1155 tokens to sell by providing contract address, token ID, and **quantity**
2. Configuring what to receive in return (native currency or ERC20 tokens)
3. Preparing the listing with the maker's address and the defined parameters
4. Processing the listing through approval, signing, and submission stages

The key difference from ERC721 listings is the inclusion of an amount parameter for the ERC1155 tokens, allowing sellers to list multiple copies of the same token.

## Running the App

### Prerequisites
- Node.js v18+
- An Immutable Hub account for environment setup. [Get started with Immutable Hub](https://hub.immutable.com/)
- A wallet with test tokens on the Immutable zkEVM testnet

### Setup Instructions
1. Clone the repository
2. Copy `.env.example` to `.env` and update with your Passport client credentials from Immutable Hub
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Start the development server:
   ```bash
   pnpm dev
   ```
5. Open your browser and navigate to `http://localhost:3000`

### Using the App
1. Connect your wallet using Passport
2. Navigate to either the ERC721 or ERC1155 listing page
3. Enter the contract address and token ID of the NFT you want to sell
4. For ERC1155 tokens, specify the quantity
5. Choose whether you want to receive native currency or ERC20 tokens in return
6. Enter the amount you want to receive
7. Optionally, add marketplace fees
8. Click "Create Listing" and approve the transactions

## Summary
This example app demonstrates how to create on-chain listings for both ERC721 and ERC1155 tokens using the Immutable Orderbook SDK. It shows the complete flow from preparing a listing, obtaining necessary approvals, signing the order, and submitting it to the Orderbook service. The app showcases the differences between listing single ERC721 NFTs and multiple ERC1155 tokens, as well as providing options for receiving either native currency or ERC20 tokens in exchange.

Key takeaways:
- The Orderbook SDK simplifies the process of creating on-chain listings
- The listing process follows a specific flow: prepare, approve, sign, and create
- The SDK supports both ERC721 and ERC1155 token standards
- Optional marketplace fees can be included when creating listings 