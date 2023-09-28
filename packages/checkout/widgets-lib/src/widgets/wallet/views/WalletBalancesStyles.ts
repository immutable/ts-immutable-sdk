export const walletBalanceOuterContainerStyles = {
  display: 'flex',
  flexDirection: 'column',
  rowGap: 'base.spacing.x2',
  paddingX: 'base.spacing.x2',
  flex: 1,
};

export const walletBalanceContainerStyles = {
  backgroundColor: 'base.color.neutral.800',
  paddingX: 'base.spacing.x1',
  borderRadius: 'base.borderRadius.x6',
  flex: 1,
};

export const walletBalanceLoadingIconStyles = {
  display: 'flex',
  flexDirection: 'column',
  rowGap: 'base.spacing.x2',
};

export const walletBalanceListContainerStyles = (showNetworkMenu: boolean, showAddCoins: boolean) => {
  /**
   * Need fixed height set to enable vertical scrolling within div
   * */
  let height = 460;
  if (showNetworkMenu) {
    height -= 104; // - network menu height
  }
  if (showAddCoins) {
    height -= 98; // - add coins button height
  }
  const heightpx = `${height}px`;
  return {
    height: heightpx,
    overflowY: 'auto',
    borderRadius: 'base.borderRadius.x6',
  };
};
