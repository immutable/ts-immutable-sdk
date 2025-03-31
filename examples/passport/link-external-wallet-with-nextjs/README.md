# Link External Wallet with NextJS

This example demonstrates how to use the Immutable Passport SDK to link external wallets to a user's Passport account using a Next.js application.

## Overview

Immutable Passport allows users to connect external wallets (like MetaMask, WalletConnect, etc.) to their Passport account. This example shows how to implement this functionality in a Next.js application.

## Prerequisites

- Node.js (v18 or later)
- pnpm
- Immutable Hub account with a registered application to get your Client ID and Publishable Key

## Setup

1. Clone the repository and navigate to the example directory:
```bash
cd examples/passport/link-external-wallet-with-nextjs
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env` file based on the `.env.example` template and fill in your Passport credentials:
```
NEXT_PUBLIC_PUBLISHABLE_KEY=your_publishable_key
NEXT_PUBLIC_CLIENT_ID=your_client_id
```

4. Start the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the example.

## Features

This example demonstrates:
- Authentication with Immutable Passport
- Linking external wallets to a Passport account
- Displaying linked wallets
- Removing linked wallets
- Proper cleanup and error handling

## Implementation Details

The main components of this example are:

1. **Setup** - Initializing the Passport SDK in `src/app/utils/setupDefault.ts`
2. **Authentication** - Handling user login and logout flows
3. **External Wallet Connection** - Implementing the wallet linking functionality
4. **UI Components** - Creating a user-friendly interface

## Best Practices

When linking external wallets:

- Always verify the user is authenticated before attempting to link wallets
- Implement proper error handling for wallet connection failures
- Provide clear feedback to users during the linking process
- Include mechanisms to verify wallet ownership
- Always clean up resources when your component unmounts

## Testing

To run the tests:

```bash
pnpm test
```

For test coverage:

```bash
pnpm test:coverage
```

## Troubleshooting

Common issues and solutions:

- **Authentication failures**: Ensure your Client ID and Publishable Key are correct
- **Wallet connection issues**: Make sure you're using a supported wallet provider
- **Redirect problems**: Verify that your redirect URIs are configured correctly in the Immutable Hub

## References

- [Immutable Passport Documentation](https://docs.immutable.com/docs/zkEVM/passport)
- [Next.js Documentation](https://nextjs.org/docs)
- [Wallet Linking Best Practices](https://docs.immutable.com/docs/zkEVM/wallet/about) 