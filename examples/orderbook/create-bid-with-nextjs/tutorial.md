# Create a Bid with Next.js

## Introduction
This tutorial demonstrates how to create bids for NFTs using the Immutable Orderbook SDK in a Next.js application. It covers how to create bids for both ERC721 and ERC1155 tokens, integrating Passport for wallet connection and handling the bid creation process.

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/orderbook/create-bid-with-nextjs)

## Features Overview
- Creating bids for ERC721 tokens
- Creating bids for ERC1155 tokens
- Setting custom marketplace fees for bids

## SDK Integration Details

### **Creating a Bid for ERC721 Tokens**: [Prepares, signs, and creates a bid for an ERC721 token](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/orderbook/create-bid-with-nextjs/src/app/create-bid-with-erc721/page.tsx)
#### Implementation
The application provides a form where users can enter the required details for creating a bid for an ERC721 token:

```typescript
// Prepare an ERC721 bid
const prepareERC721Bid = async (): Promise<orderbook.PrepareBidResponse> => {
  const sellItem: ERC20Item = {
    type: 'ERC20',
    contractAddress: sellItemContractAddress,
    amount: sellItemAmount,
  };

  const buyItem: ERC721Item = {
    type: 'ERC721',
    contractAddress: buyItemContractAddress,
    tokenId: buyItemTokenID,
  };

  const prepareBidParams: PrepareBidParams = {
    sellItem,
    buyItem,
    maker: accountsState[0],
  };

  return orderbookSDK.prepareBid(prepareBidParams);
};

// Create an ERC721 bid
const createER721Bid = async () => {
  try {
    setLoadingState(true);
    setLoadingText("Preparing ERC721 bid");
    const preparedBid = await prepareERC721Bid();
    
    setLoadingText("Approving token");
    await signAndSubmitApproval(browserProvider!, preparedBid);
    
    setLoadingText("Signing bid");
    const orderSignature = await signBid(browserProvider!, preparedBid);
    
    setLoadingText("Creating bid");
    const bidID = await createBid(
      orderbookSDK,
      preparedBid,
      orderSignature,
      makerEcosystemFeeRecipient && makerEcosystemFeeAmount ? {
        recipientAddress: makerEcosystemFeeRecipient,
        amount: makerEcosystemFeeAmount,
      } : undefined
    );
    
    handleSuccessfulBidCreation(bidID);
    setLoadingState(false);
  } catch (error) {
    // Error handling
  }
};
```

#### Explanation
The code works by:
1. Preparing the bid by defining the sell item (ERC20 token used for payment) and buy item (ERC721 token the user wants to purchase)
2. Approving the ERC20 token for trading by calling the `signAndSubmitApproval` function
3. Signing the bid using the `signBid` function, which creates a signature for the order
4. Creating the bid by submitting the order components, order hash, and signature to the Orderbook API
5. Optionally adding marketplace fees for the maker

### **Creating a Bid for ERC1155 Tokens**: [Prepares, signs, and creates a bid for an ERC1155 token](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/orderbook/create-bid-with-erc1155/page.tsx)
#### Implementation
The application provides a form where users can enter the required details for creating a bid for an ERC1155 token, including the quantity:

```typescript
// Prepare an ERC1155 bid
const prepareERC1155Bid = async (): Promise<orderbook.PrepareBidResponse> => {
  const sellItem: ERC20Item = {
    type: 'ERC20',
    contractAddress: sellItemContractAddress,
    amount: sellItemAmount,
  };

  const buyItem: ERC1155Item = {
    type: 'ERC1155',
    contractAddress: buyItemContractAddress,
    tokenId: buyItemTokenID,
    amount: buyItemQty,
  };

  const prepareBidParams: PrepareBidParams = {
    sellItem,
    buyItem,
    maker: accountsState[0],
  };

  return orderbookSDK.prepareBid(prepareBidParams);
};
```

#### Explanation
The process for creating an ERC1155 bid is similar to creating an ERC721 bid, with the main difference being that an ERC1155 bid includes an additional `amount` parameter, which specifies the quantity of tokens to bid for. This is because ERC1155 tokens are semi-fungible and can have multiple copies of the same token ID.

