# Contract Interaction with Viem

## Introduction
This example app demonstrates how to interact with Immutable smart contracts using the Viem library. It focuses on performing batch minting operations for ERC721 tokens on the Immutable zkEVM network. The example showcases two different batch minting approaches: minting by specific token IDs and minting by quantity.

## Features Overview
- Connecting to the Immutable zkEVM network using Viem
- Interacting with ERC721 contracts using the `@imtbl/contracts` ABI
- Checking permissions before executing contract functions
- Batch minting ERC721 tokens by specific IDs
- Batch minting ERC721 tokens by quantity

## SDK Integration Details

### Connecting to Immutable zkEVM Network
**Link**: [batch-mint-erc721-by-id.ts](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/contracts/contract-interaction-with-viem/batch-mint-erc721-by-id.ts#L28-L37)

**Feature Name**: Network Connection with Viem

**Implementation**:
```typescript
const immutableTestnet = defineChain({
  id: 13473,
  name: 'imtbl-zkevm-testnet',
  nativeCurrency: { name: 'IMX', symbol: 'IMX', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.immutable.com'],
    },
  },
});

const walletClient = createWalletClient({
  chain: immutableTestnet,
  transport: http(),
  account: privateKeyToAccount(privateKey),
});
```

**Explanation**: This code defines the Immutable zkEVM testnet network configuration and creates a wallet client. The `defineChain` function from Viem allows you to specify the network details, including the chain ID, name, native currency, and RPC endpoints. The wallet client is created using the network configuration, an HTTP transport, and an account derived from a private key.

### Contract Interaction Setup
**Link**: [batch-mint-erc721-by-id.ts](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/contracts/contract-interaction-with-viem/batch-mint-erc721-by-id.ts#L39-L43)

**Feature Name**: Contract Instance Creation

**Implementation**:
```typescript
const contract = getContract({
  address: contractAddress,
  abi: ImmutableERC721Abi,
  client: walletClient,
});
```

**Explanation**: This code creates a contract instance using Viem's `getContract` function. It requires the contract address, ABI, and wallet client. The ABI is imported from the `@imtbl/contracts` package, which provides the interface definitions for Immutable's smart contracts. The contract instance can be used to call read and write functions on the contract.

### Permission Checking
**Link**: [batch-mint-erc721-by-id.ts](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/contracts/contract-interaction-with-viem/batch-mint-erc721-by-id.ts#L47-L60)

**Feature Name**: Role-Based Access Control

**Implementation**:
```typescript
const minterRole = await contract.read.MINTER_ROLE();

const hasMinterRole = await contract.read.hasRole([
  minterRole,
  walletClient.account.address,
]);

if (!hasMinterRole) {
  // Handle scenario without permissions...
  console.log('Account doesnt have permissions to mint.');
  return Promise.reject(
    new Error('Account doesnt have permissions to mint.'),
  );
}
```

**Explanation**: Before attempting to mint tokens, this code checks if the wallet has the required permissions. It first retrieves the `MINTER_ROLE` constant from the contract, then uses the `hasRole` function to determine if the wallet address has that role. If the wallet doesn't have the required role, the function returns an error, preventing unauthorized minting operations.

### Batch Minting by ID
**Link**: [batch-mint-erc721-by-id.ts](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/contracts/contract-interaction-with-viem/batch-mint-erc721-by-id.ts#L62-L64)

**Feature Name**: Batch Minting ERC721 Tokens by Specific IDs

**Implementation**:
```typescript
const txHash = await contract.write.mintBatch([requests]);

console.log(`txHash: ${txHash}`);
return txHash;
```

**Explanation**: This code calls the `mintBatch` function on the contract to mint multiple ERC721 tokens with specific token IDs. The `requests` parameter is an array of objects, each containing a recipient address (`to`) and an array of token IDs (`tokenIds`) to mint for that recipient. The function returns the transaction hash, which can be used to track the transaction status.

### Batch Minting by Quantity
**Link**: [batch-mint-erc721-by-quantity.ts](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/contracts/contract-interaction-with-viem/batch-mint-erc721-by-quantity.ts#L62-L64)

**Feature Name**: Batch Minting ERC721 Tokens by Quantity

**Implementation**:
```typescript
const txHash = await contract.write.mintBatchByQuantity([mints]);

console.log(`txHash: ${txHash}`);
return txHash;
```

**Explanation**: This code calls the `mintBatchByQuantity` function on the contract to mint multiple ERC721 tokens by specifying the quantity to mint. The `mints` parameter is an array of objects, each containing a recipient address (`to`) and a quantity (`quantity`) of tokens to mint for that recipient. The function returns the transaction hash. Unlike the `mintBatch` function that requires specific token IDs, this function automatically assigns sequential token IDs.

## Running the App

This example demonstrates how to use the code in your own application. To implement this:

1. Visit [GitHub Repository](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/contracts/contract-interaction-with-viem) for full source code.

### Prerequisites
- Node.js and pnpm installed
- An Immutable Passport account and project set up through [Immutable Hub](https://hub.immutable.com)
- A deployed ERC721 contract on Immutable zkEVM
- A private key with MINTER_ROLE permission on the contract

### Steps to Use in Your Project

1. Install the required dependencies:
   ```bash
   pnpm add viem @imtbl/contracts
   ```

2. Set up your environment variables for `PRIVATE_KEY` and `CONTRACT_ADDRESS`.

3. Import the functions into your project:
   ```typescript
   import { batchMintERC721ByID, batchMintERC721ByQuantity } from './path-to-example';
   ```

4. Call the functions with the appropriate parameters:
   ```typescript
   // For minting by ID
   const requests = [
     {
       to: '0xRecipientAddress1',
       tokenIds: [BigInt(1), BigInt(2)],
     },
     {
       to: '0xRecipientAddress2',
       tokenIds: [BigInt(3), BigInt(4)],
     },
   ];
   
   const txHash = await batchMintERC721ByID(privateKey, contractAddress, requests);

   // OR for minting by quantity
   const mints = [
     {
       to: '0xRecipientAddress1',
       quantity: BigInt(3),
     },
     {
       to: '0xRecipientAddress2',
       quantity: BigInt(3),
     },
   ];
   
   const txHash = await batchMintERC721ByQuantity(privateKey, contractAddress, mints);
   ```

## Summary

This example demonstrates how to interact with Immutable smart contracts using Viem, focusing on batch minting operations for ERC721 tokens. The example showcases two approaches to batch minting: one that allows you to specify exact token IDs and another that automatically assigns IDs based on quantity.

Key takeaways:
- Viem provides a clean and type-safe way to interact with Ethereum/zkEVM contracts
- Always check permissions before attempting to perform restricted operations
- Batch operations can significantly reduce gas costs by combining multiple transactions
- The `@imtbl/contracts` package provides helpful ABIs for interacting with Immutable's standard contracts 