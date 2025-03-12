# Create Listing with Next.js

## Introduction
This example application demonstrates how to use the Immutable Orderbook SDK to create listings for both ERC721 and ERC1155 tokens using Next.js. It showcases the process of connecting to Passport for authentication, preparing listings, approving transactions, and creating listings on the Immutable marketplace. 

[View example app on GitHub](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/orderbook/create-listing-with-nextjs)

## Features Overview
- Connecting to Immutable Passport for authentication
- Creating ERC721 token listings
- Creating ERC1155 token listings
- Supporting both native token and ERC20 token payment options
- Adding optional marketplace fees to listings
- Handling the complete listing creation flow (prepare, approve, sign, create)

## SDK Integration Details

### Connecting to Passport
[View on GitHub](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/orderbook/create-listing-with-nextjs/src/app/create-listing-with-erc721/page.tsx#L47-L57)

**Feature Name**: Passport Authentication

**Implementation**:
```typescript
// fetch the Passport provider from the Passport instance
const [passportProvider, setPassportProvider] = useState<Provider>();

useEffect(() => {
  const fetchPassportProvider = async () => {
    const passportProvider = await passportInstance.connectEvm();
    setPassportProvider(passportProvider);
  };
  fetchPassportProvider();
}, []);

// create the BrowserProvider using the Passport provider
const browserProvider = useMemo(() => passportProvider ? new BrowserProvider(passportProvider) : undefined, [passportProvider]);
```

**Explanation**: The application connects to Immutable Passport to authenticate users and obtain a provider that can be used for blockchain interactions. It uses `passportInstance.connectEvm()` to obtain a provider, which is then wrapped in a BrowserProvider from ethers.js to enable Web3 operations.

### Creating an ERC721 Listing
[View on GitHub](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/orderbook/create-listing-with-nextjs/src/app/create-listing-with-erc721/page.tsx#L163-L188)

**Feature Name**: ERC721 Listing Preparation

**Implementation**:
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

**Explanation**: The application prepares an ERC721 listing by creating a sell item that specifies the ERC721 token details (contract address and token ID) and a buy item that represents what the seller wants to receive (either a native token or an ERC20 token). These parameters are passed to the `prepareListing` method of the Orderbook SDK to obtain the necessary information for the next steps in the listing process.

### Creating an ERC1155 Listing
[View on GitHub](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/orderbook/create-listing-with-nextjs/src/app/create-listing-with-erc1155/page.tsx#L169-L195)

**Feature Name**: ERC1155 Listing Preparation

**Implementation**:
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

**Explanation**: Similar to the ERC721 listing preparation, the ERC1155 listing preparation creates a sell item for an ERC1155 token, which includes an additional `amount` parameter that specifies how many tokens are being sold. This allows for the sale of multiple fungible tokens in a single listing.

### Approving Token Transfers
[View on GitHub](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/orderbook/create-listing-with-nextjs/src/app/utils/listing.ts#L5-L28)

**Feature Name**: Approving Token Transfers for the Immutable Marketplace

**Implementation**:
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

**Explanation**: Before a listing can be created, the seller must approve the Immutable Seaport contract to transfer their tokens. This function extracts the approval transactions from the prepared listing response, builds unsigned transactions for each approval, sends them using the user's wallet, and waits for the transactions to be confirmed.

### Signing a Listing
[View on GitHub](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/orderbook/create-listing-with-nextjs/src/app/utils/listing.ts#L30-L54)

**Feature Name**: Signing a Listing Order

**Implementation**:
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

**Explanation**: After approving token transfers, the seller must sign the listing order to ensure authenticity. This function finds the signable action from the prepared listing response, gets the necessary data for a typed signature (EIP-712), and uses the user's wallet to sign the data. The resulting signature is returned for use in the final step of listing creation.

### Creating a Listing with Optional Marketplace Fees
[View on GitHub](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/orderbook/create-listing-with-nextjs/src/app/utils/listing.ts#L56-L80)

**Feature Name**: Creating a Listing with Optional Marketplace Fees

**Implementation**:
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
        recipientAddress: makerEcosystemFee.recipientAddress, // Replace address with your own marketplace address
        amount: makerEcosystemFee.amount,
      },
    ] : [],
  });
  return order.result.id;
};
```

**Explanation**: The final step in the listing process is to create the listing on the Immutable marketplace. This function uses the prepared listing data, order hash, and signature to call the `createListing` method of the Orderbook SDK. It also supports adding optional marketplace fees, which allow the marketplace operator to collect a percentage of the sale amount when the listing is filled.

## Running the App

[View example app on GitHub](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/orderbook/create-listing-with-nextjs)

### Prerequisites
- Node.js v18 or later
- pnpm v8 or later
- An Immutable Hub account to set up your environment variables. [Sign up on Immutable Hub](https://hub.immutable.com/)

### Setup Environment
1. Copy the `.env.example` file to `.env.local`
2. Fill in your Immutable Hub credentials in the `.env.local` file:
   ```
   NEXT_PUBLIC_PUBLISHABLE_KEY=<your-publishable-key>
   NEXT_PUBLIC_CLIENT_ID=<your-client-id>
   ```

### Steps to Run the App
1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Start the development server:
   ```bash
   pnpm dev
   ```
3. Open your browser and navigate to http://localhost:3000

## Summary
This example application demonstrates the complete flow for creating listings for both ERC721 and ERC1155 tokens on the Immutable marketplace using the Orderbook SDK. It shows how to:

- Connect to Passport for user authentication
- Prepare listings for different token types
- Support both native and ERC20 token payments
- Handle the approval process for token transfers
- Sign and create listings with optional marketplace fees

By following this example, developers can understand how to integrate the Immutable Orderbook SDK into their Next.js applications to enable token listings. 