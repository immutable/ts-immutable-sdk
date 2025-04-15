<div class="display-none">

# Create Collection Bid with Next.js

</div>

This tutorial demonstrates how to create collection bids for both ERC721 and ERC1155 tokens using the Immutable Orderbook SDK with a Next.js application. A collection bid allows users to place bids on any NFT within a specific collection rather than a specific token.

<div class="button-component">

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/orderbook/create-collection-bid-with-nextjs) <span class="button-component-arrow">→</span>

</div>

## Features Overview

- Create a collection bid for an ERC721 collection
- Create a collection bid for an ERC1155 collection

## SDK Integration Details

### Create a Collection Bid for an ERC721 Collection

Creates a bid on the Orderbook for any NFT within a specified ERC721 collection.

First, the application prepares the collection bid by defining the buy and sell items:

```typescript title="Prepare ERC721 Collection Bid" manualLink="https://github.com/immutable/ts-immutable-sdk/blob/main/examples/orderbook/create-collection-bid-with-nextjs/src/app/create-collection-bid-with-erc721/page.tsx"
const prepareERC721CollectionBid =
  async (): Promise<orderbook.PrepareCollectionBidResponse> => {
    // build the sell item
    const sell: ERC20Item = {
      type: "ERC20",
      contractAddress: sellItemContractAddress,
      amount: sellItemAmount,
    };

    // build the buy item
    const buy: ERC721CollectionItem = {
      type: "ERC721_COLLECTION",
      contractAddress: buyItemContractAddress,
      amount: buyItemTokenAmount,
    };

    // build the prepare collection bid parameters
    const prepareCollectionBidParams: PrepareCollectionBidParams = {
      makerAddress: accountsState[0],
      buy,
      sell,
    };

    // invoke the orderbook SDK to prepare the collection bid
    return await orderbookSDK.prepareCollectionBid(prepareCollectionBidParams);
  };
```

Then it handles approvals, signing, and submitting the collection bid:

```typescript title="Create ERC721 Collection Bid" manualLink="https://github.com/immutable/ts-immutable-sdk/blob/main/examples/orderbook/create-collection-bid-with-nextjs/src/app/create-collection-bid-with-erc721/page.tsx"
const createER721CollectionBid = async () => {
  setCollectionBidErrorState(null);
  setLoadingState(true);
  setLoadingText('Creating collection bid');

  if (!browserProvider) {
    setCollectionBidErrorState("Please connect to Passport");
    return;
  }

  try {
    // prepare the collection bid
    const preparedCollectionBid = await prepareERC721CollectionBid();

    // sign and submit approval transaction
    await signAndSubmitApproval(browserProvider, preparedCollectionBid);

    // sign the collection bid
    const orderSignature = await signCollectionBid(browserProvider, preparedCollectionBid);

    // create the collection bid
    const collectionBidID = await createCollectionBid(
      orderbookSDK,
      preparedCollectionBid,
      orderSignature,
      makerEcosystemFeeRecipient != "" ? {
        recipientAddress: makerEcosystemFeeRecipient,
        amount: makerEcosystemFeeAmount,
      } : undefined
    );

    handleSuccessfulCollectionBidCreation(collectionBidID);
  } catch (error: any) {
    console.error(error);
    setSuccessMessageState(null);
    setCollectionBidErrorState(`Something went wrong - ${error.message}`);
  }

  setLoadingState(false);
};
```

The code creates a collection bid for any NFT in an ERC721 collection by:
1. Defining what the user is selling (ERC20 tokens) and what they want to buy (NFTs from an ERC721 collection)
2. Calling the `prepareCollectionBid` method to get approval actions and order components
3. Handling token approvals by signing and submitting approval transactions
4. Signing the order using a typed data signature
5. Creating the collection bid by submitting the order components, hash, and signature to the Orderbook service

### Create a Collection Bid for an ERC1155 Collection

Creates a bid on the Orderbook for a specified quantity of any NFT within an ERC1155 collection.

First, the application prepares the collection bid by defining the buy and sell items:

