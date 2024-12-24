This example application demonstrates how to fill a listing using the Immutable SDK. The application connects to the Immutable Sandbox environment and requires a valid client ID and publishable API key (which can be retrieved from the Immutable Hub).

In order to fill a listing, valid ERC721 or ERC1155 listings should exist in the system. The application will prompt the user to connect their Passport wallet and approve the settlement contract to transfer the currency tokens on their behalf. Once the currency is approved, a listing is filled on a best effort basis.

## Features
- Fill a ERC721 listing
- Fill a ERC1155 listing

## Prerequisites
- Node.js

## Getting Started
1. Install the dependencies:

```bash
pnpm
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

## Fill a ERC721 listing
1. Click on the "Fulfill listing - Complete fulfillment with ERC721" button
2. Connect your Passport wallet
3. Filter listings based on criteria:
   - NFT Contract Address: The contract address of the ERC721 token
   - Currency Type: The type of currency (Native or ERC20) you'd like to receive for the item
4. Click on the "Submit" button
5. Approve the settlement contract to transfer tokens on your behalf
6. If successful, the listing will be fulfilled
7. If unsuccessful, an error message will be displayed

## Fill a ERC1155 listing
1. Click on the "Fulfill listing - Complete fulfillment with ERC1155" button
2. Connect your Passport wallet
3. Filter listings based on criteria:
   - NFT Contract Address: The contract address of the ERC1155 token
   - Currency Type: The type of currency (Native or ERC20) you'd like to receive for the item
4. Provide the number of units to fill
5. Click on the "Submit" button
6. Approve the settlement contract to transfer tokens on your behalf
7. If successful, the listing will be fulfilled
8. If unsuccessful, an error message will be displayed

## Required Environment Variables

- NEXT_PUBLIC_PUBLISHABLE_KEY // replace with your publishable API key from Hub
- NEXT_PUBLIC_CLIENT_ID // replace with your client ID from Hub
