# Create Listing with Next.js

## Introduction
This example application demonstrates how to create listings using the Immutable SDK with a Next.js application. It showcases creating both ERC721 and ERC1155 token listings using the Orderbook SDK. Users can connect their Immutable Passport wallet, approve tokens for trading, and create listings with various pricing options.

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/orderbook/create-listing-with-nextjs)

## Features Overview
- Listing creation for ERC721 tokens
- Listing creation for ERC1155 tokens
- Token approval for trading
- Support for Native token and ERC20 token pricing
- Optional marketplace fees

## SDK Integration Details

### Create Listing for ERC721 Tokens
[Creating ERC721 listings](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/orderbook/create-listing-with-nextjs/src/app/create-listing-with-erc721/page.tsx) allows users to sell unique NFTs through the Orderbook.

**Implementation:**
The process of creating an ERC721 listing involves several key steps:

1. Preparing the listing:
```typescript
const prepareERC721Listing = async (): Promise<orderbook.PrepareListingResponse> => {
  // Create the sell item (an ERC721 token)
  const sellItem: ERC721Item = {
    type: "ERC721", // Type of token being sold
    tokenAddress: sellItemContractAddress, // Contract address of the token
    tokenId: sellItemTokenID, // Token ID being listed
  };

  // Create the buy item (what the seller will receive)
  let buyItem: NativeItem | ERC20Item;
  if (buyItemType === "Native") {
    buyItem = {
      type: "NATIVE", // Native token (e.g., ETH, IMX)
      amount: buyItemAmount, // Listing price in wei
    };
  } else {
    buyItem = {
      type: "ERC20", // ERC20 token
      tokenAddress: buyItemContractAddress, // Contract address of the ERC20 token
      amount: buyItemAmount, // Listing price in token amount
    };
  }

  // Prepare the listing with Orderbook SDK
  const listingParams: PrepareListingParams = {
    makerAddress: accountsState[0], // Seller's wallet address
    sellItem: sellItem,
    buyItem: buyItem,
    fees: [], // No fees in this example, but fees could be added here
  };

  return orderbookSDK.prepareListing(listingParams);
};
```

2. Approving tokens for trading:
```typescript
// Approve tokens for trading
await signAndSubmitApproval(browserProvider!, preparedListing);
```

3. Signing the listing order:
```typescript
// Sign the listing order
const orderSignature = await signListing(browserProvider!, preparedListing);
```

4. Creating the listing:
```typescript
// Create the listing with optional marketplace fees
const listingID = await createListing(
  orderbookSDK, 
  preparedListing, 
  orderSignature,
  makerEcosystemFeeRecipient && makerEcosystemFeeAmount
    ? {
        recipientAddress: makerEcosystemFeeRecipient,
        amount: makerEcosystemFeeAmount,
      }
    : undefined
);
```

**Explanation:**
The code handles the complete flow for creating an ERC721 listing:
- Connects to the user's Passport wallet
- Collects details about the token being sold and the payment being requested
- Prepares the listing using the Orderbook SDK
- Handles token approvals (if needed)
- Signs the listing order with the user's wallet
- Creates the listing on the Immutable Orderbook
- Optionally includes marketplace fees for the listing

### Create Listing for ERC1155 Tokens
[Creating ERC1155 listings](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/orderbook/create-listing-with-nextjs/src/app/create-listing-with-erc1155/page.tsx) allows users to sell multiple copies of semi-fungible tokens.

**Implementation:**
The main differences in the ERC1155 implementation involve the sell item configuration:

```typescript
const sellItem: ERC1155Item = {
  type: "ERC1155", // Type of token being sold
  tokenAddress: sellItemContractAddress, // Contract address of the token
  tokenId: sellItemTokenID, // Token ID being listed
  amount: sellItemAmount, // Number of tokens to sell from this token ID
};
```

The rest of the flow remains similar to the ERC721 process.

### Utility Functions for Orderbook Integration
The application provides [utility functions](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/orderbook/create-listing-with-nextjs/src/app/utils/listing.ts) that handle core Orderbook SDK interactions:

1. **Token Approval:**
```typescript
export const signAndSubmitApproval = async (
  provider: BrowserProvider,
  listing: orderbook.PrepareListingResponse,
): Promise<void> => {
  const signer = await provider.getSigner();
  
  // Filter approval actions from the prepared listing
  const approvalActions = listing.actions.filter(
    (action): action is orderbook.TransactionAction =>
      action.type === orderbook.ActionType.TRANSACTION,
  );

  // Execute each approval transaction
  for (const approvalAction of approvalActions) {
    const unsignedTx = await approvalAction.buildTransaction();
    const receipt = await signer.sendTransaction(unsignedTx);
    await receipt.wait();
  }
};
```

2. **Order Signing:**
```typescript
export const signListing = async (
  provider: BrowserProvider,
  listing: orderbook.PrepareListingResponse,
): Promise<string> => {
  const signer = await provider.getSigner();
  
  // Find the signable action in the prepared listing
  const signableAction = listing.actions.find(
    (action): action is orderbook.SignableAction =>
      action.type === orderbook.ActionType.SIGNABLE,
  )!;

  // Sign the order using EIP-712 typed data signing
  const signature = await signer.signTypedData(
    signableAction.message.domain,
    signableAction.message.types,
    signableAction.message.value,
  );

  return signature;
};
```

3. **Listing Creation:**
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
  // Submit the listing to the Orderbook with all required data
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

## Running the App

### Prerequisites
- Node.js v16 or later
- A valid Immutable Hub account with client ID and publishable API key ([Get Started with Immutable Hub](https://hub.immutable.com/))
- An Immutable Passport wallet with tokens to list

### Setup and Running
1. Install the dependencies:
   ```bash
   pnpm i
   ```

2. Copy the environment example file:
   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your Immutable Hub credentials:
   ```
   NEXT_PUBLIC_PUBLISHABLE_KEY=your_publishable_key
   NEXT_PUBLIC_CLIENT_ID=your_client_id
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to access the application.

### Creating a Listing
1. Choose either "Create ERC721 Listing" or "Create ERC1155 Listing" depending on your token type.
2. Connect your Passport wallet when prompted.
3. Fill in the required fields:
   - NFT Contract Address: The address of your token contract
   - NFT Token ID: The ID of the token you want to sell
   - Amount (for ERC1155 only): How many tokens to sell
   - Currency Type: Choose Native (ETH/IMX) or ERC20
   - Currency Contract Address (for ERC20 only): The address of the payment token
   - Currency Amount: The price you want to sell for
   - Optional marketplace fees: If you want to include fees for a marketplace
4. Click "Create Listing" and follow the prompts to approve your token (if needed) and sign the listing.
5. Upon success, the listing ID will be displayed, confirming your listing is active on the Orderbook.

## Summary
This example demonstrates how to integrate the Immutable Orderbook SDK into a Next.js application to create listings for both ERC721 and ERC1155 tokens. The app showcases the complete flow from connecting a wallet to creating a listing, including token approvals, order signing, and optional marketplace fees. Developers can use this example as a foundation for building their own marketplace applications on Immutable. 