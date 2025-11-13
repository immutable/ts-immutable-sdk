/**
 * Sequence signature encoding/decoding
 * Minimal implementation replacing @0xsequence/core dependency
 * 
 * Sequence signature format:
 * - version (1 byte): 0x00 or 0x01
 * - threshold (1 byte): number of signatures required
 * - signers: array of signer data
 *   - isDynamic (1 bit): whether signer is dynamic
 *   - unrecovered (1 bit): whether signature is unrecovered
 *   - weight (6 bits): weight of signer
 *   - signature (65 bytes): actual signature
 *   - address (20 bytes, optional): signer address
 */

import { isAddress, keccak256, encodeAbiParameters, fromHex } from 'viem';
import { cleanSignature, cleanAddress, removeHexPrefix } from './utils/hex';
import { JsonRpcError, RpcErrorCode } from './errors';
import type { Signer } from './signer/signer';
import { encodeMessageSubDigest } from './signer/signing';
import { getFunctionSelector } from './utils/abi';
import type { MetaTransaction } from './metatransaction';

/**
 * Sequence signature constants
 */
export const SEQUENCE_VERSION = 0;
export const SIGNATURE_WEIGHT = 1;
export const TRANSACTION_SIGNATURE_THRESHOLD = 1;
export const PACKED_SIGNATURE_THRESHOLD = 2;
export const ETH_SIGN_FLAG = '02';

/**
 * Signer data structure
 */
interface SignerData {
  isDynamic?: boolean;
  unrecovered?: boolean;
  weight: number;
  signature: string;
  address?: string;
}

/**
 * Signature encoding options
 */
interface EncodeSignatureOptions {
  version: number;
  threshold: number;
  signers: SignerData[];
}

/**
 * Decoded signature structure
 */
interface DecodedSignature {
  version: number;
  threshold: number;
  signers: SignerData[];
}

/**
 * Encodes a signature in Sequence format
 */
export function encodeSignature(options: EncodeSignatureOptions): string {
  const { version, threshold, signers } = options;

  // Encode header: version (1 byte) + threshold (1 byte) + reserved (1 byte) + signerCount (1 byte)
  let encoded = version.toString(16).padStart(2, '0');
  encoded += threshold.toString(16).padStart(2, '0');
  encoded += '00'; // Reserved byte (always 0)
  encoded += signers.length.toString(16).padStart(2, '0');

  // Encode each signer
  for (const signer of signers) {
    // Pack flags and weight into 1 byte:
    // bit 0: isDynamic (0 or 1)
    // bit 1: unrecovered (0 or 1)
    // bits 2-7: weight (0-63)
    const isDynamic = signer.isDynamic ? 1 : 0;
    const unrecovered = signer.unrecovered !== false ? 1 : 0; // Default to true
    const weight = signer.weight & 0x3f; // Mask to 6 bits
    
    const flagsByte = (isDynamic | (unrecovered << 1) | (weight << 2)).toString(16).padStart(2, '0');
    encoded += flagsByte;

    // Signature (65 bytes = 130 hex chars)
    const sig = cleanSignature(signer.signature, 130);
    encoded += sig;

    // Address (20 bytes = 40 hex chars) - only if provided
    if (signer.address) {
      const addr = cleanAddress(signer.address);
      if (addr.length !== 40) {
        throw new Error(`Invalid address length: expected 40 hex chars, got ${addr.length}`);
      }
      encoded += addr;
    }
  }

  return `0x${encoded}`;
}

/**
 * Decodes a Sequence signature
 */
export function decodeSignature(signature: string): DecodedSignature {
  const hex = removeHexPrefix(signature);
  
  if (hex.length < 8) {
    throw new Error('Invalid signature: too short');
  }

  // Read version (1 byte)
  const version = parseInt(hex.slice(0, 2), 16);

  // Read threshold (1 byte)
  const threshold = parseInt(hex.slice(2, 4), 16);

  // Skip reserved byte (offset 4-6)
  
  // Read signers count (1 byte)
  const signersCount = parseInt(hex.slice(6, 8), 16);

  const signers: SignerData[] = [];
  let offset = 8;

  for (let i = 0; i < signersCount; i++) {
    if (offset + 2 > hex.length) {
      throw new Error('Invalid signature: incomplete signer data');
    }

    // Read flags byte
    const flagsByte = parseInt(hex.slice(offset, offset + 2), 16);
    offset += 2;

    const isDynamic = (flagsByte & 0x01) !== 0;
    const unrecovered = (flagsByte & 0x02) !== 0;
    const weight = (flagsByte >> 2) & 0x3f;

    // Read signature (65 bytes = 130 hex chars)
    if (offset + 130 > hex.length) {
      throw new Error('Invalid signature: incomplete signature data');
    }
    const sig = `0x${hex.slice(offset, offset + 130)}`;
    offset += 130;

    // Read address if present (20 bytes = 40 hex chars)
    // For relayer signatures, address might not be present
    let address: string | undefined;
    if (offset + 40 <= hex.length) {
      address = `0x${hex.slice(offset, offset + 40)}`;
      offset += 40;
    }

    signers.push({
      isDynamic,
      unrecovered,
      weight,
      signature: sig,
      address,
    });
  }

  return {
    version,
    threshold,
    signers,
  };
}

