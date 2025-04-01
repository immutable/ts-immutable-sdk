<div class="display-none">

# Fulfill Bid with Next.js

</div>

This example app demonstrates how to fulfill a bid using the Immutable Orderbook SDK with a Next.js frontend. It shows the process of fulfilling bids for both ERC721 and ERC1155 tokens.

<div class="button-component">

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/orderbook/fulfill-bid-with-nextjs) <span class="button-component-arrow">→</span>

</div>

## Features Overview

- **Fulfill Bid for ERC721**: Fulfill a bid for an ERC721 token 
- **Fulfill Bid for ERC1155**: Fulfill a bid for an ERC1155 token, including partial fulfillment

## SDK Integration Details

### Fulfill Bid for ERC721

**Feature Name**: Fulfill bid for ERC721 tokens.

**Source Code**: [Source code file](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/orderbook/fulfill-bid-with-nextjs/src/app/fulfill-bid-with-erc721/page.tsx)

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

**Explanation**: 

The code demonstrates how to fulfill a bid for an ERC721 token. The process involves:

1. Calling the `fulfillOrder` method from the Orderbook SDK, passing:
   - The bid ID to fulfill
   - The account address of the fulfiller (seller)
   - Optional ecosystem fee configuration to collect marketplace fees
   
2. The method returns an array of actions that need to be performed to complete the bid fulfillment
   
3. For each transaction action, the code:
   - Builds the transaction using `buildTransaction()`
   - Sends the transaction using the signer from the connected wallet
   - Waits for one confirmation before proceeding

### Fulfill Bid for ERC1155

**Feature Name**: Fulfill bid for ERC1155 tokens, including partial fulfillment.

**Source Code**: [Source code file](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/orderbook/fulfill-bid-with-nextjs/src/app/fulfill-bid-with-erc1155/page.tsx)

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

**Explanation**: 

The code demonstrates how to fulfill a bid for an ERC1155 token, with additional support for partial fulfillment. The process involves:

1. Calling the `fulfillOrder` method from the Orderbook SDK, passing:
   - The bid ID to fulfill
   - The account address of the fulfiller (seller)
   - Optional ecosystem fee configuration to collect marketplace fees
   - Optional `unitsToFill` parameter that allows for partial fulfillment of the bid (for ERC1155 tokens only)
   
2. The method returns an array of actions that need to be performed to complete the bid fulfillment
   
3. For each transaction action, the code:
   - Builds the transaction using `buildTransaction()`
   - Sends the transaction using the signer from the connected wallet
   - Waits for one confirmation before proceeding

## Running the App

### Prerequisites

- Node.js (version 16 or later recommended)
- pnpm (version 6 or later)
- An Immutable Hub account to get your API keys and set up your environment. [Sign up for Immutable Hub](https://hub.immutable.com/)

### Steps to Run the App Locally

1. Clone the repository and navigate to the example directory:
   ```bash
   git clone https://github.com/immutable/ts-immutable-sdk.git
   cd ts-immutable-sdk/examples/orderbook/fulfill-bid-with-nextjs
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create a `.env` file in the root of the project and add your Immutable Hub credentials:
   ```
   NEXT_PUBLIC_PUBLISHABLE_KEY=<your-publishable-key>
   NEXT_PUBLIC_CLIENT_ID=<your-client-id>
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

6. Connect your wallet using Passport login

7. Explore the ERC721 and ERC1155 bid fulfillment pages to see how to fulfill bids for different token types

## Summary

This example demonstrates how to use the Immutable Orderbook SDK to fulfill bids for both ERC721 and ERC1155 tokens. It showcases the complete flow from connecting a wallet via Passport to executing the bid fulfillment transaction. 

The app includes support for:
- Fulfilling bids for ERC721 tokens
- Fulfilling bids for ERC1155 tokens with support for partial fulfillment
- Adding marketplace fees during the fulfillment process 