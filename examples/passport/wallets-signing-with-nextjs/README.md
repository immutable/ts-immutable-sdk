# Passport Signing and Verification Example App

This example app is designed to show you how to sign data with Passport and verify that the signature is valid.

This example app runs on Immutable Testnet. To use this code on Immutable zkEVM Mainnet make sure you instantiate the SDK with the Mainnet configuration.

You must ensure your wallet has made at least one transaction on Immutable Testnet so the smart contract wallet gets deployed. 
You can still sign messages without the smart contract wallet deployed but you can not verify the signed messages without a deployed wallet.

If you are using ERC-191 to sign & verify messages 
you can set the `forceScwDeployBeforeMessageSignature` property to `true` in your passport config to force the smart contract wallet to deploy if it hasn't already.

```ts
const passportInstance = new passport.Passport({
  ...
  forceScwDeployBeforeMessageSignature: true,
});
```

The `forceScwDeployBeforeMessageSignature` flag has no effect if you're using EIP-712 to sign & verify messages, in which case you will need to manually transact with the wallet before signing by receiving some tokens or assets.

## Getting Started

Install your dependencies:

```bash
pnpm install
```

Copy over the `.env.example` file to `.env` and fill in the required environment variables.

## Required Environment Variables

- NEXT_PUBLIC_PUBLISHABLE_KEY // replace with your publishable API key from Hub
- NEXT_PUBLIC_CLIENT_ID // replace with your client ID from Hub

Run the app locally:

```bash
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