/**
 * Packs two signatures together using Sequence encoding format
 * Decodes relayer signature, adds EOA signature, re-encodes with threshold 2
 */
export function packSignatures(
  eoaSignature: string,
  eoaAddress: string,
  relayerSignature: string
): string {
  // Validate address format
  if (!isAddress(eoaAddress)) {
    throw new JsonRpcError(
      RpcErrorCode.INVALID_PARAMS,
      `Invalid address: ${eoaAddress}`
    );
  }

  // Decode relayer signature (add 0x prefix if missing, and version/threshold prefix)
  const relayerSigWithPrefix = relayerSignature.startsWith('0x') 
    ? relayerSignature 
    : `0x0000${relayerSignature}`; // Add version/threshold prefix for decoding
  
  const decoded = decodeSignature(relayerSigWithPrefix);
  const relayerSigners = decoded.signers;

  // Add EOA signature flag
  const signedDigest = `${eoaSignature}${ETH_SIGN_FLAG}`;

  // Combine signers: relayer signers + EOA signer
  const combinedSigners = [
    ...relayerSigners,
    {
      isDynamic: false,
      unrecovered: true,
      weight: SIGNATURE_WEIGHT,
      signature: signedDigest,
      address: eoaAddress,
    },
  ];

  // Sort signers by address (if address present)
  const sortedSigners = combinedSigners.sort((a, b) => {
    if (!a.address || !b.address) return 0;
    const diff = BigInt(a.address) - BigInt(b.address);
    return diff === 0n ? 0 : diff < 0n ? -1 : 1;
  });

  // Re-encode with threshold 2
  return encodeSignature({
    version: SEQUENCE_VERSION,
    threshold: PACKED_SIGNATURE_THRESHOLD,
    signers: sortedSigners,
  });
}

/**
 * Signs meta-transactions using Sequence signature encoding
 * This is Sequence-specific logic for signing wallet transactions
 */
export async function signMetaTransactions(
  metaTransactions: MetaTransaction[],
  nonce: bigint,
  chainId: bigint,
  walletAddress: string,
  signer: Signer
): Promise<string> {
  // Get digest of transactions and nonce
  const META_TRANSACTIONS_TYPE = `tuple(
    bool delegateCall,
    bool revertOnError,
    uint256 gasLimit,
    address target,
    uint256 value,
    bytes data
  )[]`;

  const packMetaTransactionsNonceData = encodeAbiParameters(
    [
      { type: 'uint256' },
      { type: META_TRANSACTIONS_TYPE },
    ],
    [nonce, metaTransactions] as readonly [bigint, readonly MetaTransaction[]]
  );
  
  const digest = keccak256(packMetaTransactionsNonceData);
  
  // Create sub-digest with chain ID and wallet address
  const completePayload = encodeMessageSubDigest(chainId, walletAddress, digest);
  const hash = keccak256(`0x${Buffer.from(completePayload, 'utf8').toString('hex')}` as `0x${string}`);

  // Sign the hash
  const hashBytes = fromHex(hash, 'bytes');
  const ethsigNoType = await signer.signMessage(hashBytes);
  const signedDigest = `${ethsigNoType}${ETH_SIGN_FLAG}`;

  // Encode signature using Sequence encoder
  const encodedSignature = encodeSignature({
    version: SEQUENCE_VERSION,
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

  // Encode execute function call
  // Function: execute(tuple[] transactions, uint256 nonce, bytes signature)
  const executeSelector = getFunctionSelector('execute((bool,bool,uint256,address,uint256,bytes)[],uint256,bytes)');

  // Encode parameters
  const encodedParams = encodeAbiParameters(
    [
      { type: 'tuple[]', components: [
        { name: 'delegateCall', type: 'bool' },
        { name: 'revertOnError', type: 'bool' },
        { name: 'gasLimit', type: 'uint256' },
        { name: 'target', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'data', type: 'bytes' },
      ]},
      { type: 'uint256' },
      { type: 'bytes' },
    ],
    [metaTransactions as any, nonce, encodedSignature as `0x${string}`]
  );

  // Prepend function selector
  return executeSelector + encodedParams.slice(2);
}