```typescript title="Prepare ERC1155 Collection Bid" manualLink="https://github.com/immutable/ts-immutable-sdk/blob/main/examples/orderbook/create-collection-bid-with-nextjs/src/app/create-collection-bid-with-erc1155/page.tsx"
const prepareERC1155CollectionBid =
  async (): Promise<orderbook.PrepareCollectionBidResponse> => {
    // build the sell item
    const sell: ERC20Item = {
      type: "ERC20",
      contractAddress: sellItemContractAddress,
      amount: sellItemAmount,
    };

    // build the buy item
    const buy: ERC1155CollectionItem = {
      type: "ERC1155_COLLECTION",
      contractAddress: buyItemContractAddress,
      amount: buyItemQty
    };

    // build the prepare collection bid parameters
    const prepareCollectionBidParams: PrepareCollectionBidParams = {
      makerAddress: accountsState[0],
      buy,
      sell,
    };

    // invoke the orderbook SDK to prepare the collection bid
    return await orderbookSDK.prepareCollectionBid(prepareCollectionBidParams);
  };
```

The creation process for ERC1155 collection bids follows the same pattern as ERC721:

```typescript title="Create ERC1155 Collection Bid" manualLink="https://github.com/immutable/ts-immutable-sdk/blob/main/examples/orderbook/create-collection-bid-with-nextjs/src/app/create-collection-bid-with-erc1155/page.tsx"
const createER1155CollectionBid = async () => {
  setCollectionBidErrorState(null);
  setLoadingState(true);
  setLoadingText('Creating collection bid');

  if (!browserProvider) {
    setCollectionBidErrorState("Please connect to Passport");
    return;
  }

  try {
    // prepare the collection bid
    const preparedCollectionBid = await prepareERC1155CollectionBid();

    // sign and submit approval transaction
    await signAndSubmitApproval(browserProvider, preparedCollectionBid);

    // sign the collection bid
    const orderSignature = await signCollectionBid(browserProvider, preparedCollectionBid);

    // create the collection bid
    const collectionBidID = await createCollectionBid(
      orderbookSDK,
      preparedCollectionBid,
      orderSignature,
      makerEcosystemFeeRecipient != "" ? {
        recipientAddress: makerEcosystemFeeRecipient,
        amount: makerEcosystemFeeAmount,
      } : undefined
    );

    handleSuccessfulCollectionBidCreation(collectionBidID);
  } catch (error: any) {
    console.error(error);
    setSuccessMessageState(null);
    setCollectionBidErrorState(`Something went wrong - ${error.message}`);
  }

  setLoadingState(false);
};
```

The code creates a collection bid for any NFT in an ERC1155 collection by:
1. Defining what the user is selling (ERC20 tokens) and what they want to buy (NFTs from an ERC1155 collection)
2. Specifying the desired quantity of NFTs to buy from the collection
3. Calling the `prepareCollectionBid` method to get approval actions and order components
4. Handling token approvals by signing and submitting approval transactions
5. Signing the order using a typed data signature
6. Creating the collection bid by submitting the order components, hash, and signature to the Orderbook service

## Running the App

### Prerequisites
- Node.js
- Valid client ID and publishable API key from [Immutable Hub](https://hub.immutable.com/)

### Steps to Run Locally

1. Install dependencies:
```bash
pnpm i
```

2. Copy the environment variables template:
```bash
cp .env.example .env
```

3. Update the `.env` file with your Immutable Hub credentials:
```
NEXT_PUBLIC_PUBLISHABLE_KEY=<your-publishable-key>
NEXT_PUBLIC_CLIENT_ID=<your-client-id>
```

4. Start the development server:
```bash
pnpm dev
```

5. Open http://localhost:3000 in your browser

### Using the Application

#### To Create a Collection Bid for ERC721:
1. Navigate to the ERC721 Collection Bid page
2. Connect your Passport wallet
3. Enter the NFT contract address, token amount, currency contract address, and currency amount
4. Click "Create Collection Bid"
5. Approve the ERC20 token for trading (if prompted)
6. Sign the collection bid message
7. Wait for confirmation that the bid was created successfully

#### To Create a Collection Bid for ERC1155:
1. Navigate to the ERC1155 Collection Bid page
2. Connect your Passport wallet
3. Enter the NFT contract address, token quantity, currency contract address, and currency amount
4. Click "Create Collection Bid"
5. Approve the ERC20 token for trading (if prompted)
6. Sign the collection bid message
7. Wait for confirmation that the bid was created successfully

## Summary

This example demonstrates how to implement collection bids for both ERC721 and ERC1155 NFTs using the Immutable Orderbook SDK. Collection bids allow users to place offers on any NFT within a specific collection, rather than a specific token.

Key concepts demonstrated include:
- Preparing collection bids with appropriate parameters
- Handling token approvals
- Signing collection bid orders
- Creating collection bids with optional marketplace fees
- Differentiating between ERC721 and ERC1155 collection bids 