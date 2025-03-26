<div class="display-none">

# Contract Interaction with Viem

</div>

This example demonstrates how to interact with Immutable ERC721 contracts using Viem, a TypeScript library for Ethereum. The app showcases batch minting functionality for ERC721 tokens in two different ways: by specific token IDs and by quantity.

<div class="button-component">

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/contracts/contract-interaction-with-viem) <span class="button-component-arrow">→</span>

</div>

## Features Overview

- Batch minting ERC721 tokens by specific token IDs
- Batch minting ERC721 tokens by quantity

## SDK Integration Details

### Batch Mint ERC721 by ID

**Feature Name**: Batch minting of ERC721 tokens with specific token IDs

**Source Code**: [batch-mint-erc721-by-id.ts](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/contracts/contract-interaction-with-viem/batch-mint-erc721-by-id.ts)

**Implementation**:

```typescript
export const batchMintERC721ByID = async (
  privateKey: `0x${string}`,
  contractAddress: `0x${string}`,
  requests: {
    to: `0x${string}`;
    tokenIds: bigint[];
  }[],
): Promise<string> => {
  // Set up the chain configuration for Immutable zkEVM testnet
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

  // Create a wallet client with the private key
  const walletClient = createWalletClient({
    chain: immutableTestnet,
    transport: http(),
    account: privateKeyToAccount(privateKey),
  });

  // Get a contract instance
  const contract = getContract({
    address: contractAddress,
    abi: ImmutableERC721Abi,
    client: walletClient,
  });

  // Check if the account has minter role
  const minterRole = await contract.read.MINTER_ROLE();
  const hasMinterRole = await contract.read.hasRole([
    minterRole,
    walletClient.account.address,
  ]);

  if (!hasMinterRole) {
    console.log('Account doesnt have permissions to mint.');
    return Promise.reject(
      new Error('Account doesnt have permissions to mint.'),
    );
  }

  // Execute the batch mint operation
  const txHash = await contract.write.mintBatch([requests]);
  console.log(`txHash: ${txHash}`);
  return txHash;
};
```

**Explanation**:

This code demonstrates how to batch mint ERC721 tokens by specific token IDs using the Viem library:

1. It sets up a connection to the Immutable zkEVM testnet.
2. It creates a wallet client using the provided private key.
3. It connects to an Immutable ERC721 contract using the provided contract address.
4. It verifies that the wallet has the MINTER_ROLE permission on the contract.
5. It calls the `mintBatch` function with an array of requests, where each request specifies a recipient address and an array of token IDs to mint.
6. It returns the transaction hash for monitoring.

### Batch Mint ERC721 by Quantity

**Feature Name**: Batch minting of ERC721 tokens by quantity

**Source Code**: [batch-mint-erc721-by-quantity.ts](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/contracts/contract-interaction-with-viem/batch-mint-erc721-by-quantity.ts)

**Implementation**:

```typescript
export const batchMintERC721ByQuantity = async (
  privateKey: `0x${string}`,
  contractAddress: `0x${string}`,
  mints: {
    to: `0x${string}`;
    quantity: bigint;
  }[],
): Promise<string> => {
  // Set up the chain configuration for Immutable zkEVM testnet
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

  // Create a wallet client with the private key
  const walletClient = createWalletClient({
    chain: immutableTestnet,
    transport: http(),
    account: privateKeyToAccount(privateKey),
  });

  // Get a contract instance
  const contract = getContract({
    address: contractAddress,
    abi: ImmutableERC721Abi,
    client: walletClient,
  });

  // Check if the account has minter role
  const minterRole = await contract.read.MINTER_ROLE();
  const hasMinterRole = await contract.read.hasRole([
    minterRole,
    walletClient.account.address,
  ]);

  if (!hasMinterRole) {
    console.log('Account doesnt have permissions to mint.');
    return Promise.reject(
      new Error('Account doesnt have permissions to mint.'),
    );
  }

  // Execute the batch mint by quantity operation
  const txHash = await contract.write.mintBatchByQuantity([mints]);
  console.log(`txHash: ${txHash}`);
  return txHash;
};
```

**Explanation**:

This code demonstrates how to batch mint ERC721 tokens by quantity using the Viem library:

1. It sets up a connection to the Immutable zkEVM testnet.
2. It creates a wallet client using the provided private key.
3. It connects to an Immutable ERC721 contract using the provided contract address.
4. It verifies that the wallet has the MINTER_ROLE permission on the contract.
5. It calls the `mintBatchByQuantity` function with an array of mint requests, where each request specifies a recipient address and the quantity of tokens to mint.
6. It returns the transaction hash for monitoring.

## Running the App

### Prerequisites

- Node.js installed
- An Immutable Wallet with IMX tokens for gas fees. You can set up your wallet through [Immutable Hub](https://hub.immutable.com).
- An Immutable ERC721 contract deployed on the zkEVM testnet
- A private key with minter role permissions on the contract

### Steps to Run the Example

1. Clone the repository:
   ```bash
   git clone https://github.com/immutable/ts-immutable-sdk.git
   cd ts-immutable-sdk
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Navigate to the example directory:
   ```bash
   cd examples/contracts
   ```

4. Modify the example files to include your own:
   - Private key
   - Contract address
   - Recipient addresses

5. Run the example:
   ```bash
   pnpm ts-node contract-interaction-with-viem/index.ts
   ```

## Summary

This example demonstrates two methods of batch minting ERC721 tokens using the Viem library to interact with Immutable's ERC721 contracts:

1. **Batch Mint by ID**: Allows minting specific token IDs to different recipients in a single transaction.
2. **Batch Mint by Quantity**: Allows minting a specified quantity of tokens to different recipients in a single transaction.

These patterns are useful for efficient token distribution and can save gas costs when minting multiple tokens. The example shows how to properly connect to the Immutable zkEVM network, check for appropriate permissions, and execute the minting transactions. 