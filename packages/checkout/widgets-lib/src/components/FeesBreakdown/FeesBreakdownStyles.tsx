export const feeItemContainerStyles = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

export const feeItemStyles = { display: 'flex', width: '100%' };

export const feeItemLabelStyles = (boldLabel?: boolean) => ({
  width: '50%',
  color: boldLabel ? 'base.color.text.primary' : 'base.color.text.secondary',
});

export const feeItemPriceDisplayStyles = {
  width: '50%',
};
