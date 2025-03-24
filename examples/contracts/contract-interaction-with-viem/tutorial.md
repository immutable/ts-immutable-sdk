# Contract Interaction with Viem

## Introduction
This example demonstrates how to interact with Immutable ERC721 contracts using Viem, a TypeScript library for Ethereum. The example focuses on batch minting capabilities, allowing developers to efficiently mint multiple NFTs in a single transaction either by specific token IDs or by quantity. This approach leverages Viem's modern API to communicate directly with smart contracts on Immutable's zkEVM.

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/contracts/contract-interaction-with-viem)

## Features Overview
- Batch mint ERC721 tokens by specified token IDs
- Batch mint ERC721 tokens by quantity

## SDK Integration Details

### Batch Mint ERC721 Tokens by ID
**Feature Name**: Batch mint ERC721 tokens by specifying exact token IDs.

**Source Code**: [Source code file](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/contracts/contract-interaction-with-viem/batch-mint-erc721-by-id.ts)

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

  // Check if the intended signer has permissions to mint
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

  const txHash = await contract.write.mintBatch([requests]);
  return txHash;
};
```

**Explanation**:
This function enables batch minting of ERC721 tokens with specific token IDs. It works by:
1. Defining the Immutable zkEVM testnet chain configuration
2. Creating a wallet client using the provided private key
3. Creating a contract instance using the Immutable ERC721 ABI
4. Checking if the signer has the MINTER_ROLE permission
5. Calling the `mintBatch` function on the contract with an array of mint requests, where each request specifies a recipient address and an array of token IDs to mint

### Batch Mint ERC721 Tokens by Quantity
**Feature Name**: Batch mint ERC721 tokens by specifying quantities.

**Source Code**: [Source code file](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/contracts/contract-interaction-with-viem/batch-mint-erc721-by-quantity.ts)

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

  // Check if the intended signer has permissions to mint
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

  const txHash = await contract.write.mintBatchByQuantity([mints]);
  return txHash;
};
```

**Explanation**:
This function enables batch minting of ERC721 tokens by quantity. It works by:
1. Defining the Immutable zkEVM testnet chain configuration
2. Creating a wallet client using the provided private key
3. Creating a contract instance using the Immutable ERC721 ABI
4. Checking if the signer has the MINTER_ROLE permission
5. Calling the `mintBatchByQuantity` function on the contract with an array of mint requests, where each request specifies a recipient address and the quantity of tokens to mint

## Running the App

### Prerequisites
- Node.js (v16 or higher)
- pnpm package manager
- An Immutable account with zkEVM testnet IMX for gas fees
- [Immutable Hub](https://hub.immutable.com/) for environment setup

### Installation
1. Clone the repository:
```bash
git clone https://github.com/immutable/ts-immutable-sdk.git
```

2. Navigate to the examples directory:
```bash
cd ts-immutable-sdk/examples/contracts
```

3. Install dependencies:
```bash
pnpm install
```

### Running the Example
1. Update the environment variables in the example files with your own values:
   - Replace `PRIVATE_KEY` with your wallet's private key
   - Replace `CONTRACT_ADDRESS` with your deployed ERC721 contract address
   - Replace `ACCOUNT_ADDRESS_1` and `ACCOUNT_ADDRESS_2` with recipient addresses

2. Run the example using Node.js or ts-node:
```bash
npx ts-node contract-interaction-with-viem/batch-mint-erc721-by-id.ts
```

## Summary
This example demonstrates how to interact with Immutable ERC721 contracts using Viem, focusing on batch minting capabilities. By leveraging Viem's modern API and type-safe approach, developers can efficiently mint multiple NFTs in a single transaction, either by specifying exact token IDs or by quantity. This approach is particularly useful for gaming applications where multiple NFTs need to be minted efficiently. 