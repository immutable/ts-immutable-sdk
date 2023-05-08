export const WalletBalanceContainerStyle = {
  backgroundColor: 'base.color.neutral.800',
  paddingTop: 'base.spacing.x4',
  paddingBottom: 'base.spacing.x1',
  paddingX: 'base.spacing.x1',
  borderRadius: 'base.borderRadius.x6',
};

export const WalletBalanceItemStyle = (showAddCoins: boolean, hasMoreItems: boolean) => {
  /**
   * Need fixed height set to enable vertical scrolling within div
   * {height of balance item} = 92, {vertical space} = 8px
   * (92px x 3) + (8px x 2) = 292px OR (92px x 2) + 8px = 192px
   */
  return {
    height: !showAddCoins && hasMoreItems ? '292px' : showAddCoins && hasMoreItems ? '192px' : 'auto',
    overflowY: 'auto'
  };
};
