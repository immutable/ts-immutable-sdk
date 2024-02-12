import { ChainId, ChainName, ChainSlug } from '@imtbl/checkout-sdk';

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
