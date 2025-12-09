import {
  encodeAbiParameters,
  encodeFunctionData,
  encodePacked,
  getContract,
  hashMessage,
  keccak256,
  toBytes,
  zeroAddress,
  type Address,
  type PublicClient,
  type TypedDataDomain,
  hashTypedData,
  BaseError,
} from 'viem';
import { MetaTransaction, MetaTransactionNormalised, TypedDataPayload } from './types';
import {
  decodeSequenceSignatureV1,
  encodeSequenceSignatureV1,
  walletContracts,
} from './sequenceCompat';

export interface Signer {
  getAddress(): Promise<string>;
  signMessage(message: string | Uint8Array): Promise<string>;
}

const SIGNATURE_WEIGHT = 1; // Weight of a single signature in the multi-sig
const TRANSACTION_SIGNATURE_THRESHOLD = 1; // Total required weight in the multi-sig for a transaction
const PACKED_SIGNATURE_THRESHOLD = 2; // Total required weight in the multi-sig for data signing

const ETH_SIGN_FLAG = '02';
const ETH_SIGN_PREFIX = '\x19\x01';

export const getNormalisedTransactions = (txs: MetaTransaction[]): MetaTransactionNormalised[] => txs.map((t) => ({
  delegateCall: t.delegateCall === true,
  revertOnError: t.revertOnError === true,
  gasLimit: t.gasLimit ?? BigInt(0),
  target: t.to ?? zeroAddress,
  value: t.value ?? BigInt(0),
  data: t.data ?? '0x',
}));

export const digestOfTransactionsAndNonce = (
  nonce: bigint | number | string,
  normalisedTransactions: MetaTransactionNormalised[],
): string => {
  const nonceBigInt = BigInt(nonce);
  const txs = normalisedTransactions.map((tx) => ({
    delegateCall: tx.delegateCall,
    revertOnError: tx.revertOnError,
    gasLimit: BigInt(tx.gasLimit),
    target: tx.target as Address,
    value: BigInt(tx.value),
    data: tx.data as `0x${string}`,
  }));

  const packMetaTransactionsNonceData = encodeAbiParameters(
    [
      { type: 'uint256' },
      {
        type: 'tuple[]',
        components: [
          { type: 'bool', name: 'delegateCall' },
          { type: 'bool', name: 'revertOnError' },
          { type: 'uint256', name: 'gasLimit' },
          { type: 'address', name: 'target' },
          { type: 'uint256', name: 'value' },
          { type: 'bytes', name: 'data' },
        ],
      },
    ],
    [nonceBigInt, txs],
  );
  return keccak256(packMetaTransactionsNonceData);
};

export const encodedTransactions = (
  normalisedTransactions: MetaTransactionNormalised[],
): string => {
  const txs = normalisedTransactions.map((tx) => ({
    delegateCall: tx.delegateCall,
    revertOnError: tx.revertOnError,
    gasLimit: BigInt(tx.gasLimit),
    target: tx.target as Address,
    value: BigInt(tx.value),
    data: tx.data as `0x${string}`,
  }));

  return encodeAbiParameters(
    [
      {
        type: 'tuple[]',
        components: [
          { type: 'bool', name: 'delegateCall' },
          { type: 'bool', name: 'revertOnError' },
          { type: 'uint256', name: 'gasLimit' },
          { type: 'address', name: 'target' },
          { type: 'uint256', name: 'value' },
          { type: 'bytes', name: 'data' },
        ],
      },
    ],
    [txs],
  );
};

/**
 * This helper function is used to coerce the type <BigNumber | undefined> to BigNumber for the
 * getNonce function above.
 * @param {bigint} nonceSpace - An unsigned 256 bit value that can be used to encode a nonce into a distinct space.
 * @returns {bigint} The passed in nonceSpace or instead initialises the nonce to 0.
 */
export const coerceNonceSpace = (nonceSpace?: bigint): bigint => nonceSpace || 0n;

