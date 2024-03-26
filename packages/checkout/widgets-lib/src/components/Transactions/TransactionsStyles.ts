export const transactionsContainerStyle = {
  px: 'base.spacing.x4',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
};

export const transactionsListContainerStyle = {
  flexGrow: '1',
  flexShrink: '0',
  flexBasis: '0',
};

export const transactionsListStyle = (showPassportLink: boolean) => {
  let height = 440;

  if (showPassportLink) {
    height -= 20;
  }

  return {
    backgroundColor: 'base.color.neutral.800',
    px: 'base.spacing.x4',
    pt: 'base.spacing.x5',
    pb: 'base.spacing.x4',
    borderRadius: 'base.borderRadius.x6',
    h: `${height}px`,
    w: '100%',
    overflowY: 'scroll',
  };
};

export const supportBoxContainerStyle = {
  flexGrow: '0',
  flexShrink: '1',
  mt: 'base.spacing.x2',
};
