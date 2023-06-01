export const networkMenuStyles = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
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

export const logoStyle = (logoColor: string, isActive: boolean) => ({
  paddingRight: 'base.spacing.x1',
  width: '22px',
  fill: isActive ? logoColor : 'base.color.brand.4',
});

export const networkHeadingStyle = {
  paddingX: 'base.spacing.x3',
  paddingY: 'base.spacing.x2',
};
