<div class="display-none">

# Create Bid with Next.js

</div>

This example demonstrates how to create bids for ERC721 and ERC1155 tokens using the Immutable Orderbook SDK with Next.js. It showcases how to integrate the Orderbook SDK with Immutable Passport for authentication and transaction signing.

<div class="button-component">

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/orderbook/create-bid-with-nextjs) <span class="button-component-arrow">→</span>

</div>

## Features Overview

- Create bid for ERC721 tokens
- Create bid for ERC1155 tokens

## SDK Integration Details

### Create Bid for ERC721 Tokens

Creates a bid on the Orderbook for a specific ERC721 token, offering ERC20 tokens as payment.

Preparing an ERC721 bid:
```typescript title="Prepare ERC721 Bid" manualLink="https://github.com/immutable/ts-immutable-sdk/blob/main/examples/orderbook/create-bid-with-nextjs/src/app/create-bid-with-erc721/page.tsx"
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

Creating the bid:
```typescript title="Create ERC721 Bid" manualLink="https://github.com/immutable/ts-immutable-sdk/blob/main/examples/orderbook/create-bid-with-nextjs/src/app/create-bid-with-erc721/page.tsx"
const createER721Bid = async () => {
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
};
```

When creating a bid for an ERC721 token, the app first prepares the bid by specifying the ERC20 tokens the user is willing to spend (sell) and the ERC721 token they want to buy. The `prepareBid` function of the Orderbook SDK then returns the necessary information to complete the bid.

The process involves three main steps:
1. Signing and submitting approval transactions, which allow the Immutable Seaport contract to transfer the user's ERC20 tokens
2. Signing the bid using the user's wallet
3. Creating the bid on the Orderbook by submitting the prepared bid data along with the signature

### Create Bid for ERC1155 Tokens

Creates a bid on the Orderbook for a specific quantity of an ERC1155 token, offering ERC20 tokens.

Preparing an ERC1155 bid:
```typescript title="Prepare ERC1155 Bid" manualLink="https://github.com/immutable/ts-immutable-sdk/blob/main/examples/orderbook/create-bid-with-nextjs/src/app/create-bid-with-erc1155/page.tsx"
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

Creating the bid:
```typescript title="Create ERC1155 Bid" manualLink="https://github.com/immutable/ts-immutable-sdk/blob/main/examples/orderbook/create-bid-with-nextjs/src/app/create-bid-with-erc1155/page.tsx"
const createER1155Bid = async () => {
  // prepare the bid
  const preparedBid = await prepareERC1155Bid();

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
};
```

The process for creating a bid for ERC1155 tokens is similar to that for ERC721 tokens. The main difference is that with ERC1155 tokens, users can specify a quantity of tokens they want to buy using the `amount` property in the buy item.

The implementation follows the same three steps as the ERC721 bid creation:
1. Approving the transfer of ERC20 tokens
2. Signing the bid
3. Creating the bid on the Orderbook

Both bid creation processes also allow for optional maker ecosystem fees, which can be used to charge a fee for the marketplace facilitating the transaction.

## Running the App

### Prerequisites

- Node.js (v14+)
- [Immutable Hub account](https://hub.immutable.com) for environment setup
- A crypto wallet (MetaMask, etc.) connected to the Immutable zkEVM testnet

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

3. Set up your environment:
   - Copy `.env.example` to `.env`
   - Get your Immutable Passport credentials from [Immutable Hub](https://hub.immutable.com)
   - Update `.env` with your values:
     ```
     NEXT_PUBLIC_CLIENT_ID=<your-client-id>
     NEXT_PUBLIC_PUBLISHABLE_KEY=<your-publishable-key>
     ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Summary

This example demonstrates how to create bids for both ERC721 and ERC1155 tokens using the Immutable Orderbook SDK in a Next.js application. The app shows the complete workflow from connecting to Immutable Passport, preparing bids, handling token approvals, signing bids, and finally creating them on the Orderbook.

Key components illustrated include:
- Integration with Immutable Passport for authentication
- Preparing bids for different token types
- Handling token approvals
- Transaction signing
- Submission to the Orderbook
- Optional ecosystem fees

This implementation can serve as a foundation for marketplaces looking to implement bidding functionality for NFTs on the Immutable zkEVM network. 