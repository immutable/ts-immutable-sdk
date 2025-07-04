import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ListAdmonition from '@site/src/components/ListAdmonition';
import ListingOrderComparison from '@site/docs/main/build/typescript/usage/orderbook/_partials/listing-vs-order.mdx'
import FeeQTYUnits from '@site/docs/main/_partials/fees/fees-quantity-units.mdx';


<ListAdmonition label="Prerequisites">
    <li><a href="/build/typescript/usage/orderbook/setup#create-signers-for-user-authorisation">Create signers</a></li>
</ListAdmonition>
<ListingOrderComparison />


<div class="display-none">

# Fulfill Listing with Next.js

</div>


This tutorial demonstrates how to implement NFT listing fulfillment using the Immutable Orderbook SDK with Next.js. The application showcases how to fulfill both ERC721 and ERC1155 listings, providing a complete workflow from listing discovery to transaction execution.


<div class="button-component">

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/orderbook/fulfill-listing-with-nextjs) <span class="button-component-arrow">→</span>

</div>



## Features Overview

- Fulfill ERC721 listings using the Orderbook SDK
- Fulfill ERC1155 listings with specific unit amounts using the Orderbook SDK
- Filter active listings by contract address and currency type
- Apply taker ecosystem fees during fulfillment

## Get, sign and send transactions for fulfillment

This call returns actions that are required to fulfill an order. For fulfillment all actions are [transaction actions](/products/zkEVM/orderbook/actions) and include a type and builder method that can be used to generate the raw transaction for submission. The purpose of these transactions are as follows:
 - `APPROVAL` - An approval transaction is required to be submitted before the fulfillment transaction if spending an ERC20 token and the seaport contract does not yet have the required allowance.
 - `FULFILL_ORDER` - The fulfillment transaction to be submitted to fulfill the order.

The `taker` below is any `ethers` compatible `Signer` or `Wallet` instance for the user creating the listing.

When a marketplace submits a fulfill order request, they could include a `takerFees` field as demonstrated in the code block below. This fee should be represented as the net amount that the marketplace wishes to receive for the services provided, and it should be quoted in the same ERC20 (or native) token in which the order is listed.

The `fulfillOrder` call also returns the expiry for the transactions (if an user submits a transaction after the expiration it will fail on chain) and the `order` entity with confirmed fee information.

<ListAdmonition label="Note" type="tip" title="Fees">
    Read more about fees <a href="/products/zkEVM/orderbook/fees">here</a>
</ListAdmonition>

<ListAdmonition label="Note" type="tip" title="Approval">
  If the taker has purchased NFTs in the currency before, or if the listing is in the native token, no approval will be required and there will be only one fulfillment transaction in the list of actions.
</ListAdmonition>

<FeeQTYUnits />

Select the tabs below to learn about filling ERC721 and ERC1155 listings:
<Tabs>
<TabItem value="erc721_fulfillment" label="ERC721 fulfillment">

```tsx reference=examples/orderbook/fulfill-listing-with-nextjs/src/app/fulfill-listing-with-erc721/page.tsx#fulfill-erc721-listing title="Fill ERC721 Listing"
```

The fulfillment transaction is now processed. You can poll [Get orders](/products/zkEVM/orderbook/get) for the off-chain representation of the order.

The order will asynchronously transition to `FILLED` once on-chain events have been registered by Immutable services.

As shown below, the `fill_status` field in the response of the [Get orders](/products/zkEVM/orderbook/get) endpoint will have the `numerator` and `denominator` values equal to `1` to indicate that the order has been fully filled.

```json
{
  "fill_status":{
    "numerator": "1",
    "denominator": "1"
}
```

:::note
For further details on order fill status, see the [following product guide](/products/zkEVM/orderbook/fill-status)
:::

</TabItem>

<TabItem value="erc1155_fulfillment" label="ERC1155 fulfillment">

It is possible to partially fill ERC1155 orders and if only a portion of the order is to be filled (partial fill scenario), an optional `amountToFill` parameter is used to specific the quantity of tokens to be filled.
If the `amountToFill` parameter is not specified for ERC1155 orders, the entire order will be filled.

If an order is attempted to be filled beyond the available quantity a `best effort` fulfillment is attempted where the order is filled up to the available quantity.

If fulfilling an ERC1155 order, the taker fee `amount` should be a multiple of the sell token amount. For example, if the original listing is selling `5` tokens, the taker fee amount should be a multiple of `5` so 5, 10, 15, etc.

:::note
The taker fee amount should reflect the complete view of the order and should not be scaled down in the case of a partial fill.

For example, if the original listing is selling `5` tokens at `100` IMX each and the taker fee is `1%` (i.e., `1` IMX per token), the taker fee amount on all fills (partial or full) should be `5` IMX. The orderbook will pro-rate the fee for the marketplace based on the quantity executed.
:::

```tsx reference=examples/orderbook/fulfill-listing-with-nextjs/src/app/fulfill-listing-with-erc1155/page.tsx#fulfill-erc1155-listing title="Fill ERC1155 Listing"
```

The fulfillment transaction is now processed. You can poll [Get orders](/products/zkEVM/orderbook/get) for the off-chain representation of the order.

The order will asynchronously transition to `FILLED` if the order was fully filled and once on-chain events have been registered by Immutable services. If however, the order was only partially filled the order will stay in the `ACTIVE` state.

The `fill_status` field in the response of the [Get orders](/products/zkEVM/orderbook/get) endpoint will indicate the ratio of the order that is currently filled. If the order has been fully filled, the `numerator` and `denominator` values will be equal.

For instance, the below snipped would indicate that 50% of the order has been filled.

```json
{
  "fill_status":{
    "numerator": "1",
    "denominator": "2"
}
```

:::note
For further details on order fill status, see the [following product guide](/products/zkEVM/orderbook/fill-status)
:::

</TabItem>
</Tabs>

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