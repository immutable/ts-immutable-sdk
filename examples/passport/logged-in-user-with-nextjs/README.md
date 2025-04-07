# Passport SDK Login/Identity Example App

This example app is designed to show options after a user has logged in via Passport. 

This example app runs on Immutable Testnet. To use this code on Immutable zkEVM Mainnet make sure you instantiate the SDK with the Mainnet configuration.

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

## Available Features

### Linked Addresses with Passport
View wallet addresses linked to a user's Passport account.

### User Info with Passport
View user profile information after logging in.

### Verify Tokens with NextJS
View and verify ID token and access token information.

### Link External Wallet
This feature demonstrates how to link an external wallet address to a user's Passport account. The feature provides:
- Secure wallet address linking via EIP-712 signatures
- Verification that the linking wallet is owned by the user
- Adding multiple wallet types (MetaMask, External, WalletConnect)
- Secure nonce handling for request validation

## Feature Management

### Adding New Features
To add a new feature implementation to this example app:
1. Run the {feature name} generator prompt
2. Specify the new feature name when prompted
3. The generator will create a new feature implementation at `src/app/{feature name}/page.tsx`
4. Update any navigation components to include the new feature

### Updating Features
To update an existing feature implementation:
1. Run the {feature name} generator prompt
2. Specify the existing feature name to update
3. The generator will update the implementation while preserving app-specific customizations