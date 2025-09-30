export const containerStyle = (showIframe:boolean) => ({
  position: 'relative',
  maxWidth: '420px',
  height: '100%',
  borderRadius: 'base.borderRadius.x6',
  overflow: 'hidden',
  marginLeft: 'base.spacing.x2',
  marginRight: 'base.spacing.x2',
  marginBottom: 'base.spacing.x2',
  display: showIframe ? 'block' : 'none',
});

export const boxMainStyle = (showIframe:boolean) => ({
  display: showIframe ? 'block' : 'none',
});
