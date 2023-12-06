import { WalletProviderName } from '@imtbl/checkout-sdk';

export const topMenuItemStyles = {
  borderBottomLeftRadius: '0px',
  borderBottomRightRadius: '0px',
  marginBottom: '2px',
};

export const bottomMenuItemStyles = {
  borderTopLeftRadius: '0px',
  borderTopRightRadius: '0px',
};

export const bridgeReviewWrapperStyles = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  paddingX: 'base.spacing.x4',
};

export const bridgeReviewHeadingStyles = {
  paddingTop: 'base.spacing.x10',
  paddingBottom: 'base.spacing.x4',
};

export const arrowIconWrapperStyles = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingY: 'base.spacing.x1',
};

export const arrowIconStyles = {
  width: 'base.icon.size.300',
  transform: 'rotate(270deg)',
};

export const walletLogoStyles = (walletName: WalletProviderName) => ({
  minWidth: 'base.icon.size.400',
  padding: walletName === WalletProviderName.PASSPORT ? 'base.spacing.x1' : '',
  backgroundColor: 'base.color.translucent.standard.200',
  borderRadius: 'base.borderRadius.x2',
});

export const gasAmountHeadingStyles = {
  marginBottom: 'base.spacing.x4',
  color: 'base.color.text.secondary',
};

export const bridgeButtonIconLoadingStyle = {
  width: 'base.icon.size.400',
};
