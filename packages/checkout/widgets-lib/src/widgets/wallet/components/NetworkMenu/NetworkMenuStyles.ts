export const networkMenuStyles = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  paddingTop: 'base.spacing.x4',
};

export const activeNetworkButtonStyle = {
  fontWeight: 'base.text.caption.small.bold.fontWeight',
  borderColor: 'base.color.translucent.emphasis.1000',
  borderStyle: 'solid',
  borderWidth: 'base.border.size.200',
};

export const networkButtonStyle = {
  fontWeight: 'base.text.caption.small.bold.fontWeight',
};

export const logoStyle = (isActive: boolean) => ({
  width: '22px',
  filter: isActive ? undefined : 'grayscale(1)',
});

export const networkHeadingStyle = {
  paddingX: 'base.spacing.x3',
  paddingY: 'base.spacing.x2',
};
