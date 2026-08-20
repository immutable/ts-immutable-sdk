import { ChainId, ChainName, ChainSlug } from '@imtbl/checkout-sdk';

/**
 * Parse a chain id as returned by an EIP-1193 provider (e.g. `eth_chainId`).
 *
 * EIP-695 specifies a hex-encoded quantity such as `0x343b`, but providers are
 * inconsistent and may return a decimal string or a number instead. `Number()`
 * handles all three.
 *
 * Do NOT reach for `parseInt(value, 10)` here: it silently returns 0 for hex
 * input, which reads as "wrong network" for every chain. Use this helper so the
 * radix decision lives in one tested place rather than at each call site.
 *
 * Returns `null` when the value cannot be parsed, so callers can tell an
 * unknown chain apart from a legitimately parsed id.
 */
export function parseChainId(chainId: unknown): ChainId | null {
  if (chainId === null || chainId === undefined || chainId === '') return null;
  const parsed = Number(chainId);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed as ChainId;
}

export function getChainNameById(chainId: ChainId): ChainName {
  switch (chainId) {
    case ChainId.ETHEREUM: return ChainName.ETHEREUM;
    case ChainId.IMTBL_ZKEVM_TESTNET: return ChainName.IMTBL_ZKEVM_TESTNET;
    case ChainId.IMTBL_ZKEVM_MAINNET: return ChainName.IMTBL_ZKEVM_MAINNET;
    case ChainId.IMTBL_ZKEVM_DEVNET: return ChainName.IMTBL_ZKEVM_DEVNET;
    case ChainId.SEPOLIA: return ChainName.SEPOLIA;
    default: return '' as ChainName;
  }
}

export function getChainSlugById(chainId: ChainId): ChainSlug {
  switch (chainId) {
    case ChainId.ETHEREUM: return ChainSlug.ETHEREUM;
    case ChainId.IMTBL_ZKEVM_TESTNET: return ChainSlug.IMTBL_ZKEVM_TESTNET;
    case ChainId.IMTBL_ZKEVM_MAINNET: return ChainSlug.IMTBL_ZKEVM_MAINNET;
    case ChainId.IMTBL_ZKEVM_DEVNET: return ChainSlug.IMTBL_ZKEVM_DEVNET;
    case ChainId.SEPOLIA: return ChainSlug.SEPOLIA;
    default: return '' as ChainSlug;
  }
}

export function getChainIdBySlug(chainSlug: ChainSlug): ChainId {
  switch (chainSlug) {
    case ChainSlug.ETHEREUM: return ChainId.ETHEREUM;
    case ChainSlug.IMTBL_ZKEVM_TESTNET: return ChainId.IMTBL_ZKEVM_TESTNET;
    case ChainSlug.IMTBL_ZKEVM_MAINNET: return ChainId.IMTBL_ZKEVM_MAINNET;
    case ChainSlug.IMTBL_ZKEVM_DEVNET: return ChainId.IMTBL_ZKEVM_DEVNET;
    case ChainSlug.SEPOLIA: return ChainId.SEPOLIA;
    default: return 0 as ChainId;
  }
}

export function getNativeSymbolByChainSlug(chainSlug: ChainSlug): string {
  switch (chainSlug) {
    case ChainSlug.ETHEREUM:
    case ChainSlug.SEPOLIA:
      return 'ETH';
    case ChainSlug.IMTBL_ZKEVM_TESTNET:
    case ChainSlug.IMTBL_ZKEVM_MAINNET:
    case ChainSlug.IMTBL_ZKEVM_DEVNET:
      return 'IMX';
    default: return '';
  }
}
