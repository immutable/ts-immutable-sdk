export const walletBalanceOuterContainerStyles = {
  display: 'flex',
  flexDirection: 'column',
  rowGap: 'base.spacing.x2',
  paddingX: 'base.spacing.x2',
};

export const walletBalanceContainerStyles = {
  backgroundColor: 'base.color.neutral.800',
  paddingTop: 'base.spacing.x4',
  paddingBottom: 'base.spacing.x1',
  paddingX: 'base.spacing.x1',
  borderRadius: 'base.borderRadius.x6',
};

export const walletBalanceLoadingIconStyles = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
};

export const WalletBalanceItemStyle = (
  showAddCoins: boolean,
  hasMoreItems: boolean,
) => {
  /**
   * Need fixed height set to enable vertical scrolling within div
   * {height of balance item} = 92, {vertical space} = 8px
   * (92px x 3) + (8px x 2) = 292px OR (92px x 2) + 8px = 192px
   */

  let height;
  if (!showAddCoins && hasMoreItems) {
    height = '292px';
  } else if (showAddCoins && hasMoreItems) {
    height = '192px';
  } else {
    height = 'auto';
  }

  return ({
    height,
    overflowY: 'auto',
  });
};
