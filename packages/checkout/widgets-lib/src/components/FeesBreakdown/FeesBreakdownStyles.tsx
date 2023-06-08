export const feesBreakdownContentStyles = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  padding: '16px 16px 0 16px',
};

export const feeItemContainerStyles = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  height: '100%',
};

export const feeItemStyles = { display: 'flex', width: '100%' };

export const feeItemLabelStyles = (boldLabel?: boolean) => ({
  width: '50%',
  color: boldLabel ? 'base.color.text.primary' : 'base.color.text.secondary',
});

export const feeItemPriceDisplayStyles = {
  width: '50%',
};