/**
 * This helper function is used to encode the nonce into a 256 bit value where the space is encoded into
 * the first 160 bits, and the nonce the remaining 96 bits.
 * @param {bigint} nonceSpace - An unsigned 256 bit value that can be used to encode a nonce into a distinct space.
 * @param nonce {bigint} nonce - Sequential number starting at 0, and incrementing in single steps e.g. 0,1,2,...
 * @returns {bigint} The encoded value where the space is left shifted 96 bits, and the nonce is in the first 96 bits.
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
  publicClient: PublicClient,
  smartContractWalletAddress: string,
  nonceSpace?: bigint,
): Promise<bigint> => {
  try {
    const contract = getContract({
      address: smartContractWalletAddress as Address,
      abi: walletContracts.mainModule.abi,
      client: publicClient,
    });
    const space: bigint = coerceNonceSpace(nonceSpace); // Default nonce space is 0
    // @ts-ignore
    const result = await contract.read.readNonce([space]);
    if (typeof result === 'bigint') {
      return encodeNonce(space, result);
    }
    throw new Error('Unexpected result from contract.nonce() call.');
  } catch (error) {
    // Check for BAD_DATA or similar error from viem/RPC
    // In viem, errors usually come as BaseError or RpcError
    if (error instanceof BaseError || (error as any).code === 'BAD_DATA') {
      // The most likely reason for a BAD_DATA error is that the smart contract wallet
      // has not been deployed yet, so we should default to a nonce of 0.
      return BigInt(0);
    }

    throw error;
  }
};

export const encodeMessageSubDigest = (chainId: bigint, walletAddress: string, digest: string): string => (
  encodePacked(
    ['string', 'uint256', 'address', 'bytes32'],
    [ETH_SIGN_PREFIX, chainId, walletAddress as Address, digest as `0x${string}`],
  )
);

export const signMetaTransactions = async (
  metaTransactions: MetaTransaction[],
  nonce: bigint | number | string,
  chainId: bigint,
  walletAddress: string,
  signer: Signer,
): Promise<string> => {
  const normalisedMetaTransactions = getNormalisedTransactions(metaTransactions);

  // Get the hash
  const digest = digestOfTransactionsAndNonce(nonce, normalisedMetaTransactions);
  const completePayload = encodeMessageSubDigest(chainId, walletAddress, digest);

  const hash = keccak256(completePayload as `0x${string}`);

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

  // Encode the transaction;
  return encodeFunctionData({
    abi: walletContracts.mainModule.abi,
    functionName: 'execute',
    args: [
      normalisedMetaTransactions.map((tx) => ({
        delegateCall: tx.delegateCall,
        revertOnError: tx.revertOnError,
        gasLimit: BigInt(tx.gasLimit),
        target: tx.target as Address,
        value: BigInt(tx.value),
        data: tx.data as `0x${string}`,
      })),
      BigInt(nonce),
      encodedSignature as `0x${string}`,
    ],
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
  signer: Signer,
): Promise<string> => {
  // Hash the EIP712 payload and generate the complete payload
  // hashTypedData in viem expects specific types
  const types = { ...typedData.types };
  // @ts-ignore
  delete types.EIP712Domain;

  const typedDataHash = hashTypedData({
    domain: typedData.domain as TypedDataDomain,
    types,
    primaryType: typedData.primaryType,
    message: typedData.message,
  });

  const messageSubDigest = encodeMessageSubDigest(chainId, walletAddress, typedDataHash);
  const hash = keccak256(messageSubDigest as `0x${string}`);

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
  signer: Signer,
  walletAddress: string,
): Promise<string> => {
  // Generate digest
  const digest = hashMessage(payload);

  // Generate subDigest
  const subDigest = encodeMessageSubDigest(chainId, walletAddress, digest);
  const subDigestHash = keccak256(subDigest as `0x${string}`);
  const subDigestHashArray = toBytes(subDigestHash);

  return signer.signMessage(subDigestHashArray);
};

export const getEip155ChainId = (chainId: number) => `eip155:${chainId}`;
