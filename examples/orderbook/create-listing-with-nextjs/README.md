This example application demonstrates how to create a listing using the Immutable SDK. The application connects to the Immutable Sandbox environment and requires a valid client ID and publishable API key (which can be retrieved from the Immutable Hub).

In order to create a listing, a valid ERC721 or ERC1155 token must be provided. The application will prompt the user to connect their Passport wallet and approve the token. Once the token is approved, a listing with the desired price and quantity is created.

## Features
- Create a listing using ERC721 token
- Create a listing using ERC1155 token

## Prerequisites
- Node.js

## Getting Started
First, install the dependencies:

```bash
yarn
```    

Then, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Required Environment Variables

- NEXT_PUBLIC_PUBLISHABLE_KEY // replace with your publishable API key from Hub
- NEXT_PUBLIC_CLIENT_ID // replace with your client ID from Hub
