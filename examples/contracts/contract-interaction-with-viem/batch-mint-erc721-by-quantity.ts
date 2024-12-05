import { getContract, http, createWalletClient, defineChain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { ImmutableERC721Abi } from '@imtbl/contracts';

const PRIVATE_KEY = '0xYOUR_PRIVATE_KEY'; // should be read from environment variable, should be of type `0x${string}`
const CONTRACT_ADDRESS = '0xYOUR_CONTRACT_ADDRESS'; // should be of type `0x${string}`
const ACCOUNT_ADDRESS_1: `0x${string}` = '0xACCOUNT_ADDRESS_1'; // should be of type `0x${string}`
const ACCOUNT_ADDRESS_2: `0x${string}` = '0xACCOUNT_ADDRESS_2'; // should be of type `0x${string}`
const MINTS = [
  {
    to: ACCOUNT_ADDRESS_1,
    quantity: BigInt(3),
  },
  {
    to: ACCOUNT_ADDRESS_2,
    quantity: BigInt(3),
  },
];

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

  const txHash = await contract.write.mintBatchByQuantity([mints]);

  console.log(`txHash: ${txHash}`);
  return txHash;
};
