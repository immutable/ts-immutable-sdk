<div class="display-none">

# Create Listing with Next.js

</div>

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FeeQTYUnits from '@site/docs/main/_partials/fees/fees-quantity-units.mdx';
import ListingOrderComparison from '@site/docs/main/build/typescript/usage/orderbook/_partials/listing-vs-order.mdx';


<ListingOrderComparison />

This example app demonstrates how to create NFT listings using the Immutable Orderbook SDK with Next.js. It shows how to create listings for both ERC721 and ERC1155 tokens, enabling users to list their NFTs for sale in exchange for either native currency or ERC20 tokens.

<div class="button-component">

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/orderbook/create-listing-with-nextjs) <span class="button-component-arrow">→</span>

</div>

## Features Overview

- Create NFT listings for ERC721 tokens
- Create NFT listings for ERC1155 tokens

## Prepare the listing

The call to `prepareListing` returns [actions](/products/zkEVM/orderbook/actions), order components and the order hash. The order components, order hash and a signature of from the signable action are required for creating the order in later steps. Actions for preparing a listing include both transaction and signable action types. The details of these actions are as follows:
 - `APPROVAL` transaction - An approval transaction is required when the user has not yet approved the seaport contract for the collection they are creating the listing for.
 - `CREATE_LISTING` signable message - This signable message is used to create the order on the Immutable order book.

Listing creation enforces royalties requirements based on the ERC2981 interface - prepare listing in the SDK will query the royalty information automatically.

The `maker` below is any `ethers` compatible `Signer` or `Wallet` instance for the user creating the listing.

<FeeQTYUnits />

Select the tabs below to learn about the differences between preparing listings for ERC721 and ERC1155 tokens:
<Tabs>
<TabItem value="erc721_listing" label="ERC721 listing creation">

If preparing a listing containing ERC721 tokens, the `amount` of tokens offered for sale is always `1` and therefore the `amount` field in the `sell` token section is not required.

Orders containing ERC721 tokens should be setup with the order_type as `FULL_RESTRICTED` because ERC721 orders can only be fully filled. If you are using the SDK, the order type will be automatically set based on the token type.
If using the API directly, please ensure you are setting the order type correctly in the protocol data section.

:::note
All new listings created starting May 2024 should use Signed Zone version 2 contract address as specified in the [list of deployed contracts](https://github.com/immutable/contracts/blob/main/contract_address.json).

The legacy zone contract is deprecated as of May 2024 and will be sunset in May 2025. All existing listings that were created using the legacy zone contract will continue to be supported until May 2025.

If you are using the SDK, the contract address is automatically updated for you. If you are using the API directly, please ensure you are using the correct zone contract address in the protocol data section.
:::

```tsx reference=examples/orderbook/create-listing-with-nextjs/src/app/create-listing-with-erc721/page.tsx#prepare-erc721-listing title="Prepare ERC721 Listing"
```

</TabItem>

<TabItem value="erc1155_listing" label="ERC1155 listing creation">

If preparing a listing containing ERC1155 tokens, the `amount` of tokens offered for sale should be specified in the `amount` field in the `sell` token section. The amount of tokens in the `buy` section should be a multiple of the sell token amount.

For example, if the user is listing 5 tokens for sale i.e `amount` in sell token section is `5` then the `amount` in the buy token section should be a multiple of `5` so 5, 10, 15, etc.

Orders containing ERC1155 tokens should be setup the order_type as `PARTIAL_RESTRICTED` to allow for partial fulfillment. If you are using the SDK, the order type will be automatically set based on the token type.
If using the API directly, please ensure you are setting the order type correctly in the protocol data section.

:::note
All new listings created starting May 2024 should use Signed Zone version 2 contract address as specified in the [list of deployed contracts](https://github.com/immutable/contracts/blob/main/contract_address.json).

The legacy zone contract is deprecated as of May 2024 and will be sunset in May 2025. All existing listings that were created using the legacy zone contract will continue to be supported until May 2025.

If you are using the SDK, the contract address is automatically updated for you. If you are using the API directly, please ensure you are using the correct zone contract address in the protocol data section.
:::

```tsx reference=examples/orderbook/create-listing-with-nextjs/src/app/create-listing-with-erc1155/page.tsx#prepare-erc1155-listing title="Prepare ERC1155 Listing"
```

</TabItem>
</Tabs>

## Sign and submit the approval transaction

If there is an approval transaction required for the listing, it needs to be signed and submitted to the zkEVM.

```tsx reference=examples/orderbook/create-listing-with-nextjs/src/app/utils/listing.ts#sign-and-submit-approval title="Sign and submit approval"
```

## Sign the typed order data

For an order to be created (and subsequently filled), Immutable needs a valid signature for the order data. This signature is stored off-chain and is later provided to any user wishing to fulfil the open order. The signature only allows the order to be fulfilled if it meets the conditions specified by the user that created the listing.

```tsx reference=examples/orderbook/create-listing-with-nextjs/src/app/utils/listing.ts#sign-listing title="Sign listing"
```

## Create the listing

This last step is sending the locally signed order to the Immutable orderbook where validation will be performed for the order.
If the order contains malformed data, an incorrect signature or incorrect buy / sell amounts (in case of ERC1155 listings) the server will return an invalid response,
otherwise it will be server side signed and ready to be fulfilled.

When a marketplace submits a locally signed order to the Immutable orderbook, they should include a makerFees field as demonstrated in the code block below. This fee should be represented as the net amount that the marketplace wishes to receive for the services provided, and it should be quoted in the same ERC20 token in which the order is listed.

:::note
If creating a listing for ERC1155 tokens, the fee `amount` should be a multiple of the sell token amount.
For example, if the user is selling 5 tokens, the maker fee amount should be 5, 10, 15, etc.
:::

For example, if the NFT is selling for 50 IMX, and a maker fee of 1% is applied, it should be represented like this:

<FeeQTYUnits />

```ts
makerFees: [{
  amount: '500000000000000000', // 0.5 IMX
}]
```

For additional details on fees that ecosystems like marketplaces can incorporate into orders for the services they offer, please refer to our [fee guide](/products/zkEVM/orderbook/fees).

Orders created will initially be in `PENDING` status. Upon further validating blockchain approval events (if necessary) and balance checks (i.e. listing owner indeed owns NFT),
it will become `ACTIVE`. You can read more about order statuses [here](/products/zkEVM/orderbook/statuses).

<ListAdmonition label="Note" type="tip" title="Status polling">
  You can poll the Get Listing endpoint to check on status updates - in the near
  future we also plan on introducing push based (webhook) integration for order
  events.
</ListAdmonition>

```tsx reference=examples/orderbook/create-listing-with-nextjs/src/app/utils/listing.ts#create-listing title="Create Listing"
```

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

```bash
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