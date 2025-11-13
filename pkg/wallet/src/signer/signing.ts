import {
  hashTypedData, hashMessage, keccak256, hexToBytes,
} from 'viem';
import type { TypedDataPayload } from '../types';
import { packSignatures } from '../sequence';
import type { Signer } from './signer';
import { encodeMessageSubDigest } from '../utils/subdigest';

/**
 * Signs ERC-191 message with Immutable wallet sub-digest
 * Applies custom sub-digest format: \x19\x01{chainId}{walletAddress}{digest}
 */
export async function signERC191Message(
  chainId: bigint,
  payload: string,
  signer: Signer,
  walletAddress: string,
): Promise<string> {
  const digest = hashMessage(payload);
  const subDigest = encodeMessageSubDigest(chainId, walletAddress, digest);
  const subDigestHash = keccak256(`0x${Buffer.from(subDigest, 'utf8').toString('hex')}` as `0x${string}`);
  const hashBytes = hexToBytes(subDigestHash);

  return signer.signMessage(hashBytes);
}

/**
 * Signs EIP-712 typed data with Immutable wallet sub-digest
 * Packs EOA signature with relayer signature using Sequence format
 */
export async function signTypedData(
  typedData: TypedDataPayload,
  relayerSignature: string,
  chainId: bigint,
  walletAddress: string,
  signer: Signer,
): Promise<string> {
  const { EIP712Domain, ...types } = typedData.types;

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

  const subDigest = encodeMessageSubDigest(chainId, walletAddress, typedDataHash);
  const subDigestHash = keccak256(`0x${Buffer.from(subDigest, 'utf8').toString('hex')}` as `0x${string}`);
  const hashBytes = hexToBytes(subDigestHash);

  const eoaSignature = await signer.signMessage(hashBytes);
  const eoaAddress = await signer.getAddress();

  return packSignatures(eoaSignature, eoaAddress, relayerSignature);
}
