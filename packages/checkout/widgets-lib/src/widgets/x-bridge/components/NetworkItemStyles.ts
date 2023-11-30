import { ChainId } from '@imtbl/checkout-sdk';

const logoColour = {
  [ChainId.IMTBL_ZKEVM_DEVNET]: 'base.color.text.link.primary',
  [ChainId.IMTBL_ZKEVM_TESTNET]: 'base.color.text.link.primary',
  [ChainId.IMTBL_ZKEVM_MAINNET]: 'base.color.text.link.primary',
  [ChainId.ETHEREUM]: 'base.color.accent.5',
  [ChainId.SEPOLIA]: 'base.color.accent.5',
};

export const networkItemStyles = (chainId: ChainId) => ({
  backgroundColor: logoColour[chainId],
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '& svg': {
    fill: 'base.color.brand.2',
  },
});
