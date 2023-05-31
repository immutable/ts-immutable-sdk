export const balanceItemContainerStyle = {
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  padding: '24px 16px 24px 16px',
  backgroundColor: 'base.color.translucent.container.100',
  borderRadius: 'base.borderRadius.x6',
};

export const balanceItemCoinBoxStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  columnGap: 'base.spacing.x5',
};

export const balanceItemPriceBoxStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  columnGap: 'base.spacing.x4',
};

export const ShowMenuItem = (show: boolean | undefined) => ({
  display: show ? '' : 'none',
});
