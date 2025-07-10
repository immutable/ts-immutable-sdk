import { walletContracts } from '@0xsequence/abi';
import { v1 as sequenceCoreV1 } from '@0xsequence/core';
import { trackDuration } from '@imtbl/metrics';
import {
  BigNumberish, Contract, getBytes, hashMessage,
  Interface, keccak256, Signer, solidityPacked, ZeroAddress,
  TypedDataEncoder, JsonRpcProvider, AbiCoder,
  isError,
  ethers,
} from 'ethers';
import { MetaTransaction, MetaTransactionNormalised, TypedDataPayload } from './types';
import MagicTeeAdapter from '../magic/magicTeeAdapter';

const SIGNATURE_WEIGHT = 1; // Weight of a single signature in the multi-sig
const TRANSACTION_SIGNATURE_THRESHOLD = 1; // Total required weight in the multi-sig for a transaction
const PACKED_SIGNATURE_THRESHOLD = 2; // Total required weight in the multi-sig for data signing

const ETH_SIGN_FLAG = '02';
const ETH_SIGN_PREFIX = '\x19\x01';
const META_TRANSACTIONS_TYPE = `tuple(
  bool delegateCall,
  bool revertOnError,
  uint256 gasLimit,
  address target,
  uint256 value,
  bytes data
)[]`;

export const getNormalisedTransactions = (txs: MetaTransaction[]): MetaTransactionNormalised[] => txs.map((t) => ({
  delegateCall: t.delegateCall === true,
  revertOnError: t.revertOnError === true,
  gasLimit: t.gasLimit ?? BigInt(0),
  target: t.to ?? ZeroAddress,
  value: t.value ?? BigInt(0),
  data: t.data ?? '0x',
}));

export const digestOfTransactionsAndNonce = (
  nonce: BigNumberish,
  normalisedTransactions: MetaTransactionNormalised[],
): string => {
  const packMetaTransactionsNonceData = AbiCoder.defaultAbiCoder().encode(
    ['uint256', META_TRANSACTIONS_TYPE],
    [nonce, normalisedTransactions],
  );
  return keccak256(packMetaTransactionsNonceData);
};

export const encodedTransactions = (
  normalisedTransactions: MetaTransactionNormalised[],
): string => AbiCoder.defaultAbiCoder().encode(
  [META_TRANSACTIONS_TYPE],
  [normalisedTransactions],
);

/**
 * This helper function is used to coerce the type <BigNumber | undefined> to BigNumber for the
 * getNonce function above.
 * @param {BigNumber} nonceSpace - An unsigned 256 bit value that can be used to encode a nonce into a distinct space.
 * @returns {BigNumber} The passed in nonceSpace or instead initialises the nonce to 0.
 */
export const coerceNonceSpace = (nonceSpace?: bigint): bigint => nonceSpace || 0n;

