# Create Bid with Next.js

## Introduction
This example demonstrates how to create bids for both ERC721 and ERC1155 tokens using the Immutable Orderbook SDK. It leverages Next.js for the frontend and Passport for authentication and wallet interactions. This app allows users to specify the details of their bids, including token addresses, token IDs, and amounts.

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/orderbook/create-bid-with-nextjs)

## Features Overview
- Creating bids for ERC721 tokens
- Creating bids for ERC1155 tokens

## SDK Integration Details

### Creating Bids for ERC721 Tokens
**Feature Name**: Create a bid for an ERC721 token.

**Source Code**: [Source code file](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/orderbook/create-bid-with-nextjs/src/app/create-bid-with-erc721/page.tsx)

**Implementation**:

Preparing the ERC721 bid:
```typescript
const prepareERC721Bid = async (): Promise<orderbook.PrepareBidResponse> => {
  // build the sell item
  const sell: ERC20Item = {
    type: "ERC20",
    contractAddress: sellItemContractAddress,
    amount: sellItemAmount,
  };

  // build the buy item
  const buy: ERC721Item = {
    type: "ERC721",
    contractAddress: buyItemContractAddress,
    tokenId: buyItemTokenID,
  };

  // build the prepare bid parameters
  const prepareBidParams: PrepareBidParams = {
    makerAddress: accountsState[0],
    buy,
    sell,
  };

  // invoke the orderbook SDK to prepare the bid
  return await orderbookSDK.prepareBid(prepareBidParams);
};
```

Creating the ERC721 bid:
```typescript
const createER721Bid = async () => {
  setBidErrorState(null);
  setLoadingState(true);
  setLoadingText('Creating bid');

  if (!browserProvider) {
    setBidErrorState("Please connect to Passport");
    return;
  }

  try {
    // prepare the bid
    const preparedBid = await prepareERC721Bid();

    // sign and submit approval transaction
    await signAndSubmitApproval(browserProvider, preparedBid);

    // sign the bid
    const orderSignature = await signBid(browserProvider, preparedBid);

    // create the bid
    const bidID = await createBid(
      orderbookSDK,
      preparedBid,
      orderSignature,
      makerEcosystemFeeRecipient != "" ? {
        recipientAddress: makerEcosystemFeeRecipient,
        amount: makerEcosystemFeeAmount,
      } : undefined
    );

    handleSuccessfulBidCreation(bidID);
  } catch (error: any) {
    console.error(error);
    setSuccessMessageState(null);
    setBidErrorState(`Something went wrong - ${error.message}`);
  }

  setLoadingState(false);
};
```

**Explanation**:
The code creates a bid for an ERC721 token by:
1. Preparing a bid using the `prepareBid` method from the Orderbook SDK
2. Defining a sell item (ERC20 token that the buyer is offering)
3. Defining a buy item (ERC721 token that the buyer wants to purchase)
4. Handling approval for the token transfer
5. Signing the bid with the user's wallet
6. Finally, creating the bid via the Orderbook SDK

### Creating Bids for ERC1155 Tokens
**Feature Name**: Create a bid for an ERC1155 token.

**Source Code**: [Source code file](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/orderbook/create-bid-with-nextjs/src/app/create-bid-with-erc1155/page.tsx)

**Implementation**:

Preparing the ERC1155 bid:
```typescript
const prepareERC1155Bid = async (): Promise<orderbook.PrepareBidResponse> => {
  // build the sell item
  const sell: ERC20Item = {
    type: "ERC20",
    contractAddress: sellItemContractAddress,
    amount: sellItemAmount,
  };

  // build the buy item
  const buy: ERC1155Item = {
    type: "ERC1155",
    contractAddress: buyItemContractAddress,
    tokenId: buyItemTokenID,
    amount: buyItemQty
  };

  // build the prepare bid parameters
  const prepareBidParams: PrepareBidParams = {
    makerAddress: accountsState[0],
    buy,
    sell,
  };

  // invoke the orderbook SDK to prepare the bid
  return await orderbookSDK.prepareBid(prepareBidParams);
};
```

**Explanation**:
The code for creating ERC1155 bids is similar to ERC721, with the key difference being that ERC1155 tokens have a quantity parameter (`amount`) in addition to the token ID. This allows bidding for multiple copies of the same token type.

The bid creation process includes:
1. Preparing a bid for an ERC1155 token, which includes a quantity
2. Handling approval for the token transfer
3. Signing the bid
4. Creating the bid with optional marketplace fees

## Running the App

### Prerequisites
- Node.js (v16 or higher)
- pnpm
- [Immutable Hub](https://hub.immutable.com/) account for environment setup

### Steps to Run the App Locally

1. Clone the repository:
```bash
git clone https://github.com/immutable/ts-immutable-sdk.git
```

2. Navigate to the example app directory:
```bash
cd ts-immutable-sdk/examples/orderbook/create-bid-with-nextjs
```

3. Install dependencies:
```bash
pnpm install
```

4. Create a `.env` file with your credentials:
```
PASSPORT_BASE_URL=https://passport.sandbox.immutable.com
```

5. Start the development server:
```bash
pnpm dev
```

6. Open your browser and navigate to http://localhost:3000

## Summary
This example demonstrates how to integrate the Immutable Orderbook SDK with a Next.js application to create bids for both ERC721 and ERC1155 tokens. The app uses Passport for authentication and wallet interactions, allowing users to create bids by specifying the tokens and amounts involved in the transaction.

Key takeaways:
- The Orderbook SDK provides methods to prepare and create bids for different token types
- Wallet integration through Passport simplifies the authentication and signing process
- The bid creation process involves multiple steps: preparing the bid, getting approvals, signing the order, and submitting it
- Optional marketplace fees can be included when creating bids 