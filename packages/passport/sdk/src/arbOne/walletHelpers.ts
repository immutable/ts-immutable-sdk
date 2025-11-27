import { walletContracts } from '@0xsequence/abi';
import { v1 as sequenceCoreV1 } from '@0xsequence/core';
import { Payload, Signature } from '@0xsequence/wallet-primitives';
import { Bytes, Hex, Address } from 'ox';
import {
  BigNumberish, Contract, getBytes,
  Interface, Signer, ZeroAddress,
  JsonRpcProvider, AbiCoder, concat,
  SigningKey,
} from 'ethers';
import { MetaTransaction, MetaTransactionNormalised, TypedDataPayload } from './types';
import { hashMessage } from 'ethers';
import SequenceSigner from '../sequence/sequenceSigner';

const SIGNATURE_WEIGHT = 1; // Weight of a single signature in the multi-sig

// Legacy V1/V2 functions - kept for potential backwards compatibility
export const getNormalisedTransactions = (txs: MetaTransaction[]): MetaTransactionNormalised[] => txs.map((t) => ({
  delegateCall: t.delegateCall === true,
  revertOnError: t.revertOnError === true,
  gasLimit: t.gasLimit ?? BigInt(0),
  target: t.to ?? ZeroAddress,
  value: t.value ?? BigInt(0),
  data: t.data ?? '0x',
}));

export const coerceNonceSpace = (nonceSpace?: bigint): bigint => nonceSpace || 0n;

export const encodeNonce = (nonceSpace: BigNumberish, nonce: BigNumberish): bigint => {
  const space = BigInt(nonceSpace.toString());
  const n = BigInt(nonce.toString());
  const shiftedSpace = space * (2n ** 96n);
  return n + shiftedSpace;
};

/**
 * Get nonce from Sequence smart contract wallet on Arbitrum One
 * Similar to zkEVM but works with Arbitrum One chain
 */
export const getNonce = async (
  rpcProvider: JsonRpcProvider,
  arbOneAddress: string,
  nonceSpace?: bigint,
): Promise<bigint> => {
  const rawSpace = nonceSpace ? (nonceSpace >> 96n) : 0n;
  
  // Check if smart contract wallet is deployed
  const code = await rpcProvider.getCode(arbOneAddress);
  if (code === '0x') {
    // Wallet not deployed yet, nonce is 0
    // on sequence first transaction is to update image hash which nonce is 0
    // so this needs to be 1
    return encodeNonce(rawSpace, 1n);
  }

  // Wallet is deployed, get nonce from contract
  const walletInterface = new Interface(walletContracts.mainModule.abi);
  const walletContract = new Contract(arbOneAddress, walletInterface, rpcProvider);
  
  const nonce = await walletContract.readNonce(rawSpace);
  return encodeNonce(rawSpace, BigInt(nonce.toString()));
};

export const getEip155ChainId = (chainId: number): string => `eip155:${chainId}`;

/**
 * Convert MetaTransaction to Sequence Payload.Call format
 */
const toSequenceCall = (tx: MetaTransaction): Payload.Call => ({
  to: Address.from(tx.to || ZeroAddress),
  value: tx.value ? BigInt(tx.value.toString()) : 0n,
  data: (tx.data || '0x') as Hex.Hex,
  gasLimit: tx.gasLimit ? BigInt(tx.gasLimit.toString()) : 0n,
  delegateCall: tx.delegateCall ?? false,
  onlyFallback: false,
  behaviorOnError: tx.revertOnError ? 'revert' : 'ignore',
});

/**
 * Sign meta-transactions using Sequence V3 SDK primitives
 * Uses EIP-712 typed data for signing and compact binary encoding for payload
 * Returns fully encoded transaction data ready for relayer submission
 */
export const signMetaTransactions = async (
  metaTransactions: MetaTransaction[],
  encodedNonce: BigNumberish,
  chainId: bigint,
  walletAddress: string,
  sequenceSigner: Signer,
): Promise<string> => {
  const encodedNonceBigInt = BigInt(encodedNonce.toString());
  const space = encodedNonceBigInt >> 96n;
  const nonce = encodedNonceBigInt & ((1n << 96n) - 1n);

  // Convert to Sequence call format
  const calls = metaTransactions.map(toSequenceCall);

  // Create Sequence payload using SDK
  const payload = Payload.fromCall(nonce, space, calls);

  // Encode payload using SDK (compact binary format)
  // Pass wallet address for self-call optimization
  const encodedPayload = Payload.encode(payload, Address.from(walletAddress))
  // Hash payload using SDK (EIP-712 typed data hash)
  const payloadHash = Payload.hash(
    Address.from(walletAddress),
    Number(chainId),
    payload
  );
  console.log('[signMetaTransactions] payloadHash', payloadHash);
  // Sign with ETH_SIGN (adds Ethereum message prefix)
  // const signature = await sequenceSigner.signMessage(payloadHash);
  let signature;
  if ((sequenceSigner as SequenceSigner).useIdentityInstrument) {
    signature = await (sequenceSigner as SequenceSigner).signMessage(payloadHash);
    console.log('[signMetaTransactions] signature', signature);
  } else {
    const privateKey = await (sequenceSigner as SequenceSigner).getPrivateKey();
    console.log('[signMetaTransactions] privateKey', privateKey);
    const signingKey = new SigningKey(privateKey);
    const ethSignDigest = hashMessage(payloadHash);
    signature = signingKey.sign(ethSignDigest); // This returns a Signature object
  }

  console.log('[signMetaTransactions] signature', signature);
  // Parse signature to extract r, s, yParity
  // Safely convert signature to hex string before parsing bytes
  const sigHex =
    typeof signature === 'string'
      ? signature
      : (signature as any)?.serialized || (signature as any)?.compact || '';
  const sigBytes = Bytes.fromHex(sigHex);
  const r = Bytes.toBigInt(sigBytes.slice(0, 32));
  const s = Bytes.toBigInt(sigBytes.slice(32, 64));
  const v = sigBytes[64]!;
  const yParity = v >= 27 ? v - 27 : v;
  
  // Create signed signer leaf for topology
  const signedLeaf: Signature.SignedSignerLeaf = {
    type: 'signer',
    address: Address.from(await sequenceSigner.getAddress()),
    weight: BigInt(SIGNATURE_WEIGHT),
    signed: true,
    signature: {
      type: 'eth_sign',
      r,
      s,
      yParity,
    },
  };
  
  // Create raw signature configuration
  const rawSignature: Signature.RawSignature = {
    noChainId: false,
    configuration: {
      threshold: BigInt(SIGNATURE_WEIGHT),
      checkpoint: 0n,
      topology: signedLeaf,
    },
  };
  
  // Encode signature using SDK
  const encodedSignature = Signature.encodeSignature(rawSignature);
  
  // Encode the execute call: execute(bytes payload, bytes signature)
  const executeSelector = '0x61c2926c'; // keccak256("execute(bytes,bytes)")[:4]
  const encodedParams = AbiCoder.defaultAbiCoder().encode(
    ['bytes', 'bytes'],
    [Bytes.toHex(encodedPayload), Bytes.toHex(encodedSignature)]
  );
  
  return concat([executeSelector, encodedParams]);
};
