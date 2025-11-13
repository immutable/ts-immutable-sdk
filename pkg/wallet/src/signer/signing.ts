/**
 * Signing helpers for ERC-191 and EIP-712
 * Uses viem internally for EIP-712 hashing (tree-shakeable)
 */

import { hashTypedData, hashMessage, keccak256, hexToBytes } from 'viem';
import type { TypedDataPayload } from '../relayer';
import { packSignatures } from '../sequence';
import type { Signer } from './signer';
import { removeHexPrefix } from '../utils/hex';

/**
 * Signs an ERC-191 message with Immutable wallet sub-digest
 * Uses viem's hashMessage for ERC-191, then adds custom sub-digest logic
 */
export async function signERC191Message(
  chainId: bigint,
  payload: string,
  signer: Signer,
  walletAddress: string
): Promise<string> {
  // Use viem's hashMessage for ERC-191 prefix: \x19Ethereum Signed Message:\n{len(message)}{message}
  // viem's hashMessage accepts a string directly
  const digest = hashMessage(payload);
  
  // Create sub-digest with chain ID and wallet address (custom Immutable logic)
  // Format: \x19\x01{chainId}{walletAddress}{digest}
  const subDigest = encodeMessageSubDigest(chainId, walletAddress, digest);
  const subDigestHash = keccak256(`0x${Buffer.from(subDigest, 'utf8').toString('hex')}` as `0x${string}`);
  
  const hashBytes = hexToBytes(subDigestHash);
  
  return signer.signMessage(hashBytes);
}

/**
 * Signs EIP-712 typed data
 */
export async function signTypedData(
  typedData: TypedDataPayload,
  relayerSignature: string,
  chainId: bigint,
  walletAddress: string,
  signer: Signer
): Promise<string> {
  // Use viem's hashTypedData (handles full EIP-712 spec)
  // Note: viem expects types without EIP712Domain, but our payload includes it
  const { EIP712Domain, ...types } = typedData.types;
  
  // Convert domain chainId to number/bigint if it's a string
  const domain = {
    ...typedData.domain,
    chainId: typeof typedData.domain.chainId === 'string' 
      ? Number(typedData.domain.chainId) 
      : typedData.domain.chainId,
  };

  const typedDataHash = hashTypedData({
    domain: domain as any,
    types: types as any,
    primaryType: typedData.primaryType,
    message: typedData.message,
  });
  
  // Create sub-digest (custom Immutable logic)
  const subDigest = encodeMessageSubDigest(chainId, walletAddress, typedDataHash);
  const subDigestHash = keccak256(`0x${Buffer.from(subDigest, 'utf8').toString('hex')}` as `0x${string}`);
  
  // Convert hex to bytes for signing
  const hashBytes = hexToBytes(subDigestHash);
  
  // Sign the hash
  const eoaSignature = await signer.signMessage(hashBytes);
  const eoaAddress = await signer.getAddress();
  
  // Pack signatures
  return packSignatures(eoaSignature, eoaAddress, relayerSignature);
}

/**
 * Encodes message sub-digest: \x19\x01{chainId}{walletAddress}{digest}
 * Custom Immutable logic for wallet contract authentication
 * This is specific to Immutable's wallet contract implementation
 */

export function encodeMessageSubDigest(
  chainId: bigint,
  walletAddress: string,
  digest: string
): string {
  const prefix = '\x19\x01';
  const chainIdHex = chainId.toString(16).padStart(64, '0');
  const address = removeHexPrefix(walletAddress).toLowerCase();
  const digestHex = removeHexPrefix(digest);
  
  return prefix + chainIdHex + address + digestHex;
}
