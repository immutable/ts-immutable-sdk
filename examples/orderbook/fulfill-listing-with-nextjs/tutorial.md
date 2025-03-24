<div class="display-none">

# Fulfill Listing with Next.js

This tutorial demonstrates how to implement NFT listing fulfillment using the Immutable Orderbook SDK with Next.js. The application showcases how to fulfill both ERC721 and ERC1155 listings, providing a complete workflow from listing discovery to transaction execution.

</div>

<div class="button-component">

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/orderbook/fulfill-listing-with-nextjs) <span class="button-component-arrow">→</span>

</div>

## Features Overview

- Fulfill ERC721 listings using the Orderbook SDK
- Fulfill ERC1155 listings with specific unit amounts using the Orderbook SDK
- Filter active listings by contract address and currency type
- Apply taker ecosystem fees during fulfillment

## SDK Integration Details

### Fulfill ERC721 Listing

**Feature Name**: Fulfill an active ERC721 listing on the Immutable orderbook.

**Source Code**: [source code file](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/orderbook/fulfill-listing-with-nextjs/src/app/fulfill-listing-with-erc721/page.tsx)

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

**Explanation**: The code first calls the `fulfillOrder` method from the Orderbook SDK, passing the listing ID, the buyer's wallet address, and optional taker ecosystem fees. The method returns a set of actions that need to be executed to complete the fulfillment. The code then iterates through these actions, builds transactions for actions of type `TRANSACTION`, and sends them using the connected wallet's signer. This process handles all the necessary on-chain interactions to complete the purchase of the NFT.

### Fulfill ERC1155 Listing

**Feature Name**: Fulfill an active ERC1155 listing with specific unit amounts on the Immutable orderbook.

**Source Code**: [source code file](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/orderbook/fulfill-listing-with-nextjs/src/app/fulfill-listing-with-erc1155/page.tsx)

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

**Explanation**: Similar to the ERC721 fulfillment, this function calls the `fulfillOrder` method but includes an additional parameter for the number of units to fulfill. This is particularly important for ERC1155 tokens where a single listing might offer multiple units of the same NFT. The function processes the returned actions in the same way, building and sending transactions to complete the purchase. The implementation also waits for one confirmation of the transaction to ensure it's properly included in the blockchain.

## Running the App

### Prerequisites
- Node.js
- A [publishable API key and client ID from Immutable Hub](https://hub.immutable.com/)

### Setup Instructions
1. Clone the repository:
```bash
git clone https://github.com/immutable/ts-immutable-sdk.git
cd ts-immutable-sdk/examples/orderbook/fulfill-listing-with-nextjs
```

2. Install dependencies:
```bash
pnpm i
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Edit the `.env` file to add your Immutable Hub credentials:
```
NEXT_PUBLIC_PUBLISHABLE_KEY=your_publishable_key
NEXT_PUBLIC_CLIENT_ID=your_client_id
```

5. Start the development server:
```bash
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Using the Application
1. From the home page, select either "Fulfill listing - Complete fulfillment with ERC721" or "Fulfill listing - Complete fulfillment with ERC1155"
2. Connect your Passport wallet by clicking the "Login" button
3. Filter the available listings using:
   - NFT Contract Address: Optional filter for specific NFT collections
   - Currency Type: Choose between NATIVE or ERC20 currencies
4. For ERC1155 listings, specify the number of units you want to purchase
5. Click "Submit" on a listing to fulfill it
6. Approve any required wallet interactions to complete the transaction

## Summary

This example demonstrates how to implement NFT marketplace functionality for fulfilling both ERC721 and ERC1155 listings using the Immutable Orderbook SDK. The application showcases filtering active listings, user wallet integration via Passport, and executing fulfillment transactions with optional ecosystem fees. By following this example, developers can implement a complete purchasing flow for NFT marketplaces on Immutable. 