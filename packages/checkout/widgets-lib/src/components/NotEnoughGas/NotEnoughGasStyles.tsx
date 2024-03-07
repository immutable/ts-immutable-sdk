export const containerStyles = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingTop: 'base.spacing.x6',
  paddingBottom: 'base.spacing.x1',
  height: '100%',
  paddingX: 'base.spacing.x6',
};

export const headingTextStyles = {
  fontFamily: 'base.font.family.heading.secondary',
  textAlign: 'center',
  marginTop: '15px',
  paddingX: 'base.spacing.x6',
};

export const bodyTextStyles = {
  ...headingTextStyles,
  color: 'base.color.text.body.secondary',
};

export const actionButtonContainerStyles = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  gap: 'base.spacing.x2',
  height: '100%',
  width: '100%',
};

export const actionButtonStyles = {
  width: '100%',
  height: 'base.spacing.x16',
};

export const logoContainerStyles = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  paddingTop: 'base.spacing.x6',
};
