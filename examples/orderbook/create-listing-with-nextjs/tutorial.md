<div class="display-none">

# Create Listing with Next.js

</div>

This example app demonstrates how to create NFT listings using the Immutable Orderbook SDK with Next.js. It shows how to create listings for both ERC721 and ERC1155 tokens, enabling users to list their NFTs for sale in exchange for either native currency or ERC20 tokens.

<div class="button-component">

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/orderbook/create-listing-with-nextjs) <span class="button-component-arrow">→</span>

</div>

## Features Overview

- Create NFT listings for ERC721 tokens
- Create NFT listings for ERC1155 tokens

## SDK Integration Details

### Create Listing for ERC721 Tokens

**Feature Name**: Create a listing for an ERC721 token.

**Source Code**: [source code file](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/orderbook/create-listing-with-nextjs/src/app/create-listing-with-erc721/page.tsx)

**Implementation**:

1. Prepare the ERC721 listing:

```typescript
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

2. Sign and submit approval for the listing:

```typescript
export const signAndSubmitApproval = async (
  provider: BrowserProvider,
  listing: orderbook.PrepareListingResponse,
): Promise<void> => {
  // get your user's Web3 wallet, e.g. MetaMask, Passport, etc
  const signer = await provider.getSigner();

  // If the user hasn't yet approved the Immutable Seaport contract to transfer assets from this
  // collection on their behalf they'll need to do so before they create an order
  const approvalActions = listing.actions.filter(
    (action): action is orderbook.TransactionAction =>
      action.type === orderbook.ActionType.TRANSACTION,
  );

  for (const approvalAction of approvalActions) {
    const unsignedTx = await approvalAction.buildTransaction();
    const receipt = await signer.sendTransaction(unsignedTx);
    await receipt.wait();
  }

  return;
};
```

3. Sign the listing:

```typescript
export const signListing = async (
  provider: BrowserProvider,
  listing: orderbook.PrepareListingResponse,
): Promise<string> => {
  // get your user's Web3 wallet, e.g. MetaMask, Passport, etc
  const signer = await provider.getSigner();

  // For an order to be created (and subsequently filled), Immutable needs a valid signature for the order data.
  // This signature is stored off-chain and is later provided to any user wishing to fulfil the open order.
  // The signature only allows the order to be fulfilled if it meets the conditions specified by the user that created the listing.
  const signableAction = listing.actions.find(
    (action): action is orderbook.SignableAction =>
      action.type === orderbook.ActionType.SIGNABLE,
  )!;

  const signature = await signer.signTypedData(
    signableAction.message.domain,
    signableAction.message.types,
    signableAction.message.value,
  );

  return signature;
};
```

4. Create the listing:

```typescript
export const createListing = async (
  client: orderbook.Orderbook,
  preparedListing: orderbook.PrepareListingResponse,
  orderSignature: string,
  makerEcosystemFee?: {
    recipientAddress: string;
    amount: string;
  },
): Promise<string> => {
  const order = await client.createListing({
    orderComponents: preparedListing.orderComponents,
    orderHash: preparedListing.orderHash,
    orderSignature,
    // Optional maker marketplace fee
    makerFees: makerEcosystemFee ? [
      {
        recipientAddress: makerEcosystemFee.recipientAddress,
        amount: makerEcosystemFee.amount,
      },
    ] : [],
  });
  return order.result.id;
};
```

**Explanation**: 

The ERC721 listing workflow consists of four main steps:

1. **Prepare the listing**: This involves specifying what you're selling (an ERC721 token) and what you want in return (either Native currency or an ERC20 token).

2. **Sign and submit approval**: Before creating a listing, the user must approve the Immutable Seaport contract to transfer the NFT on their behalf. This step processes any approval transactions required to enable the transfer when the listing is fulfilled.

3. **Sign the listing**: The user signs the order data using their wallet. This signature is stored off-chain and allows the order to be fulfilled only under the conditions specified by the seller.

4. **Create the listing**: Finally, the application submits the listing to Immutable's Orderbook service. This includes the order components, hash, signature, and optional marketplace fees.

### Create Listing for ERC1155 Tokens

**Feature Name**: Create a listing for an ERC1155 token.

**Source Code**: [source code file](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/orderbook/create-listing-with-nextjs/src/app/create-listing-with-erc1155/page.tsx)

**Implementation**:

The implementation for ERC1155 tokens is similar to ERC721, with the main difference being the inclusion of a quantity (amount) parameter for the tokens being sold:

```typescript
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

The key difference when creating an ERC1155 listing is that you must specify the quantity (amount) of tokens to sell. ERC1155 tokens are semi-fungible, meaning multiple tokens can share the same ID. This allows sellers to list a specific quantity of tokens from their collection.

The rest of the process (approval, signing, and creating the listing) follows the same pattern as the ERC721 implementation, with the appropriate token type set to "ERC1155".

## Running the App

### Prerequisites

- Node.js
- pnpm
- An account on [Immutable Hub](https://hub.immutable.com/) to obtain your client ID and publishable API key

### Setup Instructions

1. Clone the repository:

```bash
git clone https://github.com/immutable/ts-immutable-sdk.git
cd ts-immutable-sdk/examples/orderbook/create-listing-with-nextjs
```

2. Install dependencies:

```bash
pnpm i
```

3. Copy the environment variables example file and add your credentials:

```bash
cp .env.example .env
```

4. Edit the `.env` file to add your Immutable Hub publishable API key and client ID:

```
NEXT_PUBLIC_PUBLISHABLE_KEY=your_publishable_key
NEXT_PUBLIC_CLIENT_ID=your_client_id
```

5. Start the development server:

```bash
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Summary

This example app demonstrates how to create NFT listings using the Immutable Orderbook SDK with Next.js. It shows two main features:

1. Creating listings for ERC721 tokens (non-fungible tokens)
2. Creating listings for ERC1155 tokens (semi-fungible tokens)

Both listing types support receiving payment in either native currency or ERC20 tokens. The app showcases the complete workflow from preparing the listing to getting user approval, signing the order data, and submitting it to the Immutable Orderbook service. It includes the optional ability to specify marketplace fees for the listing.

Developers can use this example as a starting point for building NFT marketplaces or integrating listing functionality into their applications. 