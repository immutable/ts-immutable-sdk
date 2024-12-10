# Passport SDK Login/Identity Example App

This example app is designed to show options after a user has logged in via Passport. 

This example app runs on Immutable Testnet. To use this code on Immutable zkEVM Mainnet make sure you instantiate the SDK with the Mainnet configuration.

## Getting Started

Install your dependencies:

```bash
yarn install
```

Copy over the `.env.example` file to `.env` and fill in the required environment variables.

## Required Environment Variables

- NEXT_PUBLIC_PUBLISHABLE_KEY // replace with your publishable API key from Hub

Run the app locally:

```bash
yarn dev
```

Then open [http://localhost:3000](http://localhost:3000) with your browser to see the result.