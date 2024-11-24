This is an example of [Sending transactions](https://docs.immutable.com/products/zkEVM/passport/wallet/transactions).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Required Environment Variables

- NEXT_PUBLIC_PUBLISHABLE_KEY // replace with your publishable API key from Hub
- NEXT_PUBLIC_CLIENT_ID // replace with your client ID from Hub

- NEXT_PUBLIC_TO_ADDRESS // replace with address you want to send the NFT to
- NEXT_PUBLIC_ERC721_ADDRESS // replace with the address of a testnet collection you've created with Immutable Hub
- NEXT_PUBLIC_TOKEN_ID // replace with token id of the token you want to send