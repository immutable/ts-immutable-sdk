# Fulfill Bid with Next.js Tutorial

## Introduction
This example application demonstrates how to fulfill bids for NFTs using the Immutable Orderbook SDK within a Next.js application. It showcases the process of fulfilling both ERC721 and ERC1155 bids, allowing users to sell their NFTs to buyers who have placed bids on them.

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/orderbook/fulfill-bid-with-nextjs)

## Features Overview
- Fulfill ERC721 bids
- Fulfill ERC1155 bids

## SDK Integration Details

### Fulfill ERC721 Bid
**Feature Name**: A feature that allows sellers to fulfill existing bids for ERC721 tokens from buyers.

**Source Code**: [Source code file](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/orderbook/fulfill-bid-with-nextjs/src/app/fulfill-bid-with-erc721/page.tsx)

**Implementation**:
```typescript
const fulfillERC721Bid = async (bidID: string) => {
  const { actions } = await orderbookSDK.fulfillOrder(
    bidID,
    accountsState[0],
    takerEcosystemFeeRecipient != "" ? [{
      recipientAddress: takerEcosystemFeeRecipient, // Replace address with your own marketplace address
      amount: takerEcosystemFeeAmount, // Insert taker ecosystem/marketplace fee here
    }] : [],
  );

  for (const action of actions) {
    if (action.type === orderbook.ActionType.TRANSACTION && signer) {
      const builtTx = await action.buildTransaction();
      await (await signer.sendTransaction(builtTx)).wait(1);
    }
  }
};
```

**Explanation**: This code fulfills an ERC721 bid by calling the `fulfillOrder` method from the Orderbook SDK. It passes the bid ID, the seller's account address, and optional taker ecosystem fees. The resulting actions (typically blockchain transactions) are then executed sequentially. For each transaction action, the code builds the transaction with the necessary parameters and sends it using the signer connected to the user's wallet. The function waits for one confirmation for each transaction to ensure it's processed.

### Fulfill ERC1155 Bid
**Feature Name**: A feature that allows sellers to fulfill existing bids for ERC1155 tokens, with the option to specify the number of units to sell.

**Source Code**: [Source code file](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/orderbook/fulfill-bid-with-nextjs/src/app/fulfill-bid-with-erc1155/page.tsx)

**Implementation**:
```typescript
const fulfillERC1155Bid = async (
  bidID: string,
  unitsToFill?: string, // Number of units to fill
) => {
  const { actions } = await orderbookSDK.fulfillOrder(
    bidID,
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

**Explanation**: This code fulfills an ERC1155 bid similarly to the ERC721 version, but with an additional parameter for the number of units to fill. This allows sellers to partially fulfill bids for fungible tokens by specifying how many units they want to sell. For ERC1155 tokens, which can have multiple copies, this flexibility is crucial to allow selling specific quantities. The function follows the same pattern of building and executing transactions as the ERC721 bid fulfillment.

## Running the App

### Prerequisites
- Node.js
- pnpm
- [Immutable Hub account](https://hub.immutable.com/) for environment setup

### Step-by-step Instructions
1. Clone the repository:
```bash
git clone https://github.com/immutable/ts-immutable-sdk.git
cd ts-immutable-sdk/examples/orderbook/fulfill-bid-with-nextjs
```

2. Install the dependencies:
```bash
pnpm i
```

3. Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```

4. Replace the environment variables in the `.env` file:
- `NEXT_PUBLIC_PUBLISHABLE_KEY`: Your publishable API key from Immutable Hub
- `NEXT_PUBLIC_CLIENT_ID`: Your client ID from Immutable Hub

5. Run the development server:
```bash
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Using the Application
1. Connect your Passport wallet by clicking the "Connect Wallet" button
2. Navigate to either the ERC721 or ERC1155 fulfillment page
3. Optionally filter bids by entering an NFT contract address
4. For ERC1155 bids, specify the number of units you want to fulfill
5. Click the "Submit" button to fulfill the bid
6. Approve any transactions in your wallet when prompted
7. If successful, you'll see a success message confirming the bid has been fulfilled

## Summary
This example demonstrates how to implement bid fulfillment functionality in a Next.js application using the Immutable Orderbook SDK. It shows how to connect to a user's wallet using Passport, retrieve available bids for NFTs, and fulfill those bids for both ERC721 and ERC1155 tokens. The application handles the entire workflow including wallet connection, bid filtering, and transaction execution, providing a complete reference implementation for developers building NFT marketplaces with Immutable. 