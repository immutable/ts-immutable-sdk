import {
  keccak256,
  encodePacked,
  encodeAbiParameters,
  parseAbiParameters,
  getContract,
  encodeFunctionData,
  toBytes,
  hashMessage,
  hashTypedData,
  zeroAddress,
  type PublicClient,
  type Hex,
} from 'viem';
import { MetaTransaction, MetaTransactionNormalised, TypedDataPayload } from './types';
import {
  decodeSequenceSignatureV1,
  encodeSequenceSignatureV1,
  walletContracts,
} from './sequenceCompat';
import type { WalletSigner } from '../types';

const SIGNATURE_WEIGHT = 1; // Weight of a single signature in the multi-sig
const TRANSACTION_SIGNATURE_THRESHOLD = 1; // Total required weight in the multi-sig for a transaction
const PACKED_SIGNATURE_THRESHOLD = 2; // Total required weight in the multi-sig for data signing

const ETH_SIGN_FLAG = '02';
const ETH_SIGN_PREFIX = '\x19\x01';

// ABI parameter type for meta transactions array
const META_TRANSACTIONS_ABI_TYPE = parseAbiParameters(
  '(bool delegateCall, bool revertOnError, uint256 gasLimit, address target, uint256 value, bytes data)[]',
);

export const getNormalisedTransactions = (txs: MetaTransaction[]): MetaTransactionNormalised[] => txs.map((t) => ({
  delegateCall: t.delegateCall === true,
  revertOnError: t.revertOnError === true,
  gasLimit: t.gasLimit ?? BigInt(0),
  target: (t.to ?? zeroAddress) as `0x${string}`,
  value: t.value ?? BigInt(0),
  data: (t.data ?? '0x') as `0x${string}`,
}));

export const digestOfTransactionsAndNonce = (
  nonce: bigint,
  normalisedTransactions: MetaTransactionNormalised[],
): Hex => {
  // Convert normalised transactions to the format expected by encodeAbiParameters
  const txsForEncoding = normalisedTransactions.map((t) => ({
    delegateCall: t.delegateCall,
    revertOnError: t.revertOnError,
    gasLimit: t.gasLimit,
    target: t.target as `0x${string}`,
    value: t.value,
    data: t.data as `0x${string}`,
  }));

  const packMetaTransactionsNonceData = encodeAbiParameters(
    [{ type: 'uint256' }, ...META_TRANSACTIONS_ABI_TYPE],
    [nonce, txsForEncoding],
  );
  return keccak256(packMetaTransactionsNonceData);
};

export const encodedTransactions = (
  normalisedTransactions: MetaTransactionNormalised[],
): Hex => {
  const txsForEncoding = normalisedTransactions.map((t) => ({
    delegateCall: t.delegateCall,
    revertOnError: t.revertOnError,
    gasLimit: t.gasLimit,
    target: t.target as `0x${string}`,
    value: t.value,
    data: t.data as `0x${string}`,
  }));

  return encodeAbiParameters(
    META_TRANSACTIONS_ABI_TYPE,
    [txsForEncoding],
  );
};

/**
 * This helper function is used to coerce the type <bigint | undefined> to bigint for the
 * getNonce function above.
 * @param nonceSpace - An unsigned 256 bit value that can be used to encode a nonce into a distinct space.
 * @returns The passed in nonceSpace or instead initialises the nonce to 0.
 */
export const coerceNonceSpace = (nonceSpace?: bigint): bigint => nonceSpace || 0n;

/**
 * This helper function is used to encode the nonce into a 256 bit value where the space is encoded into
 * the first 160 bits, and the nonce the remaining 96 bits.
 * @param nonceSpace - An unsigned 256 bit value that can be used to encode a nonce into a distinct space.
 * @param nonce - Sequential number starting at 0, and incrementing in single steps e.g. 0,1,2,...
 * @returns The encoded value where the space is left shifted 96 bits, and the nonce is in the first 96 bits.
 */
export const encodeNonce = (nonceSpace: bigint, nonce: bigint): bigint => {
  const shiftedSpace = BigInt(nonceSpace) * (2n ** 96n);
  return BigInt(nonce) + (shiftedSpace);
};

/**
 * When we retrieve a nonce for a smart contract wallet we can retrieve the nonce in a given 256 bit space.
 * Nonces in each 256 bit space need to be sequential per wallet address. Nonces across 256 bit spaces per
 * wallet address do not. This function overload can be used to invoke transactions in parallel per smart
 * contract wallet if required.
 */
export const getNonce = async (
  rpcProvider: PublicClient,
  smartContractWalletAddress: string,
  nonceSpace?: bigint,
): Promise<bigint> => {
  try {
    const contract = getContract({
      address: smartContractWalletAddress as `0x${string}`,
      abi: walletContracts.mainModule.abi,
      client: rpcProvider,
    });
    const space: bigint = coerceNonceSpace(nonceSpace); // Default nonce space is 0
    const result = await contract.read.readNonce([space]);
    if (typeof result === 'bigint') {
      return encodeNonce(space, result);
    }
    throw new Error('Unexpected result from contract.readNonce() call.');
  } catch (error) {
    // Check if the error is due to contract not being deployed (similar to ethers BAD_DATA)
    // In viem, this typically manifests as a ContractFunctionExecutionError with empty return data
    if (error instanceof Error && (
      error.message.includes('returned no data')
      || error.message.includes('execution reverted')
      || error.message.includes('ContractFunctionExecutionError')
    )) {
      // The most likely reason for this error is that the smart contract wallet
      // has not been deployed yet, so we should default to a nonce of 0.
      return BigInt(0);
    }

    throw error;
  }
};

