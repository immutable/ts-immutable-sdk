import { ChainId, ChainName } from '@imtbl/checkout-sdk';

export const logoColour = {
  [ChainId.IMTBL_ZKEVM_DEVNET]: 'base.color.text.link.primary',
  [ChainId.IMTBL_ZKEVM_TESTNET]: 'base.color.text.link.primary',
  [ChainId.IMTBL_ZKEVM_MAINNET]: 'base.color.text.link.primary',
  [ChainId.ETHEREUM]: 'base.color.accent.5',
  [ChainId.SEPOLIA]: 'base.color.accent.5',
};

// todo: add corresponding network symbols
export const networkIcon = {
  [ChainId.IMTBL_ZKEVM_DEVNET]: 'Immutable',
  [ChainId.IMTBL_ZKEVM_MAINNET]: 'Immutable',
  [ChainId.IMTBL_ZKEVM_TESTNET]: 'Immutable',
  [ChainId.ETHEREUM]: 'EthToken',
  [ChainId.SEPOLIA]: 'EthToken',
};

export const networkName = {
  [ChainId.IMTBL_ZKEVM_DEVNET]: ChainName.IMTBL_ZKEVM_DEVNET,
  [ChainId.IMTBL_ZKEVM_MAINNET]: ChainName.IMTBL_ZKEVM_MAINNET,
  [ChainId.IMTBL_ZKEVM_TESTNET]: ChainName.IMTBL_ZKEVM_TESTNET,
  [ChainId.ETHEREUM]: ChainName.ETHEREUM,
  [ChainId.SEPOLIA]: ChainName.SEPOLIA,
};
