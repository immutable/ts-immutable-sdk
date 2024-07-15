import { getContract, http, createWalletClient, defineChain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { ImmutableERC721Abi } from '@imtbl/contracts';

const PRIVATE_KEY = 'YOUR_PRIVATE_KEY'; // should be read from environment variable
const CONTRACT_ADDRESS = '0xYOUR_CONTRACT_ADDRESS'; // should be of type `0x${string}`
const ANOTHER_RECIPIENT = '0xRECIPIENT_ADDRESS';

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
  account: privateKeyToAccount(`0x${PRIVATE_KEY}`),
});

// Bound contract instance
const contract = getContract({
  address: CONTRACT_ADDRESS,
  abi: ImmutableERC721Abi,
  client: walletClient,
});

const batchMint = async (): Promise<string> => {
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
      new Error('Account doesnt have permissions to mint.')
    );
  }
  // Specify who we want to receive the minted token
  const recipient = walletClient.account.address;

  // Construct list of tokens to mint
  const mintRequests = [
    {
      to: recipient,
      tokenIds: [BigInt(2), BigInt(3), BigInt(4)],
    },
    {
      to: ANOTHER_RECIPIENT as `0x${string}`,
      tokenIds: [BigInt(5), BigInt(6), BigInt(7)],
    },
  ];

  const txHash = await contract.write.safeMintBatch([mintRequests]);

  console.log(`txHash: ${txHash}`);
  return txHash;
};

batchMint();