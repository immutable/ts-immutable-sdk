# Wallet Transaction Example with Next.js

## Introduction
This example demonstrates how to integrate the Immutable Passport SDK with a Next.js application to connect a wallet and execute ERC-721 token transfer transactions on the Immutable zkEVM network. The application showcases a simple but powerful implementation that allows users to connect their wallet and send transactions with minimal UI complexity.

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/wallets-transactions-with-nextjs)

## Features Overview
- **Wallet Connection**: Connect to Immutable Passport wallet
- **Transaction Execution**: Send ERC-721 token transfer transactions on Immutable zkEVM

## SDK Integration Details

### Wallet Connection
**Feature Name**: Wallet Connection enables users to connect their blockchain wallet to your application, giving them access to their digital assets.

**Source Code**: [src/transaction.ts](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/wallets-transactions-with-nextjs/src/transaction.ts)

**Implementation**:
```typescript
const provider = await passportInstance.connectEvm();
const browserProvider = new BrowserProvider(provider);
const signer = await browserProvider.getSigner();
```

**Explanation**: 
This implementation uses the Passport SDK to connect to the user's Ethereum wallet. The `connectEvm()` method returns a provider that conforms to the EIP-1193 interface. This provider is then wrapped with ethers.js `BrowserProvider` to create a more feature-rich interface for interacting with the blockchain. Finally, a signer is obtained from the provider, which is required to sign transactions.

### Transaction Execution
**Feature Name**: Transaction Execution allows users to send blockchain transactions, such as transferring tokens.

**Source Code**: [src/transaction.ts](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/wallets-transactions-with-nextjs/src/transaction.ts)

**Implementation**:
```typescript
const [userAddress] = await provider.request({ method: 'eth_requestAccounts' });
const toAddress = process.env.NEXT_PUBLIC_TO_ADDRESS ?? '0x000';
const erc721Address = process.env.NEXT_PUBLIC_ERC721_ADDRESS ?? '0x000';
const tokenId = process.env.NEXT_PUBLIC_TOKEN_ID ?? '0';

const abi = ['function safeTransferFrom(address from, address to, uint256 tokenId)'];
const contract = new ethers.Contract(erc721Address, abi, signer);

try {
  tx = await contract.safeTransferFrom(userAddress, toAddress, tokenId);
  const receipt = await tx.wait();
} catch (error: any) {
  // Error handling
}
```

**Explanation**: 
This code demonstrates how to execute an ERC-721 token transfer on the Immutable zkEVM. It first gets the user's address and sets up the recipient address, contract address, and token ID (from environment variables). It then defines a minimal ABI for the ERC-721 contract's `safeTransferFrom` function, creates a contract instance with ethers.js, and calls the function to transfer the token. The code also includes error handling for transaction failures and waits for transaction confirmation, which typically takes only 1-8 seconds on Immutable zkEVM.

## Running the App

### Prerequisites
- Node.js (v16 or higher)
- pnpm
- Environment variables (obtain from [Immutable Hub](https://hub.immutable.com/))

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/immutable/ts-immutable-sdk.git
   cd ts-immutable-sdk
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create a `.env.local` file based on `.env.example` and add your environment variables:
   ```
   NEXT_PUBLIC_PUBLISHABLE_KEY=your_publishable_key
   NEXT_PUBLIC_CLIENT_ID=your_client_id
   NEXT_PUBLIC_TO_ADDRESS=recipient_address
   NEXT_PUBLIC_ERC721_ADDRESS=erc721_contract_address
   NEXT_PUBLIC_TOKEN_ID=token_id_to_transfer
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

5. Open your browser and navigate to http://localhost:3000

## Summary
This example demonstrates how to integrate Immutable Passport into a Next.js application to connect to a user's wallet and execute ERC-721 token transfers on the Immutable zkEVM network. The implementation showcases how to connect to wallets using the Passport SDK and use ethers.js to interact with smart contracts for transaction execution.

Key takeaways:
- The Passport SDK provides a simple interface for connecting to user wallets
- Transaction execution on Immutable zkEVM is fast (1-8 seconds in most cases)
- Combining the Passport SDK with ethers.js creates a powerful toolkit for blockchain interactions 