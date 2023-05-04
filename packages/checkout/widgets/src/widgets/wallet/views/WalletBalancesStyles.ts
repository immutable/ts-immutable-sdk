export const WalletBalanceContainerStyle = {
  backgroundColor: 'base.color.neutral.800',
  paddingY: 'base.spacing.x4',
  paddingX: 'base.spacing.x1',
  borderRadius: 'base.borderRadius.x6',
};

export const WalletBalanceItemStyle = {
  /**
   * Need fixed height set to enable vertical scrolling within div
   * ({height of balance item} + {vertical space}) x {number of items to show}
   * ( 92px + 8px ) x 2 = 200px
   */
  height: '200px',
  overflowY: 'auto',
  paddingBottom: '8px', // Add space for when scrolled all the way down
};
