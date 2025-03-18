# Contract Interaction with Viem

## Introduction
This example application demonstrates how to interact with Immutable ERC721 smart contracts using Viem, a TypeScript library for Ethereum. The app showcases batch minting functionality for ERC721 tokens using two different approaches: minting by specific token IDs and minting by quantity.

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/contracts/contract-interaction-with-viem)

## Features Overview
- Batch mint ERC721 tokens by specifying token IDs
- Batch mint ERC721 tokens by specifying quantity
- Role-based permission verification before minting
- Integration with Immutable zkEVM network

## SDK Integration Details

### Role Verification
**[Permission Checking](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/contracts/contract-interaction-with-viem/batch-mint-erc721-by-id.ts#L52-L63)**: The example demonstrates how to verify if an account has the required minter role before attempting to mint tokens.

```typescript
// We can use the read function hasRole to check if the intended signer
// has sufficient permissions to mint before we send the transaction
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

### Batch Minting by Token ID
**[Batch Mint By ID](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/contracts/contract-interaction-with-viem/batch-mint-erc721-by-id.ts#L24-L73)**: This functionality allows minting multiple tokens with specific token IDs to different recipients in a single transaction.

```typescript
export const batchMintERC721ByID = async (
  privateKey: `0x${string}`,
  contractAddress: `0x${string}`,
  requests: {
    to: `0x${string}`;
    tokenIds: bigint[];
  }[],
): Promise<string> => {
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

  // Bound contract instance
  const contract = getContract({
    address: contractAddress,
    abi: ImmutableERC721Abi,
    client: walletClient,
  });

  // Permission verification code...

  const txHash = await contract.write.mintBatch([requests]);

  console.log(`txHash: ${txHash}`);
  return txHash;
};
```

### Batch Minting by Quantity
**[Batch Mint By Quantity](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/contracts/contract-interaction-with-viem/batch-mint-erc721-by-quantity.ts#L20-L70)**: This functionality enables minting a specified quantity of tokens to different recipients in a single transaction, with the contract automatically assigning token IDs.

```typescript
export const batchMintERC721ByQuantity = async (
  privateKey: `0x${string}`,
  contractAddress: `0x${string}`,
  mints: {
    to: `0x${string}`;
    quantity: bigint;
  }[],
): Promise<string> => {
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

  // Bound contract instance
  const contract = getContract({
    address: contractAddress,
    abi: ImmutableERC721Abi,
    client: walletClient,
  });

  // Permission verification code...

  const txHash = await contract.write.mintBatchByQuantity([mints]);

  console.log(`txHash: ${txHash}`);
  return txHash;
};
```

## Running the App

### Prerequisites
- Node.js installed on your machine
- A private key with minter role permissions
- An ERC721 contract deployed on Immutable zkEVM
- [Immutable Hub account](https://hub.immutable.com/) for environment setup

### Setup Instructions
1. Clone the repository and navigate to the example app directory:
   ```bash
   git clone https://github.com/immutable/ts-immutable-sdk.git
   cd ts-immutable-sdk/examples/contracts/contract-interaction-with-viem
   ```

2. Install the dependencies:
   ```bash
   pnpm i
   ```

3. Modify the example code to include your own private key and contract address:
   - Replace `PRIVATE_KEY` with your wallet's private key
   - Replace `CONTRACT_ADDRESS` with your deployed ERC721 contract address
   - Replace `ACCOUNT_ADDRESS_1` and `ACCOUNT_ADDRESS_2` with recipient addresses

4. Create a simple test script (e.g., `test.ts`) to run one of the minting functions:
   ```typescript
   import { batchMintERC721ByID, batchMintERC721ByQuantity } from './index';

   const main = async () => {
     try {
       // Example of minting by ID
       const result = await batchMintERC721ByID(
         '0xYOUR_PRIVATE_KEY',
         '0xYOUR_CONTRACT_ADDRESS',
         [
           {
             to: '0xRECIPIENT_ADDRESS_1',
             tokenIds: [BigInt(1), BigInt(2)],
           },
           {
             to: '0xRECIPIENT_ADDRESS_2',
             tokenIds: [BigInt(3), BigInt(4)],
           },
         ]
       );
       console.log('Transaction hash:', result);
     } catch (error) {
       console.error('Error:', error);
     }
   };

   main();
   ```

5. Compile and run the test script:
   ```bash
   npx ts-node test.ts
   ```

## Summary
This example demonstrates how to interact with Immutable ERC721 contracts using Viem, focusing on batch minting capabilities. The application showcases two different approaches to minting multiple tokens: by specifying exact token IDs or by quantity. It also demonstrates the importance of verifying role-based permissions before attempting to execute contract functions. Developers can use this example as a foundation to build more complex minting functionality for their NFT projects on Immutable zkEVM. 