import { ChainId } from '@imtbl/checkout-sdk';

const logoColour = {
  [ChainId.IMTBL_ZKEVM_DEVNET]: 'base.color.text.link.primary',
  [ChainId.IMTBL_ZKEVM_TESTNET]: 'base.color.text.link.primary',
  [ChainId.IMTBL_ZKEVM_MAINNET]: 'base.color.text.link.primary',
  [ChainId.ETHEREUM]: 'base.color.accent.5',
  [ChainId.SEPOLIA]: 'base.color.accent.5',
};

export const networkItemStyles = (chainId: ChainId) => ({
  fill: 'base.color.brand.2',
  minWidth: 'base.icon.size.500',
  padding: 'base.spacing.x2',
  backgroundColor: logoColour[chainId],
  borderRadius: '50%',
});