### **Signing and Submitting Approvals**: [Handles token approvals for trading](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/orderbook/create-bid-with-nextjs/src/app/utils/bid.ts)
#### Implementation
```typescript
export const signAndSubmitApproval = async (
  provider: BrowserProvider,
  bid: orderbook.PrepareBidResponse,
): Promise<void> => {
  // get your user's Web3 wallet, e.g. MetaMask, Passport, etc
  const signer = await provider.getSigner();

  // If the user hasn't yet approved the Immutable Seaport contract to transfer assets from this
  // collection on their behalf they'll need to do so before they create an order
  const approvalActions = bid.actions.filter(
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

#### Explanation
Before creating a bid, the user must approve the Immutable Seaport contract to transfer tokens on their behalf. This function:
1. Gets the user's Web3 wallet
2. Filters for transaction actions in the prepared bid response
3. Builds and sends the approval transaction for each action
4. Waits for the transaction receipt, confirming that the approval was successful

### **Signing Bids**: [Creates cryptographic signatures for order data](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/orderbook/create-bid-with-nextjs/src/app/utils/bid.ts)
#### Implementation
```typescript
export const signBid = async (
  provider: BrowserProvider,
  bid: orderbook.PrepareBidResponse,
): Promise<string> => {
  // get your user's Web3 wallet, e.g. MetaMask, Passport, etc
  const signer = await provider.getSigner();

  // For an order to be created (and subsequently filled), Immutable needs a valid signature for the order data.
  // This signature is stored off-chain and is later provided to any user wishing to fulfil the open order.
  // The signature only allows the order to be fulfilled if it meets the conditions specified by the user that created the bid.
  const signableAction = bid.actions.find(
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

#### Explanation
For an order to be created and subsequently filled, Immutable needs a valid signature for the order data. This function:
1. Gets the user's Web3 wallet
2. Finds the signable action in the prepared bid response
3. Signs the typed data using EIP-712 standard
4. Returns the signature, which will be used when creating the bid

### **Creating Bids**: [Submits the bid to the Orderbook API](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/orderbook/create-bid-with-nextjs/src/app/utils/bid.ts)
#### Implementation
```typescript
export const createBid = async (
  client: orderbook.Orderbook,
  preparedBid: orderbook.PrepareBidResponse,
  orderSignature: string,
  makerEcosystemFee?: {
    recipientAddress: string;
    amount: string;
  },
): Promise<string> => {
  const order = await client.createBid({
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

#### Explanation
This function creates a bid by submitting the prepared bid, signature, and optional marketplace fees to the Orderbook API. It:
1. Takes the Orderbook client, prepared bid, order signature, and optional maker ecosystem fee
2. Calls the `createBid` method on the Orderbook client with the order components, order hash, and signature
3. Includes optional maker marketplace fees if specified
4. Returns the created bid's ID

## Running the App

### Prerequisites
- Node.js
- A valid client ID and publishable API key from [Immutable Hub](https://hub.immutable.com)

### Steps
1. Install the dependencies:
   ```bash
   pnpm i
   ```

2. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

3. Replace the `NEXT_PUBLIC_PUBLISHABLE_KEY` and `NEXT_PUBLIC_CLIENT_ID` in the `.env` file with your own values from the Immutable Hub.

4. Run the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to access the application.

### Creating an ERC721 Bid
1. Click on the "Create ERC721 Bid" button
2. Connect your Passport wallet
3. Enter the following details:
   - NFT Contract Address: The contract address of the ERC721 token
   - NFT Token ID: The Token ID of the ERC721 token
   - ERC20 Currency Contract Address: The contract address of ERC20 you'd like to use to make payment for the item
   - Currency Amount: The amount of currency you'd like to use
   - (Optional) Maker Ecosystem Fee Recipient: Address to receive the marketplace fee
   - (Optional) Maker Ecosystem Fee Amount: Amount of the marketplace fee
4. Click on the "Create Bid" button
5. Approve the ERC20 token balance for trading
6. Sign the bid
7. If successful, the bid will be created, and the order ID will be displayed

### Creating an ERC1155 Bid
1. Click on the "Create ERC1155 Bid" button
2. Connect your Passport wallet
3. Enter the following details:
   - NFT Contract Address: The contract address of the ERC1155 token
   - NFT Token ID: The Token ID of the ERC1155 token
   - NFT Token Quantity: The amount of ERC1155 tokens you'd like to bid for
   - ERC20 Currency Contract Address: The contract address of ERC20 you'd like to use to make payment for the item
   - Currency Amount: The amount of currency you'd like to use
   - (Optional) Maker Ecosystem Fee Recipient: Address to receive the marketplace fee
   - (Optional) Maker Ecosystem Fee Amount: Amount of the marketplace fee
4. Click on the "Create Bid" button
5. Approve the ERC20 token balance for trading
6. Sign the bid
7. If successful, the bid will be created, and the order ID will be displayed

## Summary
This example demonstrates how to create bids for both ERC721 and ERC1155 tokens using the Immutable Orderbook SDK in a Next.js application. It covers the full process from preparing the bid, approving the tokens, signing the order, and creating the bid. The application also shows how to include marketplace fees in the bid creation process, providing a complete foundation for building a marketplace on Immutable.

Key takeaways:
- The Orderbook SDK provides a simple interface for creating bids
- The bid creation process involves three main steps: preparing the bid, approving tokens, and signing the order
- You can create bids for both ERC721 and ERC1155 tokens with different parameters
- Marketplace fees can be added to bids to generate revenue for your marketplace 