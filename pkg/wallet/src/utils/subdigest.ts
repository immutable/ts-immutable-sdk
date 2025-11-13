import { removeHexPrefix } from './hex';

/**
 * Encodes message sub-digest for Immutable wallet contract authentication
 * Format: \x19\x01{chainId}{walletAddress}{digest}
 */
export function encodeMessageSubDigest(
  chainId: bigint,
  walletAddress: string,
  digest: string,
): string {
  const prefix = '\x19\x01';
  const chainIdHex = chainId.toString(16).padStart(64, '0');
  const address = removeHexPrefix(walletAddress).toLowerCase();
  const digestHex = removeHexPrefix(digest);

  return prefix + chainIdHex + address + digestHex;
}