/**
 * This helper function is used to encode the nonce into a 256 bit value where the space is encoded into
 * the first 160 bits, and the nonce the remaining 96 bits.
 * @param {BigNumber} nonceSpace - An unsigned 256 bit value that can be used to encode a nonce into a distinct space.
 * @param nonce {BigNumber} nonce - Sequential number starting at 0, and incrementing in single steps e.g. 0,1,2,...
 * @returns {BigNumber} The encoded value where the space is left shifted 96 bits, and the nonce is in the first 96 bits.
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
  rpcProvider: JsonRpcProvider,
  smartContractWalletAddress: string,
  nonceSpace?: bigint,
): Promise<bigint> => {
  try {
    const contract = new Contract(
      smartContractWalletAddress,
      walletContracts.mainModule.abi,
      rpcProvider,
    );
    const space: bigint = coerceNonceSpace(nonceSpace); // Default nonce space is 0
    const result = await contract.readNonce(space);
    if (typeof result === 'bigint') {
      return encodeNonce(space, result);
    }
    throw new Error('Unexpected result from contract.nonce() call.');
  } catch (error) {
    if (isError(error, 'BAD_DATA')) {
      // The most likely reason for a BAD_DATA error is that the smart contract wallet
      // has not been deployed yet, so we should default to a nonce of 0.
      return BigInt(0);
    }

    throw error;
  }
};

export const encodeMessageSubDigest = (chainId: bigint, walletAddress: string, digest: string): string => (
  solidityPacked(
    ['string', 'uint256', 'address', 'bytes32'],
    [ETH_SIGN_PREFIX, chainId, walletAddress, digest],
  )
);

export const signMetaTransactions = async (
  metaTransactions: MetaTransaction[],
  nonce: BigNumberish,
  chainId: bigint,
  walletAddress: string,
  magicTeeAdapter: MagicTeeAdapter,
): Promise<string> => {
  const normalisedMetaTransactions = getNormalisedTransactions(metaTransactions);

  // Get the hash
  const digest = digestOfTransactionsAndNonce(nonce, normalisedMetaTransactions);
  const completePayload = encodeMessageSubDigest(chainId, walletAddress, digest);

  const hash = keccak256(completePayload);

  // Sign the digest
  const hashArray = getBytes(hash);

  const startTime = performance.now();
  const ethsigNoType = await magicTeeAdapter.personalSign(hashArray);
  trackDuration(
    'passport',
    'magicSignMessageGetSignedMetaTransactions',
    Math.round(performance.now() - startTime),
  );

  const signedDigest = `${ethsigNoType}${ETH_SIGN_FLAG}`;

  // Add metadata
  const encodedSignature = sequenceCoreV1.signature.encodeSignature({
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
  const walletInterface = new Interface(walletContracts.mainModule.abi);
  return walletInterface.encodeFunctionData(walletInterface.getFunction('execute') ?? '', [
    normalisedMetaTransactions,
    nonce,
    encodedSignature,
  ]);
};

const decodeRelayerSignature = (relayerSignature: string) => {
  const signatureWithThreshold = `0x0000${relayerSignature}`;
  return sequenceCoreV1.signature.decodeSignature(signatureWithThreshold);
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

  return sequenceCoreV1.signature.encodeSignature({
    version: 1,
    threshold: PACKED_SIGNATURE_THRESHOLD,
    signers: sortedSigners,
  });
};

export const signAndPackTypedData = async (
  typedData: TypedDataPayload,
  relayerSignature: string,
  eoaWalletAddress: string,
  chainId: bigint,
  walletAddress: string,
  magicTeeAdapter: MagicTeeAdapter,
): Promise<string> => {
  // Ethers auto-generates the EIP712Domain type in the TypedDataEncoder, and so it needs to be removed
  const types = { ...typedData.types };
  // @ts-ignore
  delete types.EIP712Domain;

  // Hash the EIP712 payload and generate the complete payload
  const typedDataHash = TypedDataEncoder.hash(typedData.domain, types, typedData.message);
  const messageSubDigest = encodeMessageSubDigest(chainId, walletAddress, typedDataHash);
  const hash = keccak256(messageSubDigest);

  // Sign the sub digest
  // https://github.com/immutable/wallet-contracts/blob/7824b5f24b2e0eb2dc465ecb5cd71f3984556b73/src/contracts/modules/commons/ModuleAuth.sol#L155
  const hashArray = getBytes(hash);

  const startTime = performance.now();
  const eoaSignature = await magicTeeAdapter.personalSign(hashArray);
  trackDuration(
    'passport',
    'magicSignMessageTypedData',
    Math.round(performance.now() - startTime),
  );

  return packSignatures(eoaSignature, eoaWalletAddress, relayerSignature);
};

export const signERC191Message = async (
  chainId: bigint,
  payload: string,
  magicTeeAdapter: MagicTeeAdapter,
  walletAddress: string,
): Promise<string> => {
  // Generate digest
  const digest = hashMessage(payload);

  // Generate subDigest
  const subDigest = encodeMessageSubDigest(chainId, walletAddress, digest);
  const subDigestHash = keccak256(subDigest);
  const subDigestHashArray = getBytes(subDigestHash);

  return magicTeeAdapter.personalSign(subDigestHashArray);
};

export const getEip155ChainId = (chainId: number) => `eip155:${chainId}`;
