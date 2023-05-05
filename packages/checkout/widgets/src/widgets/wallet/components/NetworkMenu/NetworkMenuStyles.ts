export const NetworkMenuStyles = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
};

export const NetworkHeadingStyle = {
  display: 'flex',
  flexDirection: 'row',
  columnGap: 'base.spacing.x1',
  paddingX: 'base.spacing.x3',
  paddingY: 'base.spacing.x2',
};

export const ActiveNetworkButtonStyle = {
  borderColor: 'base.color.translucent.container.1000',
  borderStyle: 'solid',
  borderWidth: 'base.border.size.200',
};

export const LogoStyle = (logoColor: string, isActive: boolean) => {
  return {
    paddingRight: 'base.spacing.x1',
    width: '22px',
    fill: isActive ? logoColor : 'base.color.brand.4',
  };
};
