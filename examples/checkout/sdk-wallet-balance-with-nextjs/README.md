# Checkout SDK Wallet Balance Example App

This example app is designed to show you how to retrieve the wallet balance of the connected provider. It will also show you how to fetch the token's details like Name, Symbol and Decimals.

This example app runs on Immutable zkEVM Testnet. To use this code on Immutable zkEVM Mainnet make sure you instantiate the SDK with the Mainnet configuration.

## Getting Started

Install your dependencies:

```bash
pnpm install
```

Copy over the `.env.example` file to `.env` and fill in the required environment variables.

## Required Environment Variables

- NEXT_PUBLIC_PUBLISHABLE_KEY // replace with your publishable API key from Hub

Run the app locally:

```bash
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000) with your browser to see the result.