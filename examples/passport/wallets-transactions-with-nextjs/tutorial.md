# Wallet Transactions with Next.js

## Introduction
This example app demonstrates how to send transactions using Immutable Passport with a Next.js application. It shows how to connect to a user's wallet and send NFT transfers on the Immutable zkEVM network.

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/wallets-transactions-with-nextjs)

## Features Overview
- **Connecting to Ethereum wallets** - Establishing a connection to a user's Ethereum wallet using Passport
- **Sending NFT transactions** - Transferring NFT ownership using smart contract interactions
- **Transaction feedback** - Handling transaction responses and errors

## SDK Integration Details

### **Connecting to Ethereum wallets**: A feature that allows users to connect their wallet through Passport.
[Source Code](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/wallets-transactions-with-nextjs/src/transaction.ts#L4-L7)

**Implementation:**
```typescript
const provider = await passportInstance.connectEvm();
```

**Explanation:**
The application uses the `connectEvm()` method from the Passport SDK to establish a connection to the user's Ethereum wallet. This method returns a provider that adheres to the EIP-1193 standard, which can be used to interact with the Ethereum blockchain.

### **Sending NFT transactions**: A feature that demonstrates how to transfer an NFT using a smart contract.
[Source Code](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/wallets-transactions-with-nextjs/src/transaction.ts#L8-L40)

**Implementation:**
```typescript
const browserProvider = new BrowserProvider(provider);
const signer = await browserProvider.getSigner();

const [userAddress] = await provider.request({ method: 'eth_requestAccounts' });
const toAddress = process.env.NEXT_PUBLIC_TO_ADDRESS ?? '0x000';
const erc721Address = process.env.NEXT_PUBLIC_ERC721_ADDRESS ?? '0x000';
const tokenId = process.env.NEXT_PUBLIC_TOKEN_ID ?? '0';

// The Application Binary Interface (ABI) of a contract
const abi = ['function safeTransferFrom(address from, address to, uint256 tokenId)'];

// Create contract instance
const contract = new ethers.Contract(erc721Address, abi, signer);
let tx;
// Send the transaction
try {
  tx = await contract.safeTransferFrom(userAddress, toAddress, tokenId);
} catch (error: any) {
  // Handle user denying signature
  if (error.code === 4001) {
    console.error('user denied signature');
  } else {
    console.error('something went wrong: ', error.message);
  }
}
```

**Explanation:**
After connecting to the user's wallet, the application:
1. Creates an ethers.js BrowserProvider from the EIP-1193 provider
2. Gets a signer from the provider to create signed transactions
3. Retrieves the user's Ethereum address
4. Defines the contract ABI (function interface) for the ERC-721 NFT standard
5. Creates a contract instance using ethers.js
6. Calls the `safeTransferFrom` function to transfer the NFT from the user's address to the destination address
7. Implements error handling for user rejection and other potential issues

### **Transaction feedback**: A feature that handles transaction completion and status.
[Source Code](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/wallets-transactions-with-nextjs/src/transaction.ts#L42-L52)

**Implementation:**
```typescript
// Wait for the transaction to complete
// On Immutable zkEVM, this takes 1-8 seconds in 99.9% of cases
const receipt = await tx.wait();

switch (receipt.status) {
  // Failure
  case 0:
    break;
  // Success
  case 1:
    break;
  default:
    break;
}
```

**Explanation:**
The application waits for the transaction to be mined using the `wait()` method, which returns a transaction receipt. It then checks the status of the transaction (0 for failure, 1 for success) and can perform different actions based on the outcome. This pattern allows developers to provide feedback to users about their transaction status.

## Running the App

### Prerequisites
- Node.js 18.x or later
- An Immutable Hub account for obtaining your API keys
- Set up your environment variables (see below)
- A testnet NFT collection created on [Immutable Hub](https://hub.immutable.com)

### Environment Setup
1. Copy `.env.example` to `.env.local` and fill in the following details:
   ```
   NEXT_PUBLIC_PUBLISHABLE_KEY=<your publishable key from Hub>
   NEXT_PUBLIC_CLIENT_ID=<your client ID from Hub>
   NEXT_PUBLIC_TO_ADDRESS=<recipient address for the NFT>
   NEXT_PUBLIC_ERC721_ADDRESS=<your ERC721 contract address>
   NEXT_PUBLIC_TOKEN_ID=<token ID to transfer>
   ```

### Running Locally
1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the development server:
   ```bash
   pnpm dev
   ```

3. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

4. Click the "Send Transaction" button to initiate an NFT transfer

## Summary
This example demonstrates how to integrate Immutable Passport's wallet connection and transaction capabilities in a Next.js application. You've learned how to:

- Connect to a user's Ethereum wallet using Passport
- Create and send NFT transfer transactions using ethers.js and the Passport provider
- Handle transaction responses and error conditions
- Wait for transactions to complete and process their status

This pattern can be extended to support various other transaction types on Immutable zkEVM, such as minting NFTs, trading assets, or interacting with any smart contract. 