export const encodeMessageSubDigest = (chainId: bigint, walletAddress: string, digest: string): Hex => (
  encodePacked(
    ['string', 'uint256', 'address', 'bytes32'],
    [ETH_SIGN_PREFIX, chainId, walletAddress as `0x${string}`, digest as `0x${string}`],
  )
);

export const signMetaTransactions = async (
  metaTransactions: MetaTransaction[],
  nonce: bigint,
  chainId: bigint,
  walletAddress: string,
  signer: WalletSigner,
): Promise<string> => {
  const normalisedMetaTransactions = getNormalisedTransactions(metaTransactions);

  // Get the hash
  const digest = digestOfTransactionsAndNonce(nonce, normalisedMetaTransactions);
  const completePayload = encodeMessageSubDigest(chainId, walletAddress, digest);

  const hash = keccak256(completePayload);

  // Sign the digest
  const hashArray = toBytes(hash);
  const ethsigNoType = await signer.signMessage(hashArray);
  const signedDigest = `${ethsigNoType}${ETH_SIGN_FLAG}`;

  // Add metadata
  const encodedSignature = encodeSequenceSignatureV1({
    version: 1,
    threshold: TRANSACTION_SIGNATURE_THRESHOLD,
    signers: [
      {
        isDynamic: false,
        unrecovered: true,
        weight: SIGNATURE_WEIGHT,
        signature: signedDigest,
      },
    ],
  });

  // Encode the transaction using viem's encodeFunctionData
  // Convert normalised transactions to tuple format for encoding
  const txsForEncoding = normalisedMetaTransactions.map((t) => ({
    delegateCall: t.delegateCall,
    revertOnError: t.revertOnError,
    gasLimit: t.gasLimit,
    target: t.target as `0x${string}`,
    value: t.value,
    data: t.data as `0x${string}`,
  }));

  return encodeFunctionData({
    abi: walletContracts.mainModule.abi,
    functionName: 'execute',
    args: [txsForEncoding, nonce, encodedSignature as `0x${string}`],
  });
};

const decodeRelayerSignature = (relayerSignature: string) => {
  const signatureWithThreshold = `0x0000${relayerSignature}`;
  return decodeSequenceSignatureV1(signatureWithThreshold);
};

export const packSignatures = (
  EOASignature: string,
  EOAAddress: string,
  relayerSignature: string,
): string => {
  const signedDigest = `${EOASignature}${ETH_SIGN_FLAG}`;

  // Combine the relayer and user signatures; sort by address to match the imageHash order
  const { signers: relayerSigners } = decodeRelayerSignature(relayerSignature);
  const combinedSigners = [
    ...relayerSigners,
    {
      isDynamic: false,
      unrecovered: true,
      weight: SIGNATURE_WEIGHT,
      signature: signedDigest,
      address: EOAAddress,
    },
  ];
  const sortedSigners = combinedSigners.sort((a, b) => {
    const bigA = BigInt(a.address ?? 0);
    const bigB = BigInt(b.address ?? 0);

    if (bigA <= bigB) {
      return -1;
    } if (bigA === bigB) {
      return 0;
    }
    return 1;
  });

  return encodeSequenceSignatureV1({
    version: 1,
    threshold: PACKED_SIGNATURE_THRESHOLD,
    signers: sortedSigners,
  });
};

export const signAndPackTypedData = async (
  typedData: TypedDataPayload,
  relayerSignature: string,
  chainId: bigint,
  walletAddress: string,
  signer: WalletSigner,
): Promise<string> => {
  // viem's hashTypedData handles EIP712Domain automatically
  const types = { ...typedData.types };
  // Remove EIP712Domain from types as viem handles it
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { EIP712Domain, ...typesWithoutDomain } = types;

  // Hash the EIP712 payload
  const typedDataHash = hashTypedData({
    domain: typedData.domain as Parameters<typeof hashTypedData>[0]['domain'],
    types: typesWithoutDomain,
    primaryType: typedData.primaryType,
    message: typedData.message,
  });

  const messageSubDigest = encodeMessageSubDigest(chainId, walletAddress, typedDataHash);
  const hash = keccak256(messageSubDigest);

  // Sign the sub digest
  // https://github.com/immutable/wallet-contracts/blob/7824b5f24b2e0eb2dc465ecb5cd71f3984556b73/src/contracts/modules/commons/ModuleAuth.sol#L155
  const hashArray = toBytes(hash);
  const eoaSignature = await signer.signMessage(hashArray);
  const eoaAddress = await signer.getAddress();

  return packSignatures(eoaSignature, eoaAddress, relayerSignature);
};

export const signERC191Message = async (
  chainId: bigint,
  payload: string,
  signer: WalletSigner,
  walletAddress: string,
): Promise<string> => {
  // Generate digest using viem's hashMessage
  const digest = hashMessage(payload);

  // Generate subDigest
  const subDigest = encodeMessageSubDigest(chainId, walletAddress, digest);
  const subDigestHash = keccak256(subDigest);
  const subDigestHashArray = toBytes(subDigestHash);

  return signer.signMessage(subDigestHashArray);
};

export const getEip155ChainId = (chainId: number) => `eip155:${chainId}`;
