This example application demonstrates how to create a collection bid using the Immutable SDK. The application connects to the Immutable Sandbox environment and requires a valid client ID and publishable API key (which can be retrieved from the Immutable Hub).

In order to create a collection bid, a valid ERC721 or ERC1155 token must be provided. The application will prompt the user to connect their Passport wallet and approve the token. Once the token is approved, a bid with the desired price and quantity is created.

## Features
- Create a collection bid for an ERC721 collection
- Create a collection bid for an ERC1155 collection

## Prerequisites
- Node.js

## Getting Started
1. Install the dependencies:

```bash
pnpm i
```

2. Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

3. Replace the `NEXT_PUBLIC_PUBLISHABLE_KEY` and `NEXT_PUBLIC_CLIENT_ID` with your own values from the Immutable Hub.


4. Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser and you'll be navigated to the home screen.

## Create collection bid for ERC721 token
1. Click on the "Create ERC721 Collection Bid" button
2. Connect your Passport wallet
3. Enter the following details
   - NFT Contract Address: The contract address of the ERC721 token
   - NFT Token Amount: The number of ERC721 you're willing to purchase from the collection, default to 1
   - ERC20 Currency Contract Address: The contract address of ERC20 you'd like to use to make payment for the item
   - Currency Amount: The amount of currency you'd like use
4. Click on the "Create Collection Bid" button
5. Approve the ERC20 token balance for trading
6. Sign the collection bid creation message
7. If successful, the collection bid will be created and the order ID will be displayed
8. If unsuccessful, an error message will be displayed

## Create collection bid for ERC1155 token
1. Click on the "Create ERC1155 Collection Bid" button
2. Connect your Passport wallet
3. Enter the following details
    - NFT Contract Address: The contract address of the ERC1155 token
    - NFT Token Quantity: The amount of ERC1155 tokens you'd like to bid for
    - ERC20 Currency Contract Address: The contract address of ERC20 you'd like to use to make payment for the item
    - Currency Amount: The amount of currency you'd like use
4. Click on the "Create Collection Bid" button
5. Approve the ERC20 token balance for trading
6. Sign the collection bid creation message
7. If successful, the collection bid will be created and the order ID will be displayed
8. If unsuccessful, an error message will be displayed

## Required Environment Variables

- NEXT_PUBLIC_PUBLISHABLE_KEY // replace with your publishable API key from Hub
- NEXT_PUBLIC_CLIENT_ID // replace with your client ID from Hub
