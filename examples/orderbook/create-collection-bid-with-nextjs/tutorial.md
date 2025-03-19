# Create Collection Bid with Next.js

## Introduction
This example app demonstrates how to create collection bids using the Immutable Orderbook SDK in a Next.js application. Collection bids allow users to make offers on an entire NFT collection rather than specific tokens, enabling collectors to easily acquire NFTs from a desired collection. This example shows how to create collection bids for both ERC721 and ERC1155 token types.

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/orderbook/create-collection-bid-with-nextjs)

## Features Overview
- Creating ERC721 collection bids
- Creating ERC1155 collection bids
- Handling token approvals
- Signing Orderbook actions
- Managing maker marketplace fees

## SDK Integration Details

### Creating Collection Bids
The application demonstrates the complete workflow for creating collection bids using the Orderbook SDK:

#### **Preparing Collection Bids**: [Implementation in page.tsx](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/orderbook/create-collection-bid-with-nextjs/src/app/create-collection-bid-with-erc721/page.tsx)
```typescript
const prepareERC721CollectionBid = async (): Promise<orderbook.PrepareCollectionBidResponse> => {
  const buyItem: ERC20Item = {
    type: "ERC20",
    contractAddress: buyItemContractAddress,
    amount: buyItemTokenAmount,
  };

  const sellItem: ERC721CollectionItem = {
    type: "ERC721_COLLECTION",
    contractAddress: sellItemContractAddress,
    amount: sellItemAmount,
  };

  // Prepare the collection bid parameters
  const params: PrepareCollectionBidParams = {
    sellItem,
    buyItem,
  };

  return await orderbookSDK.prepareBid(params);
};
```

The code prepares a collection bid by specifying the buy item (ERC20 token) and sell item (ERC721 collection). It then calls the Orderbook SDK's `prepareBid` method with these parameters.

#### **Approving Token Transfers**: [Implementation in collectionBid.ts](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/orderbook/create-collection-bid-with-nextjs/src/app/utils/collectionBid.ts)
```typescript
export const signAndSubmitApproval = async (
  provider: BrowserProvider,
  collectionBid: orderbook.PrepareBidResponse,
): Promise<void> => {
  const signer = await provider.getSigner();

  // Filter for approval transaction actions
  const approvalActions = collectionBid.actions.filter(
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

This function handles the approval process, which is necessary before creating a collection bid. It processes all transaction actions returned by the `prepareBid` method, allowing the Immutable Seaport contract to transfer tokens on behalf of the user.

#### **Signing Collection Bids**: [Implementation in collectionBid.ts](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/orderbook/create-collection-bid-with-nextjs/src/app/utils/collectionBid.ts)
```typescript
export const signCollectionBid = async (
  provider: BrowserProvider,
  bid: orderbook.PrepareBidResponse,
): Promise<string> => {
  const signer = await provider.getSigner();

  // Find the signable action
  const signableAction = bid.actions.find(
    (action): action is orderbook.SignableAction =>
      action.type === orderbook.ActionType.SIGNABLE,
  )!;

  // Sign the order with EIP-712
  const signature = await signer.signTypedData(
    signableAction.message.domain,
    signableAction.message.types,
    signableAction.message.value,
  );

  return signature;
};
```

This function signs the collection bid using EIP-712 typed data signatures. This signature validates the order and allows it to be fulfilled by other users.

#### **Creating Collection Bids**: [Implementation in collectionBid.ts](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/orderbook/create-collection-bid-with-nextjs/src/app/utils/collectionBid.ts)
```typescript
export const createCollectionBid = async (
  client: orderbook.Orderbook,
  preparedBid: orderbook.PrepareBidResponse,
  orderSignature: string,
  makerEcosystemFee?: {
    recipientAddress: string;
    amount: string;
  },
): Promise<string> => {
  const order = await client.createCollectionBid({
    orderComponents: preparedBid.orderComponents,
    orderHash: preparedBid.orderHash,
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

This function submits the prepared and signed collection bid to the Orderbook service. It also demonstrates how to include optional maker marketplace fees.

### Integration with Passport for Authentication
The example also demonstrates integration with Immutable Passport for authentication and wallet connection:

```typescript
const passportLogin = async () => {
  if (browserProvider?.send) {
    setLoadingState(true);
    setLoadingText("Connecting to Passport");

    // Trigger Passport login flow
    const accounts = await browserProvider.send("eth_requestAccounts", []);

    setAccountsState(accounts);
    setLoadingState(false);
  }
};
```

The Passport integration provides a seamless authentication experience for users.

## Running the App

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later)
- [pnpm](https://pnpm.io/installation)
- [Immutable Hub Account](https://hub.immutable.com/) for environment setup

### Setup Instructions
1. Clone the repository
```bash
git clone https://github.com/immutable/ts-immutable-sdk.git
cd ts-immutable-sdk/examples/orderbook/create-collection-bid-with-nextjs
```

2. Install dependencies
```bash
pnpm install
```

3. Create a `.env` file based on `.env.example` and add your Immutable Hub credentials
```
NEXT_PUBLIC_PUBLISHABLE_KEY=<Your publishable key from Immutable Hub>
NEXT_PUBLIC_CLIENT_ID=<Your client ID from Immutable Hub>
```

4. Start the development server
```bash
pnpm dev
```

5. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

## Summary
This example demonstrates how to implement collection bids using the Immutable Orderbook SDK in a Next.js application. It covers the complete workflow from preparing collection bids to handling approvals, signing orders, and finally submitting the collection bids. The application also showcases integration with Immutable Passport for user authentication and wallet connection.

Key takeaways:
- Creating collection bids requires preparing the bid parameters, handling approvals, signing the order data, and submitting the bid
- Collection bids can include optional maker marketplace fees
- Immutable Passport provides a seamless authentication experience
- The Orderbook SDK handles the complexity of interacting with the underlying blockchain protocols 