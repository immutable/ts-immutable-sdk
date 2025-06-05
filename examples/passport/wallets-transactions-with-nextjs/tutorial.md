<div class="display-none">

# Wallet Connection and Transaction Execution with Next.js

</div>

This tutorial demonstrates how to integrate Immutable Passport's wallet connection and transaction execution capabilities within a Next.js application. It showcases how to establish a connection to the user's wallet and execute transactions on the Immutable zkEVM network.

<div class="button-component">

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/wallets-transactions-with-nextjs) <span class="button-component-arrow">→</span>

</div>

## Features Overview

- **Wallet Connection**: Connect to users' wallets through Immutable Passport
- **Transaction Execution**: Execute ERC-721 token transfers on Immutable zkEVM

## SDK Integration Details

### Wallet Connection

Establishes a connection to the user's wallet using Passport.

```typescript title="Connect Wallet" manualLink="https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/wallets-transactions-with-nextjs/src/transaction.ts"
const provider = await passportInstance.connectEvm();
const browserProvider = new BrowserProvider(provider);
const signer = await browserProvider.getSigner();
const [userAddress] = await provider.request({ method: 'eth_requestAccounts' });
```

The application uses Passport's `connectEvm()` method to establish a connection to the user's wallet. This method returns a provider that can be used with ethers.js. The code then creates a BrowserProvider using this provider, gets a signer for transactions, and retrieves the user's Ethereum address.

### Transaction Execution

Shows how to execute transactions, specifically an ERC-721 token transfer, using the connected wallet.

```typescript title="Execute Transaction" manualLink="https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/wallets-transactions-with-nextjs/src/transaction.ts"
const abi = ['function safeTransferFrom(address from, address to, uint256 tokenId)'];
const contract = new ethers.Contract(erc721Address, abi, signer);

try {
  tx = await contract.safeTransferFrom(userAddress, toAddress, tokenId);
  // Wait for the transaction to complete
  const receipt = await tx.wait();
} catch (error: any) {
  // Handle errors
}
```

The application demonstrates how to interact with an ERC-721 smart contract for transferring NFTs. It creates a contract instance using ethers.js, then calls the `safeTransferFrom` method to transfer a token from the user's address to another address. The code also includes error handling and transaction receipt verification.

## Running the App

### Prerequisites

1. Node.js and pnpm installed
2. An account on [Immutable Hub](https://hub.immutable.com/) for obtaining API keys
3. A created testnet collection with minted tokens on Immutable zkEVM

### Setting up the Environment

1. Copy `.env.example` to `.env.local` and fill in:
   ```
   NEXT_PUBLIC_PUBLISHABLE_KEY=your_publishable_key
   NEXT_PUBLIC_CLIENT_ID=your_client_id
   ```

2. Configure your Hub application:
   - Add `http://localhost:3000/redirect` as a redirect URI
   - Add `http://localhost:3000/logout` as a logout URI

### Running Locally

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the development server:
   ```bash
   pnpm dev
   ```

3. Open your browser to http://localhost:3000

### Using the App

1. Click the "Send Transaction" button
2. Complete the Passport authentication flow if not already logged in
3. Approve the transaction in your connected wallet
4. The app will handle the transaction and show the result

## Summary

This example demonstrates the integration of Immutable Passport's wallet connection and transaction execution capabilities within a Next.js application. By following this tutorial, developers can implement wallet connections and execute blockchain transactions in their own applications, allowing for seamless interaction with the Immutable zkEVM ecosystem. 