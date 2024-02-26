import { ChainId, WalletProviderName } from '@imtbl/checkout-sdk';

export const logoColour = {
  [ChainId.IMTBL_ZKEVM_DEVNET]: 'base.color.text.link.primary',
  [ChainId.IMTBL_ZKEVM_TESTNET]: 'base.color.text.link.primary',
  [ChainId.IMTBL_ZKEVM_MAINNET]: 'base.color.text.link.primary',
  [ChainId.ETHEREUM]: 'base.color.accent.5',
  [ChainId.SEPOLIA]: 'base.color.accent.5',
};

export const walletButtonOuterStyles = {
  width: '100%',
  backgroundColor: 'base.color.translucent.emphasis.100',
  borderRadius: 'base.borderRadius.x4',
  paddingX: 'base.spacing.x3',
  paddingY: 'base.spacing.x5',
  display: 'flex',
  flexDirection: 'row',
  gap: 'base.spacing.x4',
  alignItems: 'center',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '&:hover': {
    cursor: 'pointer',
    backgroundColor: 'base.color.translucent.emphasis.200',
  },
};

export const walletLogoStyles = (walletName: WalletProviderName | string) => ({
  width: 'base.icon.size.500',
  padding: walletName === WalletProviderName.PASSPORT ? 'base.spacing.x1' : '',
  backgroundColor: 'base.color.translucent.standard.200',
  borderRadius: 'base.borderRadius.x2',
});

export const walletCaptionStyles = { color: 'base.color.text.body.secondary' };

export const networkButtonStyles = {
  paddingY: 'base.spacing.x6',
  borderRadius: 'base.borderRadius.x18',
};

export const networkIconStyles = (chainId:ChainId) => ({
  fill: 'base.color.brand.2',
  width: 'base.icon.size.300',
  backgroundColor: logoColour[chainId],
  borderRadius: '100%',
  padding: 'base.spacing.x1',
}
);
