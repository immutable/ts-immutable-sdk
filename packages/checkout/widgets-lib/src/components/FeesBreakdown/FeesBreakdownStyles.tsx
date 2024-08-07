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
  width: '65%',
  color: boldLabel ? 'base.color.text.body.primary' : 'base.color.text.body.secondary',
});

export const feeItemPriceDisplayStyles = {
  width: '35%',
};

export const feeItemLoadingStyles = {
  display: 'flex',
  flexDirection: 'column',
  rowGap: 'base.spacing.x2',
};
