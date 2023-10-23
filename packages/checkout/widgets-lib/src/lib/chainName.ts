import { ChainId, ChainName } from '@imtbl/checkout-sdk';

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
