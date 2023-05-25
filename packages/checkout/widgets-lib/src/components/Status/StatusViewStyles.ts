export const statusContainerStyles = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
};

export const statusBoxStyles = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  alignContent: 'center',
  padding: '24px 16px 24px 12px',
  width: '270px',
  borderRadius: '12px',
  background: 'base.color.translucent.standard.100',
  rowGap: 'base.spacing.x4',
};

export const statusLogoFill = (isSuccess: boolean) => ({
  width: 'base.icon.size.500',
  fill: isSuccess
    ? 'base.color.status.success.bright'
    : 'base.color.status.fatal.bright',
});